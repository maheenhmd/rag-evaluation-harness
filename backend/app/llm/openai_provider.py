import json
import logging
import math
import time
from typing import TypeVar

from openai import (
    APIError,
    APITimeoutError,
    OpenAI,
    RateLimitError,
)
from pydantic import BaseModel, ValidationError

from backend.app.core.config import settings


Output = TypeVar("Output", bound=BaseModel)

logger = logging.getLogger(__name__)

RATE_LIMIT_MAX_ATTEMPTS = 8
RATE_LIMIT_MAX_WAIT_SECONDS = 300.0


# ============================================================
# LLM ERROR
# ============================================================

class LLMError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 502,
    ):
        super().__init__(message)
        self.status_code = status_code


# ============================================================
# RATE LIMIT RETRY
# ============================================================

def retry_delay(
    error: RateLimitError,
    remaining: float,
) -> float | None:
    try:
        retry_after = error.response.headers.get(
            "retry-after",
            "",
        )

        delay = float(retry_after)

    except (TypeError, ValueError):
        return min(5.0, remaining)

    if not math.isfinite(delay):
        return None

    if delay < 0:
        return None

    delay = max(0.1, delay)

    if delay > remaining:
        return None

    return delay


# ============================================================
# PROVIDER ERROR CODE
# ============================================================

def get_provider_error_code(
    error: Exception,
) -> str | None:
    code = getattr(error, "code", None)

    if isinstance(code, str) and code:
        return code

    body = getattr(error, "body", None)

    if not isinstance(body, dict):
        return None

    direct_code = (
        body.get("code")
        or body.get("type")
    )

    if isinstance(direct_code, str) and direct_code:
        return direct_code

    nested = body.get("error")

    if isinstance(nested, dict):
        nested_code = (
            nested.get("code")
            or nested.get("type")
        )

        if (
            isinstance(nested_code, str)
            and nested_code
        ):
            return nested_code

    return None


# ============================================================
# SAFE LOGGING
# ============================================================

def log_provider_failure(
    model: str,
    schema: type[BaseModel],
    error: Exception,
) -> None:
    logger.warning(
        (
            "LLM failure "
            "provider=groq "
            "model=%s "
            "stage=%s "
            "exception=%s "
            "upstream_status=%s "
            "code=%s "
            "request_id=%s"
        ),
        model,
        schema.__name__,
        type(error).__name__,
        getattr(error, "status_code", None),
        get_provider_error_code(error)
        or "unspecified",
        getattr(error, "request_id", None)
        or "unspecified",
    )


# ============================================================
# SIZE HELPER
# ============================================================

def encoded_size(value: object) -> int:
    return len(
        json.dumps(
            value,
            ensure_ascii=False,
        ).encode("utf-8")
    )


# ============================================================
# OPENAI-COMPATIBLE GROQ PROVIDER
# ============================================================

class OpenAIProvider:
    def __init__(self):
        key = settings.groq_api_key

        if (
            key is None
            or not key.get_secret_value().strip()
        ):
            raise LLMError(
                "Configure GROQ_API_KEY to run evaluation.",
                503,
            )

        self.client = OpenAI(
            api_key=key.get_secret_value(),
            base_url=settings.groq_base_url,
            timeout=settings.llm_timeout_seconds,
            max_retries=0,
        )

    def close(self) -> None:
        self.client.close()

    # ========================================================
    # STRUCTURED REQUEST
    # ========================================================

    def structured(
        self,
        *,
        model: str,
        instructions: str,
        payload: dict,
        schema: type[Output],
    ) -> Output:
        response = None

        waited = 0.0

        effective_instructions = instructions

        for attempt in range(RATE_LIMIT_MAX_ATTEMPTS):
            try:
                logger.info("LLM stage=%s model=%s attempt=%s outcome=start", schema.__name__, model, attempt + 1)
                response = self.client.responses.parse(
                    model=model,
                    instructions=effective_instructions,
                    input=json.dumps(
                        payload,
                        ensure_ascii=False,
                    ),
                    text_format=schema,
                    max_output_tokens=4096,
                )

                break

            # =================================================
            # RATE LIMIT
            # =================================================

            except RateLimitError as error:
                log_provider_failure(
                    model,
                    schema,
                    error,
                )

                remaining = max(
                    0.0,
                    RATE_LIMIT_MAX_WAIT_SECONDS - waited,
                )

                delay = retry_delay(
                    error,
                    remaining,
                )

                if (
                    attempt == RATE_LIMIT_MAX_ATTEMPTS - 1
                    or delay is None
                ):
                    raise LLMError(
                        (
                            f"Groq failed at {schema.__name__}. "
                            "Rate limit reached."
                        ),
                        429,
                    ) from error

                logger.warning(
                    (
                        "LLM rate-limit retry "
                        "provider=groq "
                        "model=%s "
                        "stage=%s "
                        "attempt=%s "
                        "delay_seconds=%s"
                    ),
                    model,
                    schema.__name__,
                    attempt + 1,
                    delay,
                )

                time.sleep(delay)

                waited += delay

            # =================================================
            # TIMEOUT
            # =================================================

            except APITimeoutError as error:
                log_provider_failure(
                    model,
                    schema,
                    error,
                )

                print(
                    (
                        "[GROQ ERROR] "
                        f"stage={schema.__name__} "
                        f"model={model} "
                        "status=timeout "
                        "code=timeout"
                    ),
                    flush=True,
                )

                raise LLMError(
                    (
                        f"Groq failed at {schema.__name__}. "
                        "The provider timed out."
                    ),
                    504,
                ) from error

            # =================================================
            # GROQ / OPENAI API ERROR
            # =================================================

            except APIError as error:
                log_provider_failure(
                    model,
                    schema,
                    error,
                )

                status = getattr(
                    error,
                    "status_code",
                    None,
                )

                code = get_provider_error_code(
                    error,
                )

                # ---------------------------------------------
                # Structured JSON validation retry
                # ---------------------------------------------

                if (
                    code == "json_validate_failed"
                    and attempt < 2
                ):
                    print(
                        (
                            "[GROQ RETRY] "
                            f"stage={schema.__name__} "
                            f"model={model} "
                            f"status={status} "
                            f"code={code} "
                            f"attempt={attempt + 1}"
                        ),
                        flush=True,
                    )

                    effective_instructions = (
                        instructions
                        + "\n\n"
                        + "STRICT OUTPUT REQUIREMENTS:\n"
                        + "- Follow the requested schema exactly.\n"
                        + "- Arrays must contain only values of "
                          "the required schema type.\n"
                        + "- Never insert empty strings.\n"
                        + "- Never insert null values.\n"
                        + "- Never insert separators.\n"
                        + "- Never include markdown.\n"
                        + "- Never include commentary.\n"
                        + "- Respect every array minimum and "
                          "maximum exactly.\n"
                        + "- Return only valid structured data."
                    )

                    continue

                # ---------------------------------------------
                # Final exact diagnostic
                # ---------------------------------------------

                diagnostic_status = (
                    str(status)
                    if status is not None
                    else "unknown"
                )

                diagnostic_code = (
                    code
                    if code
                    else "unknown"
                )

                print(
                    (
                        "[GROQ ERROR] "
                        f"stage={schema.__name__} "
                        f"model={model} "
                        f"status={diagnostic_status} "
                        f"code={diagnostic_code}"
                    ),
                    flush=True,
                )

                # ---------------------------------------------
                # API key
                # ---------------------------------------------

                if (
                    status == 401
                    or code == "invalid_api_key"
                ):
                    raise LLMError(
                        (
                            f"Groq failed at {schema.__name__}. "
                            "The API key was rejected."
                        ),
                        503,
                    ) from error

                # ---------------------------------------------
                # Permissions
                # ---------------------------------------------

                if (
                    status == 403
                    or code in {
                        "permission_denied",
                        "permissions_error",
                    }
                ):
                    raise LLMError(
                        (
                            f"Groq failed at {schema.__name__}. "
                            "The account does not have permission "
                            "to use this model."
                        ),
                        503,
                    ) from error

                # ---------------------------------------------
                # Model
                # ---------------------------------------------

                if code in {
                    "model_not_found",
                    "model_decommissioned",
                }:
                    raise LLMError(
                        (
                            f"Groq failed at {schema.__name__}. "
                            "The configured model is unavailable."
                        ),
                        503,
                    ) from error

                # ---------------------------------------------
                # Context
                # ---------------------------------------------

                if code == "context_length_exceeded":
                    raise LLMError(
                        (
                            f"Groq failed at {schema.__name__}. "
                            "The request exceeds the model "
                            "context window."
                        ),
                        422,
                    ) from error

                # ---------------------------------------------
                # JSON schema failure after retries
                # ---------------------------------------------

                if code == "json_validate_failed":
                    raise LLMError(
                        (
                            f"Groq failed at {schema.__name__}. "
                            f"Upstream status={diagnostic_status}, "
                            "code=json_validate_failed."
                        ),
                        502,
                    ) from error

                # ---------------------------------------------
                # Other API error
                # ---------------------------------------------

                raise LLMError(
                    (
                        f"Groq failed at {schema.__name__}. "
                        f"Upstream status={diagnostic_status}, "
                        f"code={diagnostic_code}."
                    ),
                    502,
                ) from error

            # =================================================
            # LOCAL PYDANTIC VALIDATION
            # =================================================

            except (
                ValidationError,
                ValueError,
            ) as error:
                log_provider_failure(
                    model,
                    schema,
                    error,
                )

                print(
                    (
                        "[GROQ ERROR] "
                        f"stage={schema.__name__} "
                        f"model={model} "
                        "status=local_validation "
                        "code=pydantic_validation"
                    ),
                    flush=True,
                )

                raise LLMError(
                    (
                        f"Groq failed at {schema.__name__}. "
                        "The structured response failed "
                        "local validation."
                    ),
                    502,
                ) from error

        # ====================================================
        # NO RESPONSE
        # ====================================================

        if response is None:
            raise LLMError(
                (
                    f"Groq failed at {schema.__name__}. "
                    "No response was returned."
                ),
                502,
            )

        # ====================================================
        # INCOMPLETE RESPONSE
        # ====================================================

        if response.status != "completed":
            logger.warning(
                (
                    "LLM incomplete response "
                    "provider=groq "
                    "model=%s "
                    "stage=%s "
                    "status=%s"
                ),
                model,
                schema.__name__,
                response.status,
            )

            raise LLMError(
                (
                    f"Groq failed at {schema.__name__}. "
                    f"Response status={response.status}."
                ),
                502,
            )

        # ====================================================
        # NO PARSED OUTPUT
        # ====================================================

        if response.output_parsed is None:
            logger.warning(
                (
                    "LLM missing structured output "
                    "provider=groq "
                    "model=%s "
                    "stage=%s"
                ),
                model,
                schema.__name__,
            )

            raise LLMError(
                (
                    f"Groq failed at {schema.__name__}. "
                    "No structured output was returned."
                ),
                502,
            )

        logger.info("LLM stage=%s model=%s attempt=%s outcome=success", schema.__name__, model, attempt + 1)
        return response.output_parsed

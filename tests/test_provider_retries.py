from types import SimpleNamespace
from unittest.mock import Mock

import httpx
import pytest
from openai import BadRequestError, RateLimitError, APITimeoutError

from backend.app.llm import openai_provider as module
from backend.app.schemas.evaluation import GeneratedAnswer


def provider_error(kind, status, code, retry_after=None):
    headers = {} if retry_after is None else {"retry-after": retry_after}
    response = httpx.Response(status, headers=headers, request=httpx.Request("POST", "https://api.groq.com/openai/v1/responses"))
    return kind("PRIVATE_PROVIDER_MESSAGE", response=response, body={"error": {"code": code, "message": "PRIVATE_PROVIDER_MESSAGE"}})


def invoke(monkeypatch, outcomes):
    monkeypatch.setattr(module.time, "sleep", Mock())
    provider = object.__new__(module.OpenAIProvider)
    parse = Mock(side_effect=outcomes)
    provider.client = SimpleNamespace(responses=SimpleNamespace(parse=parse))
    return provider, parse


def call(provider):
    return provider.structured(model="openai/gpt-oss-20b", instructions="Use only the context.",
                               payload={"retrieved_context": "PRIVATE_SOURCE"}, schema=GeneratedAnswer)


def success():
    return SimpleNamespace(status="completed", output_parsed=GeneratedAnswer(answer="Supported answer", cited_chunk_ids=["1:0"], insufficient_context=False))


def test_json_validation_retries_only_the_rejected_structured_call(monkeypatch, caplog):
    error = provider_error(BadRequestError, 400, "json_validate_failed")
    provider, parse = invoke(monkeypatch, [error, success()])
    assert call(provider).answer == "Supported answer"
    assert parse.call_count == 2
    first, second = [entry.kwargs for entry in parse.call_args_list]
    assert first["input"] == second["input"]
    assert first["text_format"] is second["text_format"] is GeneratedAnswer
    assert first["model"] == second["model"]
    assert "PRIVATE_SOURCE" not in caplog.text
    assert "PRIVATE_PROVIDER_MESSAGE" not in caplog.text


def test_repeated_json_failure_is_not_success(monkeypatch):
    error = provider_error(BadRequestError, 400, "json_validate_failed")
    provider, parse = invoke(monkeypatch, [error] * 8)
    with pytest.raises(module.LLMError) as caught:
        call(provider)
    assert caught.value.status_code == 502
    assert parse.call_count == 3


def test_short_rate_limit_recovers_without_changing_the_request(monkeypatch):
    error = provider_error(RateLimitError, 429, "rate_limit_exceeded", "2")
    provider, parse = invoke(monkeypatch, [error, success()])
    call(provider)
    module.time.sleep.assert_called_once_with(2.0)
    assert parse.call_args_list[0] == parse.call_args_list[1]


@pytest.mark.parametrize("retry_after", ["301", "nan", "-1"])
def test_unbounded_or_invalid_wait_is_rejected(monkeypatch, retry_after):
    error = provider_error(RateLimitError, 429, "rate_limit_exceeded", retry_after)
    provider, parse = invoke(monkeypatch, [error])
    with pytest.raises(module.LLMError) as caught:
        call(provider)
    assert caught.value.status_code == 429
    assert parse.call_count == 1
    module.time.sleep.assert_not_called()


def test_other_bad_request_is_not_retried(monkeypatch):
    provider, parse = invoke(monkeypatch, [provider_error(BadRequestError, 400, "invalid_request_error")])
    with pytest.raises(module.LLMError):
        call(provider)
    assert parse.call_count == 1


def test_timeout_is_not_retried_as_if_rejected(monkeypatch):
    provider, parse = invoke(monkeypatch, [APITimeoutError(request=httpx.Request("POST", "https://example.test"))])
    with pytest.raises(module.LLMError) as caught:
        call(provider)
    assert caught.value.status_code == 504
    assert parse.call_count == 1

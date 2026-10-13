from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


# ============================================================
# Application Settings
# ============================================================

class Settings(BaseSettings):
    app_name: str = "RAG Evaluation Harness"
    environment: str = "development"

    # --------------------------------------------------------
    # Qdrant
    # --------------------------------------------------------

    qdrant_url: str = "http://localhost:6335"

    # --------------------------------------------------------
    # PostgreSQL
    # --------------------------------------------------------

    database_url: str = (
        "postgresql+psycopg://"
        "rag_user:rag_password@localhost:5433/rag_lab"
    )

    # --------------------------------------------------------
    # Clerk Authentication
    # --------------------------------------------------------

    clerk_publishable_key: str
    clerk_secret_key: str

    use_test_auth: bool = False

    # --------------------------------------------------------
    # Groq / LLM
    # --------------------------------------------------------

    groq_api_key: SecretStr | None = None

    groq_base_url: str = (
        "https://api.groq.com/openai/v1"
    )

    generation_model: str = (
        "openai/gpt-oss-20b"
    )

    evaluation_model: str = (
        "openai/gpt-oss-120b"
    )

    synthetic_dataset_model: str = (
        "openai/gpt-oss-20b"
    )

    # --------------------------------------------------------
    # LLM Limits
    # --------------------------------------------------------

    llm_timeout_seconds: float = Field(
        default=60,
        gt=0,
        le=120,
    )

    llm_context_token_budget: int = Field(
        default=4000,
        ge=512,
        le=16000,
    )

    # --------------------------------------------------------
    # Evaluation Settings
    # --------------------------------------------------------

    default_evaluation_case_count: int = Field(
        default=8,
        ge=1,
        le=12,
    )

    evaluation_prompt_version: str = "day9-v1"

    # --------------------------------------------------------
    # Environment
    # --------------------------------------------------------

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
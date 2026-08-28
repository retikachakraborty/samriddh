from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str = Field(..., alias="SUPABASE_URL")
    supabase_publishable_key: str = Field(..., alias="SUPABASE_PUBLISHABLE_KEY")
    supabase_secret_key: str | None = Field(default=None, alias="SUPABASE_SECRET_KEY")
    supabase_jwks_url: str | None = Field(default=None, alias="SUPABASE_JWKS_URL")
    frontend_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
        alias="FRONTEND_ORIGINS",
    )
    api_prefix: str = "/api"

    # LLM Provider Configuration
    llm_provider: str = Field(default="gemini", alias="LLM_PROVIDER")
    gemini_api_key: str | None = Field(default=None, alias="GEMINI_API_KEY")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    anthropic_api_key: str | None = Field(default=None, alias="ANTHROPIC_API_KEY")
    llm_model: str | None = Field(default=None, alias="LLM_MODEL")

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[3] / ".env",
        extra="ignore",
        populate_by_name=True,
    )

    @field_validator("supabase_url")
    @classmethod
    def normalize_url(cls, value: str) -> str:
        return value.rstrip("/")

    @property
    def allowed_origins(self) -> list[str]:
        return [item.strip() for item in self.frontend_origins.split(",") if item.strip()]

    @property
    def is_llm_configured(self) -> bool:
        provider = self.llm_provider.lower()
        if provider == "gemini":
            key = (self.gemini_api_key or "").strip()
            return bool(key and "your_" not in key and "placeholder" not in key)
        elif provider == "openai":
            key = (self.openai_api_key or "").strip()
            return bool(key and key.startswith("sk-"))
        elif provider == "anthropic":
            key = (self.anthropic_api_key or "").strip()
            return bool(key)
        return False

    @property
    def active_llm_model(self) -> str:
        if self.llm_model:
            return self.llm_model
        provider = self.llm_provider.lower()
        if provider == "gemini":
            return "gemini-2.5-flash"
        elif provider == "openai":
            return "gpt-4o-mini"
        elif provider == "anthropic":
            return "claude-3-5-sonnet-20241022"
        return "default"

    @property
    def required_api_key_env_var(self) -> str:
        provider = self.llm_provider.lower()
        if provider == "gemini":
            return "GEMINI_API_KEY"
        elif provider == "openai":
            return "OPENAI_API_KEY"
        elif provider == "anthropic":
            return "ANTHROPIC_API_KEY"
        return "GEMINI_API_KEY"


@lru_cache
def get_settings() -> Settings:
    return Settings()

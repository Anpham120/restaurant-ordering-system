from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    service_name: str = "Restaurant AI Service"
    api_prefix: str = "/api/v1"
    knowledge_base_path: Path = Path("knowledge_base")
    llm_provider: str = "9router"
    llm_model: str = "9router"
    llm_base_url: str = "http://localhost:20128/v1"
    llm_api_key: str | None = None
    llm_timeout_seconds: float = 20
    cors_allowed_origins: str = "http://localhost:5173,http://localhost:5174"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="AI_SERVICE_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

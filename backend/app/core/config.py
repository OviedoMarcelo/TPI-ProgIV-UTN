from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

RAIZ_BACKEND = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Configuración leída de backend/.env. Los secretos no tienen valor por
    defecto: si faltan, la aplicación no arranca (fail-fast)."""

    model_config = SettingsConfigDict(
        env_file=RAIZ_BACKEND / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = Field(repr=False)  # obligatoria
    secret_key: str = Field(min_length=32, repr=False)  # obligatoria
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    frontend_origin: str = "http://localhost:5173"
    cookie_secure: bool = False  # en producción, con HTTPS: true

    @field_validator("database_url")
    @classmethod
    def usar_psycopg3(cls, url: str) -> str:
        # "postgresql://" haría que SQLAlchemy busque psycopg2; el proyecto
        # usa psycopg 3, cuyo dialecto es "postgresql+psycopg://"
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


settings = Settings()  # type: ignore[call-arg]  # los valores vienen del entorno

from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel

from app.core.security import MAX_BYTES_PASSWORD


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50, regex=r"^[A-Za-z0-9._-]+$")
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("username", "email")
    @classmethod
    def normalizar(cls, valor: str) -> str:
        # "Juan" y "juan" son el mismo usuario
        return valor.strip().lower()

    @field_validator("full_name")
    @classmethod
    def sin_espacios_extremos(cls, valor: str) -> str:
        valor = valor.strip()
        if len(valor) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return valor

    @field_validator("password")
    @classmethod
    def maximo_bcrypt(cls, valor: str) -> str:
        # bcrypt solo procesa 72 bytes: más largo, el resto se ignoraría
        if len(valor.encode("utf-8")) > MAX_BYTES_PASSWORD:
            raise ValueError(f"La contraseña no puede superar {MAX_BYTES_PASSWORD} bytes")
        return valor


class UserPublic(SQLModel):
    """Salida de usuario: nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime

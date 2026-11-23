from pydantic import field_validator
from sqlmodel import Field, SQLModel


class CategoriaBase(SQLModel):
    @field_validator("nombre", check_fields=False)
    @classmethod
    def nombre_limpio(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        valor = valor.strip()
        if len(valor) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return valor

    @field_validator("descripcion", check_fields=False)
    @classmethod
    def descripcion_limpia(cls, valor: str | None) -> str | None:
        # Un texto vacío o solo con espacios se guarda como None
        return (valor.strip() or None) if valor is not None else None


class CategoriaCreate(CategoriaBase):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)


class CategoriaUpdate(CategoriaBase):
    """PUT con actualización parcial: solo cambian los campos enviados."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool

from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoBase(SQLModel):
    @field_validator("nombre", check_fields=False)
    @classmethod
    def nombre_limpio(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        valor = valor.strip()
        if not valor:
            raise ValueError("El nombre es obligatorio")
        return valor

    @field_validator("descripcion", "imagen_url", check_fields=False)
    @classmethod
    def texto_opcional(cls, valor: str | None) -> str | None:
        # Un texto vacío o solo con espacios se guarda como None
        return (valor.strip() or None) if valor is not None else None

    @field_validator("imagen_url", check_fields=False)
    @classmethod
    def url_http(cls, valor: str | None) -> str | None:
        if valor is not None and not valor.startswith(("http://", "https://")):
            raise ValueError("La imagen debe ser una URL que empiece con http:// o https://")
        return valor


class ProductoCreate(ProductoBase):
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str | None = Field(default=None, max_length=500)
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(ProductoBase):
    """PUT con actualización parcial: solo cambian los campos enviados."""

    nombre: str | None = Field(default=None, min_length=1, max_length=150)
    descripcion: str | None = Field(default=None, max_length=500)
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = None


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    categoria_id: int
    activo: bool
    categoria: CategoriaRead  # viene de la relación Producto.categoria


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]

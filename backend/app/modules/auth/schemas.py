from sqlmodel import SQLModel


class Mensaje(SQLModel):
    """Respuesta del login y del logout: el token nunca viaja en el cuerpo."""

    message: str

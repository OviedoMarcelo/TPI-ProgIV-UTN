from fastapi import HTTPException


class ErrorDeDominio(Exception):
    """Base de las excepciones que lanzan los Services. Cada módulo define las
    suyas en service.py y su Router las traduce a un código HTTP."""

    def __init__(self, mensaje: str):
        super().__init__(mensaje)
        self.mensaje = mensaje


def a_http(exc: ErrorDeDominio, codigos: dict[type[ErrorDeDominio], int]) -> HTTPException:
    """Traduce una excepción de dominio con la tabla de códigos del Router.
    Las reglas de negocio que no figuran en la tabla responden 400."""
    for tipo, codigo in codigos.items():
        if isinstance(exc, tipo):
            return HTTPException(status_code=codigo, detail=exc.mensaje)
    return HTTPException(status_code=400, detail=exc.mensaje)

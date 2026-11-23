from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Agrupa las operaciones de un caso de uso en UNA transacción.

    Se usa con `with`: al entrar abre la sesión y crea los repositorios; al
    salir hace commit si no hubo errores o rollback si se lanzó una excepción,
    y siempre cierra la sesión. Ningún Service ni Router llama a commit().
    Cada módulo hereda y crea en `_crear_repositorios` los que necesita.
    """

    session: Session

    def __init__(self, fabrica: Callable[[], Session] = session_factory):
        # Inyectar la fábrica permite usar otra base (por ejemplo, en pruebas)
        self._fabrica = fabrica

    def _crear_repositorios(self) -> None:
        """Hook: cada Unit of Work concreto crea acá sus repositorios."""

    def __enter__(self) -> Self:
        self.session = self._fabrica()
        self._crear_repositorios()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                # Cualquier excepción dentro del with descarta TODO lo hecho
                self.session.rollback()
        except Exception:
            # Si falla el propio commit también se deshace antes de propagar
            self.session.rollback()
            raise
        finally:
            self.session.close()
        # Devuelve None: la excepción original (si la hubo) se sigue propagando

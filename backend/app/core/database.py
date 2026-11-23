from datetime import UTC, datetime

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita este argumento para usarse desde los hilos de FastAPI
_argumentos = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

# echo=False: con echo=True los hashes de las contraseñas quedarían en la consola
engine = create_engine(settings.database_url, echo=False, connect_args=_argumentos)


def ahora() -> datetime:
    """Fecha y hora actual en UTC (la asigna el backend, nunca el cliente)."""
    return datetime.now(UTC)


def create_all_tables() -> None:
    # Importar los modelos registra todas las tablas en SQLModel.metadata
    import app.db.models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Abre una sesión nueva. La usa el Unit of Work en __enter__."""
    return Session(engine)

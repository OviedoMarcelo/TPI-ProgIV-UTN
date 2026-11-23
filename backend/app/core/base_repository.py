from sqlmodel import Session, SQLModel, select


class BaseRepository[T: SQLModel]:
    """Acceso genérico a una tabla. Sin reglas de negocio y sin commit: la
    transacción la confirma el Unit of Work.

    Cada repositorio concreto hereda indicando su modelo, por ejemplo
    BaseRepository[Pedido], y agrega solo sus consultas propias.
    """

    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, entidad_id: int) -> T | None:
        return self.session.get(self.model, entidad_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, entidad: T) -> T:
        self.session.add(entidad)
        # flush envía el INSERT o UPDATE sin confirmar: la base asigna el id y
        # queda disponible (por ejemplo, para crear las líneas del pedido)
        self.session.flush()
        self.session.refresh(entidad)
        return entidad

    def delete(self, entidad: T) -> None:
        self.session.delete(entidad)
        self.session.flush()

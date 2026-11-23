from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        # Sin distinguir mayúsculas e incluyendo las dadas de baja: la baja
        # lógica no libera el nombre
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        return self.session.exec(consulta).first()

    def list_activas(self) -> list[Categoria]:
        consulta = (
            select(Categoria).where(col(Categoria.activo)).order_by(col(Categoria.nombre))
        )
        return list(self.session.exec(consulta).all())

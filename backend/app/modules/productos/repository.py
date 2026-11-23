from sqlalchemy import ColumnElement, func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def search(
        self,
        *,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> tuple[int, list[Producto]]:
        """Productos activos que cumplen los filtros: devuelve (total, página)."""
        filtros: list[ColumnElement[bool]] = [col(Producto.activo).is_(True)]
        if search:
            # ilike: sin distinguir mayúsculas
            filtros.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            filtros.append(col(Producto.categoria_id) == categoria_id)
        if disponible is not None:
            filtros.append(col(Producto.disponible) == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        pagina = self.session.exec(
            select(Producto)
            .where(*filtros)
            .order_by(col(Producto.nombre), col(Producto.id))
            .offset(skip)
            .limit(limit)
        ).all()
        return total, list(pagina)

    def get_para_actualizar(self, producto_id: int) -> Producto | None:
        """Lee el producto bloqueando su fila (SELECT ... FOR UPDATE) hasta el
        commit: dos pedidos simultáneos no pueden descontar el mismo stock."""
        return self.session.get(Producto, producto_id, with_for_update=True)

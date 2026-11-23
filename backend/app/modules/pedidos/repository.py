from datetime import datetime

from sqlalchemy import ColumnElement, func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def list_by_usuario(
        self, *, usuario_id: int | None, estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        """Pedidos de un usuario (o de todos con usuario_id=None), del más
        nuevo al más viejo: devuelve (total, página)."""
        filtros: list[ColumnElement[bool]] = []
        if usuario_id is not None:
            filtros.append(col(Pedido.usuario_id) == usuario_id)
        if estado is not None:
            filtros.append(col(Pedido.estado) == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        pagina = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return total, list(pagina)

    def get_para_actualizar(self, pedido_id: int) -> Pedido | None:
        """Bloquea la fila hasta el commit: dos cancelaciones simultáneas del
        mismo pedido no pueden restituir el stock dos veces."""
        return self.session.get(Pedido, pedido_id, with_for_update=True)

    def count_by_estado(self) -> dict[str, int]:
        consulta = select(Pedido.estado, func.count()).group_by(col(Pedido.estado))
        return {estado: cantidad for estado, cantidad in self.session.exec(consulta).all()}

    def count_desde(self, desde: datetime) -> int:
        consulta = select(func.count()).select_from(Pedido).where(col(Pedido.created_at) >= desde)
        return self.session.exec(consulta).one()

    def sum_total_por_estado(self, estado: str) -> float:
        consulta = select(func.coalesce(func.sum(Pedido.total), 0)).where(
            col(Pedido.estado) == estado
        )
        return float(self.session.exec(consulta).one())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)

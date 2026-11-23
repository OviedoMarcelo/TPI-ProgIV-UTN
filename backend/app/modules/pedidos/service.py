from datetime import datetime

from app.core.errors import ErrorDeDominio
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import ROL_ADMIN
from app.modules.usuarios.schemas import UserPublic

# ---------------------------------------------------------------- excepciones


class PedidoNoEncontrado(ErrorDeDominio):
    """404"""


class ProductoNoEncontrado(ErrorDeDominio):
    """404: el producto del ítem no existe o está dado de baja."""


class PedidoAjeno(ErrorDeDominio):
    """403: el pedido es de otro usuario."""


class ProductoRepetido(ErrorDeDominio):
    """400"""


class ProductoNoDisponible(ErrorDeDominio):
    """400"""


class StockInsuficiente(ErrorDeDominio):
    """400"""


class TransicionInvalida(ErrorDeDominio):
    """400"""


# ---------------------------------------------------- máquina de estados (RN-02)

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),  # terminal
    CANCELADO: set(),  # terminal
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        """RN-01: todo en una transacción. Si una validación falla, el
        rollback del Unit of Work deshace el pedido, las líneas y el stock."""
        ids = [item.producto_id for item in datos.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido("Un producto no puede repetirse en el pedido")

        with self.uow as uow:
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=PENDIENTE,
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega,
                    notas=datos.notas,
                    total=0,
                )
            )
            assert pedido.id is not None

            # Se bloquean las filas en orden de id: dos pedidos con los mismos
            # productos no pueden quedar esperándose entre sí (deadlock)
            productos = {pid: uow.productos.get_para_actualizar(pid) for pid in sorted(ids)}

            total = 0.0
            for item in datos.items:
                producto = productos[item.producto_id]
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"No existe el producto con id {item.producto_id}")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de '{producto.nombre}': "
                        f"quedan {producto.stock} y pediste {item.cantidad}"
                    )
                # En la misma iteración: se descuenta el stock y se crea la
                # línea con la COPIA del nombre y del precio (RN-05)
                producto.stock -= item.cantidad
                uow.productos.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            return PedidoRead.model_validate(uow.pedidos.add(pedido))

    def listar(
        self, usuario: UserPublic, *, estado: EstadoPedido | None, skip: int, limit: int
    ) -> PedidosPaginados:
        # RN-04: el admin ve todos; el cliente, solo los suyos
        usuario_id = None if usuario.role == ROL_ADMIN else usuario.id
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=usuario_id, estado=estado, skip=skip, limit=limit
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if usuario.role != ROL_ADMIN and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés ver un pedido de otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        """Admin: avanza o cancela según el mapa de transiciones (RN-02)."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id, bloquear=True)
            # La transición se valida ANTES de modificar el pedido
            if nuevo not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(
                    f"No se puede pasar de {pedido.estado} a {nuevo}"
                    if TRANSICIONES[pedido.estado]
                    else f"El pedido está {pedido.estado} y ya no admite cambios"
                )
            if nuevo == CANCELADO:
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo
            return PedidoRead.model_validate(uow.pedidos.add(pedido))

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """Dueño: cancela su pedido solo en PENDIENTE (RN-03 y RN-04)."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id, bloquear=True)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés cancelar un pedido de otro usuario")
            if pedido.estado != PENDIENTE:
                raise TransicionInvalida(
                    f"Solo se puede cancelar un pedido PENDIENTE (este está {pedido.estado})"
                )
            self._restituir_stock(uow, pedido)
            pedido.estado = CANCELADO
            return PedidoRead.model_validate(uow.pedidos.add(pedido))

    def resumen(self) -> ResumenPedidos:
        # "Hoy" según la zona horaria del servidor, desde las 00:00
        inicio_del_dia = datetime.now().astimezone().replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        with self.uow as uow:
            conteo = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteo.get(PENDIENTE, 0),
                en_preparacion=conteo.get(EN_PREPARACION, 0),
                entregados=conteo.get(ENTREGADO, 0),
                cancelados=conteo.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado(ENTREGADO), 2),
            )

    # ------------------------------------------------------------- auxiliares

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int, bloquear: bool = False) -> Pedido:
        pedido = (
            uow.pedidos.get_para_actualizar(pedido_id)
            if bloquear
            else uow.pedidos.get_by_id(pedido_id)
        )
        if pedido is None:
            raise PedidoNoEncontrado(f"No existe el pedido con id {pedido_id}")
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock lo de cada línea, en la misma transacción
        que cambia el estado. Vale aunque el producto esté dado de baja."""
        for linea in sorted(pedido.items, key=lambda d: d.producto_id):
            producto = uow.productos.get_para_actualizar(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad
                uow.productos.add(producto)

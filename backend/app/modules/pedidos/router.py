from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.core.deps import SOLO_ADMIN, UsuarioActivoDep
from app.core.errors import ErrorDeDominio, a_http
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

# Las demás reglas (stock, disponibilidad, repetidos, transiciones) responden 400
CODIGOS: dict[type[ErrorDeDominio], int] = {
    PedidoNoEncontrado: 404,
    ProductoNoEncontrado: 404,
    PedidoAjeno: 403,
}


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(datos: PedidoCreate, usuario: UsuarioActivoDep, service: ServiceDep):
    assert usuario.id is not None
    try:
        return service.crear(datos, usuario.id)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: UsuarioActivoDep,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(usuario, estado=estado, skip=skip, limit=limit)


# Se declara antes de /{pedido_id}: si no, "resumen" se tomaría como un id
@router.get("/resumen", response_model=ResumenPedidos, dependencies=SOLO_ADMIN)
def resumen_pedidos(service: ServiceDep):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: UsuarioActivoDep, service: ServiceDep):
    try:
        return service.obtener(pedido_id, usuario)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=SOLO_ADMIN)
def cambiar_estado(pedido_id: int, datos: CambioEstado, service: ServiceDep):
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: UsuarioActivoDep, service: ServiceDep):
    try:
        return service.cancelar(pedido_id, usuario)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc

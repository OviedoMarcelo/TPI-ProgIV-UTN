from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.core.deps import SOLO_ADMIN
from app.core.errors import ErrorDeDominio, a_http
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaDelProductoNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])

CODIGOS: dict[type[ErrorDeDominio], int] = {
    ProductoNoEncontrado: 404,
    CategoriaDelProductoNoEncontrada: 404,
}


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(max_length=100, description="Busca en el nombre")] = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
):
    return service.listar(
        search=search, categoria_id=categoria_id, disponible=disponible, skip=skip, limit=limit
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep):
    try:
        return service.obtener(producto_id)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.post(
    "", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=SOLO_ADMIN
)
def crear_producto(datos: ProductoCreate, service: ServiceDep):
    try:
        return service.crear(datos)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=SOLO_ADMIN)
def actualizar_producto(producto_id: int, datos: ProductoUpdate, service: ServiceDep):
    try:
        return service.actualizar(producto_id, datos)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.patch("/{producto_id}/stock", response_model=ProductoRead, dependencies=SOLO_ADMIN)
def actualizar_stock(producto_id: int, datos: ProductoStockUpdate, service: ServiceDep):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=SOLO_ADMIN)
def eliminar_producto(producto_id: int, service: ServiceDep):
    try:
        service.eliminar(producto_id)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

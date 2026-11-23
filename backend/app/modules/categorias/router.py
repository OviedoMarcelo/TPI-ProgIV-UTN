from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.core.deps import SOLO_ADMIN
from app.core.errors import ErrorDeDominio, a_http
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])

CODIGOS: dict[type[ErrorDeDominio], int] = {CategoriaNoEncontrada: 404, NombreDuplicado: 409}


def get_categoria_service() -> CategoriaService:
    # El Router recibe el Service armado; nunca abre el Unit of Work
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.post(
    "", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=SOLO_ADMIN
)
def crear_categoria(datos: CategoriaCreate, service: ServiceDep):
    try:
        return service.crear(datos)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=SOLO_ADMIN)
def actualizar_categoria(categoria_id: int, datos: CategoriaUpdate, service: ServiceDep):
    try:
        return service.actualizar(categoria_id, datos)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.delete(
    "/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=SOLO_ADMIN
)
def eliminar_categoria(categoria_id: int, service: ServiceDep):
    try:
        service.eliminar(categoria_id)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from fastapi import APIRouter

from app.core.deps import AdminDep, SOLO_ADMIN, UsuarioServiceDep
from app.core.errors import ErrorDeDominio, a_http
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])

CODIGOS: dict[type[ErrorDeDominio], int] = {UsuarioNoEncontrado: 404, AutoDesactivacion: 400}


@router.get("", response_model=list[UserPublic], dependencies=SOLO_ADMIN)
def listar_usuarios(service: UsuarioServiceDep):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic, dependencies=SOLO_ADMIN)
def activar_usuario(usuario_id: int, service: UsuarioServiceDep):
    try:
        return service.activar(usuario_id)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: AdminDep, service: UsuarioServiceDep):
    try:
        return service.desactivar(usuario_id, admin.id)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc

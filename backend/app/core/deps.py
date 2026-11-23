"""Cadena de dependencias de seguridad:

oauth2_scheme -> get_current_user -> get_current_active_user -> require_role(roles)
(lee la cookie)  (token + base: 401)  (desactivado: 400)         (rol: 403)
"""

from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.requests import HTTPConnection
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.modules.usuarios.models import ROL_ADMIN
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

NOMBRE_COOKIE = "access_token"
MENSAJE_DESACTIVADA = "Cuenta de usuario desactivada"


def _no_autenticado(detalle: str) -> HTTPException:
    # El estándar OAuth2 pide el header WWW-Authenticate en los 401
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detalle,
        headers={"WWW-Authenticate": "Bearer"},
    )


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Lee el token SOLO de la cookie HttpOnly; el header Authorization se ignora.
    Hereda de OAuth2PasswordBearer para que /docs muestre el botón Authorize."""

    async def __call__(self, request: HTTPConnection) -> str | None:
        token = request.cookies.get(NOMBRE_COOKIE)
        if not token and self.auto_error:
            raise _no_autenticado("No autenticado")
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_usuario_service() -> UsuarioService:
    # Un Unit of Work nuevo por request
    return UsuarioService(UsuarioUnitOfWork())


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], service: UsuarioServiceDep
) -> UserPublic:
    usuario_id = decode_access_token(token)
    usuario = service.buscar_para_sesion(usuario_id) if usuario_id else None
    if usuario is None:
        raise _no_autenticado("Credenciales inválidas o sesión vencida")
    return usuario


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=MENSAJE_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[..., UserPublic]:
    """Fábrica de dependencias: devuelve una que exige alguno de esos roles."""

    def verificar_rol(
        usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return usuario

    return verificar_rol


# Para los endpoints que necesitan saber quién es el usuario
UsuarioActivoDep = Annotated[UserPublic, Depends(get_current_active_user)]
AdminDep = Annotated[UserPublic, Depends(require_role([ROL_ADMIN]))]

# Para proteger endpoints que no necesitan el dato: dependencies=SOLO_ADMIN
SOLO_ADMIN = [Depends(require_role([ROL_ADMIN]))]

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import NOMBRE_COOKIE, UsuarioActivoDep
from app.core.errors import ErrorDeDominio, a_http
from app.modules.auth.schemas import Mensaje
from app.modules.auth.service import (
    AuthService,
    CredencialesIncorrectas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])

CODIGOS: dict[type[ErrorDeDominio], int] = {
    UsuarioDuplicado: 409,
    CredencialesIncorrectas: 401,
    CuentaDesactivada: 400,
}


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(datos: UserCreate, service: AuthServiceDep):
    try:
        return service.registrar(datos)
    except ErrorDeDominio as exc:
        raise a_http(exc, CODIGOS) from exc


@router.post("/token", response_model=Mensaje)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: AuthServiceDep,
):
    try:
        token = service.login(form.username, form.password)
    except ErrorDeDominio as exc:
        headers = {"WWW-Authenticate": "Bearer"} if isinstance(exc, CredencialesIncorrectas) else None
        error = a_http(exc, CODIGOS)
        error.headers = headers
        raise error from exc
    # HttpOnly: JavaScript no puede leerla. SameSite=Lax: el navegador no la
    # envía en peticiones POST iniciadas por otros sitios (protección CSRF)
    response.set_cookie(
        key=NOMBRE_COOKIE,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje)
def logout(response: Response):
    # Mismos atributos que al crearla; si no, el navegador no la reemplaza
    response.delete_cookie(
        key=NOMBRE_COOKIE,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path="/",
    )
    return Mensaje(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def perfil(usuario: UsuarioActivoDep):
    return usuario

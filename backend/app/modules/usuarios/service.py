from app.core.errors import ErrorDeDominio
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(ErrorDeDominio):
    """404"""


class AutoDesactivacion(ErrorDeDominio):
    """400: el admin no puede desactivarse a sí mismo."""


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def buscar_para_sesion(self, usuario_id: int) -> UserPublic | None:
        """Lo usa get_current_user para cargar el usuario del token."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            return UserPublic.model_validate(usuario) if usuario else None

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordenados()]

    def activar(self, usuario_id: int) -> UserPublic:
        # Idempotente: si ya estaba activo, responde 200 igual
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = False
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise AutoDesactivacion("No podés desactivar tu propia cuenta")
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = True
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    @staticmethod
    def _obtener(uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado(f"No existe el usuario con id {usuario_id}")
        return usuario

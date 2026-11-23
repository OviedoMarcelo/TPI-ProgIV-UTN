from app.core.errors import ErrorDeDominio
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import ROL_USER, Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(ErrorDeDominio):
    """409"""


class CredencialesIncorrectas(ErrorDeDominio):
    """401"""


class CuentaDesactivada(ErrorDeDominio):
    """400"""


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(datos.username):
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(datos.email):
                raise UsuarioDuplicado("El email ya está registrado")
            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=datos.email,
                hashed_password=hash_password(datos.password),
                role=ROL_USER,  # el registro público nunca crea admins
            )
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    def login(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT que el Router pone en la cookie."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip().lower())
            # Se verifica siempre (con un hash ficticio si no existe): mismo
            # tiempo de respuesta y mismo mensaje para usuario o contraseña
            if not verify_password(password, usuario.hashed_password if usuario else None):
                raise CredencialesIncorrectas("Usuario o contraseña incorrectos")
            assert usuario is not None and usuario.id is not None
            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")
            return create_access_token(usuario.id)

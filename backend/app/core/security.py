from datetime import timedelta

import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

from app.core.config import settings
from app.core.database import ahora

# Hash bcrypt (lento y con sal). pwdlib reemplaza a passlib, que está abandonada
# y no funciona con bcrypt 5.
_password_hash = PasswordHash((BcryptHasher(),))

# bcrypt solo procesa los primeros 72 BYTES (una letra acentuada ocupa 2)
MAX_BYTES_PASSWORD = 72


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


# Se verifica contra este hash cuando el usuario no existe: así el login tarda
# lo mismo y no revela qué usuarios están registrados
_HASH_FICTICIO = hash_password("usuario-inexistente")


def verify_password(password: str, hashed_password: str | None) -> bool:
    if len(password.encode("utf-8")) > MAX_BYTES_PASSWORD:
        return False
    valida = _password_hash.verify(password, hashed_password or _HASH_FICTICIO)
    return valida and hashed_password is not None


def create_access_token(usuario_id: int) -> str:
    # El rol no viaja en el token: se lee de la base en cada petición, así un
    # cambio de rol o una desactivación valen en el acto
    datos = {
        "sub": str(usuario_id),
        "exp": ahora() + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(datos, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> int | None:
    """Devuelve el id del usuario (sub) o None si el token no es válido."""
    try:
        datos = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],  # lista fija de algoritmos
            options={"require": ["exp", "sub"]},
        )
        return int(datos["sub"])
    except (jwt.InvalidTokenError, ValueError):  # firma, vencimiento o formato
        return None

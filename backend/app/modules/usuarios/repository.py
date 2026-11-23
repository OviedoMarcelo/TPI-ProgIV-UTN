from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Usuario | None:
        consulta = select(Usuario).where(col(Usuario.username) == username)
        return self.session.exec(consulta).first()

    def get_by_email(self, email: str) -> Usuario | None:
        consulta = select(Usuario).where(col(Usuario.email) == email)
        return self.session.exec(consulta).first()

    def list_ordenados(self) -> list[Usuario]:
        return list(self.session.exec(select(Usuario).order_by(col(Usuario.id))).all())

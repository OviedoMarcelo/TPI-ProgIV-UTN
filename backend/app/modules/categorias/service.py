from app.core.errors import ErrorDeDominio
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(ErrorDeDominio):
    """404"""


class NombreDuplicado(ErrorDeDominio):
    """409"""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._nombre_libre(uow, datos.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(datos))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            cambios = datos.model_dump(exclude_unset=True)
            if cambios.get("nombre") is None:
                cambios.pop("nombre", None)  # el nombre es obligatorio: null no lo borra
            elif cambios["nombre"].lower() != categoria.nombre.lower():
                self._nombre_libre(uow, cambios["nombre"])
            categoria.sqlmodel_update(cambios)
            return CategoriaRead.model_validate(uow.categorias.add(categoria))

    def eliminar(self, categoria_id: int) -> None:
        # Baja lógica: no libera el nombre ni oculta sus productos
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        # Una categoría dada de baja se trata como inexistente
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"No existe la categoría con id {categoria_id}")
        return categoria

    @staticmethod
    def _nombre_libre(uow: CategoriaUnitOfWork, nombre: str) -> None:
        if uow.categorias.get_by_nombre(nombre):
            raise NombreDuplicado(f"Ya existe una categoría llamada '{nombre}'")

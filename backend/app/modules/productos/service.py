from app.core.errors import ErrorDeDominio
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(ErrorDeDominio):
    """404"""


class CategoriaDelProductoNoEncontrada(ErrorDeDominio):
    """404: la categoría indicada no existe o está dada de baja."""


# Campos que nunca se borran con null en una actualización parcial
_OBLIGATORIOS = ("nombre", "precio_base", "stock", "disponible", "categoria_id")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        *,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                search=search.strip() if search else None,
                categoria_id=categoria_id,
                disponible=disponible,
                skip=skip,
                limit=limit,
            )
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, producto_id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._categoria_activa(uow, datos.categoria_id)
            producto = uow.productos.add(Producto.model_validate(datos))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            cambios = datos.model_dump(exclude_unset=True)
            for campo in _OBLIGATORIOS:
                if campo in cambios and cambios[campo] is None:
                    del cambios[campo]
            if "categoria_id" in cambios:
                self._categoria_activa(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            return ProductoRead.model_validate(uow.productos.add(producto))

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            producto.stock = datos.stock
            producto.disponible = datos.disponible
            return ProductoRead.model_validate(uow.productos.add(producto))

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            producto.activo = False  # baja lógica: sus líneas de pedido siguen válidas
            uow.productos.add(producto)

    @staticmethod
    def _activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        # Un producto dado de baja se trata como inexistente
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(f"No existe el producto con id {producto_id}")
        return producto

    @staticmethod
    def _categoria_activa(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaDelProductoNoEncontrada(
                f"No existe la categoría con id {categoria_id}"
            )

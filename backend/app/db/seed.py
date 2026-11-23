"""Carga los datos iniciales. Es idempotente: se puede ejecutar varias veces y
solo agrega lo que falta (busca cada registro por su nombre antes de crearlo).

    python -m app.db.seed
"""

from sqlmodel import Session, col, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.db.models import Categoria, Producto, Usuario
from app.modules.usuarios.models import ROL_ADMIN, ROL_USER

USUARIOS = [
    # (username, nombre completo, email, contraseña, rol)
    ("admin", "Administrador", "admin@foodstore.com", "Admin1234!", ROL_ADMIN),
    ("cliente", "Cliente de Prueba", "cliente@foodstore.com", "Cliente1234!", ROL_USER),
]

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra, enteras de 8 porciones"),
    ("Hamburguesas", "Hamburguesas de carne con papas fritas"),
    ("Empanadas", "Empanadas al horno, por unidad"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Postres caseros"),
]


def _imagen(texto: str) -> str:
    # Imagen de ejemplo generada por un servicio público de marcadores
    return f"https://placehold.co/400x300/orange/white?text={texto.replace(' ', '+')}"


PRODUCTOS = [
    # (categoría, nombre, descripción, precio, stock)
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500.0, 20),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 10800.0, 15),
    ("Pizzas", "Pizza Fugazzeta", "Muzzarella y cebolla", 10200.0, 12),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 8200.0, 25),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne, cheddar y panceta", 11500.0, 18),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas y vegetales", 8900.0, 10),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo", 1300.0, 60),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1200.0, 60),
    ("Empanadas", "Empanada de Humita", "Choclo cremoso", 1200.0, 40),
    ("Bebidas", "Gaseosa Cola 1,5 L", "Botella de 1,5 litros", 3200.0, 30),
    ("Bebidas", "Agua Mineral 500 ml", "Sin gas", 1500.0, 40),
    ("Bebidas", "Cerveza Rubia 1 L", "Botella retornable", 4200.0, 24),
    ("Postres", "Flan Casero", "Con dulce de leche", 3500.0, 15),
    ("Postres", "Tiramisú", "Porción individual", 4800.0, 8),
]


def cargar_usuarios(session: Session) -> None:
    for username, nombre, email, password, rol in USUARIOS:
        if session.exec(select(Usuario).where(col(Usuario.username) == username)).first():
            continue
        session.add(
            Usuario(
                username=username,
                full_name=nombre,
                email=email,
                hashed_password=hash_password(password),
                role=rol,
            )
        )
        print(f"Usuario creado: {username} ({rol})")


def cargar_categorias(session: Session) -> dict[str, Categoria]:
    categorias: dict[str, Categoria] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(col(Categoria.nombre) == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()  # asigna el id para los productos
        categorias[nombre] = categoria
    return categorias


def cargar_productos(session: Session, categorias: dict[str, Categoria]) -> None:
    for nombre_categoria, nombre, descripcion, precio, stock in PRODUCTOS:
        if session.exec(select(Producto).where(col(Producto.nombre) == nombre)).first():
            continue
        categoria = categorias[nombre_categoria]
        assert categoria.id is not None
        session.add(
            Producto(
                categoria_id=categoria.id,
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                imagen_url=_imagen(nombre),
                stock=stock,
            )
        )


def principal() -> None:
    create_all_tables()
    with Session(engine) as session:
        cargar_usuarios(session)
        categorias = cargar_categorias(session)
        cargar_productos(session, categorias)
        session.commit()  # el seed no pasa por un Service: confirma él mismo
        total_categorias = len(session.exec(select(Categoria)).all())
        total_productos = len(session.exec(select(Producto)).all())
    print(f"Categorías: {total_categorias} - Productos: {total_productos}")


if __name__ == "__main__":
    principal()

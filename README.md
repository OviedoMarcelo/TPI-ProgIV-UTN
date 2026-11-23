# Food Store

Trabajo Práctico Integrador de Programación IV (TUPaD - UTN).
Alumno: **Marcelo Oviedo**.

Sistema de pedidos de comida: los clientes navegan el catálogo, arman el carrito y
confirman pedidos; los administradores gestionan categorías, productos, pedidos y
usuarios desde un panel.

- **Repositorio:** <https://github.com/OviedoMarcelo/TPI-ProgIV-UTN>
- **Video de presentación:** <ENLACE_AL_VIDEO>

| Capa | Tecnologías |
|---|---|
| Backend | Python, FastAPI, SQLModel (SQLAlchemy 2), PostgreSQL, psycopg 3, PyJWT, pwdlib (bcrypt) |
| Frontend | React 19, TypeScript (estricto), Vite, Tailwind CSS 4, React Router, Axios, Zustand, TanStack Query, Form y Table |

## Requisitos

- **Python 3.12** o superior
- **Node.js 22.12** o superior y **pnpm** (`npm install -g pnpm`)
- **Docker** (para PostgreSQL) o un PostgreSQL instalado localmente

## 1. Base de datos

```bash
docker run --name postgres-tupad -e POSTGRES_PASSWORD=<contraseña> -p 5432:5432 -d postgres
docker exec -it postgres-tupad psql -U postgres -c "CREATE DATABASE foodstore_db;"
```

Si el contenedor ya existe: `docker start postgres-tupad` y crear la base.
Las tablas las crea la aplicación al arrancar.

## 2. Backend

Todos los comandos se ejecutan en la carpeta `backend/`.

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS / Linux
pip install -r requirements.txt
```

### Variables de entorno

Copiar `.env.example` como `.env` y completar los valores:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql+psycopg://postgres:<contraseña>@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar los JWT (mínimo 32 caracteres) | ver comando abajo |
| `ALGORITHM` | Algoritmo de firma | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo con HTTPS | `false` |

Generar una `SECRET_KEY`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### Seed (datos iniciales)

```bash
python -m app.db.seed
```

Crea las tablas y carga dos usuarios, 5 categorías y 14 productos. Se puede
ejecutar más de una vez: no duplica datos.

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | Administrador |
| `cliente` | `Cliente1234!` | Cliente |

### Ejecutar

```bash
uvicorn app.main:app --reload --reload-dir app
```

`--reload-dir app` hace que solo se reinicie al cambiar el código (y no por
cambios dentro de `.venv`).

- API: <http://localhost:8000/api/v1>
- Documentación interactiva: <http://localhost:8000/docs> y <http://localhost:8000/redoc>

## 3. Frontend

En otra terminal, dentro de la carpeta `frontend/`:

```bash
pnpm install
pnpm dev
```

Abrir <http://localhost:5173>. El puerto es fijo porque es el único origen que
admite el CORS del backend.

Variable de entorno opcional (`.env`, ver `.env.example`):

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

Usar `localhost` y no `127.0.0.1`: si no, el navegador no envía la cookie de sesión.

Otros comandos: `pnpm build` (compilación de producción) y `pnpm lint`.

## Funcionalidades

**Cliente**
- Catálogo con búsqueda por nombre, filtro por categoría y paginación en el servidor.
- Carrito persistente en el navegador (cantidades limitadas al stock).
- Checkout con dirección, forma de pago (efectivo o transferencia) y notas.
- "Mis pedidos": historial paginado, detalle y cancelación de pedidos pendientes.

**Administrador**
- Resumen: pedidos del día, cantidad por estado e ingresos de los entregados.
- ABM de categorías y productos (con baja lógica) y ajuste rápido de stock.
- Gestión de pedidos: filtro por estado y avance PENDIENTE → EN_PREPARACION → ENTREGADO, o cancelación.
- Usuarios: listado, activación y desactivación de cuentas.

**Reglas de negocio**
- El pedido se crea en una sola transacción (Unit of Work): si un producto no tiene
  stock, no se guarda nada.
- Los productos se bloquean con `SELECT ... FOR UPDATE` para evitar vender el mismo
  stock dos veces.
- El precio lo toma el backend; el detalle guarda una copia del nombre y del precio.
- Cancelar un pedido restituye el stock. Los estados finales no cambian.
- Sesión con JWT en cookie HttpOnly; permisos por rol en el backend (401/403).

## Estructura

```
backend/app/
├── main.py              # FastAPI, CORS, manejo de errores y routers (/api/v1)
├── core/                # config, base de datos, seguridad, dependencias,
│                        # BaseRepository, UnitOfWork, errores de dominio
├── db/                  # registro de modelos y seed
└── modules/             # auth, usuarios, categorias, productos, pedidos
    └── <módulo>/        # models, schemas, repository, unit_of_work, service, router

frontend/src/
├── features/            # auth, categorias, productos, pedidos, usuarios
│   └── <feature>/       # api, hooks, components, pages, types, index.ts (barrel)
├── routes/              # AppRouter y ProtectedRoute (sesión y rol)
├── shared/              # api (Axios, interceptores), ui, layout, componentes, tipos
└── store/               # Zustand: sesión, carrito, tema y notificaciones
```

Backend en capas: **Router → Service → Unit of Work → Repository → Modelo**.
El router solo traduce HTTP; las reglas viven en el service.

Frontend por features: cada una expone su API pública en `index.ts` y las demás
solo importan desde ahí. El estado del servidor lo maneja TanStack Query; el
estado del cliente (sesión, carrito, tema), Zustand.

## Versiones de las librerías

Se usaron las versiones más recientes disponibles en lugar de algunas de las
sugeridas, para evitar librerías discontinuadas:

- **psycopg 3** en lugar de psycopg2.
- **PyJWT** en lugar de python-jose (sin mantenimiento).
- **pwdlib** en lugar de passlib (sin mantenimiento e incompatible con bcrypt 5).
- **React Router 8** (paquete `react-router`, que reemplaza a `react-router-dom`),
  **TypeScript 7** y **TanStack Table 9**.

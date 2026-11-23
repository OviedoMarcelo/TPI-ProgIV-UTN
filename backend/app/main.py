from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Al arrancar: crea las tablas que falten (los datos los carga el seed)
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Trabajo Práctico Integrador - Programación 4 (TUPaD, UTN)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: no admite "*" en allow_origins, solo el origen del
# frontend. Así el navegador acepta y envía la cookie HttpOnly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Red de seguridad: dos requests simultáneos pueden pasar el chequeo del
# Service y chocar contra una restricción UNIQUE. Es un 409, no un 500.
@app.exception_handler(IntegrityError)
async def manejar_integridad(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "La operación choca con datos existentes"},
    )


api = APIRouter(prefix="/api/v1")
api.include_router(auth_router)
api.include_router(usuarios_router)
api.include_router(categorias_router)
api.include_router(productos_router)
api.include_router(pedidos_router)
app.include_router(api)

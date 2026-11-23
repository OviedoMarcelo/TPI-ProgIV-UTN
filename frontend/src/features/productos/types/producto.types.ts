import type { Categoria } from "@/features/categorias";
import type { Paginado } from "@/shared/types/api.types";

// Mismos nombres de campo que ProductoRead del backend
export interface Producto {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagen_url: string | null;
    stock: number;
    disponible: boolean;
    categoria_id: number;
    activo: boolean;
    categoria: Categoria;
}

// ProductoCreate / ProductoUpdate
export interface ProductoInput {
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagen_url: string | null;
    stock: number;
    disponible: boolean;
    categoria_id: number;
}

// ProductoStockUpdate
export interface ProductoStockUpdate {
    stock: number;
    disponible: boolean;
}

export type ProductosPaginados = Paginado<Producto>;

// Query params de GET /productos
export interface FiltrosProductos {
    skip: number;
    limit: number;
    search?: string;
    categoria_id?: number;
    disponible?: boolean;
}

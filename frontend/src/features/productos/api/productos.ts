import { api } from "@/shared/api/axiosInstance";
import type {
    FiltrosProductos,
    Producto,
    ProductoInput,
    ProductosPaginados,
    ProductoStockUpdate,
} from "../types/producto.types";

const RUTA = "/productos";

// Axios arma el query string y omite los filtros undefined
export const listarProductos = async (filtros: FiltrosProductos): Promise<ProductosPaginados> =>
    (await api.get<ProductosPaginados>(RUTA, { params: filtros })).data;

export const crearProducto = async (data: ProductoInput): Promise<Producto> =>
    (await api.post<Producto>(RUTA, data)).data;

export const actualizarProducto = async (id: number, data: ProductoInput): Promise<Producto> =>
    (await api.put<Producto>(`${RUTA}/${id}`, data)).data;

export const actualizarStock = async (id: number, data: ProductoStockUpdate): Promise<Producto> =>
    (await api.patch<Producto>(`${RUTA}/${id}/stock`, data)).data;

// Baja lógica: 204 sin cuerpo
export const eliminarProducto = async (id: number): Promise<void> => {
    await api.delete(`${RUTA}/${id}`);
};

import { api } from "@/shared/api/axiosInstance";
import type { Categoria, CategoriaInput } from "../types/categoria.types";

// Las rutas van sin barra final: con "/x/" FastAPI redirige (307) y se rompe CORS
const RUTA = "/categorias";

export const listarCategorias = async (): Promise<Categoria[]> =>
    (await api.get<Categoria[]>(RUTA)).data;

export const crearCategoria = async (data: CategoriaInput): Promise<Categoria> =>
    (await api.post<Categoria>(RUTA, data)).data;

export const actualizarCategoria = async (id: number, data: CategoriaInput): Promise<Categoria> =>
    (await api.put<Categoria>(`${RUTA}/${id}`, data)).data;

// Baja lógica: el backend responde 204 sin cuerpo
export const eliminarCategoria = async (id: number): Promise<void> => {
    await api.delete(`${RUTA}/${id}`);
};

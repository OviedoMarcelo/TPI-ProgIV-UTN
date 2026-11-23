import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError } from "@/shared/api/notificarError";
import { useNotificationStore } from "@/store/notificationStore";
import {
    actualizarCategoria,
    crearCategoria,
    eliminarCategoria,
    listarCategorias,
} from "../api/categorias";
import type { Categoria, CategoriaInput } from "../types/categoria.types";

const CLAVE = ["categorias"];
// Fuera del hook: referencia estable (TanStack Table no recalcula en cada render)
const SIN_CATEGORIAS: Categoria[] = [];

// Estado del servidor de categorías: listado y mutaciones con invalidación
export const useCategorias = () => {
    const queryClient = useQueryClient();
    const notificar = useNotificationStore((state) => state.showNotification);

    const listado = useQuery({ queryKey: CLAVE, queryFn: listarCategorias });

    // Tras cada cambio se invalidan las categorías y los productos (que las muestran)
    const invalidar = () => {
        void queryClient.invalidateQueries({ queryKey: CLAVE });
        void queryClient.invalidateQueries({ queryKey: ["productos"] });
    };

    const crear = useMutation({
        mutationFn: crearCategoria,
        onSuccess: (categoria) => {
            invalidar();
            notificar(`Categoría "${categoria.nombre}" creada`);
        },
        onError: notificarError,
    });

    const editar = useMutation({
        // mutationFn acepta un solo argumento: id y datos van en un objeto
        mutationFn: ({ id, data }: { id: number; data: CategoriaInput }) =>
            actualizarCategoria(id, data),
        onSuccess: (categoria) => {
            invalidar();
            notificar(`Categoría "${categoria.nombre}" actualizada`);
        },
        onError: notificarError,
    });

    const eliminar = useMutation({
        // Recibe la categoría entera para poder nombrarla en el aviso
        mutationFn: (categoria: Categoria) => eliminarCategoria(categoria.id),
        onSuccess: (_, categoria) => {
            invalidar();
            notificar(`Categoría "${categoria.nombre}" eliminada`);
        },
        onError: notificarError,
    });

    return {
        categorias: listado.data ?? SIN_CATEGORIAS,
        isLoading: listado.isLoading,
        isError: listado.isError,
        refetch: listado.refetch,
        crear,
        editar,
        eliminar,
    };
};

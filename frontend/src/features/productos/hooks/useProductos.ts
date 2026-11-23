import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarProductos } from "../api/productos";
import type { FiltrosProductos } from "../types/producto.types";

// Listado paginado en el servidor. Los filtros forman parte de la queryKey:
// cada combinación (página, búsqueda, categoría) se cachea por separado.
export const useProductos = (filtros: FiltrosProductos) =>
    useQuery({
        queryKey: ["productos", filtros],
        queryFn: () => listarProductos(filtros),
        // Mientras llega la página nueva se sigue mostrando la anterior
        placeholderData: keepPreviousData,
    });

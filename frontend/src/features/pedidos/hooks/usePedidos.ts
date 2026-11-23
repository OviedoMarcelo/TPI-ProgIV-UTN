import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarPedidos, obtenerPedido, obtenerResumen } from "../api/pedidos";
import type { FiltrosPedidos } from "../types/pedido.types";

// Los filtros forman parte de la queryKey: cada página/estado se cachea aparte
export const usePedidos = (filtros: FiltrosPedidos) =>
    useQuery({
        queryKey: ["pedidos", filtros],
        queryFn: () => listarPedidos(filtros),
        placeholderData: keepPreviousData,
    });

// Detalle de un pedido (null = ninguno abierto: la query queda desactivada)
export const usePedido = (id: number | null) =>
    useQuery({
        queryKey: ["pedidos", "detalle", id],
        queryFn: () => obtenerPedido(id as number),
        enabled: id !== null,
    });

// Indicadores del panel (solo admin)
export const useResumenPedidos = () =>
    useQuery({ queryKey: ["pedidos", "resumen"], queryFn: obtenerResumen });

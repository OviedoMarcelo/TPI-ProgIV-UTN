import { api } from "@/shared/api/axiosInstance";
import type {
    EstadoPedido,
    FiltrosPedidos,
    Pedido,
    PedidoCreate,
    PedidosPaginados,
    ResumenPedidos,
} from "../types/pedido.types";

const RUTA = "/pedidos";

// El backend decide qué devuelve: el cliente ve solo sus pedidos, el admin todos
export const listarPedidos = async (filtros: FiltrosPedidos): Promise<PedidosPaginados> =>
    (await api.get<PedidosPaginados>(RUTA, { params: filtros })).data;

export const obtenerPedido = async (id: number): Promise<Pedido> =>
    (await api.get<Pedido>(`${RUTA}/${id}`)).data;

export const crearPedido = async (data: PedidoCreate): Promise<Pedido> =>
    (await api.post<Pedido>(RUTA, data)).data;

export const cambiarEstadoPedido = async (id: number, estado: EstadoPedido): Promise<Pedido> =>
    (await api.patch<Pedido>(`${RUTA}/${id}/estado`, { estado })).data;

export const cancelarPedido = async (id: number): Promise<Pedido> =>
    (await api.patch<Pedido>(`${RUTA}/${id}/cancelar`)).data;

export const obtenerResumen = async (): Promise<ResumenPedidos> =>
    (await api.get<ResumenPedidos>(`${RUTA}/resumen`)).data;

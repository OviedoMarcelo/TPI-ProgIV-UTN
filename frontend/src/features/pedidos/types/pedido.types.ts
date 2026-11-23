import type { EstadoPedido } from "@/shared/lib/estados";
import type { Paginado } from "@/shared/types/api.types";

// Mismos nombres de campo que los schemas del backend (pedidos/schemas.py)
export type { EstadoPedido };
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

// Copia del producto al momento de la compra: no cambia si después cambia el precio
export interface DetallePedido {
    producto_id: number;
    nombre_producto: string;
    precio_unitario: number;
    cantidad: number;
    subtotal: number;
}

export interface Pedido {
    id: number;
    usuario_id: number;
    estado: EstadoPedido;
    forma_pago: FormaPago;
    direccion_entrega: string;
    notas: string | null;
    total: number;
    created_at: string;
    updated_at: string;
    items: DetallePedido[];
}

export type PedidosPaginados = Paginado<Pedido>;

export interface FiltrosPedidos {
    skip: number;
    limit: number;
    estado?: EstadoPedido;
}

// Cuerpo del POST /pedidos: el precio NO viaja, lo pone el backend
export interface PedidoCreate {
    items: { producto_id: number; cantidad: number }[];
    forma_pago: FormaPago;
    direccion_entrega: string;
    notas: string | null;
}

export interface ResumenPedidos {
    pendientes: number;
    en_preparacion: number;
    entregados: number;
    cancelados: number;
    pedidos_hoy: number;
    ingresos_entregados: number;
}

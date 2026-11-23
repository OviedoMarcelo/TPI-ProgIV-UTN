import type { EstadoPedido, FormaPago } from "../types/pedido.types";

export const TEXTO_FORMA_PAGO: Record<FormaPago, string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
};

// Siguiente paso de la máquina de estados (lo que el admin puede "avanzar").
// Es la misma tabla TRANSICIONES del backend, sin la cancelación.
export const SIGUIENTE_ESTADO: Partial<Record<EstadoPedido, { estado: EstadoPedido; accion: string }>> = {
    PENDIENTE: { estado: "EN_PREPARACION", accion: "Preparar" },
    EN_PREPARACION: { estado: "ENTREGADO", accion: "Entregar" },
};

// El admin puede cancelar mientras el pedido no llegó a un estado final
export const esCancelablePorAdmin = (estado: EstadoPedido) =>
    estado === "PENDIENTE" || estado === "EN_PREPARACION";

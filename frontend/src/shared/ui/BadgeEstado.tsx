import { TEXTO_ESTADO, type EstadoPedido } from "@/shared/lib/estados";

const ESTILOS: Record<EstadoPedido, string> = {
    PENDIENTE: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    EN_PREPARACION: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    ENTREGADO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    CANCELADO: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

// Colorea el estado del pedido
export const BadgeEstado = ({ estado }: { estado: EstadoPedido }) => {
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${ESTILOS[estado]}`}>
            {TEXTO_ESTADO[estado]}
        </span>
    );
};

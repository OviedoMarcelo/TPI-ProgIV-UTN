import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { notificarError } from "@/shared/api/notificarError";
import { TEXTO_ESTADO } from "@/shared/lib/estados";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { cambiarEstadoPedido, cancelarPedido, crearPedido } from "../api/pedidos";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

// Un pedido cambia el stock: se invalidan los pedidos Y los productos
const useInvalidarPedidos = () => {
    const queryClient = useQueryClient();
    return () => {
        void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
        void queryClient.invalidateQueries({ queryKey: ["productos"] });
    };
};

// Confirmar la compra: vacía el carrito y lleva a "Mis pedidos"
export const useCrearPedido = () => {
    const invalidar = useInvalidarPedidos();
    const vaciar = useCartStore((state) => state.vaciar);
    const notificar = useNotificationStore((state) => state.showNotification);
    const navigate = useNavigate();

    return useMutation({
        mutationFn: crearPedido,
        onSuccess: (pedido) => {
            invalidar();
            vaciar();
            notificar(`Pedido #${pedido.id} confirmado`);
            void navigate("/mis-pedidos", { replace: true });
        },
        // Sin onError: el formulario muestra el error (por ejemplo, stock insuficiente)
    });
};

// El cliente cancela un pedido propio PENDIENTE (el backend restituye el stock)
export const useCancelarPedido = () => {
    const invalidar = useInvalidarPedidos();
    const notificar = useNotificationStore((state) => state.showNotification);

    return useMutation({
        mutationFn: (pedido: Pedido) => cancelarPedido(pedido.id),
        onSuccess: (pedido) => {
            invalidar();
            notificar(`Pedido #${pedido.id} cancelado`);
        },
        onError: notificarError,
    });
};

// El admin avanza o cancela un pedido según la máquina de estados
export const useCambiarEstadoPedido = () => {
    const invalidar = useInvalidarPedidos();
    const notificar = useNotificationStore((state) => state.showNotification);

    return useMutation({
        mutationFn: ({ pedido, estado }: { pedido: Pedido; estado: EstadoPedido }) =>
            cambiarEstadoPedido(pedido.id, estado),
        onSuccess: (pedido) => {
            invalidar();
            notificar(`Pedido #${pedido.id}: ${TEXTO_ESTADO[pedido.estado]}`);
        },
        onError: notificarError,
    });
};

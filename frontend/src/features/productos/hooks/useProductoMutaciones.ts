import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificarError } from "@/shared/api/notificarError";
import { useNotificationStore } from "@/store/notificationStore";
import { actualizarProducto, actualizarStock, crearProducto, eliminarProducto } from "../api/productos";
import type { Producto, ProductoInput, ProductoStockUpdate } from "../types/producto.types";

// Escrituras del panel de administración. Cada una invalida ["productos"]:
// se vuelven a pedir TODAS las páginas y filtros cacheados del catálogo.
export const useProductoMutaciones = () => {
    const queryClient = useQueryClient();
    const notificar = useNotificationStore((state) => state.showNotification);
    const invalidar = () => queryClient.invalidateQueries({ queryKey: ["productos"] });

    const crear = useMutation({
        mutationFn: crearProducto,
        onSuccess: (producto) => {
            void invalidar();
            notificar(`Producto "${producto.nombre}" creado`);
        },
        onError: notificarError,
    });

    const editar = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProductoInput }) => actualizarProducto(id, data),
        onSuccess: (producto) => {
            void invalidar();
            notificar(`Producto "${producto.nombre}" actualizado`);
        },
        onError: notificarError,
    });

    const cambiarStock = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) => actualizarStock(id, data),
        onSuccess: (producto) => {
            void invalidar();
            notificar(`Stock de "${producto.nombre}": ${producto.stock}`);
        },
        onError: notificarError,
    });

    const eliminar = useMutation({
        mutationFn: (producto: Producto) => eliminarProducto(producto.id),
        onSuccess: (_, producto) => {
            void invalidar();
            notificar(`Producto "${producto.nombre}" eliminado`);
        },
        onError: notificarError,
    });

    return { crear, editar, cambiarStock, eliminar };
};

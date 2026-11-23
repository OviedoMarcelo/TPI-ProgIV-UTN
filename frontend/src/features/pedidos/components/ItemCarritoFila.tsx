import { formatearPrecio } from "@/shared/lib/formato";
import { Button } from "@/shared/ui/Button";
import { useCartStore, type ItemCarrito } from "@/store/cartStore";

// Una línea del carrito con controles de cantidad (+/-) acotados al stock
export const ItemCarritoFila = ({ item }: { item: ItemCarrito }) => {
    const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
    const quitar = useCartStore((state) => state.quitar);

    return (
        <li className="flex flex-wrap items-center gap-4 py-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-orange-50 dark:bg-gray-700">
                {item.imagen_url ? (
                    <img src={item.imagen_url} alt="" className="h-full w-full object-cover" />
                ) : (
                    <span aria-hidden="true">🍽️</span>
                )}
            </div>
            <div className="min-w-40 flex-1">
                <p className="font-medium text-gray-800 dark:text-gray-100">{item.nombre}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatearPrecio(item.precio_unitario)} c/u
                </p>
            </div>
            <div className="flex items-center gap-2" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                    aria-label="Restar uno"
                >
                    −
                </Button>
                <span className="w-8 text-center font-semibold" aria-live="polite">
                    {item.cantidad}
                </span>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                    aria-label="Sumar uno"
                >
                    +
                </Button>
            </div>
            <span className="w-28 text-right font-semibold text-gray-900 dark:text-gray-100">
                {formatearPrecio(item.precio_unitario * item.cantidad)}
            </span>
            <Button size="sm" variant="danger" onClick={() => quitar(item.producto_id)}>
                Quitar
            </Button>
        </li>
    );
};

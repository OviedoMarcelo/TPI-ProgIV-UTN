import { Link } from "react-router";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { formatearPrecio } from "@/shared/lib/formato";
import { Card } from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { CheckoutForm } from "../components/CheckoutForm";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { useCrearPedido } from "../hooks/usePedidoMutaciones";

// Ruta protegida: hace falta haber iniciado sesión para comprar
export const CheckoutPage = () => {
    const items = useCartStore((state) => state.items);
    const total = useCartStore((state) => state.total());
    const crear = useCrearPedido();

    // Al backend solo viajan id y cantidad: el precio lo toma de la base (RN-03)
    const form = useCheckoutForm((datos) =>
        crear.mutate({
            ...datos,
            items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        }),
    );

    if (items.length === 0) {
        return (
            <section>
                <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Confirmar pedido</h1>
                <EstadoVacio
                    mensaje="No hay productos en el carrito."
                    accion={
                        <Link to="/" className="font-medium text-orange-700 hover:underline dark:text-orange-400">
                            Volver al catálogo
                        </Link>
                    }
                />
            </section>
        );
    }

    return (
        <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Confirmar pedido</h1>
            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                <Card className="p-6">
                    <CheckoutForm
                        form={form}
                        error={crear.error ? handleApiError(crear.error) : null}
                        enviando={crear.isPending}
                    />
                </Card>
                <Card className="flex h-fit flex-col gap-3 p-4 text-sm">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">Resumen</h2>
                    <ul className="flex flex-col gap-1">
                        {items.map((i) => (
                            <li key={i.producto_id} className="flex justify-between gap-2">
                                <span>
                                    {i.cantidad} × {i.nombre}
                                </span>
                                <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold dark:border-gray-700">
                        <span>Total</span>
                        <span>{formatearPrecio(total)}</span>
                    </div>
                    <Link to="/carrito" className="text-orange-700 hover:underline dark:text-orange-400">
                        Modificar el carrito
                    </Link>
                </Card>
            </div>
        </section>
    );
};

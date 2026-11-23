import { useState } from "react";
import { Link } from "react-router";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { formatearPrecio } from "@/shared/lib/formato";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { ConfirmDialog } from "@/shared/ui/Modal";
import { useCartStore } from "@/store/cartStore";
import { ItemCarritoFila } from "../components/ItemCarritoFila";

const CLASE_LINK_BOTON =
    "rounded bg-orange-600 px-4 py-2 text-center font-medium text-white transition hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-400";

// El carrito es estado del cliente (Zustand + localStorage): no llama a la API
export const CarritoPage = () => {
    const items = useCartStore((state) => state.items);
    const vaciar = useCartStore((state) => state.vaciar);
    const total = useCartStore((state) => state.total());
    const [confirmarVaciar, setConfirmarVaciar] = useState(false);

    if (items.length === 0) {
        return (
            <section>
                <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Carrito</h1>
                <EstadoVacio
                    mensaje="Tu carrito está vacío."
                    accion={
                        <Link to="/" className={CLASE_LINK_BOTON}>
                            Ir al catálogo
                        </Link>
                    }
                />
            </section>
        );
    }

    const unidades = items.reduce((suma, i) => suma + i.cantidad, 0);

    return (
        <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Carrito</h1>
            <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
                <Card className="px-4">
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.map((item) => (
                            <ItemCarritoFila key={item.producto_id} item={item} />
                        ))}
                    </ul>
                </Card>
                <Card className="flex h-fit flex-col gap-4 p-4">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Productos</span>
                        <span>{unidades}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                        <span>Total</span>
                        <span>{formatearPrecio(total)}</span>
                    </div>
                    <Link to="/checkout" className={CLASE_LINK_BOTON}>
                        Confirmar pedido
                    </Link>
                    <Button variant="secondary" onClick={() => setConfirmarVaciar(true)}>
                        Vaciar carrito
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        El precio y el stock se confirman al crear el pedido.
                    </p>
                </Card>
            </div>
            {confirmarVaciar && (
                <ConfirmDialog
                    titulo="Vaciar carrito"
                    mensaje="¿Querés quitar todos los productos del carrito?"
                    textoConfirmar="Vaciar"
                    onConfirmar={() => {
                        vaciar();
                        setConfirmarVaciar(false);
                    }}
                    onCancelar={() => setConfirmarVaciar(false)}
                />
            )}
        </section>
    );
};

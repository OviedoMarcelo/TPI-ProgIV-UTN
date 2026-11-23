import { useState } from "react";
import { formatearPrecio } from "@/shared/lib/formato";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import type { Producto } from "../types/producto.types";

interface ProductoCardProps {
    producto: Producto;
}

// Tarjeta del catálogo. Lee el carrito (store) para no pasar el stock
export const ProductoCard = ({ producto }: ProductoCardProps) => {
    const agregar = useCartStore((state) => state.agregar);
    const enCarrito = useCartStore(
        (state) => state.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
    );
    const notificar = useNotificationStore((state) => state.showNotification);
    const [imagenRota, setImagenRota] = useState(false);

    const sinStock = producto.stock === 0;
    const vendible = producto.disponible && !sinStock;
    const llegoAlTope = enCarrito >= producto.stock;

    const handleAgregar = () => {
        agregar(producto);
        notificar(`"${producto.nombre}" agregado al carrito`);
    };

    let textoBoton = "Agregar al carrito";
    if (!producto.disponible) textoBoton = "No disponible";
    else if (sinStock) textoBoton = "Sin stock";
    else if (llegoAlTope) textoBoton = "Máximo en el carrito";

    return (
        <Card className="flex flex-col overflow-hidden">
            <div className="flex aspect-4/3 items-center justify-center bg-orange-50 dark:bg-gray-700">
                {producto.imagen_url && !imagenRota ? (
                    <img
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        loading="lazy"
                        onError={() => setImagenRota(true)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-4xl" aria-hidden="true">
                        🍽️
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="text-xs font-medium tracking-wide text-orange-700 uppercase dark:text-orange-400">
                    {producto.categoria.nombre}
                </span>
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">{producto.nombre}</h2>
                {producto.descripcion && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{producto.descripcion}</p>
                )}
                <div className="mt-auto flex items-end justify-between pt-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatearPrecio(producto.precio_base)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
                    </span>
                </div>
                <Button onClick={handleAgregar} disabled={!vendible || llegoAlTope}>
                    {textoBoton}
                </Button>
            </div>
        </Card>
    );
};

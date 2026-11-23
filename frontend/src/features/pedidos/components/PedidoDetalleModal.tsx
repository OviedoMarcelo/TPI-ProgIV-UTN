import { formatearFecha, formatearPrecio } from "@/shared/lib/formato";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { AlertaError } from "@/shared/ui/AlertaError";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { usePedido } from "../hooks/usePedidos";
import { TEXTO_FORMA_PAGO } from "../lib/textos";

interface PedidoDetalleModalProps {
    pedidoId: number;
    cliente?: string; // el admin ve de quién es el pedido
    onCerrar: () => void;
}

// Detalle completo: GET /pedidos/{id} (el backend valida que sea propio o admin)
export const PedidoDetalleModal = ({ pedidoId, cliente, onCerrar }: PedidoDetalleModalProps) => {
    const { data: pedido, isLoading, isError } = usePedido(pedidoId);

    const renderContenido = () => {
        if (isLoading) return <p className="text-gray-500 dark:text-gray-400">Cargando...</p>;
        if (isError || !pedido) return <AlertaError mensaje="No se pudo cargar el pedido" />;
        return (
            <div className="flex flex-col gap-4 text-sm">
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                    <dt className="text-gray-500 dark:text-gray-400">Estado</dt>
                    <dd>
                        <BadgeEstado estado={pedido.estado} />
                    </dd>
                    {cliente && (
                        <>
                            <dt className="text-gray-500 dark:text-gray-400">Cliente</dt>
                            <dd>{cliente}</dd>
                        </>
                    )}
                    <dt className="text-gray-500 dark:text-gray-400">Fecha</dt>
                    <dd>{formatearFecha(pedido.created_at)}</dd>
                    <dt className="text-gray-500 dark:text-gray-400">Pago</dt>
                    <dd>{TEXTO_FORMA_PAGO[pedido.forma_pago]}</dd>
                    <dt className="text-gray-500 dark:text-gray-400">Entrega</dt>
                    <dd className="wrap-anywhere">{pedido.direccion_entrega}</dd>
                    {pedido.notas && (
                        <>
                            <dt className="text-gray-500 dark:text-gray-400">Notas</dt>
                            <dd className="wrap-anywhere">{pedido.notas}</dd>
                        </>
                    )}
                </dl>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs text-gray-500 uppercase dark:text-gray-400">
                            <tr>
                                <th className="py-1">Producto</th>
                                <th className="py-1 text-right">Precio</th>
                                <th className="py-1 text-right">Cant.</th>
                                <th className="py-1 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {pedido.items.map((item) => (
                                <tr key={item.producto_id}>
                                    <td className="py-1.5">{item.nombre_producto}</td>
                                    <td className="py-1.5 text-right">{formatearPrecio(item.precio_unitario)}</td>
                                    <td className="py-1.5 text-right">{item.cantidad}</td>
                                    <td className="py-1.5 text-right">{formatearPrecio(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-gray-300 font-bold dark:border-gray-600">
                                <td colSpan={3} className="py-2">
                                    Total
                                </td>
                                <td className="py-2 text-right">{formatearPrecio(pedido.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <Modal titulo={`Pedido #${pedidoId}`} onCerrar={onCerrar} ancho="lg">
            {renderContenido()}
            <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={onCerrar}>
                    Cerrar
                </Button>
            </div>
        </Modal>
    );
};

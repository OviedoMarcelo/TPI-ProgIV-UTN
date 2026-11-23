import { useState } from "react";
import { Link } from "react-router";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { formatearFecha, formatearPrecio } from "@/shared/lib/formato";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { ConfirmDialog } from "@/shared/ui/Modal";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { useCancelarPedido } from "../hooks/usePedidoMutaciones";
import { usePedidos } from "../hooks/usePedidos";
import { TEXTO_FORMA_PAGO } from "../lib/textos";
import type { Pedido } from "../types/pedido.types";

const POR_PAGINA = 5;

// Historial del cliente: el backend filtra por el usuario de la cookie
export const MisPedidosPage = () => {
    const [pagina, setPagina] = useState(0);
    const [detalleId, setDetalleId] = useState<number | null>(null);
    const [aCancelar, setACancelar] = useState<Pedido | null>(null);

    const { data, isLoading, isError, isPlaceholderData, refetch } = usePedidos({
        skip: pagina * POR_PAGINA,
        limit: POR_PAGINA,
    });
    const cancelar = useCancelarPedido();

    const confirmarCancelacion = (pedido: Pedido) => {
        setACancelar(null);
        cancelar.mutate(pedido);
    };

    const renderContenido = () => {
        if (isLoading) return <SkeletonTabla filas={POR_PAGINA} />;
        if (isError || !data) {
            return <EstadoError mensaje="No se pudieron cargar tus pedidos" onReintentar={() => void refetch()} />;
        }
        if (data.items.length === 0) {
            return (
                <EstadoVacio
                    mensaje="Todavía no hiciste ningún pedido."
                    accion={
                        <Link to="/" className="font-medium text-orange-700 hover:underline dark:text-orange-400">
                            Ver el catálogo
                        </Link>
                    }
                />
            );
        }
        return (
            <div className="flex flex-col gap-4">
                <ul className={`flex flex-col gap-3 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
                    {data.items.map((pedido) => {
                        const cancelando = cancelar.isPending && cancelar.variables?.id === pedido.id;
                        return (
                            <li key={pedido.id}>
                                <Card className="flex flex-wrap items-center gap-4 p-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                                                Pedido #{pedido.id}
                                            </span>
                                            <BadgeEstado estado={pedido.estado} />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatearFecha(pedido.created_at)} · {pedido.items.length}{" "}
                                            {pedido.items.length === 1 ? "producto" : "productos"} ·{" "}
                                            {TEXTO_FORMA_PAGO[pedido.forma_pago]}
                                        </p>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {formatearPrecio(pedido.total)}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setDetalleId(pedido.id)}>
                                            Ver detalle
                                        </Button>
                                        {/* RN: el cliente solo cancela pedidos PENDIENTES */}
                                        {pedido.estado === "PENDIENTE" && (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => setACancelar(pedido)}
                                                disabled={cancelando}
                                            >
                                                {cancelando ? "Cancelando..." : "Cancelar"}
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
                <Paginacion
                    pagina={pagina}
                    totalPaginas={Math.ceil(data.total / POR_PAGINA)}
                    onCambiar={setPagina}
                    deshabilitada={isPlaceholderData}
                />
            </div>
        );
    };

    return (
        <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Mis pedidos</h1>
            {renderContenido()}
            {detalleId !== null && <PedidoDetalleModal pedidoId={detalleId} onCerrar={() => setDetalleId(null)} />}
            {aCancelar && (
                <ConfirmDialog
                    titulo="Cancelar pedido"
                    mensaje={`¿Cancelar el pedido #${aCancelar.id}? Esta acción no se puede deshacer.`}
                    textoConfirmar="Cancelar pedido"
                    onConfirmar={() => confirmarCancelacion(aCancelar)}
                    onCancelar={() => setACancelar(null)}
                />
            )}
        </section>
    );
};

import {
    createColumnHelper,
    useTable,
    type PaginationState,
    type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useUsuarios } from "@/features/usuarios";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { DataTable } from "@/shared/components/table/DataTable";
import {
    FILAS_POR_PAGINA,
    tablaFeatures,
    type TablaFeatures,
} from "@/shared/components/table/tablaFeatures";
import { formatearFecha, formatearPrecio } from "@/shared/lib/formato";
import { TEXTO_ESTADO } from "@/shared/lib/estados";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/Modal";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { useCambiarEstadoPedido } from "../hooks/usePedidoMutaciones";
import { usePedidos } from "../hooks/usePedidos";
import { esCancelablePorAdmin, SIGUIENTE_ESTADO, TEXTO_FORMA_PAGO } from "../lib/textos";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

// Fila de la tabla: el pedido más el nombre del cliente
type FilaPedido = Pedido & { cliente: string };

const SIN_PEDIDOS: Pedido[] = [];
const ESTADOS = Object.keys(TEXTO_ESTADO) as EstadoPedido[];

const columnHelper = createColumnHelper<TablaFeatures, FilaPedido>();
const columnas = columnHelper.columns([
    columnHelper.accessor("id", { header: "N°", cell: (info) => `#${info.getValue()}` }),
    columnHelper.accessor("cliente", { header: "Cliente" }),
    columnHelper.accessor("created_at", {
        header: "Fecha",
        cell: (info) => formatearFecha(info.getValue()),
    }),
    columnHelper.accessor((p) => TEXTO_FORMA_PAGO[p.forma_pago], { id: "pago", header: "Pago" }),
    columnHelper.accessor("total", {
        header: "Total",
        cell: (info) => formatearPrecio(info.getValue()),
    }),
    columnHelper.accessor((p) => TEXTO_ESTADO[p.estado], {
        id: "estado",
        header: "Estado",
        cell: (info) => <BadgeEstado estado={info.row.original.estado} />,
    }),
]);

export const AdminPedidosPage = () => {
    const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
    const [detalle, setDetalle] = useState<FilaPedido | null>(null);
    const [aCancelar, setACancelar] = useState<Pedido | null>(null);
    const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: true }]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: FILAS_POR_PAGINA,
    });
    const [globalFilter, setGlobalFilter] = useState("");

    // El filtro por estado lo resuelve el backend; el resto, la tabla
    const { data, isLoading, isError, refetch } = usePedidos({ skip: 0, limit: 100, estado });
    const pedidos = data?.items ?? SIN_PEDIDOS;
    const { usuarios } = useUsuarios();
    const cambiarEstado = useCambiarEstadoPedido();

    // Une cada pedido con el username de su dueño (useMemo: referencia estable para la tabla)
    const filas = useMemo<FilaPedido[]>(() => {
        const nombres = new Map(usuarios.map((u) => [u.id, u.username]));
        return pedidos.map((p) => ({ ...p, cliente: nombres.get(p.usuario_id) ?? `#${p.usuario_id}` }));
    }, [pedidos, usuarios]);

    const table = useTable({
        features: tablaFeatures,
        columns: columnas,
        data: filas,
        state: { sorting, pagination, globalFilter },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
    });

    const filtrarEstado = (valor: string) => {
        setEstado(valor ? (valor as EstadoPedido) : undefined);
        setPagination((p) => ({ ...p, pageIndex: 0 }));
    };

    const confirmarCancelacion = (pedido: Pedido) => {
        setACancelar(null);
        cambiarEstado.mutate({ pedido, estado: "CANCELADO" });
    };

    const enCurso = (id: number) => cambiarEstado.isPending && cambiarEstado.variables?.pedido.id === id;

    const renderContenido = () => {
        if (isLoading) return <SkeletonTabla />;
        if (isError) {
            return <EstadoError mensaje="No se pudieron cargar los pedidos" onReintentar={() => void refetch()} />;
        }
        if (pedidos.length === 0) {
            return <EstadoVacio mensaje={estado ? "No hay pedidos en ese estado." : "Todavía no hay pedidos."} />;
        }
        return (
            <DataTable
                table={table}
                placeholderBusqueda="Buscar por cliente, n° o estado..."
                acciones={(pedido) => {
                    const siguiente = SIGUIENTE_ESTADO[pedido.estado];
                    return (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => setDetalle(pedido)}>
                                Ver
                            </Button>
                            {siguiente && (
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => cambiarEstado.mutate({ pedido, estado: siguiente.estado })}
                                    disabled={enCurso(pedido.id)}
                                >
                                    {siguiente.accion}
                                </Button>
                            )}
                            {esCancelablePorAdmin(pedido.estado) && (
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => setACancelar(pedido)}
                                    disabled={enCurso(pedido.id)}
                                >
                                    Cancelar
                                </Button>
                            )}
                        </>
                    );
                }}
            />
        );
    };

    return (
        <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pedidos</h1>
                <select
                    value={estado ?? ""}
                    onChange={(e) => filtrarEstado(e.target.value)}
                    aria-label="Filtrar por estado"
                    className="rounded border border-gray-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                >
                    <option value="">Todos los estados</option>
                    {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                            {TEXTO_ESTADO[e]}
                        </option>
                    ))}
                </select>
            </div>

            {renderContenido()}

            {detalle && (
                <PedidoDetalleModal
                    pedidoId={detalle.id}
                    cliente={detalle.cliente}
                    onCerrar={() => setDetalle(null)}
                />
            )}
            {aCancelar && (
                <ConfirmDialog
                    titulo="Cancelar pedido"
                    mensaje={`¿Cancelar el pedido #${aCancelar.id}? El stock de sus productos se restituye.`}
                    textoConfirmar="Cancelar pedido"
                    onConfirmar={() => confirmarCancelacion(aCancelar)}
                    onCancelar={() => setACancelar(null)}
                />
            )}
        </section>
    );
};

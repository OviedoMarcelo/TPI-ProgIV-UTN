import {
    createColumnHelper,
    useTable,
    type PaginationState,
    type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { useCategorias } from "@/features/categorias";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { DataTable } from "@/shared/components/table/DataTable";
import {
    FILAS_POR_PAGINA,
    tablaFeatures,
    type TablaFeatures,
} from "@/shared/components/table/tablaFeatures";
import { formatearPrecio } from "@/shared/lib/formato";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/Modal";
import { ProductoModal } from "../components/ProductoModal";
import { StockModal } from "../components/StockModal";
import { useProductoForm, valoresProducto } from "../hooks/useProductoForm";
import { useProductoMutaciones } from "../hooks/useProductoMutaciones";
import { useProductos } from "../hooks/useProductos";
import { useStockForm } from "../hooks/useStockForm";
import type { Producto } from "../types/producto.types";

// El panel pide hasta 100 productos y pagina del lado del cliente (TanStack Table)
const FILTROS_PANEL = { skip: 0, limit: 100 };
const SIN_PRODUCTOS: Producto[] = [];

const columnHelper = createColumnHelper<TablaFeatures, Producto>();
const columnas = columnHelper.columns([
    columnHelper.accessor("nombre", { header: "Nombre" }),
    columnHelper.accessor((p) => p.categoria.nombre, { id: "categoria", header: "Categoría" }),
    columnHelper.accessor("precio_base", {
        header: "Precio",
        cell: (info) => formatearPrecio(info.getValue()),
    }),
    columnHelper.accessor("stock", {
        header: "Stock",
        cell: (info) => (
            <span className={info.getValue() === 0 ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor((p) => (p.disponible ? "Sí" : "No"), {
        id: "disponible",
        header: "Disponible",
        cell: (info) => (
            <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    info.row.original.disponible
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
            >
                {info.getValue()}
            </span>
        ),
    }),
]);

// Qué modal está abierto (uno a la vez)
type ModalAbierto = { tipo: "producto"; producto: Producto | null } | { tipo: "stock"; producto: Producto };

export const AdminProductosPage = () => {
    const [modal, setModal] = useState<ModalAbierto | null>(null);
    const [aEliminar, setAEliminar] = useState<Producto | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: FILAS_POR_PAGINA,
    });
    const [globalFilter, setGlobalFilter] = useState("");

    const { data, isLoading, isError, refetch } = useProductos(FILTROS_PANEL);
    const productos = data?.items ?? SIN_PRODUCTOS;
    const { categorias } = useCategorias();
    const { crear, editar, cambiarStock, eliminar } = useProductoMutaciones();

    const cerrarModal = () => setModal(null);

    const formProducto = useProductoForm((datos) => {
        if (modal?.tipo === "producto" && modal.producto) {
            editar.mutate({ id: modal.producto.id, data: datos }, { onSuccess: cerrarModal });
        } else {
            crear.mutate(datos, { onSuccess: cerrarModal });
        }
    });

    const formStock = useStockForm((datos) => {
        if (modal?.tipo === "stock") {
            cambiarStock.mutate({ id: modal.producto.id, data: datos }, { onSuccess: cerrarModal });
        }
    });

    const table = useTable({
        features: tablaFeatures,
        columns: columnas,
        data: productos,
        state: { sorting, pagination, globalFilter },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
    });

    const abrirProducto = (producto: Producto | null) => {
        crear.reset();
        editar.reset();
        formProducto.reset(valoresProducto(producto), { keepDefaultValues: true });
        setModal({ tipo: "producto", producto });
    };

    const abrirStock = (producto: Producto) => {
        cambiarStock.reset();
        formStock.reset(
            { stock: producto.stock, disponible: producto.disponible },
            { keepDefaultValues: true },
        );
        setModal({ tipo: "stock", producto });
    };

    const confirmarEliminacion = (producto: Producto) => {
        setAEliminar(null);
        eliminar.mutate(producto);
    };

    const mutacionProducto = modal?.tipo === "producto" && modal.producto ? editar : crear;
    const eliminandoId = eliminar.isPending ? (eliminar.variables?.id ?? null) : null;

    const renderContenido = () => {
        if (isLoading) return <SkeletonTabla />;
        if (isError) {
            return <EstadoError mensaje="No se pudieron cargar los productos" onReintentar={() => void refetch()} />;
        }
        if (productos.length === 0) {
            return (
                <EstadoVacio
                    mensaje="No hay productos cargados todavía."
                    accion={<Button onClick={() => abrirProducto(null)}>Crear el primero</Button>}
                />
            );
        }
        return (
            <DataTable
                table={table}
                placeholderBusqueda="Buscar producto..."
                acciones={(producto) => (
                    <>
                        <Button size="sm" onClick={() => abrirProducto(producto)}>
                            Editar
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => abrirStock(producto)}>
                            Stock
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setAEliminar(producto)}
                            disabled={eliminandoId === producto.id}
                        >
                            {eliminandoId === producto.id ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </>
                )}
            />
        );
    };

    return (
        <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Productos</h1>
                <Button onClick={() => abrirProducto(null)}>Nuevo producto</Button>
            </div>

            {renderContenido()}

            {modal?.tipo === "producto" && (
                <ProductoModal
                    esEdicion={modal.producto !== null}
                    form={formProducto}
                    categorias={categorias}
                    error={mutacionProducto.error ? handleApiError(mutacionProducto.error) : null}
                    guardando={mutacionProducto.isPending}
                    onCancelar={cerrarModal}
                />
            )}

            {modal?.tipo === "stock" && (
                <StockModal
                    nombreProducto={modal.producto.nombre}
                    form={formStock}
                    error={cambiarStock.error ? handleApiError(cambiarStock.error) : null}
                    guardando={cambiarStock.isPending}
                    onCancelar={cerrarModal}
                />
            )}

            {aEliminar && (
                <ConfirmDialog
                    titulo="Eliminar producto"
                    mensaje={`¿Querés dar de baja "${aEliminar.nombre}"? Deja de verse en el catálogo; los pedidos que ya lo incluyen no cambian.`}
                    textoConfirmar="Eliminar"
                    onConfirmar={() => confirmarEliminacion(aEliminar)}
                    onCancelar={() => setAEliminar(null)}
                />
            )}
        </section>
    );
};

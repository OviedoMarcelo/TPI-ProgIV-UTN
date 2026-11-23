import {
    createColumnHelper,
    useTable,
    type PaginationState,
    type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
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
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/Modal";
import { CategoriaModal } from "../components/CategoriaModal";
import { useCategoriaForm, valoresCategoria } from "../hooks/useCategoriaForm";
import { useCategorias } from "../hooks/useCategorias";
import type { Categoria } from "../types/categoria.types";

const columnHelper = createColumnHelper<TablaFeatures, Categoria>();
const columnas = columnHelper.columns([
    columnHelper.accessor("nombre", { header: "Nombre" }),
    columnHelper.accessor((c) => c.descripcion ?? "", {
        id: "descripcion",
        header: "Descripción",
        cell: (info) =>
            info.getValue() || <span className="text-gray-400 dark:text-gray-500">Sin descripción</span>,
    }),
]);

export const AdminCategoriasPage = () => {
    // ---------- Estado de interfaz ----------
    const [modalAbierto, setModalAbierto] = useState(false);
    const [seleccionada, setSeleccionada] = useState<Categoria | null>(null);
    // null = pop-up cerrado; con datos = qué categoría se está por eliminar
    const [aEliminar, setAEliminar] = useState<Categoria | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: FILAS_POR_PAGINA,
    });
    const [globalFilter, setGlobalFilter] = useState("");

    // ---------- Estado del servidor (TanStack Query, en el hook) ----------
    const { categorias, isLoading, isError, refetch, crear, editar, eliminar } = useCategorias();

    const cerrarModal = () => {
        setModalAbierto(false);
        setSeleccionada(null);
    };

    // ---------- TanStack Form: alta o edición según haya selección ----------
    const form = useCategoriaForm((datos) => {
        if (seleccionada) {
            editar.mutate({ id: seleccionada.id, data: datos }, { onSuccess: cerrarModal });
        } else {
            crear.mutate(datos, { onSuccess: cerrarModal });
        }
    });

    // ---------- TanStack Table (paginación del lado del cliente) ----------
    const table = useTable({
        features: tablaFeatures,
        columns: columnas,
        data: categorias,
        state: { sorting, pagination, globalFilter },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
    });

    const abrirModal = (categoria: Categoria | null) => {
        crear.reset(); // limpia el error del intento anterior
        editar.reset();
        // keepDefaultValues: si no, el siguiente render volvería a los valores vacíos
        form.reset(valoresCategoria(categoria), { keepDefaultValues: true });
        setSeleccionada(categoria);
        setModalAbierto(true);
    };

    const confirmarEliminacion = (categoria: Categoria) => {
        setAEliminar(null);
        eliminar.mutate(categoria);
    };

    const mutacionModal = seleccionada ? editar : crear;
    const eliminandoId = eliminar.isPending ? (eliminar.variables?.id ?? null) : null;

    const renderContenido = () => {
        if (isLoading) return <SkeletonTabla />;
        if (isError) {
            return (
                <EstadoError mensaje="No se pudieron cargar las categorías" onReintentar={() => void refetch()} />
            );
        }
        if (categorias.length === 0) {
            return (
                <EstadoVacio
                    mensaje="No hay categorías cargadas todavía."
                    accion={<Button onClick={() => abrirModal(null)}>Crear la primera</Button>}
                />
            );
        }
        return (
            <DataTable
                table={table}
                placeholderBusqueda="Buscar categoría..."
                acciones={(categoria) => (
                    <>
                        <Button size="sm" onClick={() => abrirModal(categoria)}>
                            Editar
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setAEliminar(categoria)}
                            disabled={eliminandoId === categoria.id}
                        >
                            {eliminandoId === categoria.id ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </>
                )}
            />
        );
    };

    return (
        <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Categorías</h1>
                <Button onClick={() => abrirModal(null)}>Nueva categoría</Button>
            </div>

            {renderContenido()}

            {modalAbierto && (
                <CategoriaModal
                    esEdicion={seleccionada !== null}
                    form={form}
                    error={mutacionModal.error ? handleApiError(mutacionModal.error) : null}
                    guardando={mutacionModal.isPending}
                    onCancelar={cerrarModal}
                />
            )}

            {aEliminar && (
                <ConfirmDialog
                    titulo="Eliminar categoría"
                    mensaje={`¿Querés dar de baja la categoría "${aEliminar.nombre}"? Sus productos siguen en el catálogo: si querés retirarlos, dalos de baja también.`}
                    textoConfirmar="Eliminar"
                    onConfirmar={() => confirmarEliminacion(aEliminar)}
                    onCancelar={() => setAEliminar(null)}
                />
            )}
        </section>
    );
};

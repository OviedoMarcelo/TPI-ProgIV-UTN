import type { ReactTable, RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Button } from "@/shared/ui/Button";
import type { TablaFeatures } from "./tablaFeatures";

interface DataTableProps<T extends RowData> {
    table: ReactTable<TablaFeatures, T>; // la instancia la crea la página con useTable
    acciones?: (fila: T) => ReactNode; // botones de la última columna
    placeholderBusqueda?: string;
}

const ICONO_ORDEN = { asc: " ▲", desc: " ▼" } as const;

// Tabla genérica (headless: TanStack Table aporta la lógica, acá va el
// marcado y los estilos). La usan todas las páginas de listado.
export const DataTable = <T extends RowData>({
    table,
    acciones,
    placeholderBusqueda = "Buscar...",
}: DataTableProps<T>) => {
    const { pageIndex } = table.state.pagination;
    const totalPaginas = Math.max(table.getPageCount(), 1);
    const totalFiltradas = table.getFilteredRowModel().rows.length;
    const filas = table.getRowModel().rows; // la página actual, ya ordenada y filtrada

    return (
        <div className="flex flex-col gap-3">
            <input
                type="search"
                value={String(table.state.globalFilter ?? "")}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                placeholder={placeholderBusqueda}
                aria-label="Buscar"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 sm:max-w-xs focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:placeholder:text-gray-500"
            />

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
                    <thead className="bg-gray-50 text-xs tracking-wide text-gray-600 uppercase dark:bg-gray-900/40 dark:text-gray-300">
                        {table.getHeaderGroups().map((grupo) => (
                            <tr key={grupo.id}>
                                {grupo.headers.map((header) => {
                                    const orden = header.column.getIsSorted();
                                    return (
                                        <th
                                            key={header.id}
                                            scope="col"
                                            className="px-4 py-3 font-semibold"
                                            aria-sort={
                                                orden === "asc"
                                                    ? "ascending"
                                                    : orden === "desc"
                                                      ? "descending"
                                                      : undefined
                                            }
                                        >
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <button
                                                    type="button"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className="uppercase hover:text-orange-600 dark:hover:text-orange-400"
                                                >
                                                    <table.FlexRender header={header} />
                                                    {orden ? ICONO_ORDEN[orden] : " ↕"}
                                                </button>
                                            ) : (
                                                <table.FlexRender header={header} />
                                            )}
                                        </th>
                                    );
                                })}
                                {acciones && (
                                    <th scope="col" className="px-4 py-3 text-right font-semibold">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filas.length === 0 ? (
                            <tr>
                                <td colSpan={100} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No hay resultados para la búsqueda.
                                </td>
                            </tr>
                        ) : (
                            filas.map((fila) => (
                                <tr key={fila.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    {fila.getAllCells().map((celda) => (
                                        <td key={celda.id} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            <table.FlexRender cell={celda} />
                                        </td>
                                    ))}
                                    {acciones && (
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                {acciones(fila.original)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>
                    {totalFiltradas} {totalFiltradas === 1 ? "registro" : "registros"}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <span>
                        Página {pageIndex + 1} de {totalPaginas}
                    </span>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
};

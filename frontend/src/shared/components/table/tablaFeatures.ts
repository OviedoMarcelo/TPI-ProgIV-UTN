import {
    columnFilteringFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_includesString,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_basic,
    sortFn_datetime,
    sortFn_text,
    tableFeatures,
} from "@tanstack/react-table";

// TanStack Table v9: cada tabla declara qué features usa (en la v8 venían
// todas incluidas). Todas las tablas usan las mismas, por eso se definen una
// sola vez, FUERA de los componentes, para que la referencia sea estable.
//
// Equivalencias con la v8:
//   getCoreRowModel()       -> ya no se declara (viene incluido)
//   getSortedRowModel()     -> rowSortingFeature + sortedRowModel
//   getFilteredRowModel()   -> columnFilteringFeature + filteredRowModel
//   getPaginationRowModel() -> rowPaginationFeature + paginatedRowModel
export const tablaFeatures = tableFeatures({
    rowSortingFeature,
    columnFilteringFeature, // requisito del filtro global
    globalFilteringFeature, // buscador por texto
    rowPaginationFeature,
    // Los "row models" van después de la feature de la que dependen
    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    // Funciones de ordenamiento y filtrado que se registran (tree-shaking)
    sortFns: {
        alphanumeric: sortFn_alphanumeric,
        basic: sortFn_basic,
        datetime: sortFn_datetime,
        text: sortFn_text,
    },
    filterFns: { includesString: filterFn_includesString },
});

export type TablaFeatures = typeof tablaFeatures;

// Cantidad de filas por página de todas las tablas
export const FILAS_POR_PAGINA = 10;

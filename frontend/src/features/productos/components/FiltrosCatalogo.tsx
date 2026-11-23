import { useState, type SubmitEvent } from "react";
import type { Categoria } from "@/features/categorias";
import { Button } from "@/shared/ui/Button";

interface FiltrosCatalogoProps {
    categorias: Categoria[];
    categoriaId: number | undefined;
    busqueda: string;
    onBuscar: (texto: string) => void;
    onCategoria: (id: number | undefined) => void;
}

const CLASE_CONTROL =
    "rounded border border-gray-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800";

// Búsqueda por nombre (al enviar, no en cada tecla: una petición por búsqueda)
// y filtro por categoría
export const FiltrosCatalogo = ({
    categorias,
    categoriaId,
    busqueda,
    onBuscar,
    onCategoria,
}: FiltrosCatalogoProps) => {
    const [texto, setTexto] = useState(busqueda);

    const handleSubmit = (evento: SubmitEvent<HTMLFormElement>) => {
        evento.preventDefault();
        onBuscar(texto.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-center gap-2" role="search">
            <input
                type="search"
                value={texto}
                onChange={(e) => {
                    setTexto(e.target.value);
                    // Al borrar todo con la cruz del input se vuelve al listado completo
                    if (e.target.value === "" && busqueda !== "") onBuscar("");
                }}
                placeholder="Buscar por nombre..."
                aria-label="Buscar producto por nombre"
                className={`${CLASE_CONTROL} w-full sm:w-64`}
            />
            <Button type="submit">Buscar</Button>
            <select
                value={categoriaId ?? ""}
                onChange={(e) => onCategoria(e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Filtrar por categoría"
                className={`${CLASE_CONTROL} w-full sm:ml-auto sm:w-56`}
            >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nombre}
                    </option>
                ))}
            </select>
        </form>
    );
};

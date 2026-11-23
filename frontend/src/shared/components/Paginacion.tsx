import { Button } from "@/shared/ui/Button";

interface PaginacionProps {
    pagina: number; // empieza en 0
    totalPaginas: number;
    onCambiar: (pagina: number) => void;
    deshabilitada?: boolean; // mientras llega la página nueva
}

// Paginación del lado del servidor: la página pide skip = pagina * limit
export const Paginacion = ({ pagina, totalPaginas, onCambiar, deshabilitada }: PaginacionProps) => {
    if (totalPaginas <= 1) return null;
    return (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-3 text-sm">
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onCambiar(pagina - 1)}
                disabled={pagina === 0 || deshabilitada}
            >
                Anterior
            </Button>
            <span className="text-gray-600 dark:text-gray-400">
                Página {pagina + 1} de {totalPaginas}
            </span>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onCambiar(pagina + 1)}
                disabled={pagina >= totalPaginas - 1 || deshabilitada}
            >
                Siguiente
            </Button>
        </nav>
    );
};

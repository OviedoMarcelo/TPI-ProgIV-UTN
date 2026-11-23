import { Button } from "@/shared/ui/Button";

interface EstadoErrorProps {
    mensaje: string;
    onReintentar?: () => void;
}

// Error al cargar un listado (por ejemplo, el backend está apagado)
export const EstadoError = ({ mensaje, onReintentar }: EstadoErrorProps) => {
    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-800 dark:bg-red-950/40"
        >
            <p className="font-semibold text-red-700 dark:text-red-300">{mensaje}</p>
            <p className="text-sm text-red-600 dark:text-red-400">
                Verificá que el backend esté corriendo e intentá de nuevo.
            </p>
            {onReintentar && (
                <Button variant="danger" size="sm" onClick={onReintentar}>
                    Reintentar
                </Button>
            )}
        </div>
    );
};

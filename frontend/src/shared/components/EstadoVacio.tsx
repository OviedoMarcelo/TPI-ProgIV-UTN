import type { ReactNode } from "react";

interface EstadoVacioProps {
    mensaje: string;
    accion?: ReactNode; // por ejemplo, un botón o un enlace
}

// Listado sin registros
export const EstadoVacio = ({ mensaje, accion }: EstadoVacioProps) => {
    return (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-600 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">{mensaje}</p>
            {accion}
        </div>
    );
};

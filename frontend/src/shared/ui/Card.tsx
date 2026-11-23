import type { HTMLAttributes } from "react";

// Contenedor con borde y sombra: tarjetas del catálogo, del resumen y paneles
export const Card = ({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
            {...props}
        />
    );
};

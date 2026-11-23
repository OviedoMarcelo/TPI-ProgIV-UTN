// Skeletons: imitan la forma del contenido mientras llegan los datos

const BLOQUE = "rounded bg-gray-200 dark:bg-gray-700";

export const SkeletonTabla = ({ filas = 5 }: { filas?: number }) => {
    return (
        <div
            role="status"
            aria-label="Cargando"
            className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
            <div className="h-11 bg-gray-100 dark:bg-gray-700/50" />
            {Array.from({ length: filas }, (_, i) => (
                <div key={i} className="flex gap-4 border-t border-gray-100 px-4 py-4 dark:border-gray-700">
                    <div className={`h-4 w-1/4 ${BLOQUE}`} />
                    <div className={`h-4 w-1/2 ${BLOQUE}`} />
                    <div className={`ml-auto h-4 w-24 ${BLOQUE}`} />
                </div>
            ))}
            <span className="sr-only">Cargando...</span>
        </div>
    );
};

export const SkeletonTarjetas = ({ cantidad = 8 }: { cantidad?: number }) => {
    return (
        <div
            role="status"
            aria-label="Cargando"
            className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            {Array.from({ length: cantidad }, (_, i) => (
                <div
                    key={i}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                    <div className="aspect-4/3 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex flex-col gap-3 p-4">
                        <div className={`h-4 w-3/4 ${BLOQUE}`} />
                        <div className={`h-3 w-full ${BLOQUE}`} />
                        <div className={`h-8 w-full ${BLOQUE}`} />
                    </div>
                </div>
            ))}
            <span className="sr-only">Cargando...</span>
        </div>
    );
};

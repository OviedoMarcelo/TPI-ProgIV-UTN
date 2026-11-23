interface AlertaErrorProps {
    mensaje: string;
}

// Error en línea: respuestas de la API dentro de un formulario
export const AlertaError = ({ mensaje }: AlertaErrorProps) => {
    return (
        <p
            role="alert"
            className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
        >
            {mensaje}
        </p>
    );
};

// Indicador mientras checkSession confirma la sesión con /auth/me
export const CargandoSesion = () => {
    return (
        <div
            role="status"
            className="flex flex-col items-center gap-3 px-6 py-20 text-gray-500 dark:text-gray-400"
        >
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600 dark:border-gray-700 dark:border-t-orange-400" />
            Verificando sesión...
        </div>
    );
};

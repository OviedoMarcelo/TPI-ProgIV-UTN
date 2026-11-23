import { Link } from "react-router";

export const UnauthorizedPage = () => {
    return (
        <section className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Acceso denegado</h1>
            <p className="text-gray-600 dark:text-gray-400">
                Tu usuario no tiene permisos para ver esa página.
            </p>
            <Link to="/" className="text-orange-600 hover:underline dark:text-orange-400">
                Volver al inicio
            </Link>
        </section>
    );
};

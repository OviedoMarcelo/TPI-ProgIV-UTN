import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

// Ruta de diseño: la Navbar arriba y en el Outlet la página de la ruta activa
export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};

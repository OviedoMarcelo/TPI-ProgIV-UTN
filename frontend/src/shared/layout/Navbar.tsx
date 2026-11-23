import { Link, NavLink, useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "@/shared/ui/Button";

const ENLACES_ADMIN = [
    { to: "/admin/resumen", texto: "Resumen" },
    { to: "/admin/categorias", texto: "Categorías" },
    { to: "/admin/productos", texto: "Productos" },
    { to: "/admin/pedidos", texto: "Pedidos" },
    { to: "/admin/usuarios", texto: "Usuarios" },
];

// NavLink = Link que además sabe si su ruta está activa
const claseEnlace = ({ isActive }: { isActive: boolean }) =>
    `rounded px-2 py-1 text-white hover:bg-white/15 ${isActive ? "bg-white/20 font-semibold" : ""}`;

export const Navbar = () => {
    const usuario = useAuthStore((state) => state.usuario);
    const logout = useAuthStore((state) => state.logout);
    // Selector que devuelve un número: re-renderiza solo si cambia la cantidad
    const cantidadEnCarrito = useCartStore((state) =>
        state.items.reduce((suma, item) => suma + item.cantidad, 0),
    );
    const darkMode = useThemeStore((state) => state.darkMode);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const navigate = useNavigate();

    // Ocultar el panel es solo interfaz: la protección real es require_role
    const esAdmin = usuario?.role === "admin";

    const cerrarSesion = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="bg-orange-600 shadow dark:bg-orange-950">
            <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Link to="/" className="mr-2 text-xl font-bold text-white">
                        Food Store
                    </Link>
                    <NavLink to="/" end className={claseEnlace}>
                        Catálogo
                    </NavLink>
                    <NavLink to="/carrito" className={claseEnlace}>
                        Carrito
                        {cantidadEnCarrito > 0 && (
                            <span className="ml-1 rounded-full bg-white px-1.5 text-xs font-bold text-orange-700">
                                {cantidadEnCarrito}
                            </span>
                        )}
                    </NavLink>
                    {usuario && (
                        <NavLink to="/mis-pedidos" className={claseEnlace}>
                            Mis pedidos
                        </NavLink>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-white">
                    {usuario ? (
                        <>
                            <span>{usuario.full_name}</span>
                            <span className="rounded-full bg-orange-800 px-2 py-0.5 text-xs font-medium dark:bg-orange-700">
                                {usuario.role}
                            </span>
                            <Button variant="secondary" size="sm" onClick={() => void cerrarSesion()}>
                                Cerrar sesión
                            </Button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={claseEnlace}>
                                Ingresar
                            </NavLink>
                            <NavLink to="/register" className={claseEnlace}>
                                Registrarse
                            </NavLink>
                        </>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={toggleTheme}
                        aria-pressed={darkMode}
                        title="Cambiar el tema"
                    >
                        {darkMode ? "Modo claro" : "Modo oscuro"}
                    </Button>
                </div>
            </nav>

            {esAdmin && (
                <div className="bg-orange-700 dark:bg-orange-900">
                    <nav
                        aria-label="Panel de administración"
                        className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 text-sm"
                    >
                        <span className="mr-1 font-semibold text-orange-100">Panel:</span>
                        {ENLACES_ADMIN.map(({ to, texto }) => (
                            <NavLink key={to} to={to} className={claseEnlace}>
                                {texto}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

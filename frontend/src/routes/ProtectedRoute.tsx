import { Navigate, Outlet, useLocation } from "react-router";
import { CargandoSesion } from "@/features/auth";
import type { Rol } from "@/shared/types/usuario.types";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
    allowedRoles?: Rol[]; // sin roles: alcanza con haber iniciado sesión
}

// Guardián de rutas: decide si muestra la ruta hija (Outlet) o redirige.
// Es solo experiencia de usuario: la seguridad real la aplica el backend.
export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const usuario = useAuthStore((state) => state.usuario);
    const cargando = useAuthStore((state) => state.cargando);
    const location = useLocation();

    // Mientras checkSession consulta /auth/me no se decide nada
    if (cargando) return <CargandoSesion />;

    // Sin sesión: al login, recordando a dónde quería ir
    if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;

    // Con sesión pero sin el rol necesario
    if (allowedRoles && !allowedRoles.includes(usuario.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

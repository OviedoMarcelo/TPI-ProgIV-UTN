import { useAuthStore } from "@/store/authStore";

// Lectura de la sesión para los componentes. Un selector por dato: el
// componente se re-renderiza solo si cambia lo que usa.
export const useAuth = () => {
    const usuario = useAuthStore((state) => state.usuario);
    const cargando = useAuthStore((state) => state.cargando);
    const enviando = useAuthStore((state) => state.enviando);
    const error = useAuthStore((state) => state.error);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const clearError = useAuthStore((state) => state.clearError);
    const esAdmin = useAuthStore((state) => state.usuario?.role === "admin");

    return { usuario, cargando, enviando, error, login, logout, clearError, esAdmin };
};

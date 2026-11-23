import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { handleApiError } from "@/shared/api/handleApiError";
import { loginApi, logoutApi, meApi } from "@/shared/api/sesionApi";
import type { RespuestaError } from "@/shared/types/api.types";
import type { UsuarioPublico, UsuarioSesion } from "@/shared/types/usuario.types";

interface AuthState {
    usuario: UsuarioSesion | null;
    cargando: boolean; // checkSession todavía no confirmó la sesión
    enviando: boolean; // login en curso
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    clearSession: () => void;
    clearError: () => void;
}

// Solo lo que la interfaz necesita: nombre, email y rol
const aUsuarioSesion = ({ id, username, full_name, email, role }: UsuarioPublico): UsuarioSesion => ({
    id,
    username,
    full_name,
    email,
    role,
});

// En el login un 401 es "credenciales incorrectas", no "sesión vencida"
const mensajeDeLogin = (error: unknown): string => {
    if (axios.isAxiosError<RespuestaError>(error) && error.response?.status === 401) {
        const detail = error.response.data?.detail;
        return typeof detail === "string" ? detail : "Usuario o contraseña incorrectos";
    }
    return handleApiError(error);
};

// create<T>()(...): doble paréntesis para que TypeScript infiera bien con persist
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            usuario: null,
            cargando: true,
            enviando: false,
            error: null,

            login: async (username, password) => {
                set({ enviando: true, error: null });
                try {
                    await loginApi(username, password); // el servidor pone la cookie
                    set({ usuario: aUsuarioSesion(await meApi()) });
                } catch (error) {
                    set({ usuario: null, error: mensajeDeLogin(error) });
                } finally {
                    set({ enviando: false });
                }
            },

            logout: async () => {
                try {
                    await logoutApi(); // el servidor borra la cookie
                } finally {
                    set({ usuario: null });
                }
            },

            // Al montar la aplicación: confirma con el backend que la cookie
            // sigue valiendo y trae los datos actualizados (rol, nombre)
            checkSession: async () => {
                set({ cargando: true });
                try {
                    set({ usuario: aUsuarioSesion(await meApi()) });
                } catch {
                    set({ usuario: null }); // cookie vencida, cuenta desactivada o sin red
                } finally {
                    set({ cargando: false });
                }
            },

            clearSession: () => set({ usuario: null }),
            clearError: () => set({ error: null }),
        }),
        {
            name: "auth-storage", // localStorage
            // partialize: SOLO el usuario. Nunca el token (vive en la cookie
            // HttpOnly, que JavaScript no puede leer) ni los estados de carga.
            partialize: (state) => ({ usuario: state.usuario }),
        },
    ),
);

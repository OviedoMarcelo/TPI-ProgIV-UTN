import type { UsuarioPublico } from "@/shared/types/usuario.types";
import { api } from "./axiosInstance";

// Llamadas de sesión que usa el authStore. Están en shared y no en la feature
// auth porque el store es transversal: así store/ no depende de una feature.

// El login es un formulario OAuth2 (x-www-form-urlencoded), no JSON.
// La respuesta solo trae { message }: el token llega en la cookie HttpOnly.
export const loginApi = async (username: string, password: string): Promise<void> => {
    await api.post("/auth/token", new URLSearchParams({ username, password }));
};

export const logoutApi = async (): Promise<void> => {
    await api.post("/auth/logout");
};

// ¿De quién es la cookie que tiene el navegador?
export const meApi = async (): Promise<UsuarioPublico> =>
    (await api.get<UsuarioPublico>("/auth/me")).data;

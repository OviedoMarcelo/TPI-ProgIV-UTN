import { api } from "@/shared/api/axiosInstance";
import type { UsuarioPublico } from "@/shared/types/usuario.types";
import type { RegistroInput } from "../types/auth.types";

// Login, logout y /me los usa el authStore (shared/api/sesionApi.ts)
export const registrar = async (data: RegistroInput): Promise<UsuarioPublico> =>
    (await api.post<UsuarioPublico>("/auth/register", data)).data;

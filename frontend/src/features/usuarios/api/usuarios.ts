import { api } from "@/shared/api/axiosInstance";
import type { UsuarioPublico } from "@/shared/types/usuario.types";

const RUTA = "/admin/usuarios";

export const listarUsuarios = async (): Promise<UsuarioPublico[]> =>
    (await api.get<UsuarioPublico[]>(RUTA)).data;

export const activarUsuario = async (id: number): Promise<UsuarioPublico> =>
    (await api.post<UsuarioPublico>(`${RUTA}/${id}/activar`)).data;

export const desactivarUsuario = async (id: number): Promise<UsuarioPublico> =>
    (await api.post<UsuarioPublico>(`${RUTA}/${id}/desactivar`)).data;

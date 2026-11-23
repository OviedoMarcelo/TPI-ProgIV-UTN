// Tipos de usuario que comparten la sesión (store/) y las features auth y usuarios.
// Los nombres de campo son los mismos que UserPublic del backend.

export type Rol = "user" | "admin";

export interface UsuarioPublico {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: Rol;
    disabled: boolean;
    created_at: string; // ISO 8601
}

// Lo que guarda el authStore: nombre, email y rol (nunca el token)
export type UsuarioSesion = Pick<UsuarioPublico, "id" | "username" | "full_name" | "email" | "role">;

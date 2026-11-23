import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError } from "@/shared/api/notificarError";
import type { UsuarioPublico } from "@/shared/types/usuario.types";
import { useNotificationStore } from "@/store/notificationStore";
import { activarUsuario, desactivarUsuario, listarUsuarios } from "../api/usuarios";

const CLAVE = ["usuarios"];
const SIN_USUARIOS: UsuarioPublico[] = [];

// Listado de usuarios (solo admin) y activación/desactivación de cuentas
export const useUsuarios = () => {
    const queryClient = useQueryClient();
    const notificar = useNotificationStore((state) => state.showNotification);

    const listado = useQuery({ queryKey: CLAVE, queryFn: listarUsuarios });
    const invalidar = () => queryClient.invalidateQueries({ queryKey: CLAVE });

    const activar = useMutation({
        mutationFn: (usuario: UsuarioPublico) => activarUsuario(usuario.id),
        onSuccess: (usuario) => {
            void invalidar();
            notificar(`Cuenta de "${usuario.username}" activada`);
        },
        onError: notificarError,
    });

    const desactivar = useMutation({
        mutationFn: (usuario: UsuarioPublico) => desactivarUsuario(usuario.id),
        onSuccess: (usuario) => {
            void invalidar();
            notificar(`Cuenta de "${usuario.username}" desactivada`);
        },
        onError: notificarError,
    });

    return {
        usuarios: listado.data ?? SIN_USUARIOS,
        isLoading: listado.isLoading,
        isError: listado.isError,
        refetch: listado.refetch,
        activar,
        desactivar,
    };
};

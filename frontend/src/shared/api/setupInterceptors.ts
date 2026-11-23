import type { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import type { RespuestaError } from "@/shared/types/api.types";
import { api } from "./axiosInstance";
import { esCuentaDesactivada } from "./handleApiError";

// Archivo aparte de axiosInstance.ts: si la instancia importara el store
// habría un import circular (store -> sesionApi -> axiosInstance -> store).

// En estas rutas el 401 es parte del funcionamiento normal: login con datos
// incorrectos y la verificación inicial de la sesión (la maneja checkSession)
const RUTAS_DE_AUTH = ["/auth/token", "/auth/me"];

api.interceptors.response.use(
    (respuesta) => respuesta,
    (error: AxiosError<RespuestaError>) => {
        const url = error.config?.url ?? "";
        const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));
        const estado = error.response?.status;
        const { showNotification } = useNotificationStore.getState();

        if (!esDeAuth && estado === 401) {
            // Sesión vencida: se limpia el store y ProtectedRoute lleva al login
            useAuthStore.getState().clearSession();
            showNotification("Tu sesión venció. Iniciá sesión de nuevo.", "info");
        } else if (!esDeAuth && esCuentaDesactivada(error)) {
            // El admin desactivó la cuenta con la sesión abierta
            useAuthStore.getState().clearSession();
            showNotification("Tu cuenta fue desactivada.", "error");
        } else if (estado === 403) {
            // Sesión válida sin permisos: se avisa sin cerrar la sesión
            showNotification("Acceso denegado: no tenés permisos para esta acción.", "error");
        }
        return Promise.reject(error); // quien llamó también se entera
    },
);

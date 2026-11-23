import axios from "axios";
import type { RespuestaError } from "@/shared/types/api.types";

export const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

export const esCuentaDesactivada = (error: unknown): boolean =>
    axios.isAxiosError<RespuestaError>(error) &&
    error.response?.status === 400 &&
    error.response.data?.detail === CUENTA_DESACTIVADA;

// Errores que ya avisa el interceptor (sesión vencida, cuenta desactivada y 403):
// los hooks no los vuelven a notificar
export const loAvisaElInterceptor = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    const estado = error.response?.status;
    return estado === 401 || estado === 403 || esCuentaDesactivada(error);
};

// Convierte el detail de la API en un mensaje para la pantalla
export const handleApiError = (error: unknown): string => {
    if (!axios.isAxiosError<RespuestaError>(error)) {
        return "Error inesperado.";
    }
    if (error.code === "ECONNABORTED") {
        return "El servidor tardó demasiado en responder.";
    }
    if (!error.response) {
        return "No se pudo conectar con el servidor.";
    }

    const { status, data } = error.response;
    if (status === 401) {
        return "La sesión venció. Iniciá sesión de nuevo.";
    }
    if (status === 403) {
        return "No tenés permisos para realizar esta acción.";
    }
    const detail = data?.detail;
    if (typeof detail === "string") {
        return detail; // 400, 404 y 409: el mensaje del backend es el más preciso
    }
    if (Array.isArray(detail)) {
        return detail.map((item) => item.msg).join(". "); // 422
    }
    return status < 500
        ? "No se pudo completar la operación."
        : "Error del servidor. Intentá de nuevo más tarde.";
};

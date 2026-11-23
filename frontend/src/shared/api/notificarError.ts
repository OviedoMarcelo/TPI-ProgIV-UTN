import { useNotificationStore } from "@/store/notificationStore";
import { handleApiError, loAvisaElInterceptor } from "./handleApiError";

// onError de las mutaciones: muestra el error en el Toast, salvo que ya lo
// haya avisado el interceptor (así un 403 no aparece dos veces)
export const notificarError = (error: unknown) => {
    if (loAvisaElInterceptor(error)) return;
    useNotificationStore.getState().showNotification(handleApiError(error), "error");
};

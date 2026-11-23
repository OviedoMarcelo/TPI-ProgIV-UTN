import { create } from "zustand";

export type TipoNotificacion = "exito" | "error" | "info";

interface NotificationState {
    mensaje: string;
    tipo: TipoNotificacion;
    visible: boolean;
    id: number; // cambia con cada aviso: reinicia el temporizador del Toast
    showNotification: (mensaje: string, tipo?: TipoNotificacion) => void;
    hideNotification: () => void;
}

// Sin persist: un aviso no tiene sentido después de recargar
export const useNotificationStore = create<NotificationState>()((set) => ({
    mensaje: "",
    tipo: "info",
    visible: false,
    id: 0,
    showNotification: (mensaje, tipo = "exito") =>
        set((state) => ({ mensaje, tipo, visible: true, id: state.id + 1 })),
    hideNotification: () => set({ visible: false }),
}));

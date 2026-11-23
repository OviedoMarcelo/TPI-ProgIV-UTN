import { useEffect } from "react";
import { useNotificationStore, type TipoNotificacion } from "@/store/notificationStore";

const DURACION_MS = 3000;

const ESTILOS: Record<TipoNotificacion, string> = {
    exito: "bg-emerald-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-gray-800 text-white dark:bg-gray-700",
};

// Se monta una sola vez (App.tsx) y muestra el aviso del notificationStore
export const Toast = () => {
    const mensaje = useNotificationStore((state) => state.mensaje);
    const tipo = useNotificationStore((state) => state.tipo);
    const visible = useNotificationStore((state) => state.visible);
    const id = useNotificationStore((state) => state.id);
    const hideNotification = useNotificationStore((state) => state.hideNotification);

    // Se oculta solo. id en las dependencias: un aviso nuevo reinicia los 3 s
    useEffect(() => {
        if (!visible) return;
        const temporizador = setTimeout(hideNotification, DURACION_MS);
        return () => clearTimeout(temporizador);
    }, [visible, id, hideNotification]);

    if (!visible) return null;

    return (
        <div
            // alert interrumpe al lector de pantalla; status espera su turno
            role={tipo === "error" ? "alert" : "status"}
            className={`fixed right-4 bottom-4 left-4 z-50 flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg sm:left-auto sm:max-w-sm ${ESTILOS[tipo]}`}
        >
            <p className="flex-1 text-sm wrap-anywhere">{mensaje}</p>
            <button
                type="button"
                onClick={hideNotification}
                aria-label="Cerrar notificación"
                className="leading-none opacity-80 hover:opacity-100"
            >
                ✕
            </button>
        </div>
    );
};

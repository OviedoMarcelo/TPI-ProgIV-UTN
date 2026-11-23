import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

// Instancia única de TanStack Query: administra la caché del estado del servidor
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000, // 30 s sin volver a pedir lo mismo
            // Un 4xx no se arregla reintentando; un corte de red, quizás sí
            retry: (intentos, error) => {
                const estado = axios.isAxiosError(error) ? error.response?.status : undefined;
                return (estado === undefined || estado >= 500) && intentos < 1;
            },
        },
    },
});

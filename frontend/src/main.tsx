import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/shared/api/setupInterceptors"; // registra los interceptores de Axios una sola vez
import { queryClient } from "@/shared/api/queryClient";
import { useAuthStore } from "@/store/authStore";
import { App } from "./App";

// Si cambia el usuario (login, logout, sesión vencida) se borra la caché de
// TanStack Query: los pedidos de una cuenta no se muestran en otra
useAuthStore.subscribe((state, anterior) => {
    if (state.usuario?.id !== anterior.usuario?.id) {
        queryClient.clear();
    }
});

const root = document.getElementById("root");
if (!root) throw new Error("Falta el elemento #root en index.html");

createRoot(root).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </StrictMode>,
);

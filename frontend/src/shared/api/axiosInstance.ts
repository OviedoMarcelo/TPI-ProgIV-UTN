import axios from "axios";

// Única instancia de Axios de la aplicación. Los interceptores se registran
// en setupInterceptors.ts (importado una sola vez en main.tsx).
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
    timeout: 10_000,
    withCredentials: true, // envía y recibe la cookie HttpOnly entre orígenes
});

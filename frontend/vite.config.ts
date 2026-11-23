import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    // Alias @/ -> src/ (el mismo se declara en tsconfig.app.json para TypeScript).
    // import.meta.dirname: vite.config.ts es un módulo ES, no existe __dirname
    resolve: {
        alias: { "@": path.resolve(import.meta.dirname, "src") },
    },
    // El CORS del backend solo admite este origen: si el puerto está ocupado,
    // mejor fallar que arrancar en 5174
    server: { port: 5173, strictPort: true },
    // Las librerías (node_modules) van en un archivo aparte del código propio:
    // cambian poco, así el navegador las mantiene en caché entre versiones
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [{ name: "vendor", test: /node_modules/ }],
                },
            },
        },
    },
});

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
    darkMode: boolean;
    toggleTheme: () => void;
}

// Tailwind aplica las clases dark: cuando <html> tiene la clase "dark"
const aplicarTema = (darkMode: boolean) => {
    document.documentElement.classList.toggle("dark", darkMode);
};

// Primera visita: se respeta la preferencia del sistema operativo
const prefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            darkMode: prefiereOscuro,
            toggleTheme: () => set((state) => ({ darkMode: !state.darkMode })),
        }),
        {
            name: "theme-storage",
            // Al cargar la página: aplica el tema guardado antes del primer render
            onRehydrateStorage: () => (state) => aplicarTema(state?.darkMode ?? prefiereOscuro),
        },
    ),
);

// Cada cambio posterior del tema se refleja en <html>
useThemeStore.subscribe((state) => aplicarTema(state.darkMode));

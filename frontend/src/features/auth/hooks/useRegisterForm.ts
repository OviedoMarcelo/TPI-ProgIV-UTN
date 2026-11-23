import { useForm } from "@tanstack/react-form";
import { esEmailValido } from "@/shared/lib/formato";
import type { RegistroInput } from "../types/auth.types";

const REGISTRO_VACIO: RegistroInput = { username: "", full_name: "", email: "", password: "" };

const FORMATO_USERNAME = /^[A-Za-z0-9._-]+$/;

// Las mismas reglas que UserCreate del backend
const validarRegistro = ({ value }: { value: RegistroInput }) => {
    const errores: Partial<Record<keyof RegistroInput, string>> = {};
    const username = value.username.trim();
    if (username.length < 3 || username.length > 50) {
        errores.username = "Entre 3 y 50 caracteres";
    } else if (!FORMATO_USERNAME.test(username)) {
        errores.username = "Solo letras, números, punto, guion y guion bajo";
    }
    const nombre = value.full_name.trim();
    if (nombre.length < 2 || nombre.length > 100) {
        errores.full_name = "Entre 2 y 100 caracteres";
    }
    if (!esEmailValido(value.email)) {
        errores.email = "Ingresá un email válido";
    }
    if (value.password.length < 8) {
        errores.password = "Mínimo 8 caracteres";
    } else if (new TextEncoder().encode(value.password).length > 72) {
        errores.password = "La contraseña es demasiado larga (máximo 72 bytes)";
    }
    return Object.keys(errores).length > 0 ? { fields: errores } : undefined;
};

export const useRegisterForm = (onEnviar: (data: RegistroInput) => void) =>
    useForm({
        defaultValues: REGISTRO_VACIO,
        validators: { onChange: validarRegistro },
        onSubmit: ({ value }) =>
            onEnviar({
                username: value.username.trim(),
                full_name: value.full_name.trim(),
                email: value.email.trim(),
                password: value.password,
            }),
    });

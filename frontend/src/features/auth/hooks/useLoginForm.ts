import { useForm } from "@tanstack/react-form";
import type { LoginInput } from "../types/auth.types";

const LOGIN_VACIO: LoginInput = { username: "", password: "" };

const validarLogin = ({ value }: { value: LoginInput }) => {
    const errores: Partial<Record<keyof LoginInput, string>> = {};
    if (!value.username.trim()) {
        errores.username = "Ingresá tu nombre de usuario";
    }
    if (!value.password) {
        errores.password = "Ingresá la contraseña";
    }
    return Object.keys(errores).length > 0 ? { fields: errores } : undefined;
};

export const useLoginForm = (onEnviar: (data: LoginInput) => Promise<void>) =>
    useForm({
        defaultValues: LOGIN_VACIO,
        validators: { onChange: validarLogin },
        onSubmit: ({ value }) => onEnviar({ ...value, username: value.username.trim() }),
    });

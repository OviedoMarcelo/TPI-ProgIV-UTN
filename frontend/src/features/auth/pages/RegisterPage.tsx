import { Link, Navigate } from "react-router";
import { handleApiError } from "@/shared/api/handleApiError";
import { CampoTexto } from "@/shared/ui/Input";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { useRegister } from "../hooks/useRegister";
import { useRegisterForm } from "../hooks/useRegisterForm";

export const RegisterPage = () => {
    const { usuario } = useAuth();
    const registro = useRegister();
    const form = useRegisterForm((datos) => registro.mutate(datos));

    // Con sesión activa no tiene sentido registrarse
    if (usuario) return <Navigate to="/" replace />;

    return (
        <form.Subscribe selector={(state) => state.canSubmit}>
            {(puedeEnviar) => (
                <AuthForm
                    titulo="Crear cuenta"
                    textoBoton="Registrarme"
                    // 409 si el usuario o el email ya existen
                    error={registro.error ? handleApiError(registro.error) : null}
                    enviando={registro.isPending}
                    puedeEnviar={puedeEnviar}
                    onSubmit={() => void form.handleSubmit()}
                    pie={
                        <>
                            ¿Ya tenés cuenta?{" "}
                            <Link to="/login" className="text-orange-600 hover:underline dark:text-orange-400">
                                Iniciá sesión
                            </Link>
                        </>
                    }
                >
                    <form.Field name="username">
                        {(field) => <CampoTexto field={field} label="Usuario" autoComplete="username" />}
                    </form.Field>
                    <form.Field name="full_name">
                        {(field) => <CampoTexto field={field} label="Nombre completo" autoComplete="name" />}
                    </form.Field>
                    <form.Field name="email">
                        {(field) => <CampoTexto field={field} label="Email" tipo="email" autoComplete="email" />}
                    </form.Field>
                    <form.Field name="password">
                        {(field) => (
                            <CampoTexto
                                field={field}
                                label="Contraseña (mínimo 8 caracteres)"
                                tipo="password"
                                autoComplete="new-password"
                            />
                        )}
                    </form.Field>
                </AuthForm>
            )}
        </form.Subscribe>
    );
};

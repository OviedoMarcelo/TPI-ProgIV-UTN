import { useEffect } from "react";
import { Link, Navigate, useLocation, type Location } from "react-router";
import { CampoTexto } from "@/shared/ui/Input";
import { AuthForm } from "../components/AuthForm";
import { CargandoSesion } from "../components/CargandoSesion";
import { useAuth } from "../hooks/useAuth";
import { useLoginForm } from "../hooks/useLoginForm";

// Lo que pueden mandar ProtectedRoute (from) y el registro (registrado)
type EstadoNavegacion = { from?: Location; registrado?: boolean } | null;

export const LoginPage = () => {
    const { usuario, cargando, enviando, error, login, clearError } = useAuth();

    const location = useLocation();
    const estado = location.state as EstadoNavegacion;
    // Vuelve a la pantalla que se pidió antes de que ProtectedRoute mandara acá
    const destino = estado?.from?.pathname ?? "/";

    const form = useLoginForm(({ username, password }) => login(username, password));

    // Al salir de la página no queda el error del intento anterior
    useEffect(() => clearError, [clearError]);

    if (cargando) return <CargandoSesion />;
    // Cubre el login exitoso y el entrar a /login con sesión activa
    if (usuario) return <Navigate to={destino} replace />;

    return (
        <form.Subscribe selector={(state) => state.canSubmit}>
            {(puedeEnviar) => (
                <AuthForm
                    titulo="Iniciar sesión"
                    textoBoton="Ingresar"
                    error={error}
                    enviando={enviando}
                    puedeEnviar={puedeEnviar}
                    onSubmit={() => void form.handleSubmit()}
                    pie={
                        <>
                            ¿No tenés cuenta?{" "}
                            <Link to="/register" className="text-orange-600 hover:underline dark:text-orange-400">
                                Registrate
                            </Link>
                        </>
                    }
                >
                    {estado?.registrado && !error && (
                        <p
                            role="status"
                            className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        >
                            Cuenta creada. Ya podés iniciar sesión.
                        </p>
                    )}
                    <form.Field name="username">
                        {(field) => <CampoTexto field={field} label="Usuario" autoComplete="username" />}
                    </form.Field>
                    <form.Field name="password">
                        {(field) => (
                            <CampoTexto
                                field={field}
                                label="Contraseña"
                                tipo="password"
                                autoComplete="current-password"
                            />
                        )}
                    </form.Field>
                </AuthForm>
            )}
        </form.Subscribe>
    );
};

import type { ReactNode, SubmitEvent } from "react";
import { AlertaError } from "@/shared/ui/AlertaError";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

interface AuthFormProps {
    titulo: string;
    textoBoton: string;
    error: string | null;
    enviando: boolean;
    puedeEnviar: boolean; // canSubmit de TanStack Form
    onSubmit: () => void;
    children: ReactNode; // los campos
    pie: ReactNode; // el enlace a la otra página
}

// Estructura común del login y del registro
export const AuthForm = ({
    titulo,
    textoBoton,
    error,
    enviando,
    puedeEnviar,
    onSubmit,
    children,
    pie,
}: AuthFormProps) => {
    const handleSubmit = (evento: SubmitEvent<HTMLFormElement>) => {
        evento.preventDefault(); // no recarga la página
        onSubmit();
    };

    return (
        <div className="flex justify-center py-6">
            <Card className="w-full max-w-md p-6">
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{titulo}</h1>
                    {error && <AlertaError mensaje={error} />}
                    {children}
                    <Button type="submit" disabled={!puedeEnviar || enviando}>
                        {enviando ? "Enviando..." : textoBoton}
                    </Button>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">{pie}</p>
                </form>
            </Card>
        </div>
    );
};

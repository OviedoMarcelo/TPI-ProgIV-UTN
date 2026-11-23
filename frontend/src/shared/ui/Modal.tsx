import { useEffect, useId, useRef, type ReactNode, type SubmitEvent } from "react";
import { AlertaError } from "./AlertaError";
import { Button } from "./Button";

interface ModalProps {
    titulo: string;
    onCerrar: () => void;
    children: ReactNode;
    ancho?: "md" | "lg";
}

// Base de todos los pop-ups: <dialog> nativo con showModal(), que bloquea el
// fondo, encierra el foco y se cierra con Escape
export const Modal = ({ titulo, onCerrar, children, ancho = "md" }: ModalProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const tituloId = useId();

    useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    return (
        <dialog
            ref={dialogRef}
            onClose={onCerrar} // Escape o close()
            aria-labelledby={tituloId}
            className={`m-auto max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/50 dark:bg-gray-800 dark:text-gray-100 ${ancho === "lg" ? "max-w-2xl" : "max-w-md"}`}
        >
            <h2 id={tituloId} className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100">
                {titulo}
            </h2>
            {children}
        </dialog>
    );
};

interface FormModalProps {
    titulo: string;
    error: string | null; // error de la API: se muestra SIN cerrar el modal
    guardando: boolean;
    puedeGuardar: boolean; // canSubmit de TanStack Form
    onSubmit: () => void;
    onCancelar: () => void;
    children: ReactNode; // los campos del formulario
}

// Modal de alta y edición: estructura común de los ABM
export const FormModal = ({
    titulo,
    error,
    guardando,
    puedeGuardar,
    onSubmit,
    onCancelar,
    children,
}: FormModalProps) => {
    const handleSubmit = (evento: SubmitEvent<HTMLFormElement>) => {
        evento.preventDefault(); // evita que el navegador recargue la página
        onSubmit();
    };

    return (
        <Modal titulo={titulo} onCerrar={onCancelar}>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {error && <AlertaError mensaje={error} />}
                {children}
                <div className="mt-2 flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancelar} disabled={guardando}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={!puedeGuardar || guardando}>
                        {guardando ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

interface ConfirmDialogProps {
    titulo: string;
    mensaje: string;
    textoConfirmar: string;
    onConfirmar: () => void;
    onCancelar: () => void;
}

// Confirmación propia: reemplaza a window.confirm
export const ConfirmDialog = ({
    titulo,
    mensaje,
    textoConfirmar,
    onConfirmar,
    onCancelar,
}: ConfirmDialogProps) => {
    return (
        <Modal titulo={titulo} onCerrar={onCancelar}>
            <p className="text-gray-600 wrap-anywhere dark:text-gray-300">{mensaje}</p>
            <div className="mt-6 flex justify-end gap-2">
                {/* Va primero para recibir el foco: un Enter accidental no confirma */}
                <Button variant="secondary" onClick={onCancelar}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirmar}>
                    {textoConfirmar}
                </Button>
            </div>
        </Modal>
    );
};

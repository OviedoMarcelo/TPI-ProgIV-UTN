import { CampoAreaTexto, CampoTexto } from "@/shared/ui/Input";
import { FormModal } from "@/shared/ui/Modal";
import type { CategoriaForm } from "../hooks/useCategoriaForm";

interface CategoriaModalProps {
    esEdicion: boolean;
    form: CategoriaForm; // instancia de TanStack Form creada en la página
    error: string | null;
    guardando: boolean;
    onCancelar: () => void;
}

export const CategoriaModal = ({ esEdicion, form, error, guardando, onCancelar }: CategoriaModalProps) => {
    return (
        // form.Subscribe: re-renderiza solo cuando cambia canSubmit
        <form.Subscribe selector={(estado) => estado.canSubmit}>
            {(puedeGuardar) => (
                <FormModal
                    titulo={esEdicion ? "Editar categoría" : "Nueva categoría"}
                    error={error}
                    guardando={guardando}
                    puedeGuardar={puedeGuardar}
                    onSubmit={() => void form.handleSubmit()}
                    onCancelar={onCancelar}
                >
                    <form.Field name="nombre">
                        {(field) => <CampoTexto field={field} label="Nombre" />}
                    </form.Field>
                    <form.Field name="descripcion">
                        {(field) => <CampoAreaTexto field={field} label="Descripción (opcional)" />}
                    </form.Field>
                </FormModal>
            )}
        </form.Subscribe>
    );
};

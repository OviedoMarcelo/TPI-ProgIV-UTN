import type { Categoria } from "@/features/categorias";
import {
    CampoAreaTexto,
    CampoCheckbox,
    CampoNumero,
    CampoSelect,
    CampoTexto,
} from "@/shared/ui/Input";
import { FormModal } from "@/shared/ui/Modal";
import type { ProductoForm } from "../hooks/useProductoForm";

interface ProductoModalProps {
    esEdicion: boolean;
    form: ProductoForm;
    categorias: Categoria[];
    error: string | null;
    guardando: boolean;
    onCancelar: () => void;
}

export const ProductoModal = ({
    esEdicion,
    form,
    categorias,
    error,
    guardando,
    onCancelar,
}: ProductoModalProps) => {
    const opciones = categorias.map((c) => ({ valor: String(c.id), texto: c.nombre }));

    return (
        <form.Subscribe selector={(estado) => estado.canSubmit}>
            {(puedeGuardar) => (
                <FormModal
                    titulo={esEdicion ? "Editar producto" : "Nuevo producto"}
                    error={error}
                    guardando={guardando}
                    puedeGuardar={puedeGuardar}
                    onSubmit={() => void form.handleSubmit()}
                    onCancelar={onCancelar}
                >
                    <form.Field name="nombre">
                        {(field) => <CampoTexto field={field} label="Nombre" />}
                    </form.Field>
                    <form.Field name="categoria_id">
                        {(field) => (
                            <CampoSelect
                                field={field}
                                label="Categoría"
                                opciones={opciones}
                                textoVacio="Elegí una categoría"
                            />
                        )}
                    </form.Field>
                    <form.Field name="descripcion">
                        {(field) => <CampoAreaTexto field={field} label="Descripción (opcional)" />}
                    </form.Field>
                    <div className="grid grid-cols-2 gap-3">
                        <form.Field name="precio_base">
                            {(field) => <CampoNumero field={field} label="Precio" />}
                        </form.Field>
                        <form.Field name="stock">
                            {(field) => <CampoNumero field={field} label="Stock" decimales={false} />}
                        </form.Field>
                    </div>
                    <form.Field name="imagen_url">
                        {(field) => <CampoTexto field={field} label="URL de la imagen (opcional)" tipo="url" />}
                    </form.Field>
                    <form.Field name="disponible">
                        {(field) => <CampoCheckbox field={field} label="Disponible para la venta" />}
                    </form.Field>
                </FormModal>
            )}
        </form.Subscribe>
    );
};

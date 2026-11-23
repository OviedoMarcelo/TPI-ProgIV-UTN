import { CampoCheckbox, CampoNumero } from "@/shared/ui/Input";
import { FormModal } from "@/shared/ui/Modal";
import type { StockForm } from "../hooks/useStockForm";

interface StockModalProps {
    nombreProducto: string;
    form: StockForm;
    error: string | null;
    guardando: boolean;
    onCancelar: () => void;
}

// Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock)
export const StockModal = ({ nombreProducto, form, error, guardando, onCancelar }: StockModalProps) => {
    return (
        <form.Subscribe selector={(estado) => estado.canSubmit}>
            {(puedeGuardar) => (
                <FormModal
                    titulo={`Stock de "${nombreProducto}"`}
                    error={error}
                    guardando={guardando}
                    puedeGuardar={puedeGuardar}
                    onSubmit={() => void form.handleSubmit()}
                    onCancelar={onCancelar}
                >
                    <form.Field name="stock">
                        {(field) => <CampoNumero field={field} label="Stock" decimales={false} />}
                    </form.Field>
                    <form.Field name="disponible">
                        {(field) => <CampoCheckbox field={field} label="Disponible para la venta" />}
                    </form.Field>
                </FormModal>
            )}
        </form.Subscribe>
    );
};

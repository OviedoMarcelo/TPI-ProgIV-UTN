import type { SubmitEvent } from "react";
import { AlertaError } from "@/shared/ui/AlertaError";
import { Button } from "@/shared/ui/Button";
import { CampoAreaTexto, CampoSelect, CampoTexto } from "@/shared/ui/Input";
import type { CheckoutForm as CheckoutFormInstancia } from "../hooks/useCheckoutForm";
import { TEXTO_FORMA_PAGO } from "../lib/textos";

interface CheckoutFormProps {
    form: CheckoutFormInstancia;
    error: string | null;
    enviando: boolean;
}

const OPCIONES_PAGO = Object.entries(TEXTO_FORMA_PAGO).map(([valor, texto]) => ({ valor, texto }));

// Datos de entrega y pago del pedido (RN-06)
export const CheckoutForm = ({ form, error, enviando }: CheckoutFormProps) => {
    const handleSubmit = (evento: SubmitEvent<HTMLFormElement>) => {
        evento.preventDefault();
        void form.handleSubmit();
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {error && <AlertaError mensaje={error} />}
            <form.Field name="direccion_entrega">
                {(field) => <CampoTexto field={field} label="Dirección de entrega" autoComplete="street-address" />}
            </form.Field>
            <form.Field name="forma_pago">
                {(field) => (
                    <CampoSelect
                        field={field}
                        label="Forma de pago"
                        opciones={OPCIONES_PAGO}
                        textoVacio="Elegí una opción"
                    />
                )}
            </form.Field>
            <form.Field name="notas">
                {(field) => <CampoAreaTexto field={field} label="Notas para el pedido (opcional)" />}
            </form.Field>
            <form.Subscribe selector={(estado) => estado.canSubmit}>
                {(puedeEnviar) => (
                    <Button type="submit" disabled={!puedeEnviar || enviando}>
                        {enviando ? "Enviando pedido..." : "Confirmar pedido"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    );
};

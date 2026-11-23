import { useForm } from "@tanstack/react-form";
import type { FormaPago } from "../types/pedido.types";

interface CheckoutValores {
    direccion_entrega: string;
    forma_pago: FormaPago | "";
    notas: string;
}

export interface DatosEntrega {
    direccion_entrega: string;
    forma_pago: FormaPago;
    notas: string | null;
}

const CHECKOUT_VACIO: CheckoutValores = { direccion_entrega: "", forma_pago: "", notas: "" };

// RN-06: las mismas reglas que PedidoCreate del backend
const validarCheckout = ({ value }: { value: CheckoutValores }) => {
    const errores: Partial<Record<keyof CheckoutValores, string>> = {};
    const direccion = value.direccion_entrega.trim();
    if (direccion.length < 5 || direccion.length > 200) {
        errores.direccion_entrega = "La dirección debe tener entre 5 y 200 caracteres";
    }
    if (value.forma_pago === "") {
        errores.forma_pago = "Elegí una forma de pago";
    }
    if (value.notas.length > 500) {
        errores.notas = "Las notas admiten hasta 500 caracteres";
    }
    return Object.keys(errores).length > 0 ? { fields: errores } : undefined;
};

export const useCheckoutForm = (onConfirmar: (datos: DatosEntrega) => void) =>
    useForm({
        defaultValues: CHECKOUT_VACIO,
        // onChange también corre al enviar: un form sin tocar igual muestra los errores
        validators: { onChange: validarCheckout },
        onSubmit: ({ value }) => {
            if (value.forma_pago === "") return; // ya lo frena el validador
            onConfirmar({
                direccion_entrega: value.direccion_entrega.trim(),
                forma_pago: value.forma_pago,
                notas: value.notas.trim() || null,
            });
        },
    });

export type CheckoutForm = ReturnType<typeof useCheckoutForm>;

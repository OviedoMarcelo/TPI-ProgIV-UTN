import { useForm } from "@tanstack/react-form";
import type { ProductoStockUpdate } from "../types/producto.types";

const STOCK_VACIO: ProductoStockUpdate = { stock: 0, disponible: true };

const validarStock = ({ value }: { value: ProductoStockUpdate }) => {
    if (!Number.isInteger(value.stock) || value.stock < 0) {
        return { fields: { stock: "El stock debe ser un entero mayor o igual a 0" } };
    }
    return undefined;
};

// Formulario del PATCH /productos/{id}/stock
export const useStockForm = (onGuardar: (data: ProductoStockUpdate) => void) =>
    useForm({
        defaultValues: STOCK_VACIO,
        validators: { onChange: validarStock },
        onSubmit: ({ value }) => onGuardar(value),
    });

export type StockForm = ReturnType<typeof useStockForm>;

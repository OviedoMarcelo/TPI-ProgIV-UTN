import { useForm } from "@tanstack/react-form";
import type { Categoria, CategoriaInput } from "../types/categoria.types";

// En el formulario la descripción es siempre texto ("" = sin descripción)
interface CategoriaValores {
    nombre: string;
    descripcion: string;
}

const CATEGORIA_VACIA: CategoriaValores = { nombre: "", descripcion: "" };

export const valoresCategoria = (categoria: Categoria | null): CategoriaValores =>
    categoria ? { nombre: categoria.nombre, descripcion: categoria.descripcion ?? "" } : CATEGORIA_VACIA;

// Las mismas reglas que CategoriaCreate del backend
const validarCategoria = ({ value }: { value: CategoriaValores }) => {
    const errores: Partial<Record<keyof CategoriaValores, string>> = {};
    const nombre = value.nombre.trim();
    if (nombre.length < 2 || nombre.length > 100) {
        errores.nombre = "El nombre debe tener entre 2 y 100 caracteres";
    }
    if (value.descripcion.length > 500) {
        errores.descripcion = "La descripción admite hasta 500 caracteres";
    }
    return Object.keys(errores).length > 0 ? { fields: errores } : undefined;
};

// La página crea la instancia (useForm) y el modal solo la dibuja
export const useCategoriaForm = (onGuardar: (data: CategoriaInput) => void) =>
    useForm({
        defaultValues: CATEGORIA_VACIA,
        validators: { onChange: validarCategoria },
        onSubmit: ({ value }) =>
            onGuardar({
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim() || null,
            }),
    });

export type CategoriaForm = ReturnType<typeof useCategoriaForm>;

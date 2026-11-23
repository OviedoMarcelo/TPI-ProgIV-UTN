import { useForm } from "@tanstack/react-form";
import type { Producto, ProductoInput } from "../types/producto.types";

// Valores del formulario: los textos opcionales son "" y la categoría es el
// string del <select> ("" = sin elegir)
interface ProductoValores {
    nombre: string;
    descripcion: string;
    precio_base: number;
    imagen_url: string;
    stock: number;
    disponible: boolean;
    categoria_id: string;
}

const PRODUCTO_VACIO: ProductoValores = {
    nombre: "",
    descripcion: "",
    precio_base: 0,
    imagen_url: "",
    stock: 0,
    disponible: true,
    categoria_id: "",
};

export const valoresProducto = (producto: Producto | null): ProductoValores =>
    producto
        ? {
              nombre: producto.nombre,
              descripcion: producto.descripcion ?? "",
              precio_base: producto.precio_base,
              imagen_url: producto.imagen_url ?? "",
              stock: producto.stock,
              disponible: producto.disponible,
              categoria_id: String(producto.categoria_id),
          }
        : PRODUCTO_VACIO;

// Las mismas reglas que ProductoCreate del backend
const validarProducto = ({ value }: { value: ProductoValores }) => {
    const errores: Partial<Record<keyof ProductoValores, string>> = {};
    const nombre = value.nombre.trim();
    if (!nombre || nombre.length > 150) {
        errores.nombre = "El nombre es obligatorio (hasta 150 caracteres)";
    }
    if (value.descripcion.length > 500) {
        errores.descripcion = "Hasta 500 caracteres";
    }
    if (Number.isNaN(value.precio_base) || value.precio_base < 0) {
        errores.precio_base = "El precio debe ser mayor o igual a 0";
    }
    if (!Number.isInteger(value.stock) || value.stock < 0) {
        errores.stock = "El stock debe ser un entero mayor o igual a 0";
    }
    const url = value.imagen_url.trim();
    if (url && !/^https?:\/\//.test(url)) {
        errores.imagen_url = "Debe empezar con http:// o https://";
    }
    if (!value.categoria_id) {
        errores.categoria_id = "Elegí una categoría";
    }
    return Object.keys(errores).length > 0 ? { fields: errores } : undefined;
};

export const useProductoForm = (onGuardar: (data: ProductoInput) => void) =>
    useForm({
        defaultValues: PRODUCTO_VACIO,
        validators: { onChange: validarProducto },
        onSubmit: ({ value }) =>
            onGuardar({
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim() || null,
                precio_base: value.precio_base,
                imagen_url: value.imagen_url.trim() || null,
                stock: value.stock,
                disponible: value.disponible,
                categoria_id: Number(value.categoria_id),
            }),
    });

export type ProductoForm = ReturnType<typeof useProductoForm>;

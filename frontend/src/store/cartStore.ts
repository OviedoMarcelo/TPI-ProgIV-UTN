import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
    producto_id: number;
    nombre: string;
    precio_unitario: number;
    cantidad: number;
    stock: number; // tope de cantidad al agregarlo (el backend vuelve a validar)
    imagen_url: string | null;
}

// Lo mínimo de un producto para agregarlo (así el store no depende de la feature)
export interface ProductoParaCarrito {
    id: number;
    nombre: string;
    precio_base: number;
    stock: number;
    imagen_url: string | null;
}

interface CartState {
    items: ItemCarrito[];
    agregar: (producto: ProductoParaCarrito, cantidad?: number) => void;
    quitar: (productoId: number) => void;
    cambiarCantidad: (productoId: number, cantidad: number) => void;
    vaciar: () => void;
    total: () => number;
}

const limitar = (cantidad: number, stock: number) => Math.max(1, Math.min(cantidad, stock));

// El carrito es estado del cliente: vive en el navegador y sobrevive al recargar
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            agregar: (producto, cantidad = 1) =>
                set((state) => {
                    const existente = state.items.find((i) => i.producto_id === producto.id);
                    // Un producto no se repite (RN-01): si ya está, se suma la cantidad
                    if (existente) {
                        return {
                            items: state.items.map((i) =>
                                i.producto_id === producto.id
                                    ? {
                                          ...i,
                                          stock: producto.stock,
                                          cantidad: limitar(i.cantidad + cantidad, producto.stock),
                                      }
                                    : i,
                            ),
                        };
                    }
                    return {
                        items: [
                            ...state.items,
                            {
                                producto_id: producto.id,
                                nombre: producto.nombre,
                                precio_unitario: producto.precio_base,
                                cantidad: limitar(cantidad, producto.stock),
                                stock: producto.stock,
                                imagen_url: producto.imagen_url,
                            },
                        ],
                    };
                }),

            quitar: (productoId) =>
                set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

            cambiarCantidad: (productoId, cantidad) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.producto_id === productoId ? { ...i, cantidad: limitar(cantidad, i.stock) } : i,
                    ),
                })),

            vaciar: () => set({ items: [] }),

            // Derivado: se calcula, no se guarda
            total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
        }),
        { name: "cart-storage" }, // localStorage: persiste al recargar
    ),
);

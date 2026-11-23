// API pública de la feature productos
export { CatalogoPage } from "./pages/CatalogoPage";
export { AdminProductosPage } from "./pages/AdminProductosPage";
export { ProductoCard } from "./components/ProductoCard";
export { useProductos } from "./hooks/useProductos";
export type {
    FiltrosProductos,
    Producto,
    ProductoInput,
    ProductosPaginados,
    ProductoStockUpdate,
} from "./types/producto.types";

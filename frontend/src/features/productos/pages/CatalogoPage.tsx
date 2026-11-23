import { useState } from "react";
import { useCategorias } from "@/features/categorias";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonTarjetas } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { FiltrosCatalogo } from "../components/FiltrosCatalogo";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const POR_PAGINA = 8;

export const CatalogoPage = () => {
    // Estado de interfaz: la página y los filtros elegidos
    const [pagina, setPagina] = useState(0);
    const [busqueda, setBusqueda] = useState("");
    const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

    // Paginación en el servidor: skip = página × limit
    const { data, isLoading, isError, isPlaceholderData, refetch } = useProductos({
        skip: pagina * POR_PAGINA,
        limit: POR_PAGINA,
        search: busqueda || undefined,
        categoria_id: categoriaId,
    });
    const { categorias } = useCategorias();

    // Cambiar un filtro vuelve a la primera página
    const buscar = (texto: string) => {
        setBusqueda(texto);
        setPagina(0);
    };
    const filtrarCategoria = (id: number | undefined) => {
        setCategoriaId(id);
        setPagina(0);
    };
    const limpiarFiltros = () => {
        buscar("");
        setCategoriaId(undefined);
    };

    const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0;
    const hayFiltros = busqueda !== "" || categoriaId !== undefined;

    const renderContenido = () => {
        if (isLoading) return <SkeletonTarjetas cantidad={POR_PAGINA} />;
        if (isError || !data) {
            return <EstadoError mensaje="No se pudo cargar el catálogo" onReintentar={() => void refetch()} />;
        }
        if (data.items.length === 0) {
            return (
                <EstadoVacio
                    mensaje={hayFiltros ? "Ningún producto coincide con la búsqueda." : "Todavía no hay productos."}
                    accion={
                        hayFiltros && (
                            <Button variant="secondary" onClick={limpiarFiltros}>
                                Ver todos los productos
                            </Button>
                        )
                    }
                />
            );
        }
        return (
            <div className="flex flex-col gap-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.total} {data.total === 1 ? "producto" : "productos"}
                </p>
                <div
                    // Mientras llega la página nueva, la anterior se ve atenuada
                    className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${isPlaceholderData ? "opacity-60" : ""}`}
                >
                    {data.items.map((producto) => (
                        <ProductoCard key={producto.id} producto={producto} />
                    ))}
                </div>
                <Paginacion
                    pagina={pagina}
                    totalPaginas={totalPaginas}
                    onCambiar={setPagina}
                    deshabilitada={isPlaceholderData}
                />
            </div>
        );
    };

    return (
        <section>
            <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Catálogo</h1>
            <FiltrosCatalogo
                // key: al limpiar los filtros desde afuera, el input se reinicia
                key={busqueda === "" ? "sin-busqueda" : "con-busqueda"}
                categorias={categorias}
                categoriaId={categoriaId}
                busqueda={busqueda}
                onBuscar={buscar}
                onCategoria={filtrarCategoria}
            />
            {renderContenido()}
        </section>
    );
};

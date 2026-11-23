import { EstadoError } from "@/shared/components/EstadoError";
import { formatearPrecio } from "@/shared/lib/formato";
import { Card } from "@/shared/ui/Card";
import { useResumenPedidos } from "../hooks/usePedidos";
import type { ResumenPedidos } from "../types/pedido.types";

interface Indicador {
    clave: keyof ResumenPedidos;
    titulo: string;
    color: string;
    esDinero?: boolean;
}

const INDICADORES: Indicador[] = [
    { clave: "pedidos_hoy", titulo: "Pedidos de hoy", color: "text-orange-600 dark:text-orange-400" },
    { clave: "pendientes", titulo: "Pendientes", color: "text-amber-600 dark:text-amber-400" },
    { clave: "en_preparacion", titulo: "En preparación", color: "text-sky-600 dark:text-sky-400" },
    { clave: "entregados", titulo: "Entregados", color: "text-emerald-600 dark:text-emerald-400" },
    { clave: "cancelados", titulo: "Cancelados", color: "text-red-600 dark:text-red-400" },
    {
        clave: "ingresos_entregados",
        titulo: "Ingresos (entregados)",
        color: "text-gray-900 dark:text-gray-100",
        esDinero: true,
    },
];

// Panel del administrador: GET /pedidos/resumen
export const AdminResumenPage = () => {
    const { data, isLoading, isError, refetch } = useResumenPedidos();

    const renderContenido = () => {
        if (isError) {
            return <EstadoError mensaje="No se pudo cargar el resumen" onReintentar={() => void refetch()} />;
        }
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {INDICADORES.map(({ clave, titulo, color, esDinero }) => (
                    <Card key={clave} className="p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{titulo}</p>
                        {isLoading || !data ? (
                            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        ) : (
                            <p className={`mt-1 text-3xl font-bold ${color}`}>
                                {esDinero ? formatearPrecio(data[clave]) : data[clave]}
                            </p>
                        )}
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Resumen</h1>
            {renderContenido()}
        </section>
    );
};

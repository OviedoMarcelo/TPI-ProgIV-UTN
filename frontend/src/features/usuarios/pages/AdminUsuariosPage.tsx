import {
    createColumnHelper,
    useTable,
    type PaginationState,
    type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { DataTable } from "@/shared/components/table/DataTable";
import {
    FILAS_POR_PAGINA,
    tablaFeatures,
    type TablaFeatures,
} from "@/shared/components/table/tablaFeatures";
import { formatearFecha } from "@/shared/lib/formato";
import type { UsuarioPublico } from "@/shared/types/usuario.types";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/Modal";
import { useAuthStore } from "@/store/authStore";
import { useUsuarios } from "../hooks/useUsuarios";

const columnHelper = createColumnHelper<TablaFeatures, UsuarioPublico>();
const columnas = columnHelper.columns([
    columnHelper.accessor("username", { header: "Usuario" }),
    columnHelper.accessor("full_name", { header: "Nombre" }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor((u) => (u.role === "admin" ? "Administrador" : "Cliente"), {
        id: "rol",
        header: "Rol",
    }),
    columnHelper.accessor((u) => (u.disabled ? "Desactivada" : "Activa"), {
        id: "estado",
        header: "Estado",
        cell: (info) => (
            <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    info.row.original.disabled
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                }`}
            >
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("created_at", {
        header: "Alta",
        cell: (info) => formatearFecha(info.getValue()),
    }),
]);

export const AdminUsuariosPage = () => {
    const [aDesactivar, setADesactivar] = useState<UsuarioPublico | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: FILAS_POR_PAGINA,
    });
    const [globalFilter, setGlobalFilter] = useState("");

    // El admin logueado no puede desactivarse a sí mismo (el backend también lo impide)
    const miId = useAuthStore((state) => state.usuario?.id);
    const { usuarios, isLoading, isError, refetch, activar, desactivar } = useUsuarios();

    const table = useTable({
        features: tablaFeatures,
        columns: columnas,
        data: usuarios,
        state: { sorting, pagination, globalFilter },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
    });

    const enCurso = (id: number) =>
        (activar.isPending && activar.variables?.id === id) ||
        (desactivar.isPending && desactivar.variables?.id === id);

    const confirmarDesactivacion = (usuario: UsuarioPublico) => {
        setADesactivar(null);
        desactivar.mutate(usuario);
    };

    const renderContenido = () => {
        if (isLoading) return <SkeletonTabla />;
        if (isError) {
            return <EstadoError mensaje="No se pudieron cargar los usuarios" onReintentar={() => void refetch()} />;
        }
        if (usuarios.length === 0) return <EstadoVacio mensaje="No hay usuarios registrados." />;
        return (
            <DataTable
                table={table}
                placeholderBusqueda="Buscar usuario..."
                acciones={(usuario) => {
                    if (usuario.id === miId) {
                        return <span className="text-xs text-gray-500 dark:text-gray-400">Tu cuenta</span>;
                    }
                    return usuario.disabled ? (
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => activar.mutate(usuario)}
                            disabled={enCurso(usuario.id)}
                        >
                            Activar
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setADesactivar(usuario)}
                            disabled={enCurso(usuario.id)}
                        >
                            Desactivar
                        </Button>
                    );
                }}
            />
        );
    };

    return (
        <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Usuarios</h1>
            {renderContenido()}
            {aDesactivar && (
                <ConfirmDialog
                    titulo="Desactivar cuenta"
                    mensaje={`¿Desactivar la cuenta de "${aDesactivar.username}"? No va a poder iniciar sesión hasta que la vuelvas a activar.`}
                    textoConfirmar="Desactivar"
                    onConfirmar={() => confirmarDesactivacion(aDesactivar)}
                    onCancelar={() => setADesactivar(null)}
                />
            )}
        </section>
    );
};

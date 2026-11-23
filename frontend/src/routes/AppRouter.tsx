import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { LoginPage, RegisterPage, UnauthorizedPage } from "@/features/auth";
import { AdminCategoriasPage } from "@/features/categorias";
import {
    AdminPedidosPage,
    AdminResumenPage,
    CarritoPage,
    CheckoutPage,
    MisPedidosPage,
} from "@/features/pedidos";
import { AdminProductosPage, CatalogoPage } from "@/features/productos";
import { AdminUsuariosPage } from "@/features/usuarios";
import { MainLayout } from "@/shared/layout/MainLayout";
import type { Rol } from "@/shared/types/usuario.types";
import { ProtectedRoute } from "./ProtectedRoute";

const SOLO_ADMIN: Rol[] = ["admin"];

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    {/* Públicas */}
                    <Route path="/" element={<CatalogoPage />} />
                    <Route path="/carrito" element={<CarritoPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Cualquier usuario con sesión */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/mis-pedidos" element={<MisPedidosPage />} />
                    </Route>

                    {/* Solo administradores */}
                    <Route path="/admin" element={<ProtectedRoute allowedRoles={SOLO_ADMIN} />}>
                        <Route index element={<Navigate to="resumen" replace />} />
                        <Route path="resumen" element={<AdminResumenPage />} />
                        <Route path="categorias" element={<AdminCategoriasPage />} />
                        <Route path="productos" element={<AdminProductosPage />} />
                        <Route path="pedidos" element={<AdminPedidosPage />} />
                        <Route path="usuarios" element={<AdminUsuariosPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

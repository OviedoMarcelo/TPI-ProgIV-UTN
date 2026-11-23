// Mismos nombres de campo que CategoriaRead y CategoriaCreate del backend
export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
}

export interface CategoriaInput {
    nombre: string;
    descripcion: string | null;
}

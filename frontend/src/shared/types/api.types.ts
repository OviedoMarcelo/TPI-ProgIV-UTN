// Un elemento de la lista que devuelve FastAPI en un 422
export interface ErrorValidacion {
    loc: (string | number)[];
    msg: string;
    type: string;
}

// Cuerpo de todos los errores del backend: HTTPException con detail
export interface RespuestaError {
    detail?: string | ErrorValidacion[];
}

// Listados paginados del backend: { total, items }
export interface Paginado<T> {
    total: number;
    items: T[];
}

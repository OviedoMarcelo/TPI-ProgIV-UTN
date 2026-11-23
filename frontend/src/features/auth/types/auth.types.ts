// Mismos nombres de campo que el backend (formulario OAuth2 y UserCreate)
export interface LoginInput {
    username: string;
    password: string;
}

export interface RegistroInput {
    username: string;
    full_name: string;
    email: string;
    password: string;
}

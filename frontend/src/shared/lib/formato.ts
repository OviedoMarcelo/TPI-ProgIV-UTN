const PESOS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const FECHA = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

export const formatearPrecio = (valor: number): string => PESOS.format(valor);

// El backend envía las fechas en ISO 8601 con zona horaria
export const formatearFecha = (iso: string): string => FECHA.format(new Date(iso));

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Chequeo de formato; la validación definitiva la hace EmailStr en el backend
export const esEmailValido = (email: string): boolean => FORMATO_EMAIL.test(email.trim());

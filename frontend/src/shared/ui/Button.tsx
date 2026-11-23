import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";
type ButtonSize = "sm" | "md";

// Hereda todos los atributos de <button> (onClick, disabled, aria-*, etc.)
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

// Record obliga a definir una clase para CADA variante
const VARIANTES: Record<ButtonVariant, string> = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-400",
    secondary:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
};

const TAMANIOS: Record<ButtonSize, string> = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
};

export const Button = ({
    variant = "primary",
    size = "md",
    type = "button", // por defecto NO envía formularios
    className = "",
    ...props
}: ButtonProps) => {
    return (
        <button
            type={type}
            className={`rounded font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${VARIANTES[variant]} ${TAMANIOS[size]} ${className}`}
            {...props}
        />
    );
};

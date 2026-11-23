import type { AnyFieldApi } from "@tanstack/react-form";

// Campos de formulario conectados con TanStack Form: reciben el `field` del
// render-prop de form.Field y lo enlazan con el input (valor, cambios, blur
// y errores).

const CLASE_INPUT =
    "mt-1 w-full rounded border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-orange-900";

const CLASE_LABEL = "block text-sm font-medium text-gray-700 dark:text-gray-300";

interface CampoProps {
    field: AnyFieldApi;
    label: string;
}

// Los errores son un ARRAY (puede haber varios validadores). Se muestran
// recién cuando el campo fue tocado, para no marcar en rojo un form vacío.
const mensajeError = (field: AnyFieldApi): string | null => {
    const { isTouched, errors } = field.state.meta;
    if (!isTouched || errors.length === 0) {
        return null;
    }
    return errors.filter(Boolean).map(String).join(". ");
};

const borde = (error: string | null) =>
    error
        ? "border-red-400 focus:border-red-500"
        : "border-gray-300 focus:border-orange-500 dark:border-gray-600";

const ErrorCampo = ({ id, error }: { id: string; error: string | null }) =>
    error ? (
        <p id={id} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
        </p>
    ) : null;

const atributosError = (field: AnyFieldApi, error: string | null) => ({
    "aria-invalid": error !== null,
    "aria-describedby": error ? `${field.name}-error` : undefined,
});

interface CampoTextoProps extends CampoProps {
    tipo?: "text" | "email" | "password" | "url";
    autoComplete?: string;
}

export const CampoTexto = ({ field, label, tipo = "text", autoComplete }: CampoTextoProps) => {
    const error = mensajeError(field);
    return (
        <div>
            <label htmlFor={field.name} className={CLASE_LABEL}>
                {label}
            </label>
            <input
                id={field.name}
                name={field.name}
                type={tipo}
                autoComplete={autoComplete}
                value={String(field.state.value ?? "")}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                {...atributosError(field, error)}
                className={`${CLASE_INPUT} ${borde(error)}`}
            />
            <ErrorCampo id={`${field.name}-error`} error={error} />
        </div>
    );
};

export const CampoAreaTexto = ({ field, label }: CampoProps) => {
    const error = mensajeError(field);
    return (
        <div>
            <label htmlFor={field.name} className={CLASE_LABEL}>
                {label}
            </label>
            <textarea
                id={field.name}
                name={field.name}
                rows={3}
                value={String(field.state.value ?? "")}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                {...atributosError(field, error)}
                className={`${CLASE_INPUT} ${borde(error)}`}
            />
            <ErrorCampo id={`${field.name}-error`} error={error} />
        </div>
    );
};

interface CampoNumeroProps extends CampoProps {
    decimales?: boolean; // false: solo enteros (stock)
}

export const CampoNumero = ({ field, label, decimales = true }: CampoNumeroProps) => {
    const error = mensajeError(field);
    const valor = Number(field.state.value);
    return (
        <div>
            <label htmlFor={field.name} className={CLASE_LABEL}>
                {label}
            </label>
            <input
                id={field.name}
                name={field.name}
                type="number"
                step={decimales ? "0.01" : "1"}
                min="0"
                // Input vacío = NaN: se muestra vacío y el validador lo rechaza
                value={Number.isNaN(valor) ? "" : valor}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                onBlur={field.handleBlur}
                {...atributosError(field, error)}
                className={`${CLASE_INPUT} ${borde(error)}`}
            />
            <ErrorCampo id={`${field.name}-error`} error={error} />
        </div>
    );
};

export const CampoCheckbox = ({ field, label }: CampoProps) => {
    return (
        <label
            htmlFor={field.name}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
        >
            <input
                id={field.name}
                name={field.name}
                type="checkbox"
                checked={Boolean(field.state.value)}
                onChange={(e) => field.handleChange(e.target.checked)}
                onBlur={field.handleBlur}
                className="h-4 w-4 rounded border-gray-300 accent-orange-600"
            />
            {label}
        </label>
    );
};

interface CampoSelectProps extends CampoProps {
    opciones: { valor: string; texto: string }[];
    textoVacio?: string; // opción inicial sin valor ("Elegí...")
}

// El valor del campo es siempre un string (el de la opción elegida)
export const CampoSelect = ({ field, label, opciones, textoVacio }: CampoSelectProps) => {
    const error = mensajeError(field);
    return (
        <div>
            <label htmlFor={field.name} className={CLASE_LABEL}>
                {label}
            </label>
            <select
                id={field.name}
                name={field.name}
                value={String(field.state.value ?? "")}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                {...atributosError(field, error)}
                className={`${CLASE_INPUT} ${borde(error)}`}
            >
                {textoVacio !== undefined && <option value="">{textoVacio}</option>}
                {opciones.map(({ valor, texto }) => (
                    <option key={valor} value={valor}>
                        {texto}
                    </option>
                ))}
            </select>
            <ErrorCampo id={`${field.name}-error`} error={error} />
        </div>
    );
};

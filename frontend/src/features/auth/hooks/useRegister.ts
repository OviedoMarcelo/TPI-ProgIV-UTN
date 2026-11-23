import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { registrar } from "../api/auth";

// Alta de cuenta: al terminar lleva al login con un aviso
export const useRegister = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: registrar,
        onSuccess: () => navigate("/login", { replace: true, state: { registrado: true } }),
    });
};

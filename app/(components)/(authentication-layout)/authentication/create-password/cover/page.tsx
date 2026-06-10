"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "react-bootstrap";

// El flujo real de creación/restablecimiento de contraseña vive en
// /authentication/reset-password/email-token (solicitud → código → nueva contraseña).
// Esta ruta del template se mantiene solo como redirección.
const CreatePasswordRedirect: React.FC = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace("/authentication/reset-password/email-token");
    }, [router]);

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Redirigiendo...</span>
            </Spinner>
        </div>
    );
};

export default CreatePasswordRedirect;

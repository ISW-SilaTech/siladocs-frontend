"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useState } from "react"; // 🔹 Importa useState
import { Card, Col, Form, Row, Alert, Spinner } from "react-bootstrap"; // 🔹 Importa Alert y Spinner
import { toast, ToastContainer } from "react-toastify";
import { useForm } from 'react-hook-form';
import { useRouter } from "next/navigation";
import axios from 'axios'; // 🔹 Importa axios

//Efectos
import { motion } from "framer-motion";

interface CoverProps { }

const Cover: React.FC<CoverProps> = () => {

    const {
        register,
        handleSubmit,
        formState: { errors },
    }: any = useForm();

    // 🔹 Estados para manejar la carga y los mensajes
    const [isLoading, setIsLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState<string | null>(null); // Mensaje de éxito/error
    const [apiError, setApiError] = useState(false); // Para colorear el mensaje

    const router = useRouter();

    // 🔹 onSubmit actualizado para llamar al backend
    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setApiMessage(null);
        setApiError(false);

        try {
            // 🔹 Llama al endpoint de "olvidé contraseña"
            const response = await axios.post('http://localhost:8080/auth/forgot-password', {
                email: data.email // 'email' viene de react-hook-form
            });

            // Éxito: Muestra el mensaje del backend (siempre es exitoso por seguridad)
            setApiMessage(response.data.message || "Si el email está registrado, se ha enviado un enlace.");
            toast.success(response.data.message || "Solicitud enviada.", { autoClose: 3000 });

        } catch (error: any) {
            // Aunque el backend siempre responde OK, manejamos errores de red
            console.error("Error solicitando reseteo:", error);
            setApiError(true);
            setApiMessage("Error al conectar con el servidor. Intenta de nuevo.");
            toast.error("Error de red.", { autoClose: 2500 });
        } finally {
            setIsLoading(false); // Detiene la carga
        }
    };

    return (
        <Fragment>
            <motion.div
                initial={{ filter: "blur(5px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
            >
                <Seo title="Olvidé Contraseña - Cover" /> {/* 🔹 Título actualizado */}

                <Row className="authentication authentication-cover-main mx-0 min-vh-100 d-flex align-items-center justify-content-center">
                    <Row className="justify-content-center align-items-center h-100">
                        <Col xxl={4} xl={5} lg={6} md={6} sm={8} className="col-12">
                            <Card className="custom-card border-0 shadow-none my-4">
                                <Card.Body className="p-5">
                                    <div>
                                        <h4 className="mb-1 fw-semibold">¿Olvidaste tu contraseña?</h4>
                                        <p className="mb-4 text-muted">
                                            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                                        </p>
                                    </div>

                                    {/* 🔹 Alerta para mostrar mensajes de éxito o error */}
                                    {apiMessage && (
                                        <Alert variant={apiError ? 'danger' : 'success'}>
                                            {apiMessage}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit(onSubmit)}>
                                        <Row className="row gy-3">
                                            <Col xl={12}>
                                                <label htmlFor="forgot-email" className="form-label text-default">Email</label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type="email"
                                                        id="forgot-email"
                                                        placeholder="Ingresa tu email"
                                                        className="form-control form-control"
                                                        {...register('email', { // 🔹 Registra 'email'
                                                            required: 'Se requiere un email',
                                                            pattern: {
                                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                message: "Dirección de email inválida"
                                                            }
                                                        })}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                {errors.email && <p className="text-danger text-sm">{errors.email.message}</p>}
                                            </Col>
                                        </Row>
                                        <div className="d-grid mt-3">
                                            <SpkButton Buttontype="submit" Customclass="btn btn-primary" Disabled={isLoading}>
                                                {isLoading ? (
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                ) : (
                                                    'Enviar enlace'
                                                )}
                                            </SpkButton>
                                        </div>
                                    </Form>

                                    {/* ... (Sección "O" eliminada, no aplica aquí) ... */}

                                    <div className="text-center mt-3 fw-medium">
                                        ¿Recordaste tu contraseña? <Link scroll={false} href="/authentication/sign-in/cover/" className="text-primary animated-underline">Iniciar Sesión</Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Row>
                <ToastContainer />
            </motion.div>


        </Fragment>
    )
};

export default Cover;

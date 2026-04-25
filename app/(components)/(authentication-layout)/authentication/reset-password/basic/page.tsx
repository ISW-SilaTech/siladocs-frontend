"use client"

// 🔹 Importa axios, hooks de React y Next, y componentes de Bootstrap
import React, { Fragment, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 🔹 Importa useSearchParams
import { Card, Col, Form, Row, Alert, Spinner } from "react-bootstrap"; // 🔹 Importa Alert y Spinner
import axios from 'axios'; // 🔹 Importa axios
import { toast, ToastContainer } from "react-toastify";
import { useForm } from 'react-hook-form';
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";

interface BasicProps { }

const Basic: React.FC<BasicProps> = () => {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    }: any = useForm();

    // 🔹 Estado de visibilidad (eliminamos 'current')
    const [passwordVisibility, setPasswordVisibility] = useState({
        new: false,
        confirm: false,
    });

    // 🔹 Nuevos estados para manejar el token, la carga y los errores
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams(); // Hook para leer la URL

    // 🔹 Efecto para obtener el token de la URL cuando el componente carga
    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            // Si no hay token, muestra un error
            setApiError("Token de restablecimiento no válido o no encontrado. Por favor, solicita un nuevo enlace.");
            toast.error("Token no válido o faltante.", { autoClose: 3000 });
        }
    }, [searchParams]); // Se ejecuta cuando searchParams cambia

    // 🔹 Función de visibilidad actualizada (solo 'new' y 'confirm')
    const togglePasswordVisibility = (field: 'new' | 'confirm') => {
        setPasswordVisibility((prev: any) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    // 🔹 onSubmit actualizado para llamar al backend
    const onSubmit = async (data: any) => {
        if (!token) {
            setApiError("No se puede restablecer la contraseña sin un token válido.");
            toast.error("Token no válido o faltante.", { autoClose: 2000 });
            return;
        }

        setIsLoading(true);
        setApiError(null);

        try {
            // 🔹 Llama al endpoint del backend
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api';
            const response = await axios.post(`${apiUrl}/auth/reset-password`, {
                token: token,
                newPassword: data.newPassword
            });

            // Éxito
            toast.success(response.data.message || 'Contraseña restablecida exitosamente', {
                autoClose: 1500,
            });

            // Redirige al login después de 2 segundos
            setTimeout(() => {
                router.push('/authentication/sign-in/cover'); // ⬅️ Redirige a Iniciar Sesión
            }, 2000);

        } catch (error: any) {
            // Manejo de error
            let errorMessage = "Ocurrió un error.";
            if (axios.isAxiosError(error) && error.response) {
                // Usa el mensaje de error del backend (ej: "Token inválido", "El token ha expirado")
                errorMessage = error.response.data.error || "Error al restablecer la contraseña.";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setApiError(errorMessage);
            toast.error(errorMessage, { autoClose: 2500 });
            setIsLoading(false); // Detiene la carga solo si hay error
        }
    };

    const newPassword = watch('newPassword');

    return (

        <Fragment>
            <Seo title="Restablecer contraseña - Básico" />
            <div className="authentication-basic-background">
                <Image fill src="../../../assets/images/media/backgrounds/9.png" alt="" />
            </div>

            <div className="container">
                <Row className="justify-content-center align-items-center authentication authentication-basic h-100">
                    <Col xxl={4} xl={5} lg={6} md={6} sm={8} className="col-12">
                        <Card className="custom-card border-0 my-4">
                            <Card.Body className="card-body p-5">
                                <div className="mb-4">
                                    <Link scroll={false} href="/dashboards/sales">
                                        <Image fill src="../../../assets/images/brand-logos/toggle-logo.png" alt="logo" className="desktop-dark" />
                                    </Link>
                                </div>
                                <div>
                                    <h4 className="mb-1 fw-semibold">Restablecer contraseña</h4>
                                    <p className="mb-4 text-muted fw-normal">Establece aquí tu nueva contraseña.</p>
                                </div>
                                
                                {/* 🔹 Muestra el error de la API aquí */}
                                {apiError && <Alert variant="danger">{apiError}</Alert>}

                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <Row className="row gy-3">

                                        {/* 🔹 CAMPO "CONTRASEÑA ACTUAL" ELIMINADO */}

                                        <Col xl={12}>
                                            <label htmlFor="reset-newpassword" className="form-label text-default">Nueva contraseña</label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type={passwordVisibility.new ? 'text' : 'password'}
                                                    id="newPassword"
                                                    placeholder="Nueva contraseña"
                                                    className="form-control form-control-lg"
                                                    {...register('newPassword', {
                                                        required: 'Se requiere nueva contraseña',
                                                        minLength: {
                                                            value: 6,
                                                            message: 'La contraseña debe tener al menos 6 caracteres',
                                                        },
                                                    })}
                                                    disabled={isLoading || !token} // 🔹 Deshabilita si está cargando o no hay token
                                                />
                                                <Link scroll={false} href="#!" onClick={() => togglePasswordVisibility('new')} className="show-password-button text-muted" id="button-addon21"><i className={`${passwordVisibility.new ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`} /></Link>
                                            </div>
                                            {errors.newPassword && <p className="text-danger text-sm">{errors.newPassword.message}</p>}
                                        </Col>
                                        <Col xl={12}>
                                            <label htmlFor="reset-confirmpassword" className="form-label text-default">Confirmar Contraseña</label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type={passwordVisibility.confirm ? 'text' : 'password'}
                                                    id="confirmPassword"
                                                    placeholder="Confirmar Contraseña"
                                                    className="form-control form-control-lg"
                                                    {...register('confirmPassword', {
                                                        required: 'Por favor confirma tu contraseña',
                                                        validate: (value: any) =>
                                                            value === newPassword || 'Las contraseñas no coinciden',
                                                    })}
                                                    disabled={isLoading || !token} // 🔹 Deshabilita si está cargando o no hay token
                                                />
                                                <Link scroll={false} href="#!" onClick={() => togglePasswordVisibility('confirm')} className="show-password-button text-muted" id="button-addon22"><i className={`${passwordVisibility.confirm ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`} /></Link>
                                            </div>
                                            {errors.confirmPassword && <p className="text-danger text-sm">{errors.confirmPassword.message}</p>}
                                        </Col>
                                    </Row>
                                    <div className="d-grid mt-3">
                                        <SpkButton Buttontype="submit" Customclass="btn btn-primary" Disabled={isLoading || !token}>
                                            {isLoading ? (
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                            ) : (
                                                'Restablecer contraseña'
                                            )}
                                        </SpkButton>
                                    </div>
                                </Form>
                                
                                {/* ... (El resto de tu JSX: "O", botones de Google/Outlook) ... */}
                                
                                <div className="text-center mt-3 fw-medium">
                                    ¿No quieres reiniciar? <Link scroll={false} href="/authentication/sign-in/cover/" className="text-primary">Iniciar sesión</Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
            <ToastContainer />
        </Fragment>
    )
};

export default Basic;

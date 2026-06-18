"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Col, Form, Row, Button, InputGroup } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import { AuthService } from "@/shared/services/auth.service";
import { useAuth } from "@/shared/contextapi";
import { useRecaptcha } from "@/shared/hooks/useRecaptcha";

const Cover: React.FC = () => {
    const { register } = useAuth();
    const { getToken } = useRecaptcha();
    const searchParams = useSearchParams();

    const [values, setValues] = useState({
        token: '',
        name: '',
        email: '',
        password: '',
        institutionName: '',
        showPassword: false,
    });
    const [tokenValidated, setTokenValidated] = useState(false);

    useEffect(() => {
        const codeParam = searchParams.get('code');
        if (codeParam) {
            setValues((prev) => ({ ...prev, token: codeParam }));
        }
    }, [searchParams]);
    const [isValidating, setIsValidating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
    const [acceptTerms, setAcceptTerms] = useState(false);

    const validate = () => {
        const newErrors: { email?: string; password?: string; name?: string } = {};
        if (!values.email) {
            newErrors.email = "Correo requerido.";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            newErrors.email = "Formato inválido.";
        }
        if (!values.password) {
            newErrors.password = "Contraseña requerida.";
        } else if (values.password.length < 6) {
            newErrors.password = "Debe incluir al menos 6 caracteres.";
        }
        if (!values.name) {
            newErrors.name = "El nombre es requerido.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleValidateToken = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (tokenValidated || !values.token) {
            if (!values.token) toast.warn('Ingresa un código antes de validar');
            return;
        }
        setIsValidating(true);
        try {
            const data = await AuthService.validateCode(values.token);
            setValues((prev) => ({ ...prev, institutionName: data.institutionName }));
            setTokenValidated(true);
            toast.success('¡Código válido!');
        } catch (err: any) {
            setTokenValidated(false);
            const statusCode = err?.response?.status;
            const backendMsg: string = err?.response?.data?.message || '';
            const lower = backendMsg.toLowerCase();

            // Nunca mostramos err.message (texto técnico de axios) al usuario.
            let msg = 'No se pudo validar el código. Inténtalo nuevamente.';

            if (statusCode === 400 || statusCode === 404 || statusCode === 410) {
                // Si el backend indica el motivo específico, lo aprovechamos.
                if (lower.includes('utilizado') || lower.includes('used') || lower.includes('already')) {
                    msg = 'Este código de acceso ya fue utilizado. Solicita uno nuevo a tu institución.';
                } else if (lower.includes('expirado') || lower.includes('expired')) {
                    msg = 'El código de acceso ha expirado. Solicita uno nuevo a tu institución.';
                } else if (lower.includes('inválido') || lower.includes('invalid') ||
                           lower.includes('not found') || lower.includes('no existe')) {
                    msg = 'El código de acceso no es válido. Verifica que esté escrito correctamente.';
                } else {
                    // El backend no especifica el motivo: informamos las causas
                    // posibles junto con la acción a tomar.
                    msg = 'El código de acceso no es válido, ya fue utilizado o ha expirado. Verifícalo o solicita uno nuevo a tu institución.';
                }
            } else if (typeof statusCode === 'number' && statusCode >= 500) {
                msg = 'El servidor no está disponible en este momento. Inténtalo más tarde.';
            } else if (statusCode === undefined) {
                msg = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            }

            toast.error(msg);
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!acceptTerms) {
            toast.warn("Debes aceptar los términos y condiciones para continuar.");
            return;
        }

        setIsSubmitting(true);
        try {
            const recaptchaToken = await getToken('sign_up');
            if (!recaptchaToken) {
                toast.warn("No se pudo verificar reCAPTCHA. Intenta nuevamente.");
                return;
            }

            await register({
                accessCode: values.token,
                fullName: values.name,
                email: values.email,
                password: values.password,
            });

            toast.success("Cuenta creada correctamente", { position: "top-right", autoClose: 1500 });
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Error en el registro';
            toast.error(msg);
            setTokenValidated(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Fragment>
            <motion.div
                initial={{ filter: "blur(5px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
            >
                <style>{`
                .form-control:disabled, .form-select:disabled {
                    background-color: #e9ecef !important;
                    color: #6c757d !important;
                    opacity: 1 !important;
                }
                .btn.opacity-50 { opacity: 0.5 !important; pointer-events: none; }
                `}</style>
                <Seo title="Crear Cuenta" />
                <Row className="authentication authentication-cover-main mx-0">
                    <Col xxl={9} xl={9}>
                        <Row className="justify-content-center align-items-center h-100">
                            <Col xxl={4} xl={5} lg={6} md={6} sm={8} className="col-12">
                                <Card className="custom-card border-0 shadow-none my-4">
                                    <Card.Body className="p-5">
                                        <div>
                                            <h4 className="mb-1 fw-semibold">Asocia una cuenta educativa</h4>
                                            <p className="mb-4 text-muted fw-normal">Por favor ingresar credenciales válidas</p>
                                        </div>
                                        <Form onSubmit={handleSubmit}>
                                            <Row className="gy-3">
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="user-token" className="text-default">Código de acceso</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type="text"
                                                            id="user-token"
                                                            placeholder="Ingresa el código de acceso"
                                                            value={values.token}
                                                            onChange={(e) => setValues({ ...values, token: e.target.value })}
                                                            disabled={tokenValidated}
                                                        />
                                                        <Button
                                                            variant={tokenValidated ? 'success' : 'primary'}
                                                            onClick={handleValidateToken}
                                                            disabled={isValidating || tokenValidated}
                                                        >
                                                            {isValidating ? 'Validando...' : tokenValidated ? 'Válido ✓' : 'Validar'}
                                                        </Button>
                                                    </InputGroup>
                                                </Col>
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="signup-institution" className="text-default">Institución asignada</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="signup-institution"
                                                        placeholder="Se asignará al validar el código"
                                                        value={values.institutionName}
                                                        disabled
                                                        className="bg-light"
                                                    />
                                                </Col>
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="signup-email" className="text-default">Correo del Administrador</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        id="signup-email"
                                                        placeholder="Ingresa el correo electrónico"
                                                        value={values.email}
                                                        onChange={(e) => setValues({ ...values, email: e.target.value })}
                                                        isInvalid={!!errors.email}
                                                        disabled={!tokenValidated}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                                </Col>
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="signup-name" className="text-default">Nombre del Administrador</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="signup-name"
                                                        placeholder="Ingresa el nombre completo"
                                                        value={values.name}
                                                        onChange={(e) => setValues({ ...values, name: e.target.value })}
                                                        isInvalid={!!errors.name}
                                                        disabled={!tokenValidated}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                                </Col>
                                                <Col xl={12} className="mb-2">
                                                    <Form.Label htmlFor="signup-password" className="text-default d-block">Contraseña</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type={values.showPassword ? "text" : "password"}
                                                            id="signup-password"
                                                            placeholder="Contraseña"
                                                            value={values.password}
                                                            onChange={(e) => setValues({ ...values, password: e.target.value })}
                                                            isInvalid={!!errors.password}
                                                            disabled={!tokenValidated}
                                                        />
                                                        <button type="button" className="show-password-button text-muted"
                                                            style={{ border: 'none', background: 'none', padding: 0 }}
                                                            aria-label={values.showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                            title={values.showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                            onClick={() => setValues((prev) => ({ ...prev, showPassword: !prev.showPassword }))}>
                                                            {values.showPassword
                                                                ? <i className="ri-eye-line align-middle"></i>
                                                                : <i className="ri-eye-off-line align-middle"></i>}
                                                        </button>
                                                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                                                    </div>
                                                </Col>
                                                <div className="mt-2">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="termsCheck"
                                                            checked={acceptTerms}
                                                            onChange={(e) => setAcceptTerms(e.target.checked)}
                                                            disabled={!tokenValidated}
                                                        />
                                                        <label className="form-check-label" htmlFor="termsCheck">
                                                            Acepto los{" "}
                                                            <Link href="/terminos-condiciones" target="_blank" style={{ color: "#4767ed" }}>
                                                                términos y condiciones
                                                            </Link>
                                                        </label>
                                                    </div>
                                                </div>
                                            </Row>
                                            <div className="d-grid mt-3">
                                                <SpkButton
                                                    Buttontype="submit"
                                                    Customclass="btn btn-primary"
                                                    Disabled={!tokenValidated || isSubmitting}
                                                >
                                                    {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                                                </SpkButton>
                                            </div>
                                        </Form>
                                        <div className="text-center mt-3 fw-medium">
                                            ¿Ya tienes una cuenta?{" "}
                                            <Link scroll={false} href="/authentication/sign-in/cover/" className="text-primary animated-underline">
                                                Ingresar
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                    <Col xxl={3} xl={3} lg={12} className="d-xl-block d-none px-0">
                        <div className="authentication-cover overflow-hidden">
                            <div className="authentication-cover-logo">
                                <Link scroll={false} href="/landing">
                                    <Image fill src="../../../assets/images/brand-logos/toggle-logo.png" alt="logo" className="desktop-dark" />
                                </Link>
                            </div>
                            <div className="authentication-cover-background">
                                <Image fill src="../../../assets/images/media/backgrounds/9.png" alt="" />
                            </div>
                            <div className="authentication-cover-content">
                                <div className="p-5">
                                    <h3 className="fw-semibold lh-base">
                                        Bienvenido a <span style={{ color: "#5976ef" }}>Siladocs</span>
                                    </h3>
                                    <p className="mb-0 text-muted fw-medium">
                                        Administra los sílabos de tu institución de forma segura y trazable con tecnología blockchain.
                                    </p>
                                </div>
                                <div>
                                    <Image fill src="../../../assets/images/media/media-72.png" alt="" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <ToastContainer />
            </motion.div>
        </Fragment>
    );
};

export default Cover;

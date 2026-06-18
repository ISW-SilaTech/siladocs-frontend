"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import Seo from "@/shared/layouts-components/seo/seo";
import Link from "next/link";
import React, { Fragment, useState } from "react";
import { Card, Col, Form, Row, Alert, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthService } from "@/shared/services/auth.service";
import { extractErrorMessage } from "@/shared/utils/errors";

type Step = "email" | "code" | "password";

const Cover: React.FC = () => {
    const router = useRouter();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const [apiError, setApiError] = useState(false);
    const [fieldError, setFieldError] = useState<string | null>(null);

    const isValidEmail = (value: string) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldError(null);
        if (!email) { setFieldError("Se requiere un email"); return; }
        if (!isValidEmail(email)) { setFieldError("Dirección de email inválida"); return; }

        setIsLoading(true);
        setApiMessage(null);
        setApiError(false);
        try {
            const data = await AuthService.forgotPasswordRequest(email);
            setApiMessage(data.message || "Si el email está registrado, se ha enviado un código de verificación.");
            toast.success("Código enviado. Revisa tu correo.", { autoClose: 3000 });
            setStep("code");
        } catch (error: any) {
            setApiError(true);
            setApiMessage(error?.response?.data?.error || error?.response?.data?.message || "Error al conectar con el servidor. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldError(null);
        if (!code.trim()) { setFieldError("Ingresa el código de verificación"); return; }

        setIsLoading(true);
        setApiMessage(null);
        setApiError(false);
        try {
            await AuthService.forgotPasswordVerify(email, code.trim());
            toast.success("Código verificado correctamente.", { autoClose: 2000 });
            setStep("password");
        } catch (error: any) {
            setApiError(true);
            setApiMessage(error?.response?.data?.error || error?.response?.data?.message || "Código inválido o expirado. Verifica e intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldError(null);
        if (!newPassword || newPassword.length < 6) { setFieldError("Debe incluir al menos 6 caracteres."); return; }
        if (newPassword !== confirmPassword) { setFieldError("Las contraseñas no coinciden."); return; }

        setIsLoading(true);
        setApiMessage(null);
        setApiError(false);
        try {
            await AuthService.forgotPasswordReset(email, code.trim(), newPassword);
            toast.success("Contraseña restablecida correctamente. Ya puedes iniciar sesión.", { autoClose: 2500 });
            setTimeout(() => router.push("/authentication/sign-in/cover"), 1800);
        } catch (error: any) {
            setApiError(true);
            setApiMessage(error?.response?.data?.error || error?.response?.data?.message || "No se pudo restablecer la contraseña. Intenta de nuevo.");
            setIsLoading(false);
        }
    };

    const stepTitles: Record<Step, { title: string; subtitle: string }> = {
        email: { title: "¿Olvidaste tu contraseña?", subtitle: "Ingresa tu email y te enviaremos un código de verificación." },
        code: { title: "Verifica tu código", subtitle: `Hemos enviado un código de verificación a ${email}.` },
        password: { title: "Nueva contraseña", subtitle: "Define tu nueva contraseña para completar el proceso." },
    };

    return (
        <Fragment>
            <motion.div
                initial={{ filter: "blur(5px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
            >
                <Seo title="Recuperar Contraseña" />

                <Row className="authentication authentication-cover-main mx-0 min-vh-100 d-flex align-items-center justify-content-center">
                    <Row className="justify-content-center align-items-center h-100">
                        <Col xxl={4} xl={5} lg={6} md={6} sm={8} className="col-12">
                            <Card className="custom-card border-0 shadow-none my-4">
                                <Card.Body className="p-5">
                                    <div>
                                        <h4 className="mb-1 fw-semibold">{stepTitles[step].title}</h4>
                                        <p className="mb-4 text-muted">{stepTitles[step].subtitle}</p>
                                    </div>

                                    {apiMessage && (
                                        <Alert variant={apiError ? "danger" : "success"}>
                                            {apiMessage}
                                        </Alert>
                                    )}

                                    {step === "email" && (
                                        <Form onSubmit={handleRequestCode}>
                                            <Row className="gy-3">
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="forgot-email" className="text-default">Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        id="forgot-email"
                                                        placeholder="Ingresa tu email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                    {fieldError && <p className="text-danger text-sm mt-1">{fieldError}</p>}
                                                </Col>
                                            </Row>
                                            <div className="d-grid mt-3">
                                                <SpkButton Buttontype="submit" Customclass="btn btn-primary" Disabled={isLoading}>
                                                    {isLoading ? <Spinner as="span" animation="border" size="sm" className="me-2" /> : null}
                                                    {isLoading ? "Enviando..." : "Enviar código"}
                                                </SpkButton>
                                            </div>
                                        </Form>
                                    )}

                                    {step === "code" && (
                                        <Form onSubmit={handleVerifyCode}>
                                            <Row className="gy-3">
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="forgot-code" className="text-default">Código de verificación</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="forgot-code"
                                                        placeholder="Ingresa el código recibido"
                                                        value={code}
                                                        onChange={(e) => setCode(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                    {fieldError && <p className="text-danger text-sm mt-1">{fieldError}</p>}
                                                </Col>
                                            </Row>
                                            <div className="d-grid mt-3">
                                                <SpkButton Buttontype="submit" Customclass="btn btn-primary" Disabled={isLoading}>
                                                    {isLoading ? <Spinner as="span" animation="border" size="sm" className="me-2" /> : null}
                                                    {isLoading ? "Verificando..." : "Verificar código"}
                                                </SpkButton>
                                            </div>
                                            <div className="text-center mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 fs-13"
                                                    onClick={() => { setStep("email"); setApiMessage(null); setFieldError(null); }}
                                                >
                                                    Volver a ingresar el email
                                                </button>
                                            </div>
                                        </Form>
                                    )}

                                    {step === "password" && (
                                        <Form onSubmit={handleResetPassword}>
                                            <Row className="gy-3">
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="new-password" className="text-default">Nueva contraseña</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type={showPassword ? "text" : "password"}
                                                            id="new-password"
                                                            placeholder="Nueva contraseña"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            disabled={isLoading}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="show-password-button text-muted border-0 bg-transparent"
                                                            onClick={() => setShowPassword((v) => !v)}
                                                        >
                                                            <i className={`align-middle ${showPassword ? "ri-eye-line" : "ri-eye-off-line"}`}></i>
                                                        </button>
                                                    </div>
                                                </Col>
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="confirm-password" className="text-default">Confirmar contraseña</Form.Label>
                                                    <Form.Control
                                                        type={showPassword ? "text" : "password"}
                                                        id="confirm-password"
                                                        placeholder="Confirma la nueva contraseña"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                    {fieldError && <p className="text-danger text-sm mt-1">{fieldError}</p>}
                                                </Col>
                                            </Row>
                                            <div className="d-grid mt-3">
                                                <SpkButton Buttontype="submit" Customclass="btn btn-primary" Disabled={isLoading}>
                                                    {isLoading ? <Spinner as="span" animation="border" size="sm" className="me-2" /> : null}
                                                    {isLoading ? "Guardando..." : "Restablecer contraseña"}
                                                </SpkButton>
                                            </div>
                                        </Form>
                                    )}

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
    );
};

export default Cover;

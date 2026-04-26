"use client";

import React, { useState } from "react";
import { Modal, Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import Link from "next/link";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { AuthService } from "@/shared/services/auth.service";
import { useAuth } from "@/shared/contextapi";

interface RegisterModalProps {
    show: boolean;
    onHide: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ show, onHide }) => {
    const { register } = useAuth();

    const [values, setValues] = useState({
        token: "",
        name: "",
        email: "",
        password: "",
        institutionName: "",
        showPassword: false,
        acceptTerms: true,
    });
    const [tokenValidated, setTokenValidated] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

    const resetState = () => {
        setValues({
            token: "",
            name: "",
            email: "",
            password: "",
            institutionName: "",
            showPassword: false,
            acceptTerms: true,
        });
        setTokenValidated(false);
        setIsValidating(false);
        setIsSubmitting(false);
        setErrors({});
    };

    const handleClose = () => {
        if (isSubmitting || isValidating) return;
        resetState();
        onHide();
    };

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
            if (!values.token) toast.warn("Ingresa un código antes de validar");
            return;
        }
        setIsValidating(true);
        try {
            const data = await AuthService.validateCode(values.token);
            setValues((prev) => ({ ...prev, institutionName: data.institutionName }));
            setTokenValidated(true);
            toast.success("¡Código válido!");
        } catch (err: any) {
            setTokenValidated(false);
            const msg = err?.response?.data?.message || err?.message || "Código inválido, expirado o ya utilizado.";
            toast.error(msg);
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!values.acceptTerms) {
            toast.warn("Debes aceptar los términos y condiciones");
            return;
        }

        setIsSubmitting(true);
        try {
            await register({
                accessCode: values.token,
                fullName: values.name,
                email: values.email,
                password: values.password,
            });

            toast.success("Cuenta creada correctamente", { position: "top-right", autoClose: 1500 });
            resetState();
            onHide();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Error en el registro";
            toast.error(msg);
            setTokenValidated(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            centered
            backdrop={isSubmitting || isValidating ? "static" : true}
            keyboard={!isSubmitting && !isValidating}
        >
            <Modal.Header closeButton={!isSubmitting && !isValidating}>
                <Modal.Title>
                    <span className="fw-semibold">Crea tu cuenta de administrador</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    <style>{`
                        .form-control:disabled, .form-select:disabled {
                            background-color: #e9ecef !important;
                            color: #6c757d !important;
                            opacity: 1 !important;
                        }
                        .btn.opacity-50 { opacity: 0.5 !important; pointer-events: none; }
                    `}</style>
                    <p className="text-muted mb-4">
                        Ingresa tu código de acceso institucional para registrarte de forma segura.
                    </p>
                    <Form onSubmit={handleSubmit}>
                        <Row className="gy-3">
                            <Col xl={12}>
                                <Form.Label htmlFor="modal-user-token" className="text-default">Código de acceso</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        id="modal-user-token"
                                        placeholder="Ingresa el código de acceso"
                                        value={values.token}
                                        onChange={(e) => setValues({ ...values, token: e.target.value })}
                                        disabled={tokenValidated || isValidating}
                                    />
                                    <Button
                                        variant={tokenValidated ? "success" : "primary"}
                                        onClick={handleValidateToken}
                                        disabled={isValidating || tokenValidated}
                                    >
                                        {isValidating ? "Validando..." : tokenValidated ? "Válido ✓" : "Validar"}
                                    </Button>
                                </InputGroup>
                            </Col>
                            <Col xl={12}>
                                <Form.Label htmlFor="modal-signup-institution" className="text-default">Institución asignada</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="modal-signup-institution"
                                    placeholder="Se asignará al validar el código"
                                    value={values.institutionName}
                                    disabled
                                    className="bg-light"
                                />
                            </Col>
                            <Col xl={6}>
                                <Form.Label htmlFor="modal-signup-email" className="text-default">Correo del Administrador</Form.Label>
                                <Form.Control
                                    type="email"
                                    id="modal-signup-email"
                                    placeholder="correo@institucion.edu"
                                    value={values.email}
                                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                                    isInvalid={!!errors.email}
                                    disabled={!tokenValidated}
                                />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Col>
                            <Col xl={6}>
                                <Form.Label htmlFor="modal-signup-name" className="text-default">Nombre del Administrador</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="modal-signup-name"
                                    placeholder="Nombre completo"
                                    value={values.name}
                                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                                    isInvalid={!!errors.name}
                                    disabled={!tokenValidated}
                                />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Col>
                            <Col xl={12} className="mb-2">
                                <Form.Label htmlFor="modal-signup-password" className="text-default d-block">Contraseña</Form.Label>
                                <div className="position-relative">
                                    <Form.Control
                                        type={values.showPassword ? "text" : "password"}
                                        id="modal-signup-password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={values.password}
                                        onChange={(e) => setValues({ ...values, password: e.target.value })}
                                        isInvalid={!!errors.password}
                                        disabled={!tokenValidated}
                                    />
                                    <Link
                                        scroll={false}
                                        href="#!"
                                        className="show-password-button text-muted"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setValues((prev) => ({ ...prev, showPassword: !prev.showPassword }));
                                        }}
                                    >
                                        {values.showPassword
                                            ? <i className="ri-eye-line align-middle"></i>
                                            : <i className="ri-eye-off-line align-middle"></i>}
                                    </Link>
                                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                                </div>
                            </Col>
                            <Col xl={12}>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="modal-termsCheck"
                                        checked={values.acceptTerms}
                                        onChange={(e) => setValues({ ...values, acceptTerms: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="modal-termsCheck">
                                        Acepto los{" "}
                                        <a
                                            href="https://www.ejemplo.com/terminos"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "#4767ed" }}
                                        >
                                            términos y condiciones
                                        </a>
                                    </label>
                                </div>
                            </Col>
                        </Row>
                        <div className="d-grid mt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!tokenValidated || isSubmitting || !values.acceptTerms}
                            >
                                {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                            </Button>
                        </div>
                    </Form>
                    <div className="text-center mt-3 fw-medium">
                        ¿Ya tienes una cuenta?{" "}
                        <Link
                            scroll={false}
                            href="/authentication/sign-in/cover/"
                            className="text-primary animated-underline"
                        >
                            Ingresar
                        </Link>
                    </div>
                </motion.div>
            </Modal.Body>
        </Modal>
    );
};

export default RegisterModal;

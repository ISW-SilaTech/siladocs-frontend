"use client";

import React, { useState } from "react";
import { Modal, Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import Link from "next/link";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { AuthService } from "@/shared/services/auth.service";
import { useAuth } from "@/shared/contextapi";
import { extractErrorMessage } from "@/shared/utils/errors";

interface RegisterModalProps {
    show: boolean;
    onHide: () => void;
}

const MOTION_INITIAL = { opacity: 0, y: 8 };
const MOTION_ANIMATE = { opacity: 1, y: 0 };
const MOTION_TRANSITION = { duration: 0.25 };
const EMPTY_FORM = { token: "", name: "", email: "", password: "", institutionName: "" };

const RegisterModal: React.FC<RegisterModalProps> = ({ show, onHide }) => {
    const { register } = useAuth();

    const [values, setValues] = useState(EMPTY_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(true);
    const [tokenValidated, setTokenValidated] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

    const busy = isSubmitting || isValidating;

    const resetState = () => {
        setValues(EMPTY_FORM);
        setShowPassword(false);
        setAcceptTerms(true);
        setTokenValidated(false);
        setIsValidating(false);
        setIsSubmitting(false);
        setErrors({});
    };

    const handleClose = () => {
        if (busy) return;
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
        } catch (err) {
            setTokenValidated(false);
            toast.error(extractErrorMessage(err, "Código inválido, expirado o ya utilizado."));
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!acceptTerms) {
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
        } catch (err) {
            toast.error(extractErrorMessage(err, "Error en el registro"));
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
            backdrop={busy ? "static" : true}
            keyboard={!busy}
        >
            <Modal.Header closeButton={!busy}>
                <Modal.Title>
                    <span className="fw-semibold">Crea tu cuenta de administrador</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <motion.div
                    initial={MOTION_INITIAL}
                    animate={MOTION_ANIMATE}
                    transition={MOTION_TRANSITION}
                >
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
                                        onChange={(e) => setValues((prev) => ({ ...prev, token: e.target.value }))}
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
                                    onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
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
                                    onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
                                    isInvalid={!!errors.name}
                                    disabled={!tokenValidated}
                                />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Col>
                            <Col xl={12} className="mb-2">
                                <Form.Label htmlFor="modal-signup-password" className="text-default d-block">Contraseña</Form.Label>
                                <div className="position-relative">
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        id="modal-signup-password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={values.password}
                                        onChange={(e) => setValues((prev) => ({ ...prev, password: e.target.value }))}
                                        isInvalid={!!errors.password}
                                        disabled={!tokenValidated}
                                    />
                                    <Link
                                        scroll={false}
                                        href="#!"
                                        className="show-password-button text-muted"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowPassword((prev) => !prev);
                                        }}
                                    >
                                        {showPassword
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
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="modal-termsCheck">
                                        Acepto los{" "}
                                        <a
                                            href="https://www.ejemplo.com/terminos"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary"
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
                                disabled={!tokenValidated || isSubmitting || !acceptTerms}
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

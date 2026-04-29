"use client";

import React, { useState } from "react";
import { Modal, Form, Row, Col, Button, InputGroup, ProgressBar } from "react-bootstrap";
import Link from "next/link";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from "@/shared/services/auth.service";
import { useAuth } from "@/shared/contextapi";
import { extractErrorMessage } from "@/shared/utils/errors";

interface RegisterModalProps {
    show: boolean;
    onHide: () => void;
}

const MOTION_CONTAINER = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
};

const EMPTY_FORM = { token: "", name: "", email: "", password: "", institutionName: "" };

const RegisterModal: React.FC<RegisterModalProps> = ({ show, onHide }) => {
    const { register } = useAuth();

    const [step, setStep] = useState<1 | 2>(1);
    const [values, setValues] = useState(EMPTY_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(true);
    const [tokenValidated, setTokenValidated] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

    const busy = isSubmitting || isValidating;

    const resetState = () => {
        setStep(1);
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

    const validateStep2 = () => {
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
            toast.success("¡Código válido!", { autoClose: 1500 });
            setTimeout(() => setStep(2), 400);
        } catch (err) {
            setTokenValidated(false);
            toast.error(extractErrorMessage(err, "Código inválido, expirado o ya utilizado."));
        } finally {
            setIsValidating(false);
        }
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;
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

            toast.success("¡Cuenta creada correctamente!", { position: "top-right", autoClose: 1500 });
            resetState();
            setTimeout(onHide, 500);
        } catch (err) {
            toast.error(extractErrorMessage(err, "Error en el registro"));
            setTokenValidated(false);
            setStep(1);
        } finally {
            setIsSubmitting(false);
        }
    };

    const progressValue = step === 1 ? 50 : 100;

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            centered
            backdrop={busy ? "static" : true}
            keyboard={!busy}
            className="register-modal"
        >
            <Modal.Header closeButton={!busy} className="border-0 pb-2">
                <Modal.Title className="w-100">
                    <div className="d-flex align-items-center gap-2">
                        <div className="register-icon" style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #4767ed 0%, #7b5cff 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18 }}>
                            ✓
                        </div>
                        <div>
                            <h5 className="mb-0 fw-semibold">Registro de Administrador</h5>
                            <small className="text-muted">Paso {step} de 2</small>
                        </div>
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 py-3">
                <ProgressBar
                    now={progressValue}
                    className="mb-4"
                    style={{ height: "6px" }}
                />

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div key="step1" {...MOTION_CONTAINER}>
                            <div className="mb-3">
                                <p className="text-muted fw-medium mb-3">
                                    <i className="ri-shield-check-line me-2 text-primary"></i>
                                    Valida tu código de acceso institucional
                                </p>
                            </div>

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium text-dark">Código de Acceso</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingresa el código proporcionado"
                                            value={values.token}
                                            onChange={(e) => setValues((prev) => ({ ...prev, token: e.target.value }))}
                                            disabled={tokenValidated || isValidating}
                                            className="border-end-0"
                                        />
                                        <Button
                                            variant={tokenValidated ? "success" : "primary"}
                                            onClick={handleValidateToken}
                                            disabled={isValidating || tokenValidated}
                                            className={tokenValidated ? "" : ""}
                                        >
                                            {isValidating ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Validando...
                                                </>
                                            ) : tokenValidated ? (
                                                <>✓ Válido</>
                                            ) : (
                                                "Validar"
                                            )}
                                        </Button>
                                    </InputGroup>
                                    {tokenValidated && (
                                        <small className="text-success d-block mt-2">
                                            <i className="ri-check-line me-1"></i>
                                            Código validado correctamente
                                        </small>
                                    )}
                                </Form.Group>

                                {values.institutionName && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.3 }}
                                        className="alert alert-info border-0 mb-3"
                                    >
                                        <i className="ri-building-line me-2"></i>
                                        <strong>Institución:</strong> {values.institutionName}
                                    </motion.div>
                                )}

                                <div className="text-center py-2">
                                    <small className="text-muted">
                                        ¿No tienes un código? <Link href="/contacto" className="text-primary fw-medium">Contacta administración</Link>
                                    </small>
                                </div>
                            </Form>
                        </motion.div>
                    ) : (
                        <motion.div key="step2" {...MOTION_CONTAINER}>
                            <div className="mb-3">
                                <p className="text-muted fw-medium mb-3">
                                    <i className="ri-user-add-line me-2 text-primary"></i>
                                    Completa tu información personal
                                </p>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Row className="gy-3">
                                    <Col xl={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-medium text-dark">Institución</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={values.institutionName}
                                                disabled
                                                className="bg-light text-muted"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col xl={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-medium text-dark">Nombre Completo</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text className="bg-white border-end-0">
                                                    <i className="ri-user-line text-primary"></i>
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Tu nombre"
                                                    value={values.name}
                                                    onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
                                                    isInvalid={!!errors.name}
                                                    className="border-start-0"
                                                />
                                            </InputGroup>
                                            {errors.name && (
                                                <small className="text-danger d-block mt-1">
                                                    <i className="ri-error-warning-line me-1"></i>
                                                    {errors.name}
                                                </small>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    <Col xl={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-medium text-dark">Correo</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text className="bg-white border-end-0">
                                                    <i className="ri-mail-line text-primary"></i>
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="email"
                                                    placeholder="tu@institucion.edu"
                                                    value={values.email}
                                                    onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
                                                    isInvalid={!!errors.email}
                                                    className="border-start-0"
                                                />
                                            </InputGroup>
                                            {errors.email && (
                                                <small className="text-danger d-block mt-1">
                                                    <i className="ri-error-warning-line me-1"></i>
                                                    {errors.email}
                                                </small>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    <Col xl={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-medium text-dark">Contraseña</Form.Label>
                                            <div className="position-relative">
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-white border-end-0">
                                                        <i className="ri-lock-line text-primary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Mínimo 6 caracteres"
                                                        value={values.password}
                                                        onChange={(e) => setValues((prev) => ({ ...prev, password: e.target.value }))}
                                                        isInvalid={!!errors.password}
                                                        className="border-start-0 border-end-0"
                                                    />
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setShowPassword((prev) => !prev);
                                                        }}
                                                        className="border-start-0"
                                                    >
                                                        <i className={`ri-${showPassword ? "eye" : "eye-off"}-line`}></i>
                                                    </Button>
                                                </InputGroup>
                                                {errors.password && (
                                                    <small className="text-danger d-block mt-1">
                                                        <i className="ri-error-warning-line me-1"></i>
                                                        {errors.password}
                                                    </small>
                                                )}
                                                {values.password && !errors.password && (
                                                    <small className="text-success d-block mt-1">
                                                        <i className="ri-check-line me-1"></i>
                                                        Contraseña válida
                                                    </small>
                                                )}
                                            </div>
                                        </Form.Group>
                                    </Col>

                                    <Col xl={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="checkbox"
                                                id="acceptTerms"
                                                label={
                                                    <>
                                                        Acepto los{" "}
                                                        <Link href="/terminos" className="text-primary fw-medium">
                                                            términos y condiciones
                                                        </Link>
                                                        {" "} y la{" "}
                                                        <Link href="/privacidad" className="text-primary fw-medium">
                                                            política de privacidad
                                                        </Link>
                                                    </>
                                                }
                                                checked={acceptTerms}
                                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid gap-2 d-sm-flex justify-content-between">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleBackToStep1}
                                        disabled={busy}
                                        className="px-4"
                                    >
                                        <i className="ri-arrow-left-line me-2"></i>
                                        Atrás
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={!tokenValidated || isSubmitting || !acceptTerms}
                                        className="px-4 flex-grow-1"
                                        onClick={handleSubmit}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creando cuenta...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-check-line me-2"></i>
                                                Crear Cuenta
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0">
                <small className="text-muted w-100 text-center">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/authentication/sign-in/cover/" className="text-primary fw-medium">
                        Inicia sesión aquí
                    </Link>
                </small>
            </Modal.Footer>

            <style jsx>{`
                .register-modal .modal-header {
                    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                }

                .register-modal .form-control:focus,
                .register-modal .form-select:focus {
                    border-color: #4767ed;
                    box-shadow: 0 0 0 0.2rem rgba(71, 103, 237, 0.15);
                }

                .register-modal .btn-primary {
                    background: linear-gradient(135deg, #4767ed 0%, #5a7cff 100%);
                    border: none;
                    transition: all 0.3s ease;
                }

                .register-modal .btn-primary:hover:not(:disabled) {
                    background: linear-gradient(135deg, #3d58d9 0%, #4a6ee8 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(71, 103, 237, 0.3);
                }

                .register-modal .btn-primary:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                .register-modal .progress {
                    background: rgba(71, 103, 237, 0.1);
                }

                .register-modal .progress-bar {
                    background: linear-gradient(90deg, #4767ed 0%, #5a7cff 100%);
                }

                .register-icon {
                    font-weight: bold;
                    letter-spacing: 0.5px;
                }

                .register-modal .alert {
                    background: rgba(71, 103, 237, 0.08);
                    border-color: rgba(71, 103, 237, 0.2);
                    color: #3d58d9;
                }

                .register-modal .spinner-border-sm {
                    width: 0.9rem;
                    height: 0.9rem;
                    border-width: 0.2em;
                }
            `}</style>
        </Modal>
    );
};

export default RegisterModal;

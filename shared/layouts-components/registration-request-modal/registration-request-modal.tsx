"use client";

import React, { useState } from "react";
import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { RegistrationRequestsService } from "@/shared/services/registration-requests.service";
import { useRecaptcha } from "@/shared/hooks/useRecaptcha";

interface RegistrationRequestModalProps {
    show: boolean;
    onHide: () => void;
}

const EMPTY_FORM = {
    fullName: "",
    email: "",
    institutionName: "",
    message: "",
};

const RegistrationRequestModal: React.FC<RegistrationRequestModalProps> = ({ show, onHide }) => {
    const { getToken } = useRecaptcha();
    const [values, setValues] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const reset = () => {
        setValues(EMPTY_FORM);
        setErrors({});
        setIsSubmitting(false);
        setSubmitted(false);
    };

    const handleClose = () => {
        if (isSubmitting) return;
        reset();
        onHide();
    };

    const validate = (): boolean => {
        const errs: Partial<typeof EMPTY_FORM> = {};
        if (!values.fullName.trim()) errs.fullName = "El nombre es requerido.";
        if (!values.email.trim()) {
            errs.email = "El correo es requerido.";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            errs.email = "Formato de correo inválido.";
        }
        if (!values.institutionName.trim()) errs.institutionName = "El nombre de la institución es requerido.";
        if (!values.message.trim()) errs.message = "Por favor describe brevemente tu solicitud.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof EMPTY_FORM]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            // Verificar reCAPTCHA antes de enviar
            const recaptchaToken = await getToken('registration_request');
            if (!recaptchaToken) {
                toast.warn("No se pudo verificar reCAPTCHA. Intenta nuevamente.");
                return;
            }

            await RegistrationRequestsService.submit({
                fullName: values.fullName.trim(),
                email: values.email.trim(),
                institutionName: values.institutionName.trim(),
                message: values.message.trim(),
            });

            setSubmitted(true);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Error al enviar la solicitud. Inténtalo más tarde.";
            toast.error(msg);
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
            backdrop={isSubmitting ? "static" : true}
            keyboard={!isSubmitting}
        >
            <Modal.Header closeButton={!isSubmitting}>
                <Modal.Title className="fw-semibold">
                    <i className="ri-send-plane-line me-2 text-primary"></i>
                    Solicitar acceso a Siladocs
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    {submitted ? (
                        <div className="text-center py-4">
                            <div
                                style={{
                                    width: 64, height: 64, borderRadius: "50%",
                                    background: "rgba(16,185,129,0.12)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    margin: "0 auto 1.25rem",
                                }}
                            >
                                <i className="ri-checkbox-circle-line fs-1 text-success"></i>
                            </div>
                            <h5 className="fw-semibold mb-2">¡Solicitud enviada!</h5>
                            <p className="text-muted mb-4">
                                El equipo de Siladocs revisará tu solicitud y, si es aprobada,
                                recibirás un código de acceso en tu correo <strong>{values.email}</strong>.
                            </p>
                            <Button variant="primary" onClick={handleClose}>
                                Cerrar
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted mb-4">
                                Completa el formulario para solicitar acceso. El equipo de Siladocs
                                evaluará tu solicitud y te enviará un código de acceso si es aprobada.
                            </p>
                            <Form onSubmit={handleSubmit}>
                                <Row className="gy-3">
                                    <Col xl={6}>
                                        <Form.Label className="text-default fw-medium">Nombre completo</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="fullName"
                                            placeholder="Ej. María García López"
                                            value={values.fullName}
                                            onChange={handleChange}
                                            isInvalid={!!errors.fullName}
                                            disabled={isSubmitting}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
                                    </Col>
                                    <Col xl={6}>
                                        <Form.Label className="text-default fw-medium">Correo electrónico</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            placeholder="correo@institucion.edu"
                                            value={values.email}
                                            onChange={handleChange}
                                            isInvalid={!!errors.email}
                                            disabled={isSubmitting}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                    </Col>
                                    <Col xl={12}>
                                        <Form.Label className="text-default fw-medium">Nombre de la institución</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="institutionName"
                                            placeholder="Ej. Universidad Nacional de Ingeniería"
                                            value={values.institutionName}
                                            onChange={handleChange}
                                            isInvalid={!!errors.institutionName}
                                            disabled={isSubmitting}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.institutionName}</Form.Control.Feedback>
                                    </Col>
                                    <Col xl={12}>
                                        <Form.Label className="text-default fw-medium">Mensaje</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="message"
                                            rows={3}
                                            placeholder="Describe brevemente por qué necesitas acceso y el rol que desempeñas en tu institución..."
                                            value={values.message}
                                            onChange={handleChange}
                                            isInvalid={!!errors.message}
                                            disabled={isSubmitting}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                                <div className="d-grid mt-4">
                                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                                        {isSubmitting
                                            ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando solicitud...</>
                                            : <><i className="ri-send-plane-line me-2"></i>Enviar solicitud</>
                                        }
                                    </Button>
                                </div>
                            </Form>
                            <div className="text-center mt-3 text-muted" style={{ fontSize: "0.85rem" }}>
                                ¿Ya tienes un código de acceso?{" "}
                                <button
                                    type="button"
                                    className="btn btn-link p-0 align-baseline"
                                    style={{ fontSize: "0.85rem" }}
                                    onClick={handleClose}
                                >
                                    Regístrate aquí
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </Modal.Body>
        </Modal>
    );
};

export default RegistrationRequestModal;

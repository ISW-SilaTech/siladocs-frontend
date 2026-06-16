"use client";

import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Seo from "@/shared/layouts-components/seo/seo";
import { RegistrationRequestsService } from "@/shared/services/registration-requests.service";
import { extractErrorMessage } from "@/shared/utils/errors";
import Link from "next/link";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    institutionName: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Nombre requerido";
    if (!formData.email.trim()) newErrors.email = "Email requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";
    if (!formData.institutionName.trim()) newErrors.institutionName = "Nombre de institución requerido";
    if (!formData.message.trim()) newErrors.message = "Descripción requerida";
    else if (formData.message.length < 10) newErrors.message = "La descripción debe tener al menos 10 caracteres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await RegistrationRequestsService.submit(formData);

      setSubmitted(true);
      setFormData({ fullName: "", email: "", institutionName: "", message: "" });
    } catch (err) {
      toast.error(
        extractErrorMessage(err, "Error al enviar la solicitud. Por favor, intenta de nuevo.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: "ri-mail-line",
      title: "Email",
      value: "contacto@siladocs.com",
      href: "mailto:contacto@siladocs.com",
    },
    {
      icon: "ri-time-line",
      title: "Tiempo de respuesta",
      value: "Menos de 24 horas",
      href: "#",
    },
    {
      icon: "ri-shield-check-line",
      title: "Proceso seguro",
      value: "Datos protegidos con SSL",
      href: "#",
    },
    {
      icon: "ri-key-line",
      title: "Código de acceso",
      value: "Lo recibirás por email",
      href: "#",
    },
  ];

  return (
    <>
      <Seo title="Solicitar Acceso - Siladocs" />

      {/* Background decoration */}
      <div className="position-fixed top-0 start-0 w-100 h-100 pointer-events-none" style={{ zIndex: -1 }}>
        <div className="position-absolute" style={{ width: "400px", height: "400px", background: "radial-gradient(circle, rgba(71, 103, 237, 0.1) 0%, transparent 70%)", top: "-100px", right: "-100px", borderRadius: "50%" }} />
        <div className="position-absolute" style={{ width: "300px", height: "300px", background: "radial-gradient(circle, rgba(123, 92, 255, 0.08) 0%, transparent 70%)", bottom: "-50px", left: "-50px", borderRadius: "50%" }} />
      </div>

      {/* Header */}
      <motion.section className="py-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Container>
          <Row className="align-items-center py-5">
            <Col lg={8} className="mx-auto text-center">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(71,103,237,0.1)", border: "1px solid rgba(71,103,237,0.25)", color: "#4767ed", borderRadius: 20, padding: "4px 14px", fontSize: "0.8rem", fontWeight: 600, letterSpacing: 1, marginBottom: 16 }}>
                  <i className="ri-building-add-line"></i> SOLICITAR ACCESO INSTITUCIONAL
                </span>
                <h1 className="display-4 fw-bold mb-3" style={{ background: "linear-gradient(135deg, #4767ed 0%, #7b5cff 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Únete a Siladocs
                </h1>
              </motion.div>
              <motion.p className="lead text-muted mb-0" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                Completa el formulario y el equipo de Siladocs evaluará tu solicitud. Si es aprobada, recibirás un código de acceso por correo para completar tu registro.
              </motion.p>
            </Col>
          </Row>
        </Container>
      </motion.section>

      {/* Info Cards */}
      <motion.section className="py-4" variants={containerVariants} initial="hidden" animate="visible">
        <Container>
          <Row className="g-4 mb-5">
            {contactInfo.map((info, idx) => (
              <Col lg={3} md={6} key={idx}>
                <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card className="h-100 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)" }}>
                    <Card.Body className="text-center p-4">
                      <div className="mb-3 mx-auto" style={{ width: 60, height: 60, background: "linear-gradient(135deg, #4767ed 0%, #7b5cff 100%)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "white" }}>
                        <i className={info.icon}></i>
                      </div>
                      <h6 className="fw-semibold mb-2 text-dark">{info.title}</h6>
                      <p className="text-primary fw-medium mb-0" style={{ fontSize: "0.9rem" }}>{info.value}</p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </motion.section>

      {/* Registration Request Form */}
      <motion.section className="py-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <Card className="border-0 shadow-lg p-5" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)" }}>

                {submitted ? (
                  <motion.div className="text-center py-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36, color: "white" }}>
                      <i className="ri-check-line"></i>
                    </div>
                    <h4 className="fw-bold mb-2">¡Solicitud enviada!</h4>
                    <p className="text-muted mb-4">
                      Tu solicitud ha sido recibida. El equipo de Siladocs la revisará y, si es aprobada, recibirás un <strong>código de acceso</strong> en el correo <strong>{formData.email || "registrado"}</strong> para completar tu registro.
                    </p>
                    <div className="alert border-0 mb-4" style={{ background: "#fffbeb", color: "#92400e" }}>
                      <i className="ri-information-line me-2"></i>
                      El proceso de revisión puede tomar hasta 24 horas hábiles.
                    </div>
                    <Button variant="outline-primary" onClick={() => setSubmitted(false)}>
                      <i className="ri-add-line me-2"></i>
                      Enviar otra solicitud
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
                      <i className="ri-user-add-line text-primary"></i>
                      Solicitud de Acceso Institucional
                    </h3>
                    <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                      Una vez aprobada tu solicitud, recibirás un código único para registrarte como administrador de tu institución.
                    </p>

                    <Form onSubmit={handleSubmit}>
                      <Row className="g-3 mb-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium mb-2">
                              <i className="ri-user-line me-2 text-primary"></i>
                              Nombre Completo *
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              isInvalid={!!errors.fullName}
                              placeholder="Tu nombre completo"
                              className="form-control-lg border-1"
                            />
                            {errors.fullName && <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>}
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium mb-2">
                              <i className="ri-mail-line me-2 text-primary"></i>
                              Correo Electrónico *
                            </Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              isInvalid={!!errors.email}
                              placeholder="tu@institucion.edu.pe"
                              className="form-control-lg border-1"
                            />
                            {errors.email && <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium mb-2">
                          <i className="ri-building-line me-2 text-primary"></i>
                          Nombre de la Institución *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="institutionName"
                          value={formData.institutionName}
                          onChange={handleChange}
                          isInvalid={!!errors.institutionName}
                          placeholder="Ej. Universidad Nacional de Ingeniería"
                          className="form-control-lg border-1"
                        />
                        {errors.institutionName && <Form.Control.Feedback type="invalid">{errors.institutionName}</Form.Control.Feedback>}
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-medium mb-2">
                          <i className="ri-message-2-line me-2 text-primary"></i>
                          ¿Por qué deseas unirte a Siladocs? *
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          isInvalid={!!errors.message}
                          placeholder="Describe brevemente el uso que le darás a la plataforma y el tipo de documentos que gestionarás..."
                          rows={5}
                          className="border-1"
                        />
                        {errors.message && <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>}
                        <small className="text-muted d-block mt-1">{formData.message.length}/500 caracteres</small>
                      </Form.Group>

                      <div className="alert border-0 mb-4" style={{ background: "#f0f4ff", color: "#3730a3", fontSize: "0.85rem" }}>
                        <i className="ri-shield-check-line me-2"></i>
                        Al enviar esta solicitud, el equipo de Siladocs revisará tus datos y te notificará por correo electrónico con el resultado.
                      </div>

                      <div className="d-grid gap-2 d-sm-flex justify-content-between">
                        <Link href="/landing" className="btn btn-outline-secondary btn-lg px-4">
                          <i className="ri-arrow-left-line me-2"></i>
                          Volver
                        </Link>
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="px-5"
                          style={{ background: "linear-gradient(135deg, #4767ed 0%, #5a7cff 100%)", border: "none" }}
                        >
                          {isSubmitting ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando solicitud...</>
                          ) : (
                            <><i className="ri-send-plane-line me-2"></i>Enviar Solicitud</>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </motion.section>

      {/* FAQ */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-4">
            <Col lg={8} className="mx-auto text-center">
              <h3 className="fw-bold mb-2">Preguntas Frecuentes</h3>
              <p className="text-muted">Sobre el proceso de acceso a Siladocs</p>
            </Col>
          </Row>
          <Row>
            {[
              { icon: "ri-time-line", q: "¿Cuánto tarda la aprobación?", a: "El equipo de Siladocs revisa las solicitudes en menos de 24 horas hábiles." },
              { icon: "ri-mail-send-line", q: "¿Cómo recibiré el código de acceso?", a: "Una vez aprobada tu solicitud, recibirás un correo con tu código único y el enlace para completar el registro." },
              { icon: "ri-key-line", q: "¿Por cuánto tiempo es válido el código?", a: "El código de acceso tiene una validez de 7 días desde su emisión. Después expira automáticamente." },
              { icon: "ri-shield-check-line", q: "¿Están seguros mis datos?", a: "Sí, usamos encriptación SSL y protegemos tu información conforme a estándares de seguridad." },
            ].map((faq, idx) => (
              <Col lg={6} className="mb-4" key={idx}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                      <i className={`${faq.icon} text-primary`}></i>
                      {faq.q}
                    </h6>
                    <p className="text-muted mb-0">{faq.a}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <motion.section className="py-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h3 className="fw-bold mb-3">¿Ya tienes un código de acceso?</h3>
              <p className="text-muted mb-4">
                Si ya recibiste tu código de acceso, puedes completar tu registro directamente.
              </p>
              <Link href="/authentication/sign-up/cover" className="btn btn-primary btn-lg px-5">
                <i className="ri-user-add-line me-2"></i>
                Completar mi Registro
              </Link>
            </Col>
          </Row>
        </Container>
      </motion.section>
    </>
  );
};

export default ContactPage;

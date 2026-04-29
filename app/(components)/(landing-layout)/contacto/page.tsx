"use client";

import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Seo from "@/shared/layouts-components/seo/seo";
import { ContactService, type ContactRequest } from "@/shared/services/contact.service";
import { extractErrorMessage } from "@/shared/utils/errors";
import { useRecaptcha } from "@/shared/hooks/useRecaptcha";
import Link from "next/link";

const ContactPage = () => {
  const { getToken } = useRecaptcha();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
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

    if (!formData.name.trim()) newErrors.name = "Nombre requerido";
    if (!formData.email.trim()) newErrors.email = "Email requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";
    if (!formData.subject.trim()) newErrors.subject = "Asunto requerido";
    if (!formData.message.trim()) newErrors.message = "Mensaje requerido";
    else if (formData.message.length < 10) newErrors.message = "El mensaje debe tener al menos 10 caracteres";

    if (formData.phone && !/^[\d\s+\-()]*$/.test(formData.phone)) {
      newErrors.phone = "Teléfono inválido";
    }

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
      const recaptchaToken = await getToken('contact_form');
      if (!recaptchaToken) {
        toast.error("Error de verificación de seguridad. Por favor, intenta de nuevo.");
        setIsSubmitting(false);
        return;
      }

      const response = await ContactService.sendMessage({
        ...formData,
        recaptchaToken,
      } as ContactRequest & { recaptchaToken: string });

      toast.success("¡Mensaje enviado exitosamente! Nos pondremos en contacto pronto.", {
        position: "top-right",
        autoClose: 2000,
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      toast.error(
        extractErrorMessage(err, "Error al enviar el mensaje. Por favor, intenta de nuevo.")
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
      icon: "ri-phone-line",
      title: "Teléfono",
      value: "+34 900 123 456",
      href: "tel:+34900123456",
    },
    {
      icon: "ri-map-pin-line",
      title: "Ubicación",
      value: "Calle Principal 123, Madrid, España",
      href: "#",
    },
    {
      icon: "ri-time-line",
      title: "Horario",
      value: "Lunes - Viernes: 9:00 - 18:00",
      href: "#",
    },
  ];

  return (
    <>
      <Seo title="Contacto - Siladocs" />

      {/* Background decoration */}
      <div className="position-fixed top-0 start-0 w-100 h-100 pointer-events-none" style={{ zIndex: -1 }}>
        <div
          className="position-absolute"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(71, 103, 237, 0.1) 0%, transparent 70%)",
            top: "-100px",
            right: "-100px",
            borderRadius: "50%",
          }}
        />
        <div
          className="position-absolute"
          style={{
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(123, 92, 255, 0.08) 0%, transparent 70%)",
            bottom: "-50px",
            left: "-50px",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Header */}
      <motion.section className="py-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Container>
          <Row className="align-items-center py-5">
            <Col lg={8} className="mx-auto text-center">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <h1 className="display-4 fw-bold mb-3" style={{ background: "linear-gradient(135deg, #4767ed 0%, #7b5cff 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Ponte en Contacto
                </h1>
              </motion.div>
              <motion.p className="lead text-muted mb-0" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                ¿Tienes preguntas? Nos encantaría escucharte. Completa el formulario y te responderemos en menos de 24 horas.
              </motion.p>
            </Col>
          </Row>
        </Container>
      </motion.section>

      {/* Contact Info Cards */}
      <motion.section className="py-5" variants={containerVariants} initial="hidden" animate="visible">
        <Container>
          <Row className="g-4 mb-5">
            {contactInfo.map((info, idx) => (
              <Col lg={3} md={6} key={idx}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-100 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)" }}>
                    <Card.Body className="text-center p-4">
                      <div
                        className="mb-3 mx-auto"
                        style={{
                          width: 60,
                          height: 60,
                          background: "linear-gradient(135deg, #4767ed 0%, #7b5cff 100%)",
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 28,
                          color: "white",
                        }}
                      >
                        <i className={info.icon}></i>
                      </div>
                      <h6 className="fw-semibold mb-2 text-dark">{info.title}</h6>
                      <Link
                        href={info.href}
                        className="text-primary text-decoration-none fw-medium"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {info.value}
                      </Link>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </motion.section>

      {/* Contact Form Section */}
      <motion.section className="py-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <Card className="border-0 shadow-lg p-5" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)" }}>
                <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <i className="ri-mail-send-line text-primary"></i>
                  Envía tu Mensaje
                </h3>

                {submitted && (
                  <motion.div
                    className="alert alert-success border-0 mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <i className="ri-check-circle-line me-2"></i>
                    Gracias por tu mensaje. Nos pondremos en contacto pronto.
                  </motion.div>
                )}

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
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          isInvalid={!!errors.name}
                          placeholder="Tu nombre"
                          className="form-control-lg border-1"
                        />
                        {errors.name && (
                          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium mb-2">
                          <i className="ri-mail-line me-2 text-primary"></i>
                          Email *
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          isInvalid={!!errors.email}
                          placeholder="tu@ejemplo.com"
                          className="form-control-lg border-1"
                        />
                        {errors.email && (
                          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium mb-2">
                          <i className="ri-phone-line me-2 text-primary"></i>
                          Teléfono
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          isInvalid={!!errors.phone}
                          placeholder="+34 900 123 456"
                          className="form-control-lg border-1"
                        />
                        {errors.phone && (
                          <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium mb-2">
                          <i className="ri-building-line me-2 text-primary"></i>
                          Institución/Empresa
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Nombre de tu institución"
                          className="form-control-lg border-1"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium mb-2">
                      <i className="ri-file-text-line me-2 text-primary"></i>
                      Asunto *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      isInvalid={!!errors.subject}
                      placeholder="¿Cuál es el tema principal?"
                      className="form-control-lg border-1"
                    />
                    {errors.subject && (
                      <Form.Control.Feedback type="invalid">{errors.subject}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium mb-2">
                      <i className="ri-message-2-line me-2 text-primary"></i>
                      Mensaje *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      isInvalid={!!errors.message}
                      placeholder="Cuéntanos más detalles..."
                      rows={6}
                      className="border-1"
                    />
                    {errors.message && (
                      <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
                    )}
                    <small className="text-muted d-block mt-2">
                      {formData.message.length}/500 caracteres
                    </small>
                  </Form.Group>

                  <div className="d-grid gap-2 d-sm-flex justify-content-between">
                    <Link href="/landing" className="btn btn-outline-secondary btn-lg px-4">
                      <i className="ri-arrow-left-line me-2"></i>
                      Volver
                    </Link>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="px-4"
                      style={{
                        background: "linear-gradient(135deg, #4767ed 0%, #5a7cff 100%)",
                        border: "none",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <i className="ri-send-plane-line me-2"></i>
                          Enviar Mensaje
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </Container>
      </motion.section>

      {/* FAQ Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h3 className="fw-bold mb-2">Preguntas Frecuentes</h3>
              <p className="text-muted">Consulta nuestras preguntas más comunes</p>
            </Col>
          </Row>

          <Row>
            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)" }}>
                <Card.Body>
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="ri-time-line text-primary"></i>
                    ¿Cuál es el tiempo de respuesta?
                  </h6>
                  <p className="text-muted mb-0">
                    Respondemos todos los mensajes en menos de 24 horas hábiles. Para consultas urgentes, llama al +34 900 123 456.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)" }}>
                <Card.Body>
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="ri-question-line text-primary"></i>
                    ¿Tienen soporte técnico?
                  </h6>
                  <p className="text-muted mb-0">
                    Sí, contamos con un equipo técnico disponible de lunes a viernes de 9:00 a 18:00 para resolver cualquier inconveniente.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)" }}>
                <Card.Body>
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="ri-file-info-line text-primary"></i>
                    ¿Necesito una cuenta para contactar?
                  </h6>
                  <p className="text-muted mb-0">
                    No, puedes contactarnos directamente desde este formulario sin necesidad de crear una cuenta previa.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)" }}>
                <Card.Body>
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="ri-shield-check-line text-primary"></i>
                    ¿Mis datos están seguros?
                  </h6>
                  <p className="text-muted mb-0">
                    Utilizamos encriptación SSL y protegemos tus datos conforme a GDPR. Tu privacidad es nuestra prioridad.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <motion.section className="py-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h3 className="fw-bold mb-3">¿Listo para comenzar?</h3>
              <p className="text-muted mb-4">
                Si aún no eres administrador, regístrate ahora y obtén acceso completo a todas las características de Siladocs.
              </p>
              <Link href="/landing" className="btn btn-primary btn-lg px-5">
                <i className="ri-arrow-right-line me-2"></i>
                Ir a Landing Page
              </Link>
            </Col>
          </Row>
        </Container>
      </motion.section>

      <style jsx>{`
        .form-control:focus,
        .form-select:focus {
          border-color: #4767ed;
          box-shadow: 0 0 0 0.2rem rgba(71, 103, 237, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #4767ed 0%, #5a7cff 100%);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #3d58d9 0%, #4a6ee8 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(71, 103, 237, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .alert-success {
          background: rgba(40, 167, 69, 0.1);
          color: #155724;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </>
  );
};

export default ContactPage;

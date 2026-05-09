"use client";

import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Seo from "@/shared/layouts-components/seo/seo";
import api from "@/shared/config/axios";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRequestCode = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password/request", { email });
      setSuccess("Código de recuperación enviado a tu email");
      setStep("code");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password/verify", { email, code });
      setSuccess("Código verificado correctamente");
      setStep("password");
    } catch (err: any) {
      setError(err.response?.data?.message || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/forgot-password/reset", {
        email,
        code,
        newPassword,
      });
      setSuccess("Contraseña actualizada exitosamente");
      setTimeout(() => router.push("/authentication/sign-in/cover"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al resetear la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Recuperar Contraseña" />

      <div className="authenticationpage" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="custom-card shadow-lg border-0">
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <div className="avatar avatar-xl bg-primary-transparent text-primary rounded-circle mx-auto mb-3" style={{ width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ri-shield-keyhole-line" style={{ fontSize: "40px" }}></i>
                    </div>
                    <h3 className="fw-bold mb-2">Recuperar Contraseña</h3>
                    <p className="text-muted mb-0">
                      {step === "email" && "Ingresa tu email para recibir un código"}
                      {step === "code" && "Ingresa el código que recibiste"}
                      {step === "password" && "Crea tu nueva contraseña"}
                    </p>
                  </div>

                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}

                  {step === "email" && (
                    <Form onSubmit={handleRequestCode}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        className="w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? "Enviando..." : "Enviar Código"}
                      </Button>

                      <div className="text-center">
                        <p className="text-muted mb-0">
                          ¿Recuerdas tu contraseña?{" "}
                          <a href="/authentication/sign-in/cover" className="fw-bold text-primary">
                            Inicia sesión
                          </a>
                        </p>
                      </div>
                    </Form>
                  )}

                  {step === "code" && (
                    <Form onSubmit={handleVerifyCode}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Código de Recuperación</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Ingresa el código de 6 dígitos"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          maxLength={6}
                          required
                        />
                        <Form.Text className="text-muted">
                          Revisa tu email para obtener el código
                        </Form.Text>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        className="w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? "Verificando..." : "Verificar Código"}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="w-100"
                        onClick={() => setStep("email")}
                      >
                        Volver
                      </Button>
                    </Form>
                  )}

                  {step === "password" && (
                    <Form onSubmit={handleResetPassword}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Nueva Contraseña</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Mínimo 8 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Confirmar Contraseña</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirma tu contraseña"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        className="w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? "Actualizando..." : "Actualizar Contraseña"}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="w-100"
                        onClick={() => {
                          setStep("email");
                          setCode("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                      >
                        Volver
                      </Button>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

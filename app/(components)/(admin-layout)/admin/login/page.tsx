"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import adminApi, { ADMIN_TOKEN_KEY } from "@/shared/config/axios-admin";

const ADMIN_SESSION_KEY = "siladocs_admin_session";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = "Correo requerido.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Formato inválido.";
    if (!password) errs.password = "Contraseña requerida.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await adminApi.post<{ accessToken: string }>('/auth/login', { email, password });
      const token = res.data?.accessToken;
      if (!token) throw new Error('No token received');
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      toast.success("Acceso concedido", { autoClose: 1000 });
      setTimeout(() => router.replace("/admin/backoffice"), 900);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else {
        toast.error("No se pudo conectar con el servidor. Inténtalo nuevamente.");
      }
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <ToastContainer position="top-right" />
      <motion.div
        initial={{ filter: "blur(5px)", opacity: 0 }}
        animate={{ filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeIn" }}
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)", padding: "1rem" }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Logo + badge */}
          <div className="text-center mb-4">
            <div style={{ position: "relative", width: 160, height: 40, margin: "0 auto 16px" }}>
              <Image
                src="/assets/images/brand-logos/desktop-dark.png"
                alt="Siladocs"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(71,103,237,0.15)", border: "1px solid rgba(71,103,237,0.4)",
              color: "#93c5fd", borderRadius: 20, padding: "4px 14px", fontSize: "0.78rem", fontWeight: 600, letterSpacing: 1
            }}>
              <i className="ri-shield-keyhole-line"></i> SUPER ADMINISTRADOR
            </span>
          </div>

          <Card style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <Card.Body style={{ padding: "2.5rem 2rem" }}>
              <h4 className="fw-semibold mb-1" style={{ color: "#f1f5f9" }}>Acceso restringido</h4>
              <p className="mb-4" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Panel de administración interna de Siladocs.</p>

              <Form onSubmit={handleSubmit}>
                <Row className="gy-3">
                  <Col xs={12}>
                    <Form.Label style={{ color: "#cbd5e1", fontWeight: 500, fontSize: "0.9rem" }}>Correo electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="superadmin@siladocs.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      isInvalid={!!errors.email}
                      disabled={loading}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f1f5f9", borderRadius: 10 }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Col>

                  <Col xs={12}>
                    <Form.Label style={{ color: "#cbd5e1", fontWeight: 500, fontSize: "0.9rem" }}>Contraseña</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={!!errors.password}
                        disabled={loading}
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f1f5f9", borderRadius: 10, paddingRight: 44 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0, lineHeight: 1 }}
                        tabIndex={-1}
                      >
                        <i className={`ri-eye${showPassword ? "-off" : ""}-line fs-5`}></i>
                      </button>
                      <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                    </div>
                  </Col>

                  <Col xs={12} className="mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%", padding: "12px 0", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
                        background: "linear-gradient(135deg, #4767ed, #7b5cff)", color: "#fff", fontWeight: 600, fontSize: "0.95rem",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, transition: "opacity .2s"
                      }}
                    >
                      {loading ? (
                        <><Spinner size="sm" /> Verificando...</>
                      ) : (
                        <><i className="ri-login-box-line"></i> Ingresar al Panel</>
                      )}
                    </button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center mt-4" style={{ color: "#475569", fontSize: "0.78rem" }}>
            Esta área es exclusiva para el equipo interno de Siladocs.
          </p>
        </div>
      </motion.div>
    </Fragment>
  );
}

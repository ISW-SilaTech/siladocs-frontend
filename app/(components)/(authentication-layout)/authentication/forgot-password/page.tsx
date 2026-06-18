"use client";

import { useState, useRef, useEffect } from "react";
import { Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Seo from "@/shared/layouts-components/seo/seo";
import { AuthService } from "@/shared/services/auth.service";
import { extractErrorMessage } from "@/shared/utils/errors";

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = ["email", "code", "password"] as const;
type Step = (typeof STEPS)[number];

const stepIndex = (s: Step) => STEPS.indexOf(s);

const StepIndicator: React.FC<{ step: Step }> = ({ step }) => (
    <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
        {STEPS.map((s, i) => {
            const done = i < stepIndex(step);
            const active = s === step;
            return (
                <div key={s} className="d-flex align-items-center gap-2">
                    <div
                        style={{
                            width: 28, height: 28, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: done || active ? "#4767ed" : "#e9ecef",
                            color: done || active ? "#fff" : "#6c757d",
                            fontSize: "0.75rem", fontWeight: 600,
                            transition: "background 0.3s",
                        }}
                    >
                        {done ? <i className="ri-check-line" /> : i + 1}
                    </div>
                    {i < 2 && (
                        <div
                            style={{
                                width: 32, height: 2,
                                background: done ? "#4767ed" : "#e9ecef",
                                transition: "background 0.3s",
                            }}
                        />
                    )}
                </div>
            );
        })}
    </div>
);

// ── Password strength ─────────────────────────────────────────────────────────

const getStrength = (pw: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Muy débil", color: "#ef4444" };
    if (score === 2) return { score, label: "Débil", color: "#f97316" };
    if (score === 3) return { score, label: "Media", color: "#eab308" };
    if (score === 4) return { score, label: "Fuerte", color: "#22c55e" };
    return { score, label: "Muy fuerte", color: "#10b981" };
};

// ── Error message humanizer ───────────────────────────────────────────────────

const humanizeError = (err: any, step: Step): string => {
    const status: number | undefined = err?.response?.status;
    const msg: string = (extractErrorMessage(err, "")).toLowerCase();

    if (status === undefined || err?.code === "ERR_NETWORK") {
        return "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
    }
    if (status >= 500) {
        return "El servidor no está disponible en este momento. Inténtalo más tarde.";
    }
    if (step === "email") {
        if (status === 404) return "No existe una cuenta registrada con ese correo.";
        if (status === 429) return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
        return "No se pudo enviar el código. Verifica tu correo e inténtalo de nuevo.";
    }
    if (step === "code") {
        if (status === 400 || status === 404) {
            if (msg.includes("expirado") || msg.includes("expired")) return "El código ha expirado. Solicita uno nuevo.";
            return "Código incorrecto o expirado. Verifica el email e inténtalo de nuevo.";
        }
        return "No se pudo verificar el código. Inténtalo de nuevo.";
    }
    if (step === "password") {
        if (status === 400) return extractErrorMessage(err, "La contraseña no cumple los requisitos mínimos.");
        return "No se pudo actualizar la contraseña. Inténtalo de nuevo.";
    }
    return extractErrorMessage(err, "Ocurrió un error inesperado. Inténtalo de nuevo.");
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPassword() {
    const router = useRouter();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [done, setDone] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const startResendTimer = () => {
        setResendCooldown(60);
        timerRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    // ── Paso 1: solicitar código ──────────────────────────────────────────────
    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await AuthService.forgotPasswordRequest(email.trim());
            setStep("code");
            startResendTimer();
        } catch (err: any) {
            setError(humanizeError(err, "email"));
        } finally {
            setLoading(false);
        }
    };

    // ── Reenviar código ───────────────────────────────────────────────────────
    const handleResend = async () => {
        if (resendCooldown > 0 || loading) return;
        setLoading(true);
        setError("");
        try {
            await AuthService.forgotPasswordRequest(email.trim());
            startResendTimer();
        } catch (err: any) {
            setError(humanizeError(err, "email"));
        } finally {
            setLoading(false);
        }
    };

    // ── Paso 2: verificar código ──────────────────────────────────────────────
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim().length < 4) { setError("Ingresa el código completo."); return; }
        setLoading(true);
        setError("");
        try {
            await AuthService.forgotPasswordVerify(email.trim(), code.trim());
            setStep("password");
        } catch (err: any) {
            setError(humanizeError(err, "code"));
        } finally {
            setLoading(false);
        }
    };

    // ── Paso 3: nueva contraseña ──────────────────────────────────────────────
    const strength = getStrength(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
        if (newPassword !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
        setLoading(true);
        setError("");
        try {
            await AuthService.forgotPasswordReset(email.trim(), code.trim(), newPassword);
            setDone(true);
            setTimeout(() => router.push("/authentication/sign-in/cover"), 3000);
        } catch (err: any) {
            setError(humanizeError(err, "password"));
        } finally {
            setLoading(false);
        }
    };

    const stepLabel: Record<Step, string> = {
        email: "Paso 1 de 3 — Ingresa tu correo",
        code: "Paso 2 de 3 — Verifica el código",
        password: "Paso 3 de 3 — Crea tu nueva contraseña",
    };

    return (
        <>
            <Seo title="Recuperar Contraseña" />
            <motion.div
                initial={{ filter: "blur(5px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
            >
                <Row className="authentication authentication-cover-main mx-0">
                    {/* ── Main column ── */}
                    <Col xxl={9} xl={9}>
                        <Row className="justify-content-center align-items-center h-100">
                            <Col xxl={4} xl={5} lg={6} md={7} sm={9} className="col-12">
                                <Card className="custom-card border-0 shadow-none my-4">
                                    <Card.Body className="p-5">

                                        {/* Header */}
                                        <div className="text-center mb-4">
                                            <h4 className="mb-1 fw-semibold">Recuperar contraseña</h4>
                                            <StepIndicator step={step} />
                                            <p className="text-muted mb-0" style={{ fontSize: "0.88rem" }}>
                                                {stepLabel[step]}
                                            </p>
                                        </div>

                                        {error && (
                                            <Alert variant="danger" className="py-2 fs-13" onClose={() => setError("")} dismissible>
                                                {error}
                                            </Alert>
                                        )}

                                        <AnimatePresence mode="wait">
                                            {/* ── Éxito final ── */}
                                            {done && (
                                                <motion.div
                                                    key="done"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-center py-3"
                                                >
                                                    <div
                                                        style={{
                                                            width: 64, height: 64, borderRadius: "50%",
                                                            background: "rgba(16,185,129,0.12)",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            margin: "0 auto 1rem",
                                                        }}
                                                    >
                                                        <i className="ri-checkbox-circle-line fs-1 text-success"></i>
                                                    </div>
                                                    <h5 className="fw-semibold mb-2">¡Contraseña actualizada!</h5>
                                                    <p className="text-muted fs-13 mb-3">
                                                        Redirigiendo al inicio de sesión en unos segundos...
                                                    </p>
                                                    <Spinner animation="border" size="sm" variant="primary" />
                                                </motion.div>
                                            )}

                                            {/* ── Paso 1: Email ── */}
                                            {!done && step === "email" && (
                                                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                                    <Form onSubmit={handleRequestCode}>
                                                        <Form.Group className="mb-4">
                                                            <Form.Label className="text-default fw-medium">Correo electrónico</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                placeholder="correo@institucion.edu.pe"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                required
                                                                disabled={loading}
                                                                autoFocus
                                                            />
                                                        </Form.Group>
                                                        <div className="d-grid mb-3">
                                                            <Button variant="primary" type="submit" disabled={loading}>
                                                                {loading
                                                                    ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Enviando...</>
                                                                    : <><i className="ri-mail-send-line me-2"></i>Enviar código de verificación</>
                                                                }
                                                            </Button>
                                                        </div>
                                                    </Form>
                                                    <div className="text-center fs-13 text-muted">
                                                        ¿Recuerdas tu contraseña?{" "}
                                                        <Link href="/authentication/sign-in/cover" className="text-primary animated-underline fw-medium">
                                                            Iniciar sesión
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* ── Paso 2: Código ── */}
                                            {!done && step === "code" && (
                                                <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                                    <div className="mb-3 p-3 rounded-3 fs-12 text-muted" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                                                        <i className="ri-mail-line me-1 text-info"></i>
                                                        Enviamos un código a <strong>{email}</strong>. Revisa tu bandeja de entrada y carpeta de spam.
                                                    </div>
                                                    <Form onSubmit={handleVerifyCode}>
                                                        <Form.Group className="mb-4">
                                                            <Form.Label className="text-default fw-medium">Código de verificación</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                inputMode="numeric"
                                                                placeholder="Ej. 482910"
                                                                value={code}
                                                                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                                                required
                                                                disabled={loading}
                                                                autoFocus
                                                                style={{ letterSpacing: "0.25em", fontSize: "1.1rem", textAlign: "center" }}
                                                            />
                                                        </Form.Group>
                                                        <div className="d-grid mb-3">
                                                            <Button variant="primary" type="submit" disabled={loading || code.length < 4}>
                                                                {loading
                                                                    ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Verificando...</>
                                                                    : <><i className="ri-shield-check-line me-2"></i>Verificar código</>
                                                                }
                                                            </Button>
                                                        </div>
                                                    </Form>
                                                    <div className="d-flex align-items-center justify-content-between fs-13">
                                                        <button
                                                            className="btn btn-link p-0 fs-13 text-muted text-decoration-none"
                                                            onClick={() => { setStep("email"); setCode(""); setError(""); }}
                                                        >
                                                            ← Cambiar correo
                                                        </button>
                                                        <button
                                                            className="btn btn-link p-0 fs-13 text-decoration-none"
                                                            style={{ color: resendCooldown > 0 ? "#aaa" : "#4767ed" }}
                                                            onClick={handleResend}
                                                            disabled={resendCooldown > 0 || loading}
                                                        >
                                                            {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : "Reenviar código"}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* ── Paso 3: Nueva contraseña ── */}
                                            {!done && step === "password" && (
                                                <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                                    <Form onSubmit={handleResetPassword}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="text-default fw-medium">Nueva contraseña</Form.Label>
                                                            <div className="position-relative">
                                                                <Form.Control
                                                                    type={showNewPw ? "text" : "password"}
                                                                    placeholder="Mínimo 8 caracteres"
                                                                    value={newPassword}
                                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                                    required
                                                                    disabled={loading}
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="show-password-button text-muted"
                                                                    style={{ border: "none", background: "none", padding: 0 }}
                                                                    onClick={() => setShowNewPw((v) => !v)}
                                                                    aria-label={showNewPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                                >
                                                                    <i className={showNewPw ? "ri-eye-line align-middle" : "ri-eye-off-line align-middle"}></i>
                                                                </button>
                                                            </div>
                                                            {/* Strength bar */}
                                                            {newPassword.length > 0 && (
                                                                <div className="mt-2">
                                                                    <div className="d-flex gap-1 mb-1">
                                                                        {[1, 2, 3, 4, 5].map((i) => (
                                                                            <div
                                                                                key={i}
                                                                                style={{
                                                                                    height: 4, flex: 1, borderRadius: 2,
                                                                                    background: i <= strength.score ? strength.color : "#e9ecef",
                                                                                    transition: "background 0.3s",
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="fs-11" style={{ color: strength.color }}>{strength.label}</span>
                                                                </div>
                                                            )}
                                                        </Form.Group>

                                                        <Form.Group className="mb-4">
                                                            <Form.Label className="text-default fw-medium">Confirmar contraseña</Form.Label>
                                                            <div className="position-relative">
                                                                <Form.Control
                                                                    type={showConfirmPw ? "text" : "password"}
                                                                    placeholder="Repite tu nueva contraseña"
                                                                    value={confirmPassword}
                                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                                    required
                                                                    disabled={loading}
                                                                    isValid={passwordsMatch}
                                                                    isInvalid={confirmPassword.length > 0 && !passwordsMatch}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="show-password-button text-muted"
                                                                    style={{ border: "none", background: "none", padding: 0 }}
                                                                    onClick={() => setShowConfirmPw((v) => !v)}
                                                                    aria-label={showConfirmPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                                >
                                                                    <i className={showConfirmPw ? "ri-eye-line align-middle" : "ri-eye-off-line align-middle"}></i>
                                                                </button>
                                                                <Form.Control.Feedback type="invalid">Las contraseñas no coinciden.</Form.Control.Feedback>
                                                                <Form.Control.Feedback type="valid">Las contraseñas coinciden ✓</Form.Control.Feedback>
                                                            </div>
                                                        </Form.Group>

                                                        <div className="d-grid">
                                                            <Button
                                                                variant="primary"
                                                                type="submit"
                                                                disabled={loading || !passwordsMatch || newPassword.length < 8}
                                                            >
                                                                {loading
                                                                    ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Actualizando...</>
                                                                    : <><i className="ri-lock-password-line me-2"></i>Actualizar contraseña</>
                                                                }
                                                            </Button>
                                                        </div>
                                                    </Form>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* ── Side panel (mismo diseño que sign-in/sign-up) ── */}
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
                                        Recupera el acceso a <span style={{ color: "#5976ef" }}>Siladocs</span>
                                    </h3>
                                    <p className="mb-0 text-muted fw-medium">
                                        En 3 pasos restablece tu contraseña de forma segura sin perder el acceso a tu institución.
                                    </p>
                                </div>
                                <div>
                                    <Image fill src="../../../assets/images/media/media-72.png" alt="" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </motion.div>
        </>
    );
}

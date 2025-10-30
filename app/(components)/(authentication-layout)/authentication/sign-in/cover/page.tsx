"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

//Efectos
import { motion } from "framer-motion";

interface CoverProps { }

const Cover: React.FC<CoverProps> = () => {
    const [values, setValues] = useState<any>({
        email: "",
        password: "",
        showPassword: false,
    });

    const [errors, setErrors] = useState<any>({});
    const router = useRouter();

    const validate = () => {
        const newErrors: any = {};

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (validate()) {
            try {
                const response = await fetch("http://localhost:8080/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    toast.success("Inicio de sesión exitoso", {
                        position: "top-right",
                        autoClose: 1500,
                    });
                    localStorage.setItem("token", data.token); // 🔑 Guardar JWT
                    router.push("/dashboards/general/");
                } else {
                    toast.error("Credenciales inválidas");
                }
            } catch (err) {
                toast.error("Error de conexión con el servidor");
            }
        }
    };

    return (
        <Fragment>
            <motion.div
                initial={{ filter: "blur(5px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
            >
                <Seo title="Signin-Cover" />

                <Row className="authentication authentication-cover-main mx-0">
                    <Col xxl={9} xl={9}>
                        <Row className="justify-content-center align-items-center h-100">
                            <Col xxl={4} xl={5} lg={6} md={6} sm={8} className="col-12">
                                <Card className="custom-card border-0 shadow-none my-4">
                                    <Card.Body className="p-5">
                                        <div>
                                            <h4 className="mb-1 fw-semibold">¡Hola, bienvenido a siladocs!</h4>
                                            <p className="mb-4 text-muted fw-normal">
                                                Por favor, ingresa tus credenciales
                                            </p>
                                        </div>
                                        <Form onSubmit={handleSubmit}>
                                            <Row className="gy-3">
                                                <Col xl={12}>
                                                    <Form.Label
                                                        htmlFor="signin-email"
                                                        className="text-default"
                                                    >
                                                        Correo del administrador
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        className="form-control"
                                                        id="signin-email"
                                                        placeholder="Ingresa tu correo electrónico"
                                                        value={values.email}
                                                        onChange={(e) =>
                                                            setValues({ ...values, email: e.target.value })
                                                        }
                                                        isInvalid={!!errors.email}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </Col>
                                                <Col xl={12} className="mb-2">
                                                    <Form.Label
                                                        htmlFor="signin-password"
                                                        className="text-default d-block"
                                                    >
                                                        Contraseña
                                                    </Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type={values.showPassword ? "text" : "password"}
                                                            className="form-control"
                                                            id="signin-password"
                                                            placeholder="Ingresa tu contraseña"
                                                            value={values.password}
                                                            onChange={(e) =>
                                                                setValues({ ...values, password: e.target.value })
                                                            }
                                                            isInvalid={!!errors.password}
                                                        />
                                                        <Link
                                                            scroll={false}
                                                            href="#!"
                                                            className="show-password-button text-muted"
                                                            onClick={() =>
                                                                setValues((prev: any) => ({
                                                                    ...prev,
                                                                    showPassword: !prev.showPassword,
                                                                }))
                                                            }
                                                        >
                                                            {values.showPassword ? (
                                                                <i className="ri-eye-line align-middle"></i>
                                                            ) : (
                                                                <i className="ri-eye-off-line align-middle"></i>
                                                            )}
                                                        </Link>
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.password}
                                                        </Form.Control.Feedback>
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="rememberMe"
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor="rememberMe"
                                                            >
                                                                Recuérdame
                                                            </label>
                                                            <Link
                                                                scroll={false}
                                                                href="/authentication/reset-password/email-token"
                                                                className="float-end text-primary fw-medium fs-12 animated-underline"
                                                            >
                                                                ¿Olvidaste tu contraseña?
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <div className="d-grid mt-3">
                                                <SpkButton
                                                    Buttontype="submit"
                                                    Customclass="btn btn-primary"
                                                >
                                                    Ingresar
                                                </SpkButton>
                                            </div>
                                        </Form>
                                        <div className="text-center my-3 authentication-barrier">
                                            <span className="op-4 fs-13">O</span>
                                        </div>
                                        <div className="d-grid mb-3">
                                            <SpkButton Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill mb-3">
                                                <span className="avatar avatar-xs">
                                                    <Image
                                                        fill
                                                        src="../../../assets/images/media/apps/google.png"
                                                        alt=""
                                                    />
                                                </span>
                                                <span className="lh-1 ms-2 fs-13 text-default fw-medium">
                                                    Ingresa con Google
                                                </span>
                                            </SpkButton>
                                            <SpkButton Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill">
                                                <span className="avatar avatar-xs">
                                                    <Image
                                                        fill
                                                        src="../../../assets/images/media/apps/outlook.png"
                                                        alt=""
                                                    />
                                                </span>
                                                <span className="lh-1 ms-2 fs-13 text-default fw-medium">
                                                    Ingresa con Outlook
                                                </span>
                                            </SpkButton>
                                        </div>
                                        <div className="text-center mt-3 fw-medium">
                                            ¿No tienes una cuenta?{" "}
                                            <Link
                                                scroll={false}
                                                href="/authentication/sign-up/cover/"
                                                className="text-primary animated-underline"
                                            >
                                                Regístrate
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* Lado derecho */}
                    <Col xxl={3} xl={3} lg={12} className="d-xl-block d-none px-0">
                        <div className="authentication-cover overflow-hidden">
                            <div className="authentication-cover-logo">
                                <Link scroll={false} href="/landing">
                                    <Image
                                        fill
                                        src="../../../assets/images/brand-logos/toggle-logo.png"
                                        alt="logo"
                                        className="desktop-dark"
                                    />
                                </Link>
                            </div>
                            <div className="authentication-cover-background">
                                <Image
                                    fill
                                    src="../../../assets/images/media/backgrounds/9.png"
                                    alt=""
                                />
                            </div>
                            <div className="authentication-cover-content">
                                <div className="p-5">
                                    <h3 className="fw-semibold lh-base">
                                        Bienvenido a <span style={{ color: "#5976ef" }}>Siladocs</span>
                                    </h3>
                                    <p className="mb-0 text-muted fw-medium">
                                        Administra los sílabos de tu institución de forma segura y
                                        trazable con tecnología blockchain.
                                    </p>
                                </div>
                                <div>
                                    <Image
                                        fill
                                        src="../../../assets/images/media/media-72.png"
                                        alt=""
                                        className="img-fluid"
                                    />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <ToastContainer />
            </motion.div>
        </Fragment>
    );
};

export default Cover;

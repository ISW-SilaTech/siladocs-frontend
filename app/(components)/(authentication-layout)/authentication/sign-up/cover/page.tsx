"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Fragment, useState } from "react";
import { Card, Col, Form, Row, Button, InputGroup } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

//Efectos
import { motion } from "framer-motion";

interface CoverProps { }

const Cover: React.FC<CoverProps> = () => {

    const [values, setValues] = useState<any>({
        // token is separate from the administrator name
        token: '',
        name: '',
        email: '',
        password: '',
        institutionId: '',
        institutionName: '',
        showPassword: false
    });

    // Token validation states
    const [tokenValidated, setTokenValidated] = useState<boolean>(false);
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});
    const router = useRouter();

    // Función de validación del formulario final
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

        if (!values.name) {
            newErrors.name = "El nombre es requerido.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Función REAL para validar el código en el Backend
    const handleValidateToken = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (tokenValidated) return;

        if (!values.token) {
            toast.warn('Ingresa un código antes de validar');
            return;
        }

        setIsValidating(true);

        try {
            // Hacemos la llamada real a tu Spring Boot
            const response = await fetch(`http://localhost:8080/auth/validate-code?code=${values.token}`);

            if (response.ok) {
                const data = await response.json(); // ⬅️ Extraemos la data del backend
                setIsValidating(false);
                setTokenValidated(true);

                // ⬅️ Actualizamos el estado con el nombre de la institución
                setValues((prev: any) => ({ ...prev, institutionName: data.institutionName }));

                toast.success('¡Código válido!');
            } else {
                // Si el backend responde 400 o error (no existe, expiró, o ya se usó)
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || "Código inválido, expirado o ya utilizado.");
            }

        } catch (err: any) {
            setIsValidating(false);
            setTokenValidated(false); // Bloqueamos el formulario
            toast.error(err.message);
        }
    };

    // Envío final de los datos a Spring Boot
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (validate()) {
            try {
                // Mapeamos los datos de React a los que espera el Backend (DTO)
                const payload = {
                    accessCode: values.token,  // En tu backend se llama accessCode
                    fullName: values.name,     // En tu backend se llama fullName
                    email: values.email,
                    password: values.password
                    // Ya NO enviamos institutionId, el backend lo deduce del accessCode
                };

                const response = await fetch("http://localhost:8080/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/hal+json"
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok || response.status === 201) {
                    const data = await response.json();

                    // ¡Éxito! Guardamos el token JWT en el LocalStorage
                    localStorage.setItem('siladocs_token', data.token);

                    toast.success("Cuenta creada correctamente", {
                        position: "top-right",
                        autoClose: 1500,
                    });

                    // Puedes redirigir a dashboard o login según tu flujo
                    setTimeout(() => {
                        router.push("/dashboards/general");
                    }, 1500);

                } else {
                    // Manejo de errores que vienen de Spring Boot (Ej: código ya usado)
                    const errorData = await response.json();
                    toast.error(errorData.error || errorData.message || "Error en el registro");
                    setTokenValidated(false); // Reseteamos la validación si falló
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
                <style>{`
                .terms-link {
                    color: #4767ed;
                    text-decoration: none;
                    transition: text-decoration 0.2s;
                }
                .terms-link:hover {
                    text-decoration: underline;
                    color: #4767ed;
                }
                /* Disabled controls visual treatment */
                .form-control:disabled,
                .form-select:disabled {
                    background-color: #e9ecef !important;
                    color: #6c757d !important;
                    opacity: 1 !important;
                }
                /* Make SpkButton look disabled when Disabled prop is true by adding opacity */
                .btn.opacity-50 {
                    opacity: 0.5 !important;
                    pointer-events: none;
                    filter: grayscale(30%);
                }
                `}</style>
                <Seo title="Signup-Cover" />
                <Row className="authentication authentication-cover-main mx-0">
                    <Col xxl={9} xl={9}>
                        <Row className="justify-content-center align-items-center h-100">
                            <Col xxl={4} xl={5} lg={6} md={6} sm={8} className="col-12">
                                <Card className="custom-card border-0  shadow-none my-4">
                                    {/* Link simple a /dashboard/school */}
                                    <Link href="/dashboards/general" className="btn btn-primary">
                                        Ir al sistema
                                    </Link>
                                    <Card.Body className="p-5">
                                        <div>
                                            <h4 className="mb-1 fw-semibold">Asocia una cuenta educativa</h4>

                                            <p className="mb-4 text-muted fw-normal">Por favor ingresar credenciales válidas</p>
                                        </div>
                                        <Form onSubmit={handleSubmit}>
                                            <Row className="gy-3">
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="user-token" className="text-default">Código de acceso</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type="text"
                                                            id="user-token"
                                                            placeholder="Ingresa el código de acceso"
                                                            value={values.token}
                                                            onChange={(e) => setValues({ ...values, token: e.target.value })}
                                                            disabled={tokenValidated}
                                                        />
                                                        <Button
                                                            variant={tokenValidated ? 'success' : 'primary'}
                                                            onClick={handleValidateToken}
                                                            disabled={isValidating || tokenValidated}
                                                        >
                                                            {isValidating ? 'Validando...' : tokenValidated ? 'Válido' : 'Validar'}
                                                        </Button>
                                                    </InputGroup>
                                                </Col>
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="signup-institution" className="text-default">
                                                        Institución asignada
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        id="signup-institution"
                                                        placeholder={tokenValidated ? "Cargando..." : "Se asignará al validar el código"}
                                                        value={values.institutionName} // ⬅️ Muestra el nombre automático
                                                        disabled={true} // ⬅️ Siempre bloqueado para que no lo editen
                                                        className="bg-light" // Un fondito gris para que se note que es de solo lectura
                                                    />
                                                </Col>
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="signin-email" className="text-default">Correo del Administrador</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        className="form-control "
                                                        id="signup-firstname"
                                                        placeholder="Ingresa el correo electrónico"
                                                        value={values.email}
                                                        onChange={(e) => setValues({ ...values, email: e.target.value })}
                                                        isInvalid={!!errors.email}
                                                        disabled={!tokenValidated}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                                </Col>
                                                <Col xl={12}>
                                                    <Form.Label htmlFor="signup-username" className="text-default">Nombre del Administrador</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        className=""
                                                        id="signup-username"
                                                        placeholder="Ingresa el nombre completo"
                                                        value={values.name}
                                                        onChange={(e) => setValues({ ...values, name: e.target.value })}
                                                        disabled={!tokenValidated}
                                                    />
                                                </Col>
                                                <Col xl={12} className="mb-2">
                                                    <Form.Label htmlFor="signin-password" className="text-default d-block">Contraseña</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type={values.showPassword ? "text" : "password"}
                                                            className="form-control "
                                                            id="signup-password"
                                                            placeholder="Password"
                                                            value={values.password}
                                                            onChange={(e) => setValues({ ...values, password: e.target.value })}
                                                            isInvalid={!!errors.password}
                                                            disabled={!tokenValidated}
                                                        />
                                                        <Link scroll={false} href="#!" className="show-password-button text-muted"
                                                            onClick={() => setValues((prev: any) => ({ ...prev, showPassword: !prev.showPassword }))}>
                                                            {values.showPassword ? (
                                                                <i className="ri-eye-line align-middle"></i>
                                                            ) : (
                                                                <i className="ri-eye-off-line align-middle"></i>
                                                            )}
                                                        </Link>
                                                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>   </div>
                                                </Col>
                                                {/* Terms & Conditions */}
                                                <div className="mt-2">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="defaultCheck1" defaultChecked />
                                                        <label className="form-check-label" htmlFor="defaultCheck1">
                                                            Acepto los
                                                            {" "}
                                                            <a
                                                                href="https://www.ejemplo.com/terminos"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="terms-link"
                                                            >
                                                                términos y condiciones
                                                            </a>
                                                        </label>
                                                    </div>
                                                </div>
                                            </Row>
                                            <div className="d-grid mt-3">
                                                <SpkButton Buttontype="submit" Customclass="btn btn-primary" Disabled={!tokenValidated}>Crear cuenta</SpkButton>
                                            </div>
                                        </Form>
                                        <div className="text-center my-3 authentication-barrier">
                                            <span className="op-4 fs-13">O</span>
                                        </div>
                                        <div className="d-grid mb-3">
                                            <SpkButton
                                                Customclass={`btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill mb-3 ${!tokenValidated ? 'opacity-50' : ''}`}
                                                Disabled={!tokenValidated}
                                            >
                                                <span className="avatar avatar-xs">
                                                    <Image fill src="../../../assets/images/media/apps/google.png" alt="" />
                                                </span>
                                                <span className="lh-1 ms-2 fs-13 text-default fw-medium">Regístrate con Google</span>
                                            </SpkButton>
                                            <SpkButton
                                                Customclass={`btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill ${!tokenValidated ? 'opacity-50' : ''}`}
                                                Disabled={!tokenValidated}
                                            >
                                                <span className="avatar avatar-xs">
                                                    <Image fill src="../../../assets/images/media/apps/outlook.png" alt="" />
                                                </span>
                                                <span className="lh-1 ms-2 fs-13 text-default fw-medium">Regístrate con Outlook</span>
                                            </SpkButton>
                                        </div>
                                        <div className="text-center mt-3 fw-medium">
                                            ¿Ya tienes una cuenta? <Link scroll={false} href="/authentication/sign-in/cover/" className="text-primary animated-underline">  Ingresar</Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
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
                                        Bienvenido a <span style={{ color: "#5976ef" }}>Siladocs</span>
                                    </h3>

                                    <p className="mb-0 text-muted fw-medium">Administra los sílabos de tu institución de forma segura y trazable con tecnología blockchain.</p>
                                </div>
                                <div>
                                    <Image fill src="../../../assets/images/media/media-72.png" alt="" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <ToastContainer />
            </motion.div>

        </Fragment>
    )
};

export default Cover;

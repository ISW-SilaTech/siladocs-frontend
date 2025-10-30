"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons"
import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect"
import { Languagedata, timeZoneOptions } from "@/shared/data/pages/profilesettingdata"
import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import Seo from "@/shared/layouts-components/seo/seo"
import Image from "next/image"
import Link from "next/link"
import React, { Fragment, useState, useEffect } from "react" // 🔹 Importado useEffect
import { Card, Col, Form, Row, Alert, Spinner } from "react-bootstrap" // 🔹 Importado Alert y Spinner
import { useForm } from 'react-hook-form' // 🔹 Importado useForm
import { toast, ToastContainer } from "react-toastify" // 🔹 Importado ToastContainer
import axios from 'axios' // 🔹 Importado axios

// -----------------------------------------------------------------
// 🔹 Simulación de un hook de autenticación
// En tu aplicación real, obtendrías estos datos de tu contexto de sesión.
const useAuth = () => {
    // Simula la carga de datos del usuario (Luis Zárate)
    const [user, setUser] = useState<{name: string, email: string, role: string} | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simula una carga de sesión
        setTimeout(() => {
            setUser({
                name: "Luis Zárate", // Dato de tu contexto
                email: "luis.zarate@institucion.com", // Email del usuario
                role: "Administrador" // O "ROLE_ADMIN"
            });
            setIsLoading(false);
        }, 500);
    }, []);

    return { user, isLoading };
};
// -----------------------------------------------------------------


interface ProfileSettingsProps { }

const ProfileSettings: React.FC<ProfileSettingsProps> = () => {

    const { user, isLoading: isUserLoading } = useAuth(); // 🔹 Carga datos del usuario

    // --- Estado para el formulario de cambio de contraseña ---
    const {
        register,
        handleSubmit,
        watch,
        reset: resetPasswordForm, // 🔹 Para limpiar el formulario
        formState: { errors },
    } = useForm();

    const [passwordVisibility, setPasswordVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // --- Estado para el formulario de perfil (Nombre) ---
    const [name, setName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // 🔹 Carga el nombre del usuario en el estado del formulario cuando el usuario carga
    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);


    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // 🔹 Función para guardar cambios de perfil (ej. nombre)
    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        // Lógica de API para PUT /api/profile (ejemplo)
        console.log("Guardando nombre:", name);
        await new Promise(r => setTimeout(r, 1000)); // Simula llamada API
        setIsSavingProfile(false);
        toast.success("Perfil actualizado correctamente.");
    };

    // 🔹 Función para guardar nueva contraseña
    const onSubmitPassword = async (data: any) => {
        setIsSavingPassword(true);
        setPasswordError(null);
        try {
            // 🔹 Llama a un endpoint hipotético de backend
            // const response = await axios.post('/api/auth/change-password', {
            //     currentPassword: data.currentPassword,
            //     newPassword: data.newPassword
            // });
            
            // Simulación de éxito
            await new Promise(r => setTimeout(r, 1500)); 
            // throw new Error("Tu contraseña actual es incorrecta"); // Descomenta para probar error

            toast.success("Contraseña cambiada exitosamente.");
            resetPasswordForm(); // Limpia el formulario

        } catch (error: any) {
            console.error("Error cambiando contraseña:", error);
            const message = error.response?.data?.error || error.message || "Error al cambiar la contraseña.";
            setPasswordError(message);
            toast.error(message);
        } finally {
            setIsSavingPassword(false);
        }
    };

    const newPassword = watch('newPassword');

    // Estado para los toggles de notificación
    const [toggles, setToggles] = useState<{ [key: string]: string }>({});
    const toggle = (toggleKey: string) => {
        setToggles((prevState) => ({
            ...prevState,
            [toggleKey]: prevState[toggleKey] === 'on' ? 'off' : 'on',
        }));
    };

    return (
        <Fragment>
            <Seo title="Configuración de Perfil" />
            <Pageheader title="Configuración" currentpage="Perfil de Usuario" activepage="Configuración" />
            <ToastContainer />

            <Row>
                {/* 🔹 COLUMNA IZQUIERDA: TARJETA DE PERFIL (INFO) 🔹 */}
                <Col xl={4}>
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">Perfil</div>
                        </Card.Header>
                        <Card.Body>
                            {isUserLoading ? (
                                <div className="text-center"><Spinner animation="border" /></div>
                            ) : (
                                <>
                                    <div className="d-flex flex-column align-items-center text-center">
                                        <span className="avatar avatar-xxl mb-3">
                                            <Image width={80} height={80} src="../../assets/images/faces/9.jpg" alt="" />
                                        </span>
                                        <h5 className="mb-1 fw-semibold">{user?.name}</h5>
                                        <p className="fs-14 text-muted mb-3">{user?.email}</p>
                                        <span className="badge bg-primary-transparent rounded-pill mb-3">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <SpkButton Buttonvariant='primary' Customclass="btn-sm btn-wave me-1">
                                            <i className="ri-upload-2-line me-1"></i>Cambiar Foto
                                        </SpkButton>
                                        <SpkButton Buttonvariant='light' Customclass="btn-sm btn-wave">
                                            <i className="ri-delete-bin-line"></i>Eliminar
                                        </SpkButton>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">Seguridad</div>
                        </Card.Header>
                        <Card.Body>
                             <div className="d-flex align-items-top justify-content-between">
                                <div>
                                    <p className="fs-14 mb-1 fw-medium">Verificación en 2 Pasos</p>
                                    <p className="fs-12 mb-0 text-muted">Protege tu cuenta contra accesos no autorizados.</p>
                                </div>
                                <Link scroll={false} href="#!" className="link-primary text-decoration-underline">Configurar</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 🔹 COLUMNA DERECHA: TARJETAS DE ACCIÓN 🔹 */}
                <Col xl={8}>
                    {/* --- Tarjeta de Información de Cuenta --- */}
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">Información de la Cuenta</div>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleProfileSave}>
                                <Row className="gy-3">
                                    <Col xl={6}>
                                        <Form.Label htmlFor="profile-user-name">Nombre de Usuario</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="profile-user-name"
                                            placeholder="Ingresa tu nombre"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={isUserLoading || isSavingProfile}
                                        />
                                    </Col>
                                    <Col xl={6}>
                                        <Form.Label htmlFor="profile-email">Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            id="profile-email"
                                            placeholder="Ingresa tu email"
                                            value={user?.email || ""}
                                            disabled // El email no se debe poder cambiar
                                        />
                                    </Col>
                                    <Col xl={12}>
                                        <Form.Label>Preferencias</Form.Label>
                                    </Col>
                                    <Col xl={6}>
                                        <SpkSelect searchable name="language" option={Languagedata} menuplacement='auto' classNameprefix="Select2" defaultvalue={[Languagedata[3]]} />
                                    </Col>
                                    <Col xl={6}>
                                        <SpkSelect searchable name="timezone" option={timeZoneOptions} menuplacement='auto' classNameprefix="Select2" defaultvalue={[timeZoneOptions[3]]} />
                                    </Col>
                                </Row>
                                <div className="mt-3 text-end">
                                    <SpkButton Buttontype="submit" Buttonvariant='primary' Customclass="btn-wave" Disabled={isSavingProfile}>
                                        {isSavingProfile ? <Spinner as="span" animation="border" size="sm" /> : 'Guardar Cambios'}
                                    </SpkButton>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* --- Tarjeta de Cambio de Contraseña --- */}
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">Cambiar Contraseña</div>
                        </Card.Header>
                        <Card.Body>
                            {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                            <Form onSubmit={handleSubmit(onSubmitPassword)}>
                                <Row className="gy-3">
                                    {/* 🔹 Campo "Contraseña Actual" AÑADIDO */}
                                    <Col xl={12}>
                                        <label htmlFor="currentPassword" className="form-label text-default">Contraseña Actual</label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={passwordVisibility.current ? 'text' : 'password'}
                                                id="currentPassword"
                                                placeholder="Contraseña Actual"
                                                className="form-control"
                                                {...register('currentPassword', { required: 'Se requiere la contraseña actual' })}
                                                disabled={isSavingPassword}
                                            />
                                            <Link scroll={false} href="#!" onClick={() => togglePasswordVisibility('current')} className="show-password-button text-muted"><i className={`${passwordVisibility.current ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`} /></Link>
                                        </div>
                                        {errors.currentPassword && (
                                            <p className="text-danger text-sm mt-1">
                                                {typeof errors.currentPassword === 'string'
                                                    ? errors.currentPassword
                                                    : (errors.currentPassword as any)?.message}
                                            </p>
                                        )}
                                    </Col>

                                    <Col xl={6}>
                                        <label htmlFor="newPassword" className="form-label text-default">Nueva Contraseña</label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={passwordVisibility.new ? 'text' : 'password'}
                                                id="newPassword"
                                                placeholder="Nueva Contraseña"
                                                className="form-control"
                                                {...register('newPassword', {
                                                    required: 'Se requiere nueva contraseña',
                                                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                                                })}
                                                disabled={isSavingPassword}
                                            />
                                            <Link scroll={false} href="#!" onClick={() => togglePasswordVisibility('new')} className="show-password-button text-muted"><i className={`${passwordVisibility.new ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`} /></Link>
                                        </div>
                                        {errors.newPassword && <p className="text-danger text-sm mt-1">{String(errors.newPassword?.message)}</p>}
                                    </Col>

                                    <Col xl={6}>
                                        <label htmlFor="confirmPassword" className="form-label text-default">Confirmar Contraseña</label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={passwordVisibility.confirm ? 'text' : 'password'}
                                                id="confirmPassword"
                                                placeholder="Confirmar Contraseña"
                                                className="form-control"
                                                {...register('confirmPassword', {
                                                    required: 'Por favor confirma la contraseña',
                                                    validate: (value: any) => value === newPassword || 'Las contraseñas no coinciden',
                                                })}
                                                disabled={isSavingPassword}
                                            />
                                            <Link scroll={false} href="#!" onClick={() => togglePasswordVisibility('confirm')} className="show-password-button text-muted"><i className={`${passwordVisibility.confirm ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`} /></Link>
                                        </div>
                                        {errors.confirmPassword && <p className="text-danger text-sm mt-1">{String(errors.confirmPassword?.message)}</p>}
                                    </Col>
                                </Row>
                                <div className="mt-3 text-end">
                                    <SpkButton Buttontype="submit" Buttonvariant='primary' Customclass="btn-wave" Disabled={isSavingPassword}>
                                        {isSavingPassword ? <Spinner as="span" animation="border" size="sm" /> : 'Actualizar Contraseña'}
                                    </SpkButton>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* --- Tarjeta de Notificaciones (Mantenida) --- */}
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">Notificaciones</div>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-top justify-content-between mt-sm-0 mt-3">
                                <div className="mail-notification-settings">
                                    <p className="fs-14 mb-1 fw-medium">Notificaciones en la App</p>
                                    <p className="fs-12 mb-0 text-muted">Alertas dentro de la aplicación.</p>
                                </div>
                                <div className={`toggle mb-0 float-sm-end toggle-success ${toggles['app'] === 'on' || !toggles['app'] ? 'on' : ''}`} onClick={() => toggle('app')} >
                                    <span></span>
                                </div>
                            </div>
                            <div className="d-flex align-items-top justify-content-between mt-3">
                                <div className="mail-notification-settings">
                                    <p className="fs-14 mb-1 fw-medium">Notificaciones por Email</p>
                                    <p className="fs-12 mb-0 text-muted">Mensajes enviados a tu correo.</p>
                                </div>
                                <div className={`toggle mb-0 float-sm-end toggle-success ${toggles['email'] === 'on' || !toggles['email'] ? 'on' : ''}`} onClick={() => toggle('email')} >
                                    <span></span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    )
}

export default ProfileSettings;

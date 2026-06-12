"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons"
import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect"
import { Languagedata, timeZoneOptions } from "@/shared/data/pages/profilesettingdata"
import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import Seo from "@/shared/layouts-components/seo/seo"
import React, { Fragment, useState, useEffect, useRef } from "react"
import { Card, Col, Form, Row, Alert, Spinner, Modal } from "react-bootstrap"
import { useForm } from 'react-hook-form'
import { toast, ToastContainer } from "react-toastify"
import { useAuth } from "@/shared/contextapi"
import { ProfileService, UserProfile } from "@/shared/services/profile.service"
import Link from "next/link"

const ProfileSettings: React.FC = () => {
    const { user, institution, loading: authLoading } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    const [fullName, setFullName] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState(Languagedata[3]);
    const [selectedTimezone, setSelectedTimezone] = useState(timeZoneOptions[3]);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        watch,
        reset: resetPasswordForm,
        formState: { errors },
    } = useForm();

    const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false });
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const [toggles, setToggles] = useState<Record<string, boolean>>({ app: true, email: true, blockchain: true, security: true });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Load profile from backend
    useEffect(() => {
        if (authLoading) return;
        const load = async () => {
            try {
                const data = await ProfileService.getProfile();
                setProfile(data);
                setFullName(data.fullName || user?.email?.split('@')[0] || '');
                if (data.language) {
                    const lang = Languagedata.find(l => l.value === data.language);
                    if (lang) setSelectedLanguage(lang);
                }
                if (data.timezone) {
                    const tz = timeZoneOptions.find(t => t.value === data.timezone);
                    if (tz) setSelectedTimezone(tz);
                }
            } catch {
                // Fallback: use auth context data
                setFullName(user?.email?.split('@')[0] || '');
                toast.warn('No se pudo cargar el perfil completo. Se muestran datos básicos de la sesión.');
            } finally {
                setIsLoadingProfile(false);
            }
        };
        load();
    }, [authLoading, user]);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("La imagen no puede superar 5 MB."); return; }

        setAvatarPreview(URL.createObjectURL(file));
        setIsUploadingAvatar(true);
        try {
            await ProfileService.uploadAvatar(file);
            toast.success("Foto de perfil actualizada.");
        } catch {
            toast.error("No se pudo subir la foto. El servidor no soporta avatares aún.");
            setAvatarPreview(null);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) { toast.error("El nombre no puede estar vacío."); return; }
        setIsSavingProfile(true);
        try {
            const updated = await ProfileService.updateProfile({
                fullName: fullName.trim(),
                language: selectedLanguage?.value,
                timezone: selectedTimezone?.value,
            });
            setProfile(updated);
            toast.success("Perfil actualizado correctamente.");
        } catch {
            toast.error("Error al guardar el perfil. Inténtalo de nuevo.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const onSubmitPassword = async (data: any) => {
        setIsSavingPassword(true);
        setPasswordError(null);
        try {
            await ProfileService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success("Contraseña cambiada exitosamente.");
            resetPasswordForm();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || "Error al cambiar la contraseña.";
            setPasswordError(msg);
            toast.error(msg);
        } finally {
            setIsSavingPassword(false);
        }
    };

    const newPassword = watch('newPassword');
    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') =>
        setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));

    const displayName = profile?.fullName || fullName || user?.email || '—';
    const displayEmail = profile?.email || user?.email || '—';
    const displayRole = profile?.role || user?.role || '—';
    const displayInstitution = profile?.institutionName || institution?.name || '—';
    const avatarSrc = avatarPreview || profile?.avatarUrl || '/assets/images/faces/9.jpg';

    const isLoading = authLoading || isLoadingProfile;

    // Helper: Rol badge color
    const getRoleBadgeVariant = () => {
        switch(displayRole?.toLowerCase()) {
            case 'rector': return 'bg-primary-transparent text-primary';
            case 'administrador académico': return 'bg-info-transparent text-info';
            case 'docente': return 'bg-success-transparent text-success';
            case 'auditor': return 'bg-warning-transparent text-warning';
            default: return 'bg-secondary-transparent text-secondary';
        }
    };

    return (
        <Fragment>
            <Seo title="Configuración de Perfil" />
            <Pageheader title="Configuración" currentpage="Perfil de Usuario" activepage="Configuración" />
            <ToastContainer position="top-right" autoClose={3000} />

            {profileError && (
                <Alert variant="warning" className="mb-3" dismissible onClose={() => setProfileError(null)}>
                    <i className="ri-alert-line me-2"></i>{profileError}
                </Alert>
            )}

            <Row className="g-3">
                {/* LEFT COLUMN */}
                <Col xl={4}>
                    {/* Avatar Card */}
                    <Card className="custom-card text-center shadow-sm">
                        <Card.Body className="p-4">
                            {isLoading ? (
                                <div className="py-4"><Spinner animation="border" variant="primary" /></div>
                            ) : (
                                <>
                                    <div className="position-relative d-inline-block mb-3">
                                        <span
                                            className="avatar avatar-xxl"
                                            style={{ cursor: 'pointer', border: '4px solid #e9ecef', borderRadius: '50%', overflow: 'hidden', display: 'inline-flex' }}
                                            onClick={handleAvatarClick}
                                            title="Cambiar foto"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={avatarSrc}
                                                alt="Avatar"
                                                width={80} height={80}
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/faces/9.jpg'; }}
                                            />
                                        </span>
                                        {isUploadingAvatar && (
                                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
                                                <Spinner animation="border" size="sm" variant="light" />
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
                                    </div>

                                    <h5 className="mb-1 fw-semibold text-dark">{displayName}</h5>
                                    <p className="fs-13 text-muted mb-1">{displayEmail}</p>
                                    <p className="fs-12 text-muted mb-3">
                                        <i className="ri-building-line me-1"></i>{displayInstitution}
                                    </p>
                                    <span className={`badge rounded-pill mb-3 fw-semibold px-3 py-2 ${getRoleBadgeVariant()}`}>
                                        {displayRole}
                                    </span>

                                    <div className="d-flex justify-content-center gap-2 mt-2">
                                        <button className="btn btn-sm btn-primary btn-wave" onClick={handleAvatarClick} disabled={isUploadingAvatar} title="Cambiar foto de perfil">
                                            <i className="ri-upload-2-line me-1"></i>Cambiar Foto
                                        </button>
                                        {avatarPreview && (
                                            <button className="btn btn-sm btn-light btn-wave" onClick={() => setAvatarPreview(null)} title="Cancelar cambio de foto">
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Institution Info */}
                    <Card className="custom-card shadow-sm">
                        <Card.Header className="bg-light border-bottom">
                            <div className="card-title d-flex align-items-center gap-2 mb-0">
                                <i className="ri-building-2-line text-primary"></i>Institución
                            </div>
                        </Card.Header>
                        <Card.Body className="p-3">
                            {isLoading ? <Spinner animation="border" size="sm" /> : (
                                <div className="d-flex align-items-center gap-3">
                                    <div className="avatar avatar-md bg-primary-transparent rounded">
                                        <i className="ri-building-2-fill text-primary fs-5"></i>
                                    </div>
                                    <div>
                                        <p className="fw-semibold mb-0 fs-14 text-dark">{displayInstitution}</p>
                                        <p className="text-muted fs-12 mb-0 text-capitalize">{displayRole}</p>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Security Card */}
                    <Card className="custom-card shadow-sm">
                        <Card.Header className="bg-light border-bottom">
                            <div className="card-title d-flex align-items-center gap-2 mb-0">
                                <i className="ri-shield-check-line text-success"></i>Seguridad
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-start justify-content-between mb-3 pb-3 border-bottom">
                                <div>
                                    <p className="fs-14 mb-1 fw-semibold text-dark">Verificación en 2 Pasos</p>
                                    <p className="fs-12 mb-0 text-muted">Protege tu cuenta contra accesos no autorizados.</p>
                                </div>
                                <span className="badge bg-warning rounded-pill text-dark fw-semibold px-2 py-1" style={{fontSize:'11px'}}>Inactivo</span>
                            </div>
                            <div className="d-flex align-items-start justify-content-between">
                                <div>
                                    <p className="fs-14 mb-1 fw-semibold text-dark">Sesiones activas</p>
                                    <p className="fs-12 mb-0 text-muted">Administra los dispositivos conectados.</p>
                                </div>
                                <Link href="#!" className="btn btn-sm btn-light btn-wave" title="Ver sesiones activas">Ver</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* RIGHT COLUMN */}
                <Col xl={8}>
                    {/* Account Info */}
                    <Card className="custom-card shadow-sm">
                        <Card.Header className="bg-light border-bottom">
                            <div className="card-title d-flex align-items-center gap-2 mb-0">
                                <i className="ri-user-line text-info"></i>Información de la Cuenta
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleProfileSave}>
                                <Row className="gy-3">
                                    <Col sm={6}>
                                        <Form.Label htmlFor="profile-name" className="fw-semibold">Nombre completo</Form.Label>
                                        <Form.Control
                                            id="profile-name"
                                            type="text"
                                            placeholder="Tu nombre completo"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            disabled={isLoading || isSavingProfile}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label htmlFor="profile-email" className="fw-semibold">Email</Form.Label>
                                        <Form.Control
                                            id="profile-email"
                                            type="email"
                                            value={displayEmail}
                                            disabled
                                            className="bg-light text-muted"
                                        />
                                        <Form.Text className="text-muted fs-12"><i className="ri-lock-line me-1"></i>Solo lectura</Form.Text>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label htmlFor="profile-role" className="fw-semibold">Rol</Form.Label>
                                        <Form.Control
                                            id="profile-role"
                                            type="text"
                                            value={displayRole}
                                            disabled
                                            className="bg-light text-muted text-capitalize"
                                        />
                                        <Form.Text className="text-muted fs-12"><i className="ri-lock-line me-1"></i>Solo lectura</Form.Text>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label htmlFor="profile-institution" className="fw-semibold">Institución</Form.Label>
                                        <Form.Control
                                            id="profile-institution"
                                            type="text"
                                            value={displayInstitution}
                                            disabled
                                            className="bg-light text-muted"
                                        />
                                        <Form.Text className="text-muted fs-12"><i className="ri-lock-line me-1"></i>Solo lectura</Form.Text>
                                    </Col>
                                    <Col xs={12}>
                                        <hr className="my-2" />
                                        <Form.Label className="fw-semibold text-dark mb-2 d-flex align-items-center gap-2">
                                            <i className="ri-settings-3-line"></i>Preferencias
                                        </Form.Label>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label className="fw-semibold">Idioma</Form.Label>
                                        <SpkSelect
                                            searchable
                                            name="language"
                                            option={Languagedata}
                                            menuplacement="auto"
                                            classNameprefix="Select2"
                                            defaultvalue={[selectedLanguage]}
                                            onfunchange={(val: any) => setSelectedLanguage(val)}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label className="fw-semibold">Zona Horaria</Form.Label>
                                        <SpkSelect
                                            searchable
                                            name="timezone"
                                            option={timeZoneOptions}
                                            menuplacement="auto"
                                            classNameprefix="Select2"
                                            defaultvalue={[selectedTimezone]}
                                            onfunchange={(val: any) => setSelectedTimezone(val)}
                                        />
                                    </Col>
                                </Row>
                                <div className="mt-3 d-flex justify-content-end gap-2">
                                    <Link href="/dashboards/general" className="btn btn-light btn-wave">
                                        <i className="ri-close-line me-1"></i>Cancelar
                                    </Link>
                                    <SpkButton Buttontype="submit" Buttonvariant="primary" Customclass="btn-wave" Disabled={isLoading || isSavingProfile}>
                                        {isSavingProfile
                                            ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</>
                                            : <><i className="ri-save-line me-1"></i>Guardar Cambios</>}
                                    </SpkButton>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Change Password */}
                    <Card className="custom-card shadow-sm">
                        <Card.Header className="bg-light border-bottom">
                            <div className="card-title d-flex align-items-center gap-2 mb-0">
                                <i className="ri-lock-line text-danger"></i>Cambiar Contraseña
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {passwordError && (
                                <Alert variant="danger" dismissible onClose={() => setPasswordError(null)}>
                                    <i className="ri-error-warning-line me-1"></i>{passwordError}
                                </Alert>
                            )}
                            <Form onSubmit={handleSubmit(onSubmitPassword)}>
                                <Row className="gy-3">
                                    <Col xs={12}>
                                        <Form.Label className="fw-semibold">Contraseña Actual</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={passwordVisibility.current ? 'text' : 'password'}
                                                placeholder="Tu contraseña actual"
                                                isInvalid={!!errors.currentPassword}
                                                {...register('currentPassword', { required: 'Requerido' })}
                                                disabled={isSavingPassword}
                                            />
                                            <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3" onClick={() => togglePasswordVisibility('current')} style={{ border: 'none', background: 'none' }} title="Mostrar/ocultar">
                                                <i className={passwordVisibility.current ? 'ri-eye-line' : 'ri-eye-off-line'} />
                                            </button>
                                        </div>
                                        {errors.currentPassword && <Form.Text className="text-danger fs-12"><i className="ri-error-warning-line me-1"></i>{String((errors.currentPassword as any)?.message)}</Form.Text>}
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label className="fw-semibold">Nueva Contraseña</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={passwordVisibility.new ? 'text' : 'password'}
                                                placeholder="Mínimo 8 caracteres"
                                                isInvalid={!!errors.newPassword}
                                                {...register('newPassword', {
                                                    required: 'Requerido',
                                                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                                                })}
                                                disabled={isSavingPassword}
                                            />
                                            <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3" onClick={() => togglePasswordVisibility('new')} style={{ border: 'none', background: 'none' }} title="Mostrar/ocultar">
                                                <i className={passwordVisibility.new ? 'ri-eye-line' : 'ri-eye-off-line'} />
                                            </button>
                                        </div>
                                        {errors.newPassword && <Form.Text className="text-danger fs-12"><i className="ri-error-warning-line me-1"></i>{String(errors.newPassword?.message)}</Form.Text>}
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label className="fw-semibold">Confirmar Contraseña</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={passwordVisibility.confirm ? 'text' : 'password'}
                                                placeholder="Repite la nueva contraseña"
                                                isInvalid={!!errors.confirmPassword}
                                                {...register('confirmPassword', {
                                                    required: 'Requerido',
                                                    validate: v => v === newPassword || 'Las contraseñas no coinciden',
                                                })}
                                                disabled={isSavingPassword}
                                            />
                                            <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3" onClick={() => togglePasswordVisibility('confirm')} style={{ border: 'none', background: 'none' }} title="Mostrar/ocultar">
                                                <i className={passwordVisibility.confirm ? 'ri-eye-line' : 'ri-eye-off-line'} />
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <Form.Text className="text-danger fs-12"><i className="ri-error-warning-line me-1"></i>{String(errors.confirmPassword?.message)}</Form.Text>}
                                    </Col>
                                </Row>
                                <div className="mt-3 d-flex justify-content-end gap-2">
                                    <button type="reset" className="btn btn-light btn-wave">
                                        <i className="ri-close-line me-1"></i>Limpiar
                                    </button>
                                    <SpkButton Buttontype="submit" Buttonvariant="primary" Customclass="btn-wave" Disabled={isSavingPassword}>
                                        {isSavingPassword
                                            ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Actualizando...</>
                                            : <><i className="ri-lock-line me-1"></i>Actualizar Contraseña</>}
                                    </SpkButton>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Notifications */}
                    <Card className="custom-card shadow-sm">
                        <Card.Header className="bg-light border-bottom">
                            <div className="card-title d-flex align-items-center gap-2 mb-0">
                                <i className="ri-notification-3-line text-success"></i>Notificaciones
                            </div>
                        </Card.Header>
                        <Card.Body className="py-2">
                            {[
                                { key: 'app', title: 'Notificaciones en la App', desc: 'Alertas dentro de la plataforma.', icon: 'ri-notification-3-line' },
                                { key: 'email', title: 'Notificaciones por Email', desc: 'Mensajes enviados a tu correo.', icon: 'ri-mail-line' },
                                { key: 'blockchain', title: 'Alertas de Blockchain', desc: 'Confirmaciones de registros en Fabric.', icon: 'ri-links-line' },
                                { key: 'security', title: 'Alertas de Seguridad', desc: 'Inicios de sesión y cambios de contraseña.', icon: 'ri-shield-check-line' },
                            ].map(({ key, title, desc, icon }) => (
                                <div key={key} className="d-flex align-items-center justify-content-between py-3 border-bottom last-child-no-border">
                                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                                        <div className="avatar avatar-sm bg-primary-transparent rounded">
                                            <i className={`${icon} text-primary fs-5`}></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="fs-14 mb-0 fw-semibold text-dark">{title}</p>
                                            <p className="fs-12 mb-0 text-muted">{desc}</p>
                                        </div>
                                    </div>
                                    <div className="ms-2">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`toggle-${key}`}
                                                checked={toggles[key]}
                                                onChange={() => setToggles(p => ({ ...p, [key]: !p[key] }))}
                                                style={{cursor: 'pointer'}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="custom-card shadow-sm border-danger">
                        <Card.Header className="bg-danger-light border-bottom border-danger">
                            <div className="card-title d-flex align-items-center gap-2 mb-0 text-danger">
                                <i className="ri-error-warning-line"></i>Zona de Peligro
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="fw-semibold mb-1 text-dark">Eliminar cuenta</p>
                                    <p className="text-muted fs-13 mb-0">Esta acción es permanente e irreversible. Se eliminarán todos tus datos y no podrá ser revertida.</p>
                                </div>
                                <button className="btn btn-danger btn-wave text-nowrap ms-3" onClick={() => setShowDeleteModal(true)}>
                                    <i className="ri-delete-bin-line me-1"></i>Eliminar
                                </button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Delete Account Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="border-danger">
                    <Modal.Title className="text-danger">
                        <i className="ri-error-warning-line me-2"></i>Confirmar Eliminación de Cuenta
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="danger">
                        <p className="fw-semibold mb-2"><i className="ri-alert-line me-2"></i>Advertencia</p>
                        <p className="mb-0">Estás a punto de eliminar tu cuenta de forma permanente. Esta acción no puede deshacerse.</p>
                    </Alert>
                    <p className="text-muted mb-0">Se eliminarán:</p>
                    <ul className="text-muted small mt-2">
                        <li>Tu perfil de usuario</li>
                        <li>Todos tus sílabos y documentos</li>
                        <li>Tu historial de acciones</li>
                        <li>Acceso a la plataforma</li>
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-light" onClick={() => setShowDeleteModal(false)}>
                        <i className="ri-close-line me-1"></i>Cancelar
                    </button>
                    <button className="btn btn-danger" onClick={() => { toast.error("Función no disponible en esta versión."); setShowDeleteModal(false); }}>
                        <i className="ri-delete-bin-line me-1"></i>Sí, Eliminar Permanentemente
                    </button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default ProfileSettings;

const ProfileSettings: React.FC = () => {
    const { user, institution, loading: authLoading } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    const [fullName, setFullName] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState(Languagedata[3]);
    const [selectedTimezone, setSelectedTimezone] = useState(timeZoneOptions[3]);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        watch,
        reset: resetPasswordForm,
        formState: { errors },
    } = useForm();

    const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false });
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const [toggles, setToggles] = useState<Record<string, boolean>>({ app: true, email: true });

    // Load profile from backend
    useEffect(() => {
        if (authLoading) return;
        const load = async () => {
            try {
                const data = await ProfileService.getProfile();
                setProfile(data);
                setFullName(data.fullName || user?.email?.split('@')[0] || '');
                if (data.language) {
                    const lang = Languagedata.find(l => l.value === data.language);
                    if (lang) setSelectedLanguage(lang);
                }
                if (data.timezone) {
                    const tz = timeZoneOptions.find(t => t.value === data.timezone);
                    if (tz) setSelectedTimezone(tz);
                }
            } catch {
                // Fallback: use auth context data
                setFullName(user?.email?.split('@')[0] || '');
                toast.warn('No se pudo cargar el perfil completo. Se muestran datos básicos de la sesión.');
            } finally {
                setIsLoadingProfile(false);
            }
        };
        load();
    }, [authLoading, user]);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("La imagen no puede superar 5 MB."); return; }

        setAvatarPreview(URL.createObjectURL(file));
        setIsUploadingAvatar(true);
        try {
            await ProfileService.uploadAvatar(file);
            toast.success("Foto de perfil actualizada.");
        } catch {
            toast.error("No se pudo subir la foto. El servidor no soporta avatares aún.");
            setAvatarPreview(null);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) { toast.error("El nombre no puede estar vacío."); return; }
        setIsSavingProfile(true);
        try {
            const updated = await ProfileService.updateProfile({
                fullName: fullName.trim(),
                language: selectedLanguage?.value,
                timezone: selectedTimezone?.value,
            });
            setProfile(updated);
            toast.success("Perfil actualizado correctamente.");
        } catch {
            toast.error("Error al guardar el perfil. Inténtalo de nuevo.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const onSubmitPassword = async (data: any) => {
        setIsSavingPassword(true);
        setPasswordError(null);
        try {
            await ProfileService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success("Contraseña cambiada exitosamente.");
            resetPasswordForm();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || "Error al cambiar la contraseña.";
            setPasswordError(msg);
            toast.error(msg);
        } finally {
            setIsSavingPassword(false);
        }
    };

    const newPassword = watch('newPassword');
    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') =>
        setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));

    const displayName = profile?.fullName || fullName || user?.email || '—';
    const displayEmail = profile?.email || user?.email || '—';
    const displayRole = profile?.role || user?.role || '—';
    const displayInstitution = profile?.institutionName || institution?.name || '—';
    const avatarSrc = avatarPreview || profile?.avatarUrl || '/assets/images/faces/9.jpg';

    const isLoading = authLoading || isLoadingProfile;

    return (
        <Fragment>
            <Seo title="Configuración de Perfil" />
            <Pageheader title="Configuración" currentpage="Perfil de Usuario" activepage="Configuración" />
            <ToastContainer position="top-right" autoClose={3000} />

            {profileError && (
                <Alert variant="warning" className="mb-3" dismissible onClose={() => setProfileError(null)}>
                    {profileError}
                </Alert>
            )}

            <Row className="g-3">
                {/* LEFT COLUMN */}
                <Col xl={4}>
                    {/* Avatar Card */}
                    <Card className="custom-card text-center">
                        <Card.Body className="p-4">
                            {isLoading ? (
                                <div className="py-4"><Spinner animation="border" variant="primary" /></div>
                            ) : (
                                <>
                                    <div className="position-relative d-inline-block mb-3">
                                        <span
                                            className="avatar avatar-xxl"
                                            style={{ cursor: 'pointer', border: '3px solid #e9ecef', borderRadius: '50%', overflow: 'hidden', display: 'inline-flex' }}
                                            onClick={handleAvatarClick}
                                            title="Cambiar foto"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={avatarSrc}
                                                alt="Avatar"
                                                width={80} height={80}
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/faces/9.jpg'; }}
                                            />
                                        </span>
                                        {isUploadingAvatar && (
                                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                                <Spinner animation="border" size="sm" variant="light" />
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
                                    </div>

                                    <h5 className="mb-1 fw-semibold">{displayName}</h5>
                                    <p className="fs-13 text-muted mb-1">{displayEmail}</p>
                                    <p className="fs-12 text-muted mb-2">
                                        <i className="ri-building-line me-1"></i>{displayInstitution}
                                    </p>
                                    <span className="badge bg-primary-transparent rounded-pill mb-3 text-capitalize">
                                        {displayRole}
                                    </span>

                                    <div className="d-flex justify-content-center gap-2">
                                        <button className="btn btn-sm btn-primary btn-wave" onClick={handleAvatarClick} disabled={isUploadingAvatar}>
                                            <i className="ri-upload-2-line me-1"></i>Cambiar Foto
                                        </button>
                                        {avatarPreview && (
                                            <button className="btn btn-sm btn-light btn-wave" onClick={() => setAvatarPreview(null)}>
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Institution Info */}
                    <Card className="custom-card">
                        <Card.Header><div className="card-title">Institución</div></Card.Header>
                        <Card.Body className="p-3">
                            {isLoading ? <Spinner animation="border" size="sm" /> : (
                                <div className="d-flex align-items-center gap-3">
                                    <div className="avatar avatar-md bg-primary-transparent rounded">
                                        <i className="ri-building-2-line text-primary fs-4"></i>
                                    </div>
                                    <div>
                                        <p className="fw-semibold mb-0 fs-14">{displayInstitution}</p>
                                        <p className="text-muted fs-12 mb-0 text-capitalize">{displayRole}</p>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Security Card */}
                    <Card className="custom-card">
                        <Card.Header><div className="card-title">Seguridad</div></Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-start justify-content-between mb-3">
                                <div>
                                    <p className="fs-14 mb-1 fw-medium">Verificación en 2 Pasos</p>
                                    <p className="fs-12 mb-0 text-muted">Protege tu cuenta contra accesos no autorizados.</p>
                                </div>
                                <span className="badge bg-warning-transparent">No activo</span>
                            </div>
                            <div className="d-flex align-items-start justify-content-between">
                                <div>
                                    <p className="fs-14 mb-1 fw-medium">Sesiones activas</p>
                                    <p className="fs-12 mb-0 text-muted">Administra los dispositivos conectados.</p>
                                </div>
                                <Link href="#!" className="link-primary text-decoration-underline fs-12">Ver</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* RIGHT COLUMN */}
                <Col xl={8}>
                    {/* Account Info */}
                    <Card className="custom-card">
                        <Card.Header><div className="card-title">Información de la Cuenta</div></Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleProfileSave}>
                                <Row className="gy-3">
                                    <Col sm={6}>
                                        <Form.Label htmlFor="profile-name">Nombre completo</Form.Label>
                                        <Form.Control
                                            id="profile-name"
                                            type="text"
                                            placeholder="Tu nombre completo"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            disabled={isLoading || isSavingProfile}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label htmlFor="profile-email">Email</Form.Label>
                                        <Form.Control
                                            id="profile-email"
                                            type="email"
                                            value={displayEmail}
                                            disabled
                                            className="bg-light"
                                        />
                                        <Form.Text className="text-muted">El email no puede cambiarse.</Form.Text>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label htmlFor="profile-role">Rol</Form.Label>
                                        <Form.Control
                                            id="profile-role"
                                            type="text"
                                            value={displayRole}
                                            disabled
                                            className="bg-light text-capitalize"
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label>Institución</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={displayInstitution}
                                            disabled
                                            className="bg-light"
                                        />
                                    </Col>
                                    <Col xs={12}>
                                        <hr className="my-1" />
                                        <Form.Label className="fw-semibold mt-1">Preferencias</Form.Label>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label>Idioma</Form.Label>
                                        <SpkSelect
                                            searchable
                                            name="language"
                                            option={Languagedata}
                                            menuplacement="auto"
                                            classNameprefix="Select2"
                                            defaultvalue={[selectedLanguage]}
                                            onfunchange={(val: any) => setSelectedLanguage(val)}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label>Zona Horaria</Form.Label>
                                        <SpkSelect
                                            searchable
                                            name="timezone"
                                            option={timeZoneOptions}
                                            menuplacement="auto"
                                            classNameprefix="Select2"
                                            defaultvalue={[selectedTimezone]}
                                            onfunchange={(val: any) => setSelectedTimezone(val)}
                                        />
                                    </Col>
                                </Row>
                                <div className="mt-3 d-flex justify-content-end">
                                    <SpkButton Buttontype="submit" Buttonvariant="primary" Customclass="btn-wave" Disabled={isLoading || isSavingProfile}>
                                        {isSavingProfile
                                            ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</>
                                            : <><i className="ri-save-line me-1"></i>Guardar Cambios</>}
                                    </SpkButton>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Change Password */}
                    <Card className="custom-card">
                        <Card.Header><div className="card-title">Cambiar Contraseña</div></Card.Header>
                        <Card.Body>
                            {passwordError && (
                                <Alert variant="danger" dismissible onClose={() => setPasswordError(null)}>
                                    <i className="ri-error-warning-line me-1"></i>{passwordError}
                                </Alert>
                            )}
                            <Form onSubmit={handleSubmit(onSubmitPassword)}>
                                <Row className="gy-3">
                                    <Col xs={12}>
                                        <Form.Label>Contraseña Actual</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={passwordVisibility.current ? 'text' : 'password'}
                                                placeholder="Tu contraseña actual"
                                                isInvalid={!!errors.currentPassword}
                                                {...register('currentPassword', { required: 'Requerido' })}
                                                disabled={isSavingPassword}
                                            />
                                            <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3" onClick={() => togglePasswordVisibility('current')} style={{ border: 'none', background: 'none' }}>
                                                <i className={passwordVisibility.current ? 'ri-eye-line' : 'ri-eye-off-line'} />
                                            </button>
                                        </div>
                                        {errors.currentPassword && <Form.Text className="text-danger">{String((errors.currentPassword as any)?.message)}</Form.Text>}
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label>Nueva Contraseña</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={passwordVisibility.new ? 'text' : 'password'}
                                                placeholder="Mínimo 8 caracteres"
                                                isInvalid={!!errors.newPassword}
                                                {...register('newPassword', {
                                                    required: 'Requerido',
                                                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                                                })}
                                                disabled={isSavingPassword}
                                            />
                                            <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3" onClick={() => togglePasswordVisibility('new')} style={{ border: 'none', background: 'none' }}>
                                                <i className={passwordVisibility.new ? 'ri-eye-line' : 'ri-eye-off-line'} />
                                            </button>
                                        </div>
                                        {errors.newPassword && <Form.Text className="text-danger">{String(errors.newPassword?.message)}</Form.Text>}
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label>Confirmar Contraseña</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={passwordVisibility.confirm ? 'text' : 'password'}
                                                placeholder="Repite la nueva contraseña"
                                                isInvalid={!!errors.confirmPassword}
                                                {...register('confirmPassword', {
                                                    required: 'Requerido',
                                                    validate: v => v === newPassword || 'Las contraseñas no coinciden',
                                                })}
                                                disabled={isSavingPassword}
                                            />
                                            <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3" onClick={() => togglePasswordVisibility('confirm')} style={{ border: 'none', background: 'none' }}>
                                                <i className={passwordVisibility.confirm ? 'ri-eye-line' : 'ri-eye-off-line'} />
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <Form.Text className="text-danger">{String(errors.confirmPassword?.message)}</Form.Text>}
                                    </Col>
                                </Row>
                                <div className="mt-3 d-flex justify-content-end">
                                    <SpkButton Buttontype="submit" Buttonvariant="primary" Customclass="btn-wave" Disabled={isSavingPassword}>
                                        {isSavingPassword
                                            ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Actualizando...</>
                                            : <><i className="ri-lock-line me-1"></i>Actualizar Contraseña</>}
                                    </SpkButton>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Notifications */}
                    <Card className="custom-card">
                        <Card.Header><div className="card-title">Notificaciones</div></Card.Header>
                        <Card.Body className="py-2">
                            {[
                                { key: 'app', title: 'Notificaciones en la App', desc: 'Alertas dentro de la plataforma.', icon: 'ri-notification-3-line' },
                                { key: 'email', title: 'Notificaciones por Email', desc: 'Mensajes enviados a tu correo.', icon: 'ri-mail-line' },
                                { key: 'blockchain', title: 'Alertas de Blockchain', desc: 'Confirmaciones de registros en Fabric.', icon: 'ri-links-line' },
                                { key: 'security', title: 'Alertas de Seguridad', desc: 'Inicios de sesión y cambios de contraseña.', icon: 'ri-shield-check-line' },
                            ].map(({ key, title, desc, icon }) => (
                                <div key={key} className="d-flex align-items-center justify-content-between py-3 border-bottom last-child-no-border">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="avatar avatar-sm bg-primary-transparent rounded">
                                            <i className={`${icon} text-primary`}></i>
                                        </div>
                                        <div>
                                            <p className="fs-14 mb-0 fw-medium">{title}</p>
                                            <p className="fs-12 mb-0 text-muted">{desc}</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`toggle mb-0 toggle-success ${toggles[key] ? 'on' : ''}`}
                                        onClick={() => setToggles(p => ({ ...p, [key]: !p[key] }))}
                                    >
                                        <span></span>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="custom-card border-danger">
                        <Card.Header className="border-bottom border-danger">
                            <div className="card-title text-danger">
                                <i className="ri-error-warning-line me-1"></i>Zona de Peligro
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="fw-semibold mb-1">Eliminar cuenta</p>
                                    <p className="text-muted fs-13 mb-0">Esta acción es permanente e irreversible. Se eliminarán todos tus datos.</p>
                                </div>
                                <button className="btn btn-danger-light btn-wave text-nowrap ms-3" onClick={() => toast.error("Función no disponible en esta versión.")}>
                                    <i className="ri-delete-bin-line me-1"></i>Eliminar
                                </button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    );
};

export default ProfileSettings;

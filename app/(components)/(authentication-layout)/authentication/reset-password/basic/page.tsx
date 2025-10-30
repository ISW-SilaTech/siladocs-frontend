"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Fragment, useState } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from 'react-hook-form';
interface BasicProps { }

const Basic: React.FC<BasicProps> = () => {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    }: any = useForm();

    const [passwordVisibility, setPasswordVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const togglePasswordVisibility = (field: any) => {
        setPasswordVisibility((prev: any) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };
    const router = useRouter();
    const onSubmit = (data: any) => {
        router.push('/dashboards/sales');
        toast.success('Contraseña creada exitosamente', {
            position: 'top-right',
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    const newPassword = watch('newPassword');

    return (

        <Fragment>

            <Seo title="Restablecer contraseña - Básico" />

            <div className="authentication-basic-background">
                <Image fill src="../../../assets/images/media/backgrounds/9.png" alt="" />
            </div>

            <div className="container">
                <Row className="justify-content-center align-items-center authentication authentication-basic h-100">
                    <Col xxl={4} xl={5} lg={6} md={6} sm={8} className="col-12">
                        <Card className="custom-card border-0 my-4">
                            <Card.Body className="card-body p-5">
                                <div className="mb-4">
                                    <Link scroll={false} href="/dashboards/sales">
                                        <Image fill src="../../../assets/images/brand-logos/toggle-logo.png" alt="logo" className="desktop-dark" />
                                    </Link>
                                </div>
                                <div>
                                    <h4 className="mb-1 fw-semibold">Restablecer contraseña</h4>
                                    <p className="mb-4 text-muted fw-normal">Establece aquí tu nueva contraseña.</p>
                                </div>
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <Row className="row gy-3">
                                        <Col xl={12}>
                                            <label htmlFor="reset-password" className="form-label text-default">Contraseña actual</label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type={passwordVisibility.current ? 'text' : 'password'}
                                                    id="currentPassword"
                                                    placeholder="Contraseña actual"
                                                    className="form-control form-control-lg"
                                                    {...register('currentPassword', { required: 'Se requiere contraseña actual' })}
                                                />
                                                <Link scroll={false} href="#!" onClick={() => togglePasswordVisibility('current')} className="show-password-button text-muted" id="button-addon2"><i className={`${passwordVisibility.current ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`} /></Link>
                                            </div>
                                            {errors.currentPassword && <p className="text-danger text-sm">{errors.currentPassword.message}</p>}
                                        </Col>
                                        <Col xl={12}>
                                            <label htmlFor="reset-newpassword" className="form-label text-default">Nueva contraseña</label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type={passwordVisibility.new ? 'text' : 'password'}
                                                    id="newPassword"
                                                    placeholder="Nueva contraseña"
                                                    className="form-control form-control-lg"
                                                    {...register('newPassword', {
                                                        required: 'Se requiere nueva contraseña',
                                                        minLength: {
                                                            value: 6,
                                                            message: 'La contraseña debe tener al menos 6 caracteres',
                                                        },
                                                    })}
                                                />
                                                <Link scroll={false} href="#!" onClick={() => togglePasswordVisibility('new')} className="show-password-button text-muted" id="button-addon21"><i className={`${passwordVisibility.new ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`} /></Link>
                                            </div>
                                            {errors.newPassword && <p className="text-danger text-sm">{errors.newPassword.message}</p>}
                                        </Col>
                                        <Col xl={12}>
                                            <label htmlFor="reset-confirmpassword" className="form-label text-default">Confirmar Contraseña</label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type={passwordVisibility.confirm ? 'text' : 'password'}
                                                    id="confirmPassword"
                                                    placeholder="Confirmar Contraseña"
                                                    className="form-control form-control-lg"
                                                    {...register('confirmPassword', {
                                                        required: 'Por favor confirma tu contraseña',
                                                        validate: (value: any) =>
                                                            value === newPassword || 'Las contraseñas no coinciden',
                                                    })}
                                                />
                                                <Link scroll={false} href="#!" onClick={() => togglePasswordVisibility('confirm')} className="show-password-button text-muted" id="button-addon22"><i className={`${passwordVisibility.confirm ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`} /></Link>
                                            </div>
                                            {errors.confirmPassword && <p className="text-danger text-sm">{errors.confirmPassword.message}</p>}
                                        </Col>
                                    </Row>
                                    <div className="d-grid mt-3">
                                        <SpkButton Buttontype="submit" Customclass="btn btn-primary">Restablecer contraseña</SpkButton>
                                    </div>
                                </Form>
                                <div className="text-center my-3 authentication-barrier">
                                    <span className="op-4 fs-13">O</span>
                                </div>
                                <div className="d-grid mb-3">
                                    <SpkButton Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill mb-3">
                                        <span className="avatar avatar-xs">
                                            <Image fill src="../../../assets/images/media/apps/google.png" alt="" />
                                        </span>
                                        <span className="lh-1 ms-2 fs-13 text-default fw-medium">Regístrate con Google</span>
                                    </SpkButton>
                                    <SpkButton Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill">
                                        <span className="avatar avatar-xs">
                                            <Image fill src="../../../assets/images/media/apps/outlook.png" alt="" />
                                        </span>
                                        <span className="lh-1 ms-2 fs-13 text-default fw-medium">Regístrate con Outlook</span>
                                    </SpkButton>
                                </div>
                                <div className="text-center mt-3 fw-medium">
                                    ¿No quieres reiniciar? <Link scroll={false} href="/authentication/sign-in/basic" className="text-primary">Iniciar sesión</Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
                <ToastContainer />
        </Fragment>
    )
};

export default Basic;

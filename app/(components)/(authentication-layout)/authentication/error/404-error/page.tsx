"use client"

import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment } from "react";
import { Col } from "react-bootstrap";

interface Error404Props { }

const Error404: React.FC<Error404Props> = () => {

    return (

        <Fragment>
            <Seo title="Página No Encontrada" />

            <div className="page error-bg">
                <div className="error-page-background grid-cards">
                    <Image fill src="../../../assets/images/media/backgrounds/10.svg" alt="" />
                </div>

                {/* <!-- Start::error-page --> */}

                <div className="row align-items-center justify-content-center h-100 g-0">
                    <Col xl={7} lg={7} md={7} className="col-12">
                        <div className="text-center">
                            <div className="text-center mb-5  custom-width">
                                <Image fill src="../../../assets/images/media/backgrounds/11.png" alt="" className="w-sm-auto w-100 h-100" />
                            </div>
                            <span className="d-block fs-4 text-primary fw-semibold">¡Ups! Algo salió mal</span>
                            <p className="error-text mb-0">404</p>
                            <p className="fs-5 fw-normal mb-4">La página que buscas no existe o no está disponible. <br /> Intenta de nuevo más tarde o contacta a soporte.</p>
                            <Link scroll={false} href="/dashboards/general" className="btn btn-primary btn-w-lg">Volver al inicio<i className="ti ti-arrow-narrow-right ms-2"></i></Link>
                        </div>
                    </Col>
                </div>
            </div>
        </Fragment>

    )
};

export default Error404;
"use client"

import Spkapexcharts from "@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts";
import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Card, Col, Row, ListGroup, ProgressBar } from "react-bootstrap";
import { useAuth } from "@/shared/contextapi";
import {
  emissionCreditsData,
  certificateHistoryData,
  certificateStats,
  creditUsageData,
} from "@/shared/data/dashboards/institutional-dashboard-data";

interface SchoolProps { }

const School: React.FC<SchoolProps> = () => {
  const { user, institution } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isRector = user?.role === "Rector";
  const isAcademico = user?.role === "Administrador Académico";

  return (
    <Fragment>
      <Seo title="Dashboard Institucional" />
      <Pageheader title="Dashboard Institucional" currentpage="Dashboard" activepage="Dashboard" />

      {/* Header de institución */}
      <Card className="custom-card mb-4 border-0 shadow-sm">
        <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-4">
            <div className="p-3 bg-primary-light rounded-3">
              <i className="ti ti-school fs-24 text-primary"></i>
            </div>
            <div>
              <h4 className="mb-1 fw-semibold text-dark">{institution?.name ?? "Institución"}</h4>
              <p className="mb-0 text-muted">
                Bienvenido, <strong>{user?.email ?? "Usuario"}</strong>
              </p>
              <small className="text-muted">Rol: {user?.role || "—"}</small>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link href="/gestion/carreras" className="btn btn-primary btn-sm">
              <i className="ti ti-book me-2"></i>Gestión Académica
            </Link>
            <Link href="/core/blockchain" className="btn btn-outline-primary btn-sm">
              <i className="ti ti-chain me-2"></i>Ver Trazabilidad
            </Link>
          </div>
        </Card.Body>
      </Card>


      {/* Row 1: Key Metrics */}
      <Row className="mb-4">
        {/* Emission Credits Card */}
        <Col xxl={6} lg={12} className="mb-3">
          <Card className="custom-card border-0 shadow-sm h-100">
            <Card.Header className="d-flex align-items-center justify-content-between border-bottom">
              <div className="card-title d-flex align-items-center gap-2">
                <i className="ti ti-coins fs-20 text-warning"></i>
                <span>Créditos de Emisión</span>
                <SpkBadge variant="" Customclass="bg-secondary-transparent fs-10">Demo</SpkBadge>
              </div>
              <SpkBadge variant="" Customclass="bg-warning-light text-warning">
                {emissionCreditsData.phase}
              </SpkBadge>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="fw-semibold text-dark">{emissionCreditsData.available} Disponibles</h5>
                  <small className="text-muted">{emissionCreditsData.percentageUsed}% usado</small>
                </div>
                <ProgressBar
                  now={emissionCreditsData.percentageUsed}
                  variant="warning"
                  className="mb-3"
                  style={{ height: "8px" }}
                />
              </div>

              <Row className="g-3">
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <p className="mb-1 text-muted small">Comprados</p>
                    <h6 className="fw-semibold text-dark mb-0">{emissionCreditsData.totalPurchased}</h6>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <p className="mb-1 text-muted small">Usados</p>
                    <h6 className="fw-semibold text-warning mb-0">{emissionCreditsData.totalUsed}</h6>
                  </div>
                </Col>
              </Row>

              <div className="mt-3 pt-3 border-top">
                <small className="text-muted d-block mb-1">Vencimiento: {emissionCreditsData.expiresAt}</small>
                <Link href="#!" className="text-primary small fw-semibold">
                  Solicitar más créditos <i className="ti ti-arrow-right ms-1"></i>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Certificate Statistics */}
        <Col xxl={6} lg={12} className="mb-3">
          <Card className="custom-card border-0 shadow-sm h-100">
            <Card.Header className="d-flex align-items-center justify-content-between border-bottom">
              <div className="card-title d-flex align-items-center gap-2">
                <i className="ti ti-certificate fs-20 text-success"></i>
                <span>Certificados Emitidos</span>
                <SpkBadge variant="" Customclass="bg-secondary-transparent fs-10">Demo</SpkBadge>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col sm={6}>
                  <div className="p-3 bg-success-light rounded">
                    <small className="d-block text-muted mb-2">Total Emitidos</small>
                    <h5 className="fw-semibold text-success mb-0">{certificateStats.totalIssued}</h5>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-info-light rounded">
                    <small className="d-block text-muted mb-2">Este Mes</small>
                    <h5 className="fw-semibold text-info mb-0">{certificateStats.issuedThisMonth}</h5>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-warning-light rounded">
                    <small className="d-block text-muted mb-2">Pendientes</small>
                    <h5 className="fw-semibold text-warning mb-0">{certificateStats.pending}</h5>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-danger-light rounded">
                    <small className="d-block text-muted mb-2">Revocados</small>
                    <h5 className="fw-semibold text-danger mb-0">{certificateStats.revoked}</h5>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Credit Usage Chart and Certificate History */}
      <Row className="mb-4">
        <Col xxl={6} lg={12} className="mb-3">
          <Card className="custom-card border-0 shadow-sm">
            <Card.Header className="d-flex align-items-center justify-content-between border-bottom">
              <div className="card-title d-flex align-items-center gap-2">
                <i className="ti ti-chart-line fs-20 text-primary"></i>
                <span>Uso de Créditos por Mes</span>
              </div>
            </Card.Header>
            <Card.Body>
              {isClient && (
                <Spkapexcharts
                  height={300}
                  type="line"
                  width="100%"
                  chartOptions={{
                    chart: {
                      sparkline: { enabled: false },
                      fontFamily: "'Segoe UI', sans-serif",
                    },
                    stroke: { curve: "smooth", width: 2 },
                    colors: ["#F7B42E", "#17E2B9"],
                    xaxis: {
                      categories: creditUsageData.categories,
                      labels: { style: { colors: "#8A92A6" } },
                    },
                    yaxis: {
                      labels: { style: { colors: "#8A92A6" } },
                    },
                    legend: { position: "top" },
                    grid: { borderColor: "#E9EDF4" },
                  }}
                  chartSeries={creditUsageData.series}
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xxl={6} lg={12} className="mb-3">
          <Card className="custom-card border-0 shadow-sm">
            <Card.Header className="d-flex align-items-center justify-content-between border-bottom">
              <div className="card-title d-flex align-items-center gap-2">
                <i className="ti ti-list fs-20 text-info"></i>
                <span>Últimos Certificados</span>
              </div>
              {isRector && (
                <Link href="#!" className="btn btn-primary btn-sm">
                  Emitir Certificado
                </Link>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-3">Estudiante</th>
                      <th>Curso</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificateHistoryData.slice(0, 5).map((cert) => (
                      <tr key={cert.id}>
                        <td className="ps-3">
                          <small className="fw-semibold">{cert.studentName}</small>
                        </td>
                        <td>
                          <small className="text-muted">{cert.courseCode}</small>
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(cert.issuedDate).toLocaleDateString("es-ES")}
                          </small>
                        </td>
                        <td>
                          <SpkBadge
                            variant=""
                            Customclass="bg-success-light text-success"
                          >
                            Emitido
                          </SpkBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
            <Card.Footer className="text-center py-2">
              <Link href="#!" className="text-primary small fw-semibold">
                Ver todos los certificados <i className="ti ti-arrow-right ms-1"></i>
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Row 3: Detailed Certificate List */}
      <Row>
        <Col xxl={12}>
          <Card className="custom-card border-0 shadow-sm">
            <Card.Header className="d-flex align-items-center justify-content-between border-bottom">
              <div className="card-title d-flex align-items-center gap-2">
                <i className="ti ti-book fs-20 text-primary"></i>
                <span>Historial Detallado de Certificados</span>
                <SpkBadge variant="" Customclass="bg-secondary-transparent fs-10">Demo</SpkBadge>
              </div>
              <small className="text-muted">Total: {certificateHistoryData.length} certificados</small>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-3">Estudiante</th>
                      <th>Correo</th>
                      <th>Curso</th>
                      <th>Código</th>
                      <th>Fecha de Emisión</th>
                      <th>TX Hash (Blockchain)</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificateHistoryData.map((cert) => (
                      <tr key={cert.id}>
                        <td className="ps-3 fw-semibold">{cert.studentName}</td>
                        <td>
                          <small className="text-muted">{cert.studentEmail}</small>
                        </td>
                        <td>{cert.course}</td>
                        <td>
                          <SpkBadge variant="" Customclass="bg-light text-dark">
                            {cert.courseCode}
                          </SpkBadge>
                        </td>
                        <td>{new Date(cert.issuedDate).toLocaleDateString("es-ES")}</td>
                        <td>
                          <Link
                            href={`/core/blockchain?tx=${cert.fabricTxId}`}
                            className="text-primary small"
                            title="Ver en blockchain"
                          >
                            {cert.fabricTxId.substring(0, 12)}...
                          </Link>
                        </td>
                        <td>
                          <SpkBadge
                            variant=""
                            Customclass="bg-success-light text-success"
                          >
                            {cert.status === "issued" ? "Emitido" : cert.status}
                          </SpkBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default School;

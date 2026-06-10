"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, ProgressBar, Spinner, Alert } from "react-bootstrap";
import { LedgerService } from "@/shared/services/ledger.service";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { SyllabusTrace } from "@/shared/types/ledger";

interface TraceabilityMetrics {
  totalSyllabi: number;
  verifiedOnBlockchain: number;
  totalVersions: number;
  avgVersionsPerSyllabus: number;
  pendingSyllabi: number;
  blockchainCoverage: number;
}

const Trazabilidad: React.FC = () => {
  const [syllabi, setSyllabi] = useState<SyllabusTrace[]>([]);
  const [metrics, setMetrics] = useState<TraceabilityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await LedgerService.getAllSyllabus();
        setSyllabi(data);

        // Calcular métricas
        const totalSyllabi = data.length;
        const verifiedOnBlockchain = data.filter(s => s.status === "Inmutable").length;
        const pendingSyllabi = data.filter(s => s.status === "Pendiente").length;

        let totalVersions = 0;
        data.forEach(s => {
          if (s.versions) {
            totalVersions += s.versions.length;
          }
        });

        const avgVersionsPerSyllabus = totalSyllabi > 0 ? totalVersions / totalSyllabi : 0;
        const blockchainCoverage = totalSyllabi > 0 ? (verifiedOnBlockchain / totalSyllabi) * 100 : 0;

        setMetrics({
          totalSyllabi,
          verifiedOnBlockchain,
          totalVersions,
          avgVersionsPerSyllabus,
          pendingSyllabi,
          blockchainCoverage,
        });
      } catch (err) {
        console.error("Error cargando trazabilidad:", err);
        setError("Error al cargar datos de trazabilidad");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className="mt-3 text-muted">Analizando trazabilidad...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <i className="ri-alert-line me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Seo title="Panel de Trazabilidad" />
      <Pageheader
        currentpage="Panel de Trazabilidad"
        activepage="Trazabilidad"
        mainpage="Core"
        activepageclickable
      />

      <Container className="py-5">
        {/* Métricas Principales */}
        <Row className="mb-4 g-3">
          <Col lg={3} md={6}>
            <Card className="custom-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="avatar avatar-lg bg-primary-transparent text-primary rounded-circle mx-auto mb-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ri-file-list-line" style={{ fontSize: "30px" }}></i>
                </div>
                <h3 className="fw-bold mb-1">{metrics?.totalSyllabi || 0}</h3>
                <p className="text-muted mb-0 fs-13">Sílabos Registrados</p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="custom-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="avatar avatar-lg bg-success-transparent text-success rounded-circle mx-auto mb-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ri-shield-check-fill" style={{ fontSize: "30px" }}></i>
                </div>
                <h3 className="fw-bold mb-1">{metrics?.verifiedOnBlockchain || 0}</h3>
                <p className="text-muted mb-0 fs-13">Verificados en Blockchain</p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="custom-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="avatar avatar-lg bg-info-transparent text-info rounded-circle mx-auto mb-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ri-history-line" style={{ fontSize: "30px" }}></i>
                </div>
                <h3 className="fw-bold mb-1">{metrics?.totalVersions || 0}</h3>
                <p className="text-muted mb-0 fs-13">Total de Versiones</p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="custom-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="avatar avatar-lg bg-warning-transparent text-warning rounded-circle mx-auto mb-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ri-time-line" style={{ fontSize: "30px" }}></i>
                </div>
                <h3 className="fw-bold mb-1">{metrics?.pendingSyllabi || 0}</h3>
                <p className="text-muted mb-0 fs-13">Pendientes</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Cobertura Blockchain */}
        <Row className="mb-4">
          <Col lg={6}>
            <Card className="custom-card border-0 shadow-sm">
              <Card.Header>
                <Card.Title>Cobertura en Blockchain</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">Sílabos Verificados</span>
                    <Badge bg="success">{Math.round(metrics?.blockchainCoverage || 0)}%</Badge>
                  </div>
                  <ProgressBar
                    now={metrics?.blockchainCoverage || 0}
                    variant="success"
                    style={{ height: "25px" }}
                  />
                </div>
                <p className="text-muted fs-12 mb-0">
                  <i className="ri-information-line me-1"></i>
                  {metrics?.verifiedOnBlockchain} de {metrics?.totalSyllabi} sílabos registrados en blockchain
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="custom-card border-0 shadow-sm">
              <Card.Header>
                <Card.Title>Promedio de Versiones</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <h4 className="fw-bold text-primary mb-2">
                    {metrics?.avgVersionsPerSyllabus?.toFixed(1) || 0}
                  </h4>
                  <p className="text-muted mb-0">
                    <i className="ri-git-branch-line me-1"></i>
                    Versiones promedio por sílabo
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Criterios de Trazabilidad */}
        <Row className="mb-4">
          <Col lg={12}>
            <Card className="custom-card border-0 shadow-sm">
              <Card.Header>
                <Card.Title>Criterios de Trazabilidad ✓</Card.Title>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="d-flex align-items-start">
                      <div className="avatar avatar-sm bg-success-transparent text-success rounded-circle me-3" style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="ri-check-fill"></i>
                      </div>
                      <div>
                        <h6 className="fw-semibold">Seguridad</h6>
                        <p className="text-muted fs-13 mb-0">
                          Hash SHA-256 y blockchain para verificar integridad e inmutabilidad
                        </p>
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-start">
                      <div className="avatar avatar-sm bg-success-transparent text-success rounded-circle me-3" style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="ri-check-fill"></i>
                      </div>
                      <div>
                        <h6 className="fw-semibold">Gestión Ágil</h6>
                        <p className="text-muted fs-13 mb-0">
                          Control de versiones con {metrics?.avgVersionsPerSyllabus?.toFixed(1) || 0} versiones promedio
                        </p>
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-start">
                      <div className="avatar avatar-sm bg-success-transparent text-success rounded-circle me-3" style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="ri-check-fill"></i>
                      </div>
                      <div>
                        <h6 className="fw-semibold">Trazabilidad Completa</h6>
                        <p className="text-muted fs-13 mb-0">
                          Auditoría de quién, cuándo, qué cambió en cada versión
                        </p>
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-start">
                      <div className="avatar avatar-sm bg-success-transparent text-success rounded-circle me-3" style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="ri-check-fill"></i>
                      </div>
                      <div>
                        <h6 className="fw-semibold">Acceso Público</h6>
                        <p className="text-muted fs-13 mb-0">
                          Verificación sin login, compartible por QR y URL
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sílabos con Mayor Control de Versiones */}
        <Row>
          <Col lg={12}>
            <Card className="custom-card border-0 shadow-sm">
              <Card.Header>
                <Card.Title>Sílabos Registrados</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Curso</th>
                        <th>Código</th>
                        <th>Versiones</th>
                        <th>Estado</th>
                        <th>Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syllabi.slice(0, 10).map((syllabus, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{syllabus.courseName}</td>
                          <td>{syllabus.courseCode}</td>
                          <td>
                            <Badge bg="info">{(syllabi[idx].versions?.length || 0)} versiones</Badge>
                          </td>
                          <td>
                            <Badge bg={syllabus.status === "Inmutable" ? "success" : "warning"}>
                              {syllabus.status}
                            </Badge>
                          </td>
                          <td className="font-monospace fs-12 text-truncate" style={{ maxWidth: "200px" }}>
                            {syllabus.currentHash.substring(0, 20)}...
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
      </Container>
    </>
  );
};

export default Trazabilidad;

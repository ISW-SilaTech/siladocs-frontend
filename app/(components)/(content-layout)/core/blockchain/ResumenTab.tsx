"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Badge, ProgressBar, Spinner, Alert } from "react-bootstrap";
import { LedgerService } from "@/shared/services/ledger.service";
import { SyllabusTrace } from "@/shared/types/ledger";

interface TraceabilityMetrics {
  totalSyllabi: number;
  verifiedOnBlockchain: number;
  totalVersions: number;
  avgVersionsPerSyllabus: number;
  pendingSyllabi: number;
  blockchainCoverage: number;
}

const ResumenTab: React.FC = () => {
  const [syllabi, setSyllabi] = useState<SyllabusTrace[]>([]);
  const [metrics, setMetrics] = useState<TraceabilityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await LedgerService.getAllSyllabus(true);
        setSyllabi(data);

        const totalSyllabi = data.length;
        const verifiedOnBlockchain = data.filter((s) => s.status === "Inmutable").length;
        const pendingSyllabi = data.filter((s) => s.status === "Pendiente").length;
        const blockchainCoverage = totalSyllabi > 0 ? (verifiedOnBlockchain / totalSyllabi) * 100 : 0;

        // Fetch real version counts from ledger for each syllabus in parallel
        const versionResults = await Promise.allSettled(
          data.map((s) => LedgerService.getSyllabusVersions(s.id))
        );
        const totalVersions = versionResults.reduce((sum, r) => {
          if (r.status === "fulfilled") return sum + r.value.length;
          return sum;
        }, 0);

        const avgVersionsPerSyllabus = totalSyllabi > 0 ? totalVersions / totalSyllabi : 0;

        setMetrics({
          totalSyllabi,
          verifiedOnBlockchain,
          totalVersions,
          avgVersionsPerSyllabus,
          pendingSyllabi,
          blockchainCoverage,
        });
      } catch (err) {
        console.error("Error cargando resumen:", err);
        setError("Error al cargar datos del resumen");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Analizando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <i className="ri-alert-line me-2"></i>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Alert variant="light" className="border d-flex align-items-start gap-2 mb-4">
        <i className="ri-information-line fs-5 text-primary"></i>
        <div className="fs-13">
          Vista general del estado de los sílabos en blockchain. Para ver el detalle e historial
          de un documento específico usa la pestaña <strong>Trazabilidad</strong>; para ejecutar
          una verificación masiva de integridad usa <strong>Auditoría</strong>.
        </div>
      </Alert>

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
                <ProgressBar now={metrics?.blockchainCoverage || 0} variant="success" style={{ height: "25px" }} />
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
                <h4 className="fw-bold text-primary mb-2">{metrics?.avgVersionsPerSyllabus?.toFixed(1) || 0}</h4>
                <p className="text-muted mb-0">
                  <i className="ri-git-branch-line me-1"></i>
                  Versiones promedio por sílabo
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
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
                      <p className="text-muted fs-13 mb-0">Hash SHA-256 y blockchain para verificar integridad e inmutabilidad</p>
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
                      <p className="text-muted fs-13 mb-0">Control de versiones con {metrics?.avgVersionsPerSyllabus?.toFixed(1) || 0} versiones promedio</p>
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
                      <p className="text-muted fs-13 mb-0">Auditoría de quién, cuándo, qué cambió en cada versión</p>
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
                      <p className="text-muted fs-13 mb-0">Verificación sin login, compartible por QR y URL</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ResumenTab;

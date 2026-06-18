"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Badge, Spinner, Alert, Button } from "react-bootstrap";
import { LedgerService } from "@/shared/services/ledger.service";
import { SyllabusTrace } from "@/shared/types/ledger";

interface AuditRow {
  syllabus: SyllabusTrace;
  verified: boolean | null;
  block: number | null;
  checking: boolean;
}

const AuditoriaTab: React.FC = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [lastAuditAt, setLastAuditAt] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Obtener todos los sílabos incluyendo eliminados para auditoría completa.
        // El endpoint requiere rol "Administrador Académico".
        const data = await LedgerService.getAllSyllabus(true);
        setRows(data.map((s) => ({ syllabus: s, verified: null, block: null, checking: false })));
      } catch (err) {
        console.error("Error cargando sílabos para auditoría:", err);
        setError("Error al cargar el listado de sílabos");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const runAudit = async () => {
    setIsAuditing(true);
    for (let i = 0; i < rows.length; i++) {
      setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, checking: true } : r)));
      try {
        const result = await LedgerService.verifyImmutability(rows[i].syllabus.id);
        setRows((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, verified: result.verified, block: result.block, checking: false } : r))
        );
      } catch {
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, verified: false, block: null, checking: false } : r)));
      }
    }
    setIsAuditing(false);
    setLastAuditAt(new Date().toLocaleString());
  };

  const verifiedCount = rows.filter((r) => r.verified === true).length;
  const failedCount = rows.filter((r) => r.verified === false).length;
  const pendingCount = rows.filter((r) => r.verified === null).length;

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Cargando sílabos para auditoría...</p>
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
          Ejecuta una verificación masiva del hash de cada sílabo contra su registro en
          Hyperledger Fabric para detectar alteraciones fuera de la red.
        </div>
      </Alert>

      <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
          <Card className="custom-card border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="fw-bold mb-1">{rows.length}</h3>
              <p className="text-muted mb-0 fs-13">Sílabos en el alcance de auditoría</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="custom-card border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="fw-bold mb-1 text-success">{verifiedCount}</h3>
              <p className="text-muted mb-0 fs-13">Verificados (hash íntegro)</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="custom-card border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="fw-bold mb-1 text-danger">{failedCount}</h3>
              <p className="text-muted mb-0 fs-13">Con alerta de integridad</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="custom-card border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="fw-bold mb-1 text-muted">{pendingCount}</h3>
              <p className="text-muted mb-0 fs-13">Sin auditar aún</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="custom-card border-0 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <Card.Title className="mb-0">Registro consolidado de auditoría</Card.Title>
            {lastAuditAt && <p className="text-muted fs-12 mb-0">Última ejecución: {lastAuditAt}</p>}
          </div>
          <Button variant="primary" size="sm" disabled={isAuditing || rows.length === 0} onClick={runAudit}>
            {isAuditing ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Auditando...
              </>
            ) : (
              <>
                <i className="ri-shield-check-line me-1"></i>
                Ejecutar auditoría completa
              </>
            )}
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Curso</th>
                  <th>Código</th>
                  <th>Hash actual</th>
                  <th>Bloque registrado</th>
                  <th>Bloque verificado</th>
                  <th>Resultado de auditoría</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="fw-semibold">{row.syllabus.courseName}</td>
                    <td>{row.syllabus.courseCode}</td>
                    <td className="font-monospace fs-12 text-truncate" style={{ maxWidth: "180px" }}>
                      {row.syllabus.currentHash ? `${row.syllabus.currentHash.substring(0, 20)}...` : "—"}
                    </td>
                    <td>{row.syllabus.blockNumber || "—"}</td>
                    <td>{row.block ?? "—"}</td>
                    <td>
                      {row.checking ? (
                        <Spinner animation="border" size="sm" />
                      ) : row.verified === null ? (
                        <Badge bg="secondary">Sin auditar</Badge>
                      ) : row.verified ? (
                        <Badge bg="success">
                          <i className="ri-checkbox-circle-line me-1"></i>Íntegro
                        </Badge>
                      ) : (
                        <Badge bg="danger">
                          <i className="ri-error-warning-line me-1"></i>Inconsistente
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No hay sílabos registrados para auditar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default AuditoriaTab;

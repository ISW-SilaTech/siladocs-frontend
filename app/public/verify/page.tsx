"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Container, Row, Col, Card, Alert, Badge, Spinner, Button, Nav, Tab } from "react-bootstrap";
import { LedgerService } from "@/shared/services/ledger.service";
import { AzureBlobService } from "@/shared/services/azure-blob.service";
import { SyllabusTrace, SyllabusVersion } from "@/shared/types/ledger";
import Seo from "@/shared/layouts-components/seo/seo";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

const PublicVerifyContent: React.FC = () => {
  const searchParams = useSearchParams();
  const syllabusId = searchParams.get("id");
  const versionParam = searchParams.get("version");

  const [result, setResult] = useState<SyllabusTrace | null>(null);
  const [versions, setVersions] = useState<SyllabusVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [highlightedVersionNumber, setHighlightedVersionNumber] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!syllabusId) {
        setError("ID de sílabo no proporcionado");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const syllabus = await LedgerService.getSyllabusHistory(syllabusId);
        setResult(syllabus);

        const versionsData = await LedgerService.getSyllabusVersions(syllabusId);
        setVersions(versionsData || []);

        if (versionParam) {
          const versionNum = parseInt(versionParam, 10);
          setHighlightedVersionNumber(versionNum);
          setActiveTab("timeline");
        }

        if (syllabus.fileUrl) {
          const preview = await AzureBlobService.getPreviewUrl(syllabus.fileUrl);
          const download = await AzureBlobService.getDownloadUrl(syllabus.fileUrl);
          setPreviewUrl(preview);
          setDownloadUrl(download);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se encontró el sílabo o no está disponible públicamente");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [syllabusId, versionParam]);

  const getStatusColor = (status: string) => {
    return status === "Inmutable" ? "success" : status === "Pendiente" ? "warning" : "secondary";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Inmutable":
        return <i className="ri-shield-check-fill"></i>;
      case "Pendiente":
        return <i className="ri-time-line"></i>;
      default:
        return <i className="ri-error-warning-fill"></i>;
    }
  };

  const copyShareUrl = async () => {
    const url = `${window.location.origin}/public/verify?id=${syllabusId}&version=${versionParam || ""}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback para navegadores sin Clipboard API (o contexto no seguro)
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    Swal.fire({
      title: "URL Copiada",
      text: "La URL de compartir se copió al portapapeles",
      icon: "success",
      confirmButtonColor: "#198754",
    });
  };

  if (isLoading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className="text-muted">Verificando integridad del sílabo...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !result) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Alert variant="danger">
              <i className="ri-alert-line me-2"></i>
              {error || "Sílabo no encontrado"}
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <>
      <Seo title={`Verificador - ${result.courseName}`} />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="custom-card shadow-lg border-0 mb-4">
              <Card.Body className="p-5">
                <div className="text-center mb-5">
                  <div className="avatar avatar-lg bg-primary-transparent text-primary rounded-circle mx-auto mb-3" style={{ width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="ri-shield-check-fill" style={{ fontSize: "40px" }}></i>
                  </div>
                  <h3 className="fw-bold mb-2">Verificación de Autenticidad</h3>
                  <Badge bg={getStatusColor(result.status)} className="px-3 py-2 fs-12">
                    {getStatusIcon(result.status)} {result.status}
                  </Badge>
                </div>

                <div className="border-top pt-4 mb-4">
                  <h5 className="fw-bold mb-2">{result.courseName}</h5>
                  <p className="text-muted mb-1 fs-13">
                    <i className="ri-file-text-line me-2"></i>Código: <strong>{result.courseCode}</strong>
                  </p>
                  <p className="text-muted mb-0 fs-13">
                    <i className="ri-building-2-line me-2"></i>Carrera: <strong>{result.career || "No especificada"}</strong>
                  </p>
                </div>

                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "preview")}>
                  <Nav variant="tabs" className="mb-4 border-bottom">
                    <Nav.Item>
                      <Nav.Link eventKey="preview" className="fw-semibold">
                        <i className="ri-file-pdf-line me-2"></i>Vista Previa
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="timeline" className="fw-semibold">
                        <i className="ri-history-line me-2"></i>Historial
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="details" className="fw-semibold">
                        <i className="ri-information-line me-2"></i>Detalles
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    {/* PREVIEW TAB */}
                    <Tab.Pane eventKey="preview">
                      {previewUrl ? (
                        <>
                          <iframe
                            src={`${previewUrl}#toolbar=0`}
                            style={{
                              width: "100%",
                              height: "600px",
                              border: "1px solid #e0e0e0",
                              borderRadius: "4px",
                            }}
                            title="PDF Preview"
                          ></iframe>
                          <div className="mt-3">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => downloadUrl && window.open(downloadUrl, "_blank")}
                              disabled={!downloadUrl}
                            >
                              <i className="ri-download-2-line me-2"></i>
                              Descargar PDF
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Alert variant="warning">
                          <i className="ri-alert-line me-2"></i>
                          No se puede cargar la vista previa del archivo
                        </Alert>
                      )}
                    </Tab.Pane>

                    {/* TIMELINE TAB */}
                    <Tab.Pane eventKey="timeline">
                      {versions && versions.length > 0 ? (
                        <div className="timeline-container ps-4">
                          {versions.map((version, index) => {
                            const versionDate = new Date(version.createdAt);
                            const isHighlighted = version.versionNumber === highlightedVersionNumber;

                            return (
                              <div
                                key={version.versionNumber ?? index}
                                className="d-flex mb-4 position-relative"
                                style={isHighlighted ? {
                                  backgroundColor: "#fff3cd",
                                  padding: "12px",
                                  borderRadius: "4px",
                                  border: "2px solid #ffc107"
                                } : {}}
                              >
                                {index !== versions.length - 1 && (
                                  <div
                                    className="position-absolute"
                                    style={{
                                      left: "-25px",
                                      top: "40px",
                                      bottom: "-30px",
                                      width: "2px",
                                      backgroundColor: "#e9ecef",
                                      zIndex: 0,
                                    }}
                                  ></div>
                                )}
                                <div
                                  className={`avatar avatar-sm text-white rounded-circle ${version.isOnBlockchain ? "bg-success" : "bg-warning"} d-flex align-items-center justify-content-center position-relative`}
                                  style={{ width: "40px", height: "40px", zIndex: 1, flexShrink: 0 }}
                                >
                                  <i className={version.isOnBlockchain ? "ri-shield-check-fill" : "ri-time-line"}></i>
                                </div>
                                <div className="flex-fill ps-3 pb-3 border-bottom">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                      <h6 className="fw-semibold mb-1">
                                        Versión {version.versionNumber}
                                        {version.isOnBlockchain && (
                                          <Badge bg="success" className="ms-2 fs-11">
                                            <i className="ri-shield-check-fill me-1"></i>
                                            Blockchain
                                          </Badge>
                                        )}
                                      </h6>
                                      <p className="text-muted fs-13 mb-1">
                                        <i className="ri-user-3-line me-1"></i>
                                        {version.uploadedBy || "Sistema"}
                                      </p>
                                    </div>
                                    <small className="text-muted">
                                      {versionDate.toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </small>
                                  </div>
                                  <div className="bg-light p-2 rounded">
                                    <code className="text-dark fs-11 text-break d-block">
                                      Hash: {version.fileHash.substring(0, 40)}...
                                    </code>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <Alert variant="info">
                          <i className="ri-information-line me-2"></i>
                          No hay historial de versiones disponible
                        </Alert>
                      )}
                    </Tab.Pane>

                    {/* DETAILS TAB */}
                    <Tab.Pane eventKey="details">
                      <div className="mb-4">
                        <p className="text-muted mb-2 fs-12 fw-bold">
                          <i className="ri-link-chain me-2"></i>HASH SHA-256
                        </p>
                        <div className="bg-light p-3 rounded">
                          <code
                            className="text-dark fs-14 text-break d-block p-2 bg-white rounded border"
                            style={{ wordBreak: "break-all" }}
                          >
                            {result.currentHash || "No disponible"}
                          </code>
                        </div>
                      </div>

                      <Row className="g-3 mb-4">
                        <Col md={6}>
                          <div className="p-3 border rounded bg-white">
                            <p className="text-muted mb-2 fs-12 fw-bold">
                              <i className="ri-shield-check-line me-2"></i>ESTADO
                            </p>
                            <h5 className="text-primary mb-0">{result.status}</h5>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="p-3 border rounded bg-white">
                            <p className="text-muted mb-2 fs-12 fw-bold">
                              <i className="ri-link-m me-2"></i>CANAL
                            </p>
                            <h5 className="text-primary mb-0">{result.channel || "silabos-channel"}</h5>
                          </div>
                        </Col>
                      </Row>

                      <Button variant="primary" className="w-100" onClick={copyShareUrl}>
                        <i className="ri-file-copy-line me-2"></i>
                        Copiar URL de Compartir
                      </Button>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

const PublicVerify: React.FC = () => {
  return (
    <Suspense fallback={
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className="text-muted">Cargando...</p>
          </Col>
        </Row>
      </Container>
    }>
      <PublicVerifyContent />
    </Suspense>
  );
};

export default PublicVerify;

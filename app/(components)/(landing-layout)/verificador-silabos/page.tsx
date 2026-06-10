"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, InputGroup, Form, Button, Spinner, Alert, Badge, Nav, Tab, Modal } from "react-bootstrap";
import { LedgerService } from "@/shared/services/ledger.service";
import { SyllabiService } from "@/shared/services/syllabi.service";
import { AzureBlobService } from "@/shared/services/azure-blob.service";
import { SyllabusTrace, SyllabusVersion } from "@/shared/types/ledger";
import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Swal from "sweetalert2";
import { QRCodeSVG } from "qrcode.react";
import { useSearchParams } from "next/navigation";

const VerificadorSilabus: React.FC = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<SyllabusTrace | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; block: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allSyllabi, setAllSyllabi] = useState<SyllabusTrace[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);
  const [versions, setVersions] = useState<SyllabusVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedVersionForQR, setSelectedVersionForQR] = useState<SyllabusVersion | null>(null);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [highlightedVersionNumber, setHighlightedVersionNumber] = useState<number | null>(null);

  useEffect(() => {
    loadAllSyllabi();
  }, []);

  useEffect(() => {
    const loadBlobUrls = async () => {
      if (!result || !result.fileUrl) {
        setPreviewUrl(null);
        setDownloadUrl(null);
        return;
      }

      setIsLoadingUrls(true);
      try {
        const preview = await AzureBlobService.getPreviewUrl(result.fileUrl);
        const download = await AzureBlobService.getDownloadUrl(result.fileUrl);
        setPreviewUrl(preview);
        setDownloadUrl(download);
      } catch (err) {
        console.error("Error loading blob URLs:", err);
        setPreviewUrl(null);
        setDownloadUrl(null);
      } finally {
        setIsLoadingUrls(false);
      }
    };

    loadBlobUrls();
  }, [result]);

  useEffect(() => {
    const loadVersions = async () => {
      if (!result) {
        setVersions([]);
        return;
      }

      setIsLoadingVersions(true);
      try {
        const versionsData = await LedgerService.getSyllabusVersions(result.id);
        setVersions(versionsData || []);

        // Check if version param exists and highlight it
        const versionParam = searchParams.get("version");
        if (versionParam) {
          const versionNum = parseInt(versionParam, 10);
          setHighlightedVersionNumber(versionNum);
          setActiveTab("timeline");
        }
      } catch (err) {
        console.error("Error loading versions:", err);
        setVersions([]);
      } finally {
        setIsLoadingVersions(false);
      }
    };

    loadVersions();
  }, [result, searchParams]);

  const loadAllSyllabi = async () => {
    try {
      const data = await LedgerService.getAllSyllabus();
      setAllSyllabi(data);

      // Auto-load from URL parameters
      const idParam = searchParams.get("id");
      if (idParam) {
        const found = data.find(s => s.id === idParam);
        if (found) {
          setResult(found);
          setHasSearched(true);
        }
      }
    } catch (err) {
      console.error("Error loading syllabi:", err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Por favor ingresa un hash, código de curso o ID para buscar.");
      return;
    }

    setIsSearching(true);
    setError(null);
    setResult(null);
    setVerificationResult(null);
    setHasSearched(true);

    try {
      const query = searchQuery.trim().toLowerCase();

      let foundSyllabus: SyllabusTrace | null = null;

      // Buscar por ID (número)
      if (/^\d+$/.test(query)) {
        foundSyllabus = allSyllabi.find(s => s.id === query) || null;
      }

      // Buscar por código de curso
      if (!foundSyllabus) {
        foundSyllabus = allSyllabi.find(s => s.courseCode.toLowerCase() === query) || null;
      }

      // Buscar por nombre de curso
      if (!foundSyllabus) {
        foundSyllabus = allSyllabi.find(s => s.courseName.toLowerCase().includes(query)) || null;
      }

      // Buscar por hash (primeros caracteres)
      if (!foundSyllabus) {
        foundSyllabus = allSyllabi.find(s => s.currentHash.toLowerCase().startsWith(query)) || null;
      }

      if (!foundSyllabus) {
        setError(`No se encontró ningún sílabo con: "${searchQuery}"`);
        setIsSearching(false);
        return;
      }

      setResult(foundSyllabus);
      setIsSearching(false);
    } catch (err) {
      setError("Error al buscar. Intenta de nuevo.");
      setIsSearching(false);
    }
  };

  const handleVerify = async () => {
    if (!result) return;

    setIsVerifying(true);
    try {
      const verifyResult = await LedgerService.verifyImmutability(result.id);
      setVerificationResult(verifyResult);

      if (verifyResult.verified) {
        Swal.fire({
          title: "✓ Documento Verificado",
          html: `
            <p class="mb-3">El sílabo ha sido validado exitosamente en blockchain.</p>
            <div class="bg-light p-3 rounded">
              <p class="mb-1"><strong>Bloque:</strong> #${verifyResult.block}</p>
              <p class="mb-0"><strong>Estado:</strong> Inmutable</p>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#198754",
          allowOutsideClick: false,
        });
      } else {
        Swal.fire({
          title: "⚠ Documento No Verificado",
          text: "Este documento no se encuentra registrado en blockchain o ha sido modificado.",
          icon: "warning",
          confirmButtonColor: "#ff9800",
          allowOutsideClick: false,
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error de Verificación",
        text: "No se pudo conectar con el sistema de blockchain. Intenta más tarde.",
        icon: "error",
        confirmButtonColor: "#dc3545",
        allowOutsideClick: false,
      });
    } finally {
      setIsVerifying(false);
    }
  };

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

  return (
    <>
      <Seo title="Verificador de Silabus" />
      <Pageheader
        currentpage="Verificador de Silabus en Blockchain"
        activepage="Verificación"
        mainpage="Verificador"
        activepageclickable
      />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Card Principal */}
            <Card className="custom-card shadow-lg border-0 mb-4">
              <Card.Body className="p-5">
                <div className="text-center mb-5">
                  <div className="avatar avatar-lg bg-primary-transparent text-primary rounded-circle mx-auto mb-3" style={{ width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="ri-shield-check-fill" style={{ fontSize: "40px" }}></i>
                  </div>
                  <h3 className="fw-bold mb-2">Verificador de Autenticidad</h3>
                  <p className="text-muted mb-0">
                    Verifica la autenticidad e inmutabilidad de silabus registrados en blockchain
                  </p>
                </div>

                {/* Formulario de Búsqueda */}
                <form onSubmit={handleSearch}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text className="bg-light border-0">
                      <i className="ri-search-line text-primary"></i>
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Busca por ID, código de curso, nombre o hash SHA256..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 py-3"
                      style={{ fontSize: "16px" }}
                    />
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSearching}
                      className="px-4"
                    >
                      {isSearching ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <i className="ri-search-line me-2"></i>
                          Buscar
                        </>
                      )}
                    </Button>
                  </InputGroup>
                </form>

                {/* Mensajes de Error */}
                {error && !result && hasSearched && (
                  <Alert variant="warning" className="mb-4">
                    <i className="ri-error-warning-fill me-2"></i>
                    {error}
                  </Alert>
                )}

                {/* Resultado de la Búsqueda */}
                {result && (
                  <div className="mt-5">
                    <div className="border-top pt-4">
                      {/* Encabezado */}
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                          <h5 className="fw-bold mb-2">{result.courseName}</h5>
                          <p className="text-muted mb-1 fs-13">
                            <i className="ri-file-text-line me-2"></i>Código: <strong>{result.courseCode}</strong>
                          </p>
                          <p className="text-muted mb-0 fs-13">
                            <i className="ri-building-2-line me-2"></i>Carrera: <strong>{result.career || "No especificada"}</strong>
                          </p>
                        </div>
                        <Badge bg={getStatusColor(result.status)} className="px-3 py-2 fs-12">
                          {getStatusIcon(result.status)} {result.status}
                        </Badge>
                      </div>

                      {/* Tabs para PDF y Timeline */}
                      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "preview")}>
                        <Nav variant="tabs" className="mb-4 border-bottom">
                          <Nav.Item>
                            <Nav.Link eventKey="preview" className="fw-semibold">
                              <i className="ri-file-pdf-line me-2"></i>Vista Previa
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link eventKey="timeline" className="fw-semibold">
                              <i className="ri-history-line me-2"></i>Historial de Versiones
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link eventKey="details" className="fw-semibold">
                              <i className="ri-information-line me-2"></i>Detalles Blockchain
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>

                        <Tab.Content>
                          {/* TAB: PREVIEW PDF */}
                          <Tab.Pane eventKey="preview">
                            <div className="mb-4">
                              {result.fileName && result.fileName !== "—" ? (
                                <div className="bg-light p-4 rounded mb-3 text-center" style={{ minHeight: "600px" }}>
                                  <p className="text-muted mb-3 fs-13">
                                    <i className="ri-file-pdf-line me-2"></i>
                                    {result.fileName}
                                  </p>
                                  {isLoadingUrls ? (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "600px" }}>
                                      <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Cargando vista previa...</span>
                                      </Spinner>
                                    </div>
                                  ) : previewUrl ? (
                                    <>
                                      <iframe
                                        src={`${previewUrl}#toolbar=0`}
                                        style={{
                                          width: "100%",
                                          height: "600px",
                                          border: "1px solid #e0e0e0",
                                          borderRadius: "4px"
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
                                      No se puede cargar la vista previa del archivo. El archivo puede no estar disponible en el almacenamiento.
                                    </Alert>
                                  )}
                                </div>
                              ) : (
                                <Alert variant="info">
                                  <i className="ri-information-line me-2"></i>
                                  No hay archivo disponible para esta versión del sílabo.
                                </Alert>
                              )}
                            </div>
                          </Tab.Pane>

                          {/* TAB: TIMELINE */}
                          <Tab.Pane eventKey="timeline">
                            <div className="mb-4">
                              {isLoadingVersions ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                                  <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Cargando versiones...</span>
                                  </Spinner>
                                </div>
                              ) : versions && versions.length > 0 ? (
                                <div className="timeline-container ps-4">
                                  {versions.map((version, index) => {
                                    const versionDate = new Date(version.createdAt);
                                    const getStatusIcon = (isOnBlockchain: boolean) => {
                                      return isOnBlockchain ? { icon: "ri-shield-check-fill", color: "success" } : { icon: "ri-time-line", color: "warning" };
                                    };

                                    const statusInfo = getStatusIcon(version.isOnBlockchain);
                                    const isHighlighted = version.versionNumber === highlightedVersionNumber;

                                    return (
                                      <div
                                        key={index}
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
                                          className={`avatar avatar-sm text-white rounded-circle bg-${statusInfo.color} d-flex align-items-center justify-content-center position-relative`}
                                          style={{ width: "40px", height: "40px", zIndex: 1, flexShrink: 0 }}
                                        >
                                          <i className={statusInfo.icon}></i>
                                        </div>
                                        <div className="flex-fill ps-3 pb-3 border-bottom">
                                          <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                              <h6 className="fw-semibold mb-1">
                                                Versión {version.versionNumber}
                                                {version.isOnBlockchain && (
                                                  <Badge bg="success" className="ms-2 fs-11">
                                                    <i className="ri-shield-check-fill me-1"></i>
                                                    En Blockchain
                                                  </Badge>
                                                )}
                                              </h6>
                                              <p className="text-muted fs-13 mb-1">
                                                <i className="ri-user-3-line me-1"></i>
                                                Subido por: {version.uploadedBy || "Sistema"}
                                              </p>
                                              {version.status && (
                                                <p className="text-muted fs-13 mb-1">
                                                  <i className="ri-flag-line me-1"></i>
                                                  Estado: <strong>{version.status}</strong>
                                                </p>
                                              )}
                                              {version.notes && (
                                                <p className="text-muted fs-13 mb-1">
                                                  <i className="ri-sticky-note-line me-1"></i>
                                                  {version.notes}
                                                </p>
                                              )}
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
                                          <div className="row g-2 mt-2">
                                            <div className="col-auto">
                                              <div className="bg-light p-2 rounded">
                                                <code className="text-dark fs-11 text-break d-block">
                                                  Hash: {version.fileHash.substring(0, 32)}...
                                                </code>
                                              </div>
                                            </div>
                                            <div className="col-auto">
                                              <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => {
                                                  setSelectedVersionForQR(version);
                                                  setShowQRModal(true);
                                                }}
                                              >
                                                <i className="ri-qr-code-2-line me-1"></i>
                                                QR
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <Alert variant="info">
                                  <i className="ri-information-line me-2"></i>
                                  No hay versiones disponibles para este sílabo. {isLoadingVersions ? "Cargando..." : ""}
                                </Alert>
                              )}
                            </div>
                          </Tab.Pane>

                          {/* TAB: DETALLES BLOCKCHAIN */}
                          <Tab.Pane eventKey="details">
                            <div className="mb-4">
                              {/* Hash */}
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

                              {/* Información del Blockchain */}
                              <Row className="g-3 mb-4">
                                <Col md={6}>
                                  <div className="p-3 border rounded bg-white">
                                    <p className="text-muted mb-2 fs-12 fw-bold">
                                      <i className="ri-node-tree me-2"></i>BLOQUE DE RED
                                    </p>
                                    <h5 className="text-primary font-monospace mb-0">
                                      #{result.blockNumber || "—"}
                                    </h5>
                                  </div>
                                </Col>
                                <Col md={6}>
                                  <div className="p-3 border rounded bg-white">
                                    <p className="text-muted mb-2 fs-12 fw-bold">
                                      <i className="ri-link-m me-2"></i>CANAL
                                    </p>
                                    <h5 className="text-primary mb-0">{result.channel || "—"}</h5>
                                  </div>
                                </Col>
                              </Row>

                              {/* Resultado de Verificación */}
                              {verificationResult && (
                                <div className={`alert alert-${verificationResult.verified ? "success" : "warning"} mb-4`}>
                                  <div className="d-flex align-items-center">
                                    <i
                                      className={`ri-${verificationResult.verified ? "check-double-fill" : "alert-fill"} me-2 fs-5`}
                                    ></i>
                                    <div>
                                      <strong>
                                        {verificationResult.verified ? "✓ Documento Verificado" : "⚠ Documento No Verificado"}
                                      </strong>
                                      <p className="mb-0 mt-1 fs-13">
                                        {verificationResult.verified
                                          ? `El sílabo ha sido validado en el bloque #${verificationResult.block}`
                                          : "Este documento no se encuentra en el registro blockchain"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Botón de Verificación */}
                              <Button
                                variant="primary"
                                className="w-100"
                                onClick={handleVerify}
                                disabled={isVerifying}
                              >
                                {isVerifying ? (
                                  <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Verificando en blockchain...
                                  </>
                                ) : (
                                  <>
                                    <i className="ri-shield-keyhole-line me-2"></i>
                                    Verificar Integridad
                                  </>
                                )}
                              </Button>
                            </div>
                          </Tab.Pane>
                        </Tab.Content>
                      </Tab.Container>
                    </div>
                  </div>
                )}

                {/* Estado Inicial */}
                {!result && !hasSearched && (
                  <div className="text-center py-5 text-muted">
                    <i className="ri-file-search-line d-block mb-3" style={{ fontSize: "48px" }}></i>
                    <p className="mb-0">Ingresa un ID o código de curso para comenzar la verificación</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Información de Ayuda */}
            <Card className="custom-card border-0 mb-4 bg-light">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <i className="ri-information-line me-2 text-primary"></i>¿Cómo usar?
                </h6>
                <ul className="mb-0 ps-3 small text-muted">
                  <li className="mb-2">Busca por ID del sílabo, código de curso o nombre</li>
                  <li className="mb-2">También puedes usar el hash SHA-256 del documento</li>
                  <li className="mb-2">Haz click en "Verificar Integridad" para validar en blockchain</li>
                  <li>Un sílabo "Inmutable" ha sido registrado exitosamente en blockchain</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* QR Code Modal */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-qr-code-2-line me-2"></i>Código QR - Versión {selectedVersionForQR?.versionNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          {selectedVersionForQR && result && (
            <>
              <div className="mb-4 p-3 bg-white border rounded d-flex justify-content-center">
                <QRCodeSVG
                  value={`${window.location.origin}/public/verify?id=${result.id}&version=${selectedVersionForQR.versionNumber}`}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-muted mb-2">
                <i className="ri-information-line me-2"></i>
                Escanea este código QR para acceder a la versión {selectedVersionForQR.versionNumber}
              </p>
              <code className="d-block bg-light p-2 rounded text-break fs-11 mb-3">
                {`${window.location.origin}/public/verify?id=${result.id}&version=${selectedVersionForQR.versionNumber}`}
              </code>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/public/verify?id=${result.id}&version=${selectedVersionForQR.versionNumber}`;
                    navigator.clipboard.writeText(shareUrl);
                    Swal.fire({
                      title: "URL Copiada",
                      text: "La URL pública se copió al portapapeles",
                      icon: "success",
                      confirmButtonColor: "#198754",
                    });
                  }}
                >
                  <i className="ri-file-copy-line me-2"></i>
                  Copiar URL
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    const qrElement = document.querySelector("svg");
                    if (qrElement) {
                      const link = document.createElement("a");
                      link.download = `syllabus-v${selectedVersionForQR.versionNumber}-qr.svg`;
                      const svgData = new XMLSerializer().serializeToString(qrElement);
                      link.href = "data:image/svg+xml;base64," + btoa(svgData);
                      link.click();
                    }
                  }}
                >
                  <i className="ri-download-2-line me-2"></i>
                  Descargar QR
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default VerificadorSilabus;

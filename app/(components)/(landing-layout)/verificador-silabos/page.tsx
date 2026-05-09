"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, InputGroup, Form, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { LedgerService } from "@/shared/services/ledger.service";
import { SyllabusTrace } from "@/shared/types/ledger";
import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Swal from "sweetalert2";

const VerificadorSilabus: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<SyllabusTrace | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; block: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allSyllabi, setAllSyllabi] = useState<SyllabusTrace[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadAllSyllabi();
  }, []);

  const loadAllSyllabi = async () => {
    try {
      const data = await LedgerService.getAllSyllabus();
      setAllSyllabi(data);
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
                    <div className="border-top pt-4 mb-4">
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                          <h5 className="fw-bold mb-2">{result.courseName}</h5>
                          <p className="text-muted mb-1 fs-13">
                            <i className="ri-file-text-line me-2"></i>Código: <strong>{result.courseCode}</strong>
                          </p>
                          <p className="text-muted mb-3 fs-13">
                            <i className="ri-building-2-line me-2"></i>Carrera: <strong>{result.career}</strong>
                          </p>
                        </div>
                        <Badge bg={getStatusColor(result.status)} className="px-3 py-2 fs-12">
                          {getStatusIcon(result.status)} {result.status}
                        </Badge>
                      </div>

                      {/* Información del Hash */}
                      <div className="bg-light p-4 rounded mb-4">
                        <p className="text-muted mb-2 fs-12 fw-bold">
                          <i className="ri-link-chain me-2"></i>HASH SHA-256
                        </p>
                        <code className="text-dark fs-14 text-break d-block p-2 bg-white rounded border" style={{ wordBreak: "break-all" }}>
                          {result.currentHash || "No disponible"}
                        </code>
                      </div>

                      {/* Información del Blockchain */}
                      <Row className="g-3 mb-4">
                        <Col md={6}>
                          <div className="p-3 border rounded bg-white">
                            <p className="text-muted mb-1 fs-12 fw-bold">
                              <i className="ri-node-tree me-2"></i>BLOQUE DE RED
                            </p>
                            <h5 className="text-primary font-monospace mb-0">
                              #{result.blockNumber || "—"}
                            </h5>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="p-3 border rounded bg-white">
                            <p className="text-muted mb-1 fs-12 fw-bold">
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
                            <i className={`ri-${verificationResult.verified ? "check-double-fill" : "alert-fill"} me-2 fs-5`}></i>
                            <div>
                              <strong>{verificationResult.verified ? "✓ Documento Verificado" : "⚠ Documento No Verificado"}</strong>
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
                        size="lg"
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
    </>
  );
};

export default VerificadorSilabus;

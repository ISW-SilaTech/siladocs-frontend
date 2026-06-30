"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Row, Col, Card, Badge, InputGroup, Form, Button, Spinner, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import { SyllabusTrace, SyllabusVersion } from "@/shared/types/ledger";
import { LedgerService } from "@/shared/services/ledger.service";

const TrazabilidadTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<SyllabusTrace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<SyllabusTrace | null>(null);
  const [syllabusVersions, setSyllabusVersions] = useState<SyllabusVersion[]>([]);

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await LedgerService.getAllSyllabus(true);
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        Swal.fire("Error", "No se pudo cargar la lista de sílabos.", "error");
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (doc) =>
        doc.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, courses]);

  const handleSelectCourse = async (courseId: string) => {
    setIsLoadingHistory(true);
    setSyllabusVersions([]);
    const baseCourse = courses.find((c) => c.id === courseId);
    if (baseCourse) setSelectedTrace({ ...baseCourse, history: [] });

    try {
      const [fullTrace, versions] = await Promise.all([
        LedgerService.getSyllabusHistory(courseId),
        LedgerService.getSyllabusVersions(courseId),
      ]);

      setSyllabusVersions(versions);

      if (versions.length > 0) {
        // Build the history timeline from real blockchain versions
        const versionHistory = versions.map((v, idx) => ({
          txId: v.fabricTxId ?? `version-${v.versionId ?? idx}`,
          timestamp: v.createdAt,
          action: (idx === versions.length - 1 ? "CREATION" : "UPDATE") as "CREATION" | "UPDATE" | "VERIFICATION",
          actor: v.uploadedBy ?? "Sistema",
        }));
        setSelectedTrace({ ...fullTrace, history: versionHistory, versions });
      } else {
        setSelectedTrace(fullTrace);
      }
    } catch (error) {
      Swal.fire("Error", "Fallo al recuperar el historial del ledger.", "error");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleVerifyLedger = async () => {
    if (!selectedTrace) return;
    setIsVerifying(true);
    try {
      const result = await LedgerService.verifyImmutability(selectedTrace.id);
      if (result.verified) {
        Swal.fire({
          title: "Inmutabilidad Comprobada",
          html: `El hash coincide con el bloque <strong>#${result.block}</strong> de Hyperledger Fabric.`,
          icon: "success",
          confirmButtonColor: "#198754",
        });
      } else {
        Swal.fire("Alerta de Integridad", "El documento ha sido alterado fuera de la red.", "warning");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo contactar con los nodos de verificación.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Inmutable":
        return <Badge bg="success"><i className="ri-shield-check-fill me-1"></i>Inmutable</Badge>;
      case "Modificado":
        return <Badge bg="warning"><i className="ri-error-warning-fill me-1"></i>Modificado</Badge>;
      default:
        return <Badge bg="secondary">Pendiente</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATION":
        return <div className="avatar avatar-sm bg-primary text-white rounded-circle"><i className="ri-file-add-line"></i></div>;
      case "UPDATE":
        return <div className="avatar avatar-sm bg-warning text-white rounded-circle"><i className="ri-edit-line"></i></div>;
      case "VERIFICATION":
        return <div className="avatar avatar-sm bg-success text-white rounded-circle"><i className="ri-check-double-line"></i></div>;
      default:
        return <div className="avatar avatar-sm bg-secondary text-white rounded-circle"><i className="ri-node-tree"></i></div>;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "CREATION": return "Creación inicial";
      case "UPDATE": return "Nueva versión subida";
      case "VERIFICATION": return "Verificación de integridad";
      default: return action;
    }
  };

  return (
    <>
      <Alert variant="light" className="border d-flex align-items-start gap-2 mb-4">
        <i className="ri-information-line fs-5 text-primary"></i>
        <div className="fs-13">
          Selecciona un sílabo para ver su historial completo de versiones y verificar su
          integridad contra los bloques registrados en Hyperledger Fabric.
        </div>
      </Alert>

      <Row>
        <Col xl={4} lg={5}>
          <Card className="custom-card h-100">
            <Card.Header className="pb-0 border-bottom-0">
              <Card.Title>Cursos Registrados</Card.Title>
              <InputGroup className="mt-3 mb-2">
                <InputGroup.Text><i className="ri-search-line"></i></InputGroup.Text>
                <Form.Control
                  id="coach-blockchain-search"
                  placeholder="Buscar curso o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Card.Header>
            <Card.Body className="p-0">
              <div
                id="coach-blockchain-list"
                className="list-group list-group-flush"
                style={{ maxHeight: "600px", overflowY: "auto" }}
              >
                {isLoadingList ? (
                  <div className="p-5 text-center"><Spinner animation="border" variant="primary" /></div>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <button
                      key={course.id}
                      className={`list-group-item list-group-item-action p-3 border-bottom ${
                        selectedTrace?.id === course.id
                          ? "bg-primary-transparent border-start border-primary border-start-3"
                          : ""
                      }`}
                      onClick={() => handleSelectCourse(course.id)}
                      style={{ borderLeftWidth: selectedTrace?.id === course.id ? "4px" : "0px" }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-semibold mb-0">{course.courseName}</h6>
                        {getStatusBadge(course.status)}
                      </div>
                      <p className="text-muted fs-12 mb-1">{course.courseCode} • {course.career}</p>
                      <small className="text-primary font-monospace fs-11">
                        <i className="ri-link me-1"></i>
                        {course.currentHash ? course.currentHash.substring(0, 15) : "N/A"}...
                      </small>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted">No se encontraron cursos.</div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={8} lg={7}>
          {selectedTrace ? (
            <Card className="custom-card shadow-sm border-0">
              <Card.Header className="bg-light border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 d-flex align-items-center">
                    <i className="ri-file-text-line text-primary me-2 fs-4"></i>
                    {selectedTrace.fileName}
                  </h5>
                  <span className="text-muted fs-13">
                    Vigilado bajo Hyperledger Fabric ({selectedTrace.channel})
                  </span>
                </div>
                <Button variant="primary" onClick={handleVerifyLedger} disabled={isVerifying || isLoadingHistory}>
                  {isVerifying ? (
                    <><Spinner as="span" animation="border" size="sm" className="me-2" />Auditando...</>
                  ) : (
                    <><i className="ri-shield-keyhole-line me-2"></i>Verificar Integridad</>
                  )}
                </Button>
              </Card.Header>

              <Card.Body className="p-4">
                {/* ── Metadata row ── */}
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <div className="p-3 border rounded bg-light">
                      <p className="text-muted mb-1 fs-12 fw-bold">Hash SHA-256 (actual)</p>
                      <code className="text-dark fs-13 text-break">{selectedTrace.currentHash || "Cargando..."}</code>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 border rounded bg-light h-100">
                      <p className="text-muted mb-1 fs-12 fw-bold">Bloque de Red</p>
                      <h4 className="mb-0 font-monospace text-primary">#{selectedTrace.blockNumber || "-"}</h4>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 border rounded bg-light h-100">
                      <p className="text-muted mb-1 fs-12 fw-bold">Canal</p>
                      <span className="fs-14 fw-semibold">{selectedTrace.channel || "-"}</span>
                    </div>
                  </Col>
                </Row>

                {isLoadingHistory ? (
                  <div className="text-center p-5"><Spinner animation="grow" variant="secondary" /></div>
                ) : (
                  <>
                    {/* ── Version history table ── */}
                    {syllabusVersions.length > 0 && (
                      <div className="mb-5">
                        <h6 className="fw-bold mb-3 text-muted">
                          <i className="ri-git-branch-line me-2 text-primary"></i>
                          Versiones del Sílabo
                          <Badge bg="primary" className="ms-2 fs-11">{syllabusVersions.length}</Badge>
                        </h6>
                        <div className="table-responsive">
                          <table className="table table-sm table-hover fs-13 mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Versión</th>
                                <th>Hash SHA-256</th>
                                <th>Blockchain</th>
                                <th>Fecha</th>
                                <th>Subido por</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {syllabusVersions.map((v, idx) => (
                                <tr key={v.versionId ?? idx}>
                                  <td>
                                    <span className={`badge ${idx === 0 ? 'bg-primary' : 'bg-secondary-transparent text-muted'}`}>
                                      v{v.versionNumber ?? (syllabusVersions.length - idx)}
                                    </span>
                                    {idx === 0 && (
                                      <span className="badge bg-success-transparent text-success fs-10 ms-1">Última</span>
                                    )}
                                  </td>
                                  <td>
                                    <code className="fs-11 text-muted">
                                      {v.fileHash ? `${v.fileHash.substring(0, 20)}...` : "—"}
                                    </code>
                                  </td>
                                  <td>
                                    {v.isOnBlockchain ? (
                                      <div>
                                        <Badge bg="success" className="fs-10 d-block mb-1">⛓ En cadena</Badge>
                                        {v.fabricTxId && (
                                          <code className="fs-10 text-primary">{v.fabricTxId.substring(0, 16)}...</code>
                                        )}
                                      </div>
                                    ) : (
                                      <Badge bg="warning" text="dark" className="fs-10">⏳ Pendiente</Badge>
                                    )}
                                  </td>
                                  <td className="text-nowrap">
                                    {new Date(v.createdAt).toLocaleDateString("es-PE", {
                                      day: "2-digit", month: "short", year: "numeric",
                                    })}
                                  </td>
                                  <td className="text-muted">{v.uploadedBy ?? "—"}</td>
                                  <td>
                                    {v.status ? (
                                      <Badge bg="light" text="dark" className="border">{v.status}</Badge>
                                    ) : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {syllabusVersions.some(v => v.notes) && (
                          <div className="mt-2">
                            {syllabusVersions.filter(v => v.notes).map((v, idx) => (
                              <div key={idx} className="fs-12 text-muted fst-italic mt-1">
                                <strong>v{v.versionNumber}</strong>: {v.notes}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Transaction timeline ── */}
                    <h6 id="coach-blockchain-history" className="fw-bold mb-4 text-muted">
                      <i className="ri-history-line me-2"></i>Historial de Transacciones Blockchain
                    </h6>

                    {(selectedTrace.history?.length ?? 0) === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <i className="ri-node-tree fs-1 mb-3 d-block"></i>
                        <p className="mb-1 fw-medium">Sin historial detallado</p>
                        <small>El sílabo está registrado en el ledger pero no se encontraron eventos adicionales.</small>
                      </div>
                    ) : (
                      <div className="timeline-container px-2">
                        {selectedTrace.history.map((record, index) => {
                          // Find matching version for extra details
                          const matchingVersion = syllabusVersions.find(
                            v => v.fabricTxId && record.txId && v.fabricTxId === record.txId
                          ) ?? (syllabusVersions.length > 0
                            ? syllabusVersions[syllabusVersions.length - 1 - index]
                            : undefined);

                          return (
                            <div key={index} className="d-flex mb-4 position-relative">
                              {index !== selectedTrace.history.length - 1 && (
                                <div
                                  className="position-absolute"
                                  style={{ left: "15px", top: "30px", bottom: "-20px", width: "2px", backgroundColor: "#e9ecef", zIndex: 0 }}
                                />
                              )}
                              <div className="me-3 position-relative" style={{ zIndex: 1 }}>
                                {getActionIcon(record.action)}
                              </div>
                              <div className="flex-fill pb-1 border-bottom">
                                <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="fw-semibold">{getActionLabel(record.action)}</span>
                                    {matchingVersion && (
                                      <span className={`badge fs-10 ${index === 0 ? 'bg-primary' : 'bg-secondary-transparent text-muted'}`}>
                                        v{matchingVersion.versionNumber ?? (selectedTrace.history.length - index)}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-muted fs-12">
                                    {new Date(record.timestamp).toLocaleString("es-ES")}
                                  </span>
                                </div>
                                <p className="mb-1 fs-13 text-muted">
                                  Actor: <strong>{record.actor}</strong>
                                </p>
                                {matchingVersion?.fileHash && (
                                  <p className="mb-1 fs-12 text-muted">
                                    Hash: <code className="fs-11">{matchingVersion.fileHash.substring(0, 24)}...</code>
                                  </p>
                                )}
                                <Badge bg="light" text="dark" className="font-monospace border">
                                  TxID: {record.txId.length > 32 ? `${record.txId.substring(0, 32)}...` : record.txId}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Card className="custom-card h-100 d-flex align-items-center justify-content-center bg-light border-0">
              <div className="text-center p-5">
                <i className="ri-file-search-line fs-1 text-muted mb-3 d-block"></i>
                <h5 className="text-muted">Selecciona un documento para ver su trazabilidad</h5>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
};

export default TrazabilidadTab;

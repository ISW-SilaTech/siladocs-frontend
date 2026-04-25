"use client"
import React, { useState, useMemo, useEffect, Fragment } from "react"
import { Row, Col, Card, Badge, InputGroup, Form, Button, Spinner } from "react-bootstrap"
import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import Seo from "@/shared/layouts-components/seo/seo"
import Swal from "sweetalert2"

// 1. Aquí están tus tipos (esto lo arreglamos en el paso anterior)
import { SyllabusTrace, LedgerRecord } from '@/shared/types/ledger';

// 2. ¡AGREGA ESTA LÍNEA! -> Importa el servicio que hace las llamadas HTTP
import { LedgerService } from "@/shared/services/ledger.service";

const SyllabusTraceabilityDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<SyllabusTrace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<SyllabusTrace | null>(null);

  // Estados de carga
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Carga inicial de la lista
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await LedgerService.getAllSyllabus();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        Swal.fire('Error', 'No se pudo cargar la lista de sílabos.', 'error');
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(doc =>
      doc.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, courses]);

  // Handler para seleccionar y cargar historial desde Fabric
  const handleSelectCourse = async (courseId: string) => {
    setIsLoadingHistory(true);
    // Set temporal para mostrar algo mientras carga el historial
    const baseCourse = courses.find(c => c.id === courseId);
    if (baseCourse) setSelectedTrace({ ...baseCourse, history: [] });

    try {
      const fullTrace = await LedgerService.getSyllabusHistory(courseId);
      setSelectedTrace(fullTrace);
    } catch (error) {
      Swal.fire('Error', 'Fallo al recuperar el historial del ledger.', 'error');
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
          title: 'Inmutabilidad Comprobada',
          html: `El hash coincide con el bloque <strong>#${result.block}</strong> de Hyperledger Fabric.`,
          icon: 'success',
          confirmButtonColor: '#198754'
        });
      } else {
        Swal.fire('Alerta de Integridad', 'El documento ha sido alterado fuera de la red.', 'warning');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo contactar con los nodos de verificación.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Inmutable": return <Badge bg="success"><i className="ri-shield-check-fill me-1"></i>Inmutable</Badge>;
      case "Modificado": return <Badge bg="warning"><i className="ri-error-warning-fill me-1"></i>Modificado</Badge>;
      default: return <Badge bg="secondary">Pendiente</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATION": return <div className="avatar avatar-sm bg-primary text-white rounded-circle"><i className="ri-file-add-line"></i></div>;
      case "UPDATE": return <div className="avatar avatar-sm bg-warning text-white rounded-circle"><i className="ri-edit-line"></i></div>;
      case "VERIFICATION": return <div className="avatar avatar-sm bg-success text-white rounded-circle"><i className="ri-check-double-line"></i></div>;
      default: return <div className="avatar avatar-sm bg-secondary text-white rounded-circle"><i className="ri-node-tree"></i></div>;
    }
  };

  return (
    <Fragment>
      <Seo title="Trazabilidad de Sílabos" />
      <Pageheader currentpage="Trazabilidad Ledger" activepage="Auditoría" mainpage="Trazabilidad Ledger" activepageclickable />

      <Row>
        {/* PANEL IZQUIERDO */}
        <Col xl={4} lg={5}>
          <Card className="custom-card h-100">
            <Card.Header className="pb-0 border-bottom-0">
              <Card.Title>Cursos Registrados</Card.Title>
              <InputGroup className="mt-3 mb-2">
                <InputGroup.Text><i className="ri-search-line"></i></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar curso o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {isLoadingList ? (
                  <div className="p-5 text-center"><Spinner animation="border" variant="primary" /></div>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map(course => (
                    <button
                      key={course.id}
                      className={`list-group-item list-group-item-action p-3 border-bottom ${selectedTrace?.id === course.id ? 'bg-primary-transparent border-start border-primary border-start-3' : ''}`}
                      onClick={() => handleSelectCourse(course.id)}
                      style={{ borderLeftWidth: selectedTrace?.id === course.id ? '4px' : '0px' }}                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-semibold mb-0">{course.courseName}</h6>
                        {getStatusBadge(course.status)}
                      </div>
                      <p className="text-muted fs-12 mb-1">{course.courseCode} • {course.career}</p>
                      <small className="text-primary font-monospace fs-11">
                        <i className="ri-link me-1"></i>{course.currentHash ? course.currentHash.substring(0, 15) : 'N/A'}...
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

        {/* PANEL DERECHO */}
        <Col xl={8} lg={7}>
          {selectedTrace ? (
            <Card className="custom-card shadow-sm border-0 h-100">
              <Card.Header className="bg-light border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 d-flex align-items-center">
                    <i className="ri-file-text-line text-primary me-2 fs-4"></i>
                    {selectedTrace.fileName}
                  </h5>
                  <span className="text-muted fs-13">Vigilado bajo Hyperledger Fabric ({selectedTrace.channel})</span>
                </div>
                <Button
                  variant="primary"
                  onClick={handleVerifyLedger}
                  disabled={isVerifying || isLoadingHistory}
                >
                  {isVerifying ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Auditando...</> : <><i className="ri-shield-keyhole-line me-2"></i> Verificar Integridad</>}
                </Button>
              </Card.Header>

              <Card.Body className="p-4">
                <Row className="g-3 mb-5">
                  <Col md={6}>
                    <div className="p-3 border rounded bg-light">
                      <p className="text-muted mb-1 fs-12 fw-bold">Hash SHA-256</p>
                      <code className="text-dark fs-13 text-break">{selectedTrace.currentHash || 'Cargando...'}</code>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 border rounded bg-light h-100">
                      <p className="text-muted mb-1 fs-12 fw-bold">Bloque de Red</p>
                      <h4 className="mb-0 font-monospace text-primary">#{selectedTrace.blockNumber || '-'}</h4>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 border rounded bg-light h-100">
                      <p className="text-muted mb-1 fs-12 fw-bold">Canal</p>
                      <span className="fs-14 fw-semibold">{selectedTrace.channel || '-'}</span>
                    </div>
                  </Col>
                </Row>

                <h6 className="fw-bold mb-4 text-muted"><i className="ri-history-line me-2"></i>Historial de Transacciones</h6>

                {isLoadingHistory ? (
                  <div className="text-center p-5"><Spinner animation="grow" variant="secondary" /></div>
                ) : (
                  <div className="timeline-container px-2">
                    {selectedTrace.history?.map((record, index) => (
                      <div key={index} className="d-flex mb-4 position-relative">
                        {index !== selectedTrace.history.length - 1 && (
                          <div className="position-absolute" style={{ left: '15px', top: '30px', bottom: '-20px', width: '2px', backgroundColor: '#e9ecef', zIndex: 0 }}></div>
                        )}
                        <div className="me-3 position-relative" style={{ zIndex: 1 }}>{getActionIcon(record.action)}</div>
                        <div className="flex-fill pb-1 border-bottom">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold">{record.action}</span>
                            <span className="text-muted fs-12">{new Date(record.timestamp).toLocaleString('es-ES')}</span>
                          </div>
                          <p className="mb-1 fs-13 text-muted">Actor: <strong>{record.actor}</strong></p>
                          <Badge bg="light" text="dark" className="font-monospace border">TxID: {record.txId}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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
    </Fragment>
  );
};
export default SyllabusTraceabilityDashboard;

"use client";

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useState, useEffect, useRef } from "react";
import { Card, Col, Row, Spinner, Alert, Modal, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SyllabiService, Syllabus, SyllabusUploadResponse } from "@/shared/services/syllabi.service";
import { CoursesService } from "@/shared/services/courses.service";

interface CourseOption {
    id: number;
    name: string;
    code: string;
}

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const SilabosPage: React.FC = () => {
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Upload modal
    const [showModal, setShowModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<SyllabusUploadResponse | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchSyllabi = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await SyllabiService.getAll();
            setSyllabi(data);
        } catch (err) {
            console.error("Error fetching syllabi:", err);
            setError("Error al cargar los sílabos. Intente de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const data = await CoursesService.getAll();
            setCourses(data.map(c => ({ id: c.id, name: c.name, code: c.code })));
        } catch (err) {
            console.error("Error fetching courses:", err);
        }
    };

    useEffect(() => {
        fetchSyllabi();
        fetchCourses();
    }, []);

    const handleOpenModal = () => {
        setSelectedCourseId(courses.length > 0 ? String(courses[0].id) : "");
        setSelectedFile(null);
        setFormError(null);
        setUploadResult(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (isUploading) return;
        setShowModal(false);
        setUploadResult(null);
        setFormError(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFormError(null);
        if (!file) { setSelectedFile(null); return; }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            setFormError("Tipo de archivo no permitido. Solo PDF, DOC o DOCX.");
            setSelectedFile(null);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFormError("El archivo supera el tamaño máximo de 10 MB.");
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        setFormError(null);
        if (!selectedCourseId) { setFormError("Seleccione un curso."); return; }
        if (!selectedFile) { setFormError("Seleccione un archivo."); return; }

        setIsUploading(true);
        try {
            const result = await SyllabiService.upload(Number(selectedCourseId), selectedFile);
            setUploadResult(result);
            toast.success("¡Sílabo subido y confirmado en blockchain!");
            await fetchSyllabi();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Error al subir el sílabo.";
            setFormError(msg);
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Está seguro de que desea eliminar este sílabo?")) return;
        try {
            await SyllabiService.delete(id);
            toast.success("Sílabo eliminado.");
            await fetchSyllabi();
        } catch (err) {
            console.error("Error deleting syllabus:", err);
            toast.error("Error al eliminar el sílabo.");
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return "—";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const statusBadge: Record<string, string> = {
        confirmed: "bg-success-transparent",
        pending: "bg-warning-transparent",
        failed: "bg-danger-transparent",
    };

    return (
        <Fragment>
            <Seo title="Sílabos" />
            <Pageheader
                title="Gestión Académica"
                subtitle="Sílabos"
                currentpage="Lista de Sílabos"
                activepage="Gestión de Sílabos"
            />

            {/* Toolbar */}
            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Body className="p-3">
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                <SpkButton Customclass="btn btn-primary" onClick={handleOpenModal}>
                                    <i className="ri-upload-cloud-2-line me-1 fw-medium align-middle"></i>
                                    Subir Sílabo
                                </SpkButton>
                                <div className="d-flex align-items-center gap-2 text-muted fs-13">
                                    <i className="ri-shield-check-line text-success"></i>
                                    Todos los sílabos son registrados en Hyperledger Fabric
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Row>
                <Col xl={12}>
                    <Card className="custom-card overflow-hidden">
                        <Card.Body className="p-0">
                            <div className="table-responsive w-100">
                                {isLoading ? (
                                    <div className="text-center p-5">
                                        <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </Spinner>
                                    </div>
                                ) : error ? (
                                    <Alert variant="danger" className="m-3">{error}</Alert>
                                ) : (
                                    <SpkTables
                                        tableClass="text-nowrap"
                                        header={[
                                            { title: "Archivo" },
                                            { title: "Curso" },
                                            { title: "Tamaño" },
                                            { title: "Hash SHA-256" },
                                            { title: "Tx Blockchain" },
                                            { title: "Fecha" },
                                            { title: "Estado" },
                                            { title: "Acciones" },
                                        ]}
                                    >
                                        {syllabi.map((s) => (
                                            <tr key={s.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className="ri-file-pdf-2-line text-danger fs-4"></i>
                                                        <span className="fw-medium">{s.fileName}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="fw-medium">{s.courseName}</span>
                                                    <br />
                                                    <small className="text-muted">{s.courseCode}</small>
                                                </td>
                                                <td>{formatBytes(s.fileSize)}</td>
                                                <td>
                                                    <code className="text-muted fs-11">
                                                        {s.hash ? `${s.hash.substring(0, 16)}...` : "—"}
                                                    </code>
                                                </td>
                                                <td>
                                                    {s.fabricTxId ? (
                                                        <code className="text-primary fs-11">
                                                            {s.fabricTxId.substring(0, 16)}...
                                                        </code>
                                                    ) : (
                                                        <span className="text-warning">Sin confirmar</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {s.uploadedAt
                                                        ? new Date(s.uploadedAt).toLocaleDateString("es-PE")
                                                        : "—"}
                                                </td>
                                                <td>
                                                    <SpkBadge
                                                        variant=""
                                                        Customclass={statusBadge[s.status?.toLowerCase()] ?? "bg-light text-default"}
                                                    >
                                                        {s.status ?? "—"}
                                                    </SpkBadge>
                                                </td>
                                                <td>
                                                    <SpkButton
                                                        onClick={() => handleDelete(s.id)}
                                                        Buttonvariant="danger-light"
                                                        Size="sm"
                                                        Customclass="btn-icon"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </SpkButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </SpkTables>
                                )}
                            </div>
                        </Card.Body>
                        {!isLoading && !error && syllabi.length === 0 && (
                            <Card.Body className="text-center text-muted py-5">
                                <i className="ri-file-unknow-line fs-1 mb-3 d-block"></i>
                                <p className="mb-0">No hay sílabos registrados. Sube el primero.</p>
                            </Card.Body>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Upload Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="ri-upload-cloud-2-line me-2 text-primary"></i>
                        Subir Sílabo a Blockchain
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Success result */}
                    {uploadResult ? (
                        <div className="text-center py-3">
                            <div className="mb-3">
                                <i className="ri-shield-check-fill text-success" style={{ fontSize: "3rem" }}></i>
                            </div>
                            <h5 className="text-success fw-bold">¡Confirmado en Blockchain!</h5>
                            <p className="text-muted mb-3">El sílabo fue registrado exitosamente en Hyperledger Fabric.</p>
                            <div className="text-start border rounded p-3 bg-light">
                                <div className="mb-2">
                                    <span className="text-muted fs-12 fw-bold">Curso:</span>
                                    <div className="fw-medium">{uploadResult.courseName}</div>
                                </div>
                                <div className="mb-2">
                                    <span className="text-muted fs-12 fw-bold">Hash SHA-256:</span>
                                    <code className="d-block fs-11 text-break">{uploadResult.currentHash}</code>
                                </div>
                                <div>
                                    <span className="text-muted fs-12 fw-bold">Transaction ID (Fabric):</span>
                                    <code className="d-block fs-11 text-break text-primary">{uploadResult.fabricTxId}</code>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Form>
                            {formError && <Alert variant="danger">{formError}</Alert>}

                            <Form.Group className="mb-3">
                                <Form.Label>Curso <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    disabled={isUploading || courses.length === 0}
                                >
                                    {courses.length === 0 ? (
                                        <option value="">Sin cursos disponibles</option>
                                    ) : (
                                        courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} — {c.name}
                                            </option>
                                        ))
                                    )}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Archivo (PDF, DOC, DOCX — máx. 10 MB) <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                                {selectedFile && (
                                    <div className="mt-2 text-muted fs-12">
                                        <i className="ri-file-line me-1"></i>
                                        {selectedFile.name} ({formatBytes(selectedFile.size)})
                                    </div>
                                )}
                            </Form.Group>

                            <Alert variant="info" className="fs-12 mb-0">
                                <i className="ri-information-line me-1"></i>
                                Al subir, el sistema calculará el hash SHA-256 del archivo y lo registrará en
                                Hyperledger Fabric. Recibirás un <strong>Transaction ID</strong> como confirmación.
                            </Alert>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {uploadResult ? (
                        <SpkButton Customclass="btn btn-primary" onClick={handleCloseModal}>
                            Cerrar
                        </SpkButton>
                    ) : (
                        <>
                            <SpkButton Customclass="btn btn-secondary" onClick={handleCloseModal} Disabled={isUploading}>
                                Cancelar
                            </SpkButton>
                            <SpkButton Customclass="btn btn-primary" onClick={handleUpload} Disabled={isUploading || !selectedFile}>
                                {isUploading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                                        Subiendo a blockchain...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-upload-cloud-2-line me-1"></i>
                                        Subir y Registrar
                                    </>
                                )}
                            </SpkButton>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            <ToastContainer />
        </Fragment>
    );
};

export default SilabosPage;

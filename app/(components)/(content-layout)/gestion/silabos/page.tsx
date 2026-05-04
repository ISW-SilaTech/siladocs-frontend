"use client";

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useState, useEffect, useRef, useCallback } from "react";
import { Card, Col, Row, Spinner, Alert, Modal, Form, ListGroup, ProgressBar } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SyllabiService, Syllabus, SyllabusUploadResponse } from "@/shared/services/syllabi.service";
import { CoursesService } from "@/shared/services/courses.service";
import { GoogleDriveOAuthService, GoogleDriveFile } from "@/shared/services/google-drive-oauth.service";
import { OneDriveOAuthService, OneDriveFile } from "@/shared/services/onedrive-oauth.service";
import api from "@/shared/config/axios";

interface CourseOption { id: number; name: string; code: string; }

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

type ImportSource = "google" | "onedrive" | null;

const statusBadge: Record<string, string> = {
    confirmed: "bg-success-transparent",
    pending: "bg-warning-transparent",
    failed: "bg-danger-transparent",
    create: "bg-primary-transparent",
    update: "bg-info-transparent",
};

const statusLabel: Record<string, string> = {
    confirmed: "Confirmado",
    pending: "Pendiente",
    failed: "Fallido",
    create: "Creado",
    update: "Actualizado",
};

const SilabosPage: React.FC = () => {
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Upload modal
    const [showModal, setShowModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<SyllabusUploadResponse | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Download state
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    // Preview modal
    const [previewSyllabus, setPreviewSyllabus] = useState<Syllabus | null>(null);

    // Cloud Import modal
    const [showImportModal, setShowImportModal] = useState(false);
    const [importSource, setImportSource] = useState<ImportSource>(null);
    const [cloudFiles, setCloudFiles] = useState<(GoogleDriveFile | OneDriveFile)[]>([]);
    const [isLoadingCloud, setIsLoadingCloud] = useState(false);
    const [cloudAccessToken, setCloudAccessToken] = useState("");
    const [selectedCloudFile, setSelectedCloudFile] = useState<GoogleDriveFile | OneDriveFile | null>(null);
    const [importCourseId, setImportCourseId] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [cloudError, setCloudError] = useState<string | null>(null);

    const fetchSyllabi = async () => {
        setIsLoading(true); setError(null);
        try {
            const data = await SyllabiService.getAll();
            setSyllabi(data);
        } catch {
            setError("Error al cargar los sílabos. Intente de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const data = await CoursesService.getAll();
            setCourses(data.map(c => ({ id: c.id, name: c.name, code: c.code })));
        } catch { /* silent */ }
    };

    useEffect(() => { fetchSyllabi(); fetchCourses(); }, []);

    // --- Upload handlers ---
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) return "Tipo de archivo no permitido. Solo PDF, DOC o DOCX.";
        if (file.size > MAX_FILE_SIZE) return "El archivo supera el tamaño máximo de 50 MB.";
        return null;
    };

    const handleOpenModal = () => {
        setSelectedCourseId(courses.length > 0 ? String(courses[0].id) : "");
        setSelectedFile(null); setFormError(null); setUploadResult(null);
        setUploadProgress(0); setIsDragging(false);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (isUploading) return;
        setShowModal(false); setUploadResult(null); setFormError(null);
        setSelectedFile(null); setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileSelect = (file: File) => {
        setFormError(null);
        const err = validateFile(file);
        if (err) { setFormError(err); setSelectedFile(null); return; }
        setSelectedFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    }, []);

    const handleUpload = async () => {
        setFormError(null);
        if (!selectedCourseId) { setFormError("Seleccione un curso."); return; }
        if (!selectedFile) { setFormError("Seleccione un archivo."); return; }
        setIsUploading(true); setUploadProgress(0);

        // Simulate progress while uploading
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => prev < 85 ? prev + 5 : prev);
        }, 300);

        try {
            const result = await SyllabiService.upload(Number(selectedCourseId), selectedFile);
            clearInterval(progressInterval);
            setUploadProgress(100);
            setUploadResult(result);
            toast.success("¡Sílabo subido y confirmado en blockchain!");
            await fetchSyllabi();
        } catch (err: any) {
            clearInterval(progressInterval);
            setUploadProgress(0);
            const msg = err?.response?.data?.message || err?.message || "Error al subir el sílabo.";
            setFormError(msg); toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    // --- Download handler ---
    const handleDownload = async (syllabus: Syllabus) => {
        setDownloadingId(syllabus.id);
        try {
            await SyllabiService.download(syllabus.id, syllabus.fileName);
            toast.success("Descarga iniciada.");
        } catch {
            toast.error("Error al descargar. Verifique que el archivo esté disponible en Azure.");
        } finally {
            setDownloadingId(null);
        }
    };

    // --- Delete handler ---
    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Está seguro de que desea eliminar este sílabo?")) return;
        try {
            await SyllabiService.delete(id);
            toast.success("Sílabo eliminado.");
            await fetchSyllabi();
        } catch {
            toast.error("Error al eliminar el sílabo.");
        }
    };

    // --- Cloud Import handlers ---
    const handleOpenImport = (source: ImportSource) => {
        setImportSource(source);
        setCloudFiles([]); setCloudError(null); setSelectedCloudFile(null);
        setCloudAccessToken("");
        setImportCourseId(courses.length > 0 ? String(courses[0].id) : "");
        setShowImportModal(true);
    };

    const handleCloseImport = () => {
        if (isImporting) return;
        setShowImportModal(false); setImportSource(null); setCloudFiles([]);
        setSelectedCloudFile(null); setCloudAccessToken(""); setCloudError(null);
    };

    const handleLoadCloudFiles = async () => {
        if (!cloudAccessToken.trim()) { setCloudError("Ingrese un token de acceso válido."); return; }
        setIsLoadingCloud(true); setCloudError(null);
        try {
            let files;
            if (importSource === "google") {
                files = await GoogleDriveOAuthService.listFiles(cloudAccessToken);
            } else {
                files = await OneDriveOAuthService.listFiles(cloudAccessToken);
            }
            setCloudFiles(files);
            if (files.length === 0) setCloudError("No se encontraron archivos PDF, DOC o DOCX.");
        } catch {
            setCloudError("Error al listar archivos. Verifique el token de acceso.");
        } finally {
            setIsLoadingCloud(false);
        }
    };

    const handleImportCloudFile = async () => {
        if (!selectedCloudFile || !importCourseId) return;
        setIsImporting(true); setCloudError(null);
        try {
            const endpoint = importSource === "google" ? "/oauth/google/import" : "/oauth/onedrive/import";
            await api.post(endpoint, {
                accessToken: cloudAccessToken,
                fileId: selectedCloudFile.id,
                fileName: selectedCloudFile.name,
            });
            toast.success(`"${selectedCloudFile.name}" importado correctamente.`);
            handleCloseImport();
            await fetchSyllabi();
        } catch {
            setCloudError("Error al importar el archivo. Intente de nuevo.");
        } finally {
            setIsImporting(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return "—";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatDate = (iso?: string) =>
        iso ? new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    return (
        <Fragment>
            <Seo title="Sílabos" />
            <Pageheader title="Gestión Académica" subtitle="Sílabos" currentpage="Lista de Sílabos" activepage="Gestión de Sílabos" />
            <ToastContainer />

            {/* Toolbar */}
            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Body className="p-3">
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div className="d-flex flex-wrap gap-2">
                                    <SpkButton Customclass="btn btn-primary" onClick={handleOpenModal}>
                                        <i className="ri-upload-cloud-2-line me-1 fw-medium align-middle"></i>
                                        Subir Sílabo
                                    </SpkButton>
                                    <button className="btn btn-light d-flex align-items-center gap-2" onClick={() => handleOpenImport("google")}>
                                        <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                                        Google Drive
                                    </button>
                                    <button className="btn btn-light d-flex align-items-center gap-2" onClick={() => handleOpenImport("onedrive")}>
                                        <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#0364B8" d="M29 21l-5.2-3.1L17 29h17l-5-8z"/><path fill="#0078D4" d="M19.8 17.9L14 24l17 5-2-12z"/><path fill="#1490DF" d="M14 24l-5 4c-2.2 1.7-3 4.8-1.7 7.3C8.5 37.7 11 39 13.5 39H34l-3-10z"/><path fill="#28A8E8" d="M29 21L20 18c-4.7-1.5-9.8 1.1-11.3 5.8-.3 1-.4 2-.3 3L14 24z"/></svg>
                                        OneDrive
                                    </button>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted fs-13">
                                    <i className="ri-shield-check-line text-success"></i>
                                    Registrados en Hyperledger Fabric
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
                                    <div className="text-center p-5"><Spinner animation="border" /></div>
                                ) : error ? (
                                    <Alert variant="danger" className="m-3">{error}</Alert>
                                ) : (
                                    <SpkTables tableClass="text-nowrap" header={[
                                        { title: "Archivo" }, { title: "Curso" }, { title: "Hash SHA-256" },
                                        { title: "Tx Blockchain" }, { title: "Fecha" }, { title: "Estado" }, { title: "Acciones" },
                                    ]}>
                                        {syllabi.map((s) => (
                                            <tr key={s.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className={`fs-4 ${s.fileName?.endsWith(".pdf") ? "ri-file-pdf-2-line text-danger" : "ri-file-word-line text-primary"}`}></i>
                                                        <div>
                                                            <div className="fw-medium">{s.fileName || "—"}</div>
                                                            <small className="text-muted">{formatBytes(s.fileSize)}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="fw-medium">{s.courseName}</span>
                                                    <br /><small className="text-muted">{s.courseCode}</small>
                                                </td>
                                                <td><code className="text-muted fs-11">{s.hash ? `${s.hash.substring(0, 16)}...` : "—"}</code></td>
                                                <td>
                                                    {s.fabricTxId
                                                        ? <code className="text-primary fs-11">{s.fabricTxId.substring(0, 16)}...</code>
                                                        : <span className="text-warning fs-12">Sin confirmar</span>
                                                    }
                                                </td>
                                                <td className="fs-13">{formatDate(s.uploadedAt)}</td>
                                                <td>
                                                    <SpkBadge variant="" Customclass={statusBadge[s.status?.toLowerCase()] ?? "bg-light text-default"}>
                                                        {statusLabel[s.status?.toLowerCase()] ?? s.status ?? "—"}
                                                    </SpkBadge>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <button className="btn btn-sm btn-icon btn-info-light" title="Ver detalles" onClick={() => setPreviewSyllabus(s)}>
                                                            <i className="ri-eye-line"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-icon btn-success-light" title="Descargar" onClick={() => handleDownload(s)} disabled={downloadingId === s.id}>
                                                            {downloadingId === s.id ? <Spinner as="span" animation="border" size="sm" /> : <i className="ri-download-2-line"></i>}
                                                        </button>
                                                        <button className="btn btn-sm btn-icon btn-danger-light" title="Eliminar" onClick={() => handleDelete(s.id)}>
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                    </div>
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

            {/* ── Upload Modal ── */}
            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" size="lg" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="ri-upload-cloud-2-line me-2 text-primary"></i>
                        Subir Sílabo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {uploadResult ? (
                        // ── Success screen ──
                        <div className="text-center py-3">
                            <div className="mb-3"><i className="ri-shield-check-fill text-success" style={{ fontSize: "3.5rem" }}></i></div>
                            <h5 className="text-success fw-bold mb-1">¡Registrado en Blockchain!</h5>
                            <p className="text-muted mb-4">El sílabo fue subido y verificado en Hyperledger Fabric.</p>
                            <Row className="g-3 text-start">
                                <Col xs={12}>
                                    <div className="border rounded p-3 bg-light">
                                        <div className="row g-2">
                                            <div className="col-sm-6">
                                                <p className="text-muted fs-12 fw-bold mb-1">Curso</p>
                                                <p className="fw-medium mb-0">{uploadResult.courseName}</p>
                                            </div>
                                            <div className="col-sm-6">
                                                <p className="text-muted fs-12 fw-bold mb-1">Estado</p>
                                                <SpkBadge variant="" Customclass="bg-success-transparent">Confirmado</SpkBadge>
                                            </div>
                                            <div className="col-12">
                                                <p className="text-muted fs-12 fw-bold mb-1">Hash SHA-256</p>
                                                <code className="fs-11 text-break d-block">{uploadResult.currentHash}</code>
                                            </div>
                                            <div className="col-12">
                                                <p className="text-muted fs-12 fw-bold mb-1">Transaction ID (Hyperledger Fabric)</p>
                                                <code className="fs-11 text-break d-block text-primary">{uploadResult.fabricTxId}</code>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <Form>
                            {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}

                            {/* Course selector */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">Curso <span className="text-danger">*</span></Form.Label>
                                <Form.Select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} disabled={isUploading}>
                                    {courses.length === 0
                                        ? <option value="">Sin cursos disponibles</option>
                                        : courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)
                                    }
                                </Form.Select>
                            </Form.Group>

                            {/* Drag and drop zone */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Archivo <span className="text-danger">*</span></Form.Label>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    style={{
                                        border: `2px dashed ${isDragging ? "#6366f1" : selectedFile ? "#22c55e" : "#cbd5e1"}`,
                                        borderRadius: "12px",
                                        padding: "2rem",
                                        textAlign: "center",
                                        cursor: isUploading ? "not-allowed" : "pointer",
                                        background: isDragging ? "#f0f0ff" : selectedFile ? "#f0fdf4" : "#f8fafc",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {selectedFile ? (
                                        <div>
                                            <i className={`fs-2 mb-2 d-block ${selectedFile.name.endsWith(".pdf") ? "ri-file-pdf-2-line text-danger" : "ri-file-word-line text-primary"}`}></i>
                                            <p className="fw-semibold mb-0">{selectedFile.name}</p>
                                            <p className="text-muted fs-13 mb-0">{formatBytes(selectedFile.size)}</p>
                                            {!isUploading && (
                                                <button className="btn btn-sm btn-link text-danger mt-1 p-0" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                                                    Cambiar archivo
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <i className="ri-upload-cloud-2-line fs-2 text-muted mb-2 d-block"></i>
                                            <p className="fw-semibold mb-1">Arrastra tu archivo aquí</p>
                                            <p className="text-muted fs-13 mb-0">o haz clic para seleccionar</p>
                                            <p className="text-muted fs-12 mt-1">PDF, DOC, DOCX — máx. 50 MB</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} onChange={handleFileChange} className="d-none" />
                            </Form.Group>

                            {/* Upload progress */}
                            {isUploading && (
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between fs-12 text-muted mb-1">
                                        <span>Subiendo y registrando en blockchain...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <ProgressBar animated now={uploadProgress} variant={uploadProgress === 100 ? "success" : "primary"} />
                                </div>
                            )}

                            <Alert variant="info" className="fs-12 mb-0 py-2">
                                <i className="ri-shield-line me-1"></i>
                                El archivo se subirá al servidor, se calculará su <strong>hash SHA-256</strong> y se registrará en <strong>Hyperledger Fabric</strong>.
                            </Alert>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {uploadResult ? (
                        <SpkButton Customclass="btn btn-primary" onClick={handleCloseModal}>Cerrar</SpkButton>
                    ) : (
                        <>
                            <SpkButton Customclass="btn btn-secondary" onClick={handleCloseModal} Disabled={isUploading}>Cancelar</SpkButton>
                            <SpkButton Customclass="btn btn-primary" onClick={handleUpload} Disabled={isUploading || !selectedFile || !selectedCourseId}>
                                {isUploading
                                    ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Procesando...</>
                                    : <><i className="ri-upload-cloud-2-line me-1"></i>Subir y Registrar en Blockchain</>
                                }
                            </SpkButton>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            {/* ── Preview Modal ── */}
            <Modal show={!!previewSyllabus} onHide={() => setPreviewSyllabus(null)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="ri-file-info-line me-2 text-info"></i>
                        Detalles del Sílabo
                    </Modal.Title>
                </Modal.Header>
                {previewSyllabus && (
                    <Modal.Body>
                        {/* Header info */}
                        <div className="d-flex align-items-start gap-3 mb-4 p-3 border rounded bg-light">
                            <i className={`fs-1 ${previewSyllabus.fileName?.endsWith(".pdf") ? "ri-file-pdf-2-line text-danger" : "ri-file-word-line text-primary"}`}></i>
                            <div className="flex-grow-1">
                                <h6 className="fw-bold mb-1">{previewSyllabus.fileName || "Sin nombre"}</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    <span className="badge bg-primary-transparent text-primary">{previewSyllabus.courseCode}</span>
                                    <span className="fs-13 text-muted">{previewSyllabus.courseName}</span>
                                </div>
                                <div className="mt-1">
                                    <SpkBadge variant="" Customclass={statusBadge[previewSyllabus.status?.toLowerCase()] ?? "bg-light text-default"}>
                                        {statusLabel[previewSyllabus.status?.toLowerCase()] ?? previewSyllabus.status ?? "—"}
                                    </SpkBadge>
                                </div>
                            </div>
                            <div className="text-end">
                                <div className="fs-12 text-muted">Tamaño</div>
                                <div className="fw-semibold">{formatBytes(previewSyllabus.fileSize)}</div>
                            </div>
                        </div>

                        <Row className="g-3">
                            {/* Fecha */}
                            <Col sm={6}>
                                <div className="border rounded p-3 h-100">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="ri-calendar-line text-primary fs-5"></i>
                                        <span className="fw-semibold fs-13">Fecha de Registro</span>
                                    </div>
                                    <p className="mb-0 fs-14">{formatDate(previewSyllabus.uploadedAt)}</p>
                                </div>
                            </Col>

                            {/* Tamaño */}
                            <Col sm={6}>
                                <div className="border rounded p-3 h-100">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="ri-hard-drive-2-line text-success fs-5"></i>
                                        <span className="fw-semibold fs-13">Almacenamiento</span>
                                    </div>
                                    <p className="mb-0 fs-13 text-muted">Azure Blob Storage</p>
                                    <p className="mb-0 fs-14 fw-medium">{formatBytes(previewSyllabus.fileSize)}</p>
                                </div>
                            </Col>

                            {/* Hash SHA-256 */}
                            <Col xs={12}>
                                <div className="border rounded p-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="ri-fingerprint-line text-warning fs-5"></i>
                                        <span className="fw-semibold fs-13">Huella Digital SHA-256</span>
                                    </div>
                                    {previewSyllabus.hash ? (
                                        <code className="fs-12 text-break d-block bg-light p-2 rounded">{previewSyllabus.hash}</code>
                                    ) : (
                                        <span className="text-muted fs-13">No disponible</span>
                                    )}
                                </div>
                            </Col>

                            {/* Blockchain TX */}
                            <Col xs={12}>
                                <div className="border rounded p-3" style={{ borderColor: previewSyllabus.fabricTxId ? "#6366f1" : undefined }}>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="ri-links-line fs-5" style={{ color: "#6366f1" }}></i>
                                        <span className="fw-semibold fs-13">Registro Hyperledger Fabric</span>
                                        {previewSyllabus.fabricTxId && (
                                            <span className="badge ms-auto" style={{ background: "#6366f1" }}>Confirmado</span>
                                        )}
                                    </div>
                                    {previewSyllabus.fabricTxId ? (
                                        <code className="fs-12 text-break d-block bg-light p-2 rounded" style={{ color: "#6366f1" }}>
                                            {previewSyllabus.fabricTxId}
                                        </code>
                                    ) : (
                                        <Alert variant="warning" className="mb-0 py-2 fs-12">
                                            <i className="ri-error-warning-line me-1"></i>
                                            Este sílabo no tiene confirmación de blockchain aún.
                                        </Alert>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                )}
                <Modal.Footer className="justify-content-between">
                    <SpkButton Customclass="btn btn-secondary" onClick={() => setPreviewSyllabus(null)}>Cerrar</SpkButton>
                    {previewSyllabus && (
                        <SpkButton
                            Customclass="btn btn-success"
                            onClick={() => { handleDownload(previewSyllabus); setPreviewSyllabus(null); }}
                            Disabled={downloadingId === previewSyllabus.id}
                        >
                            <i className="ri-download-2-line me-1"></i>Descargar Sílabo
                        </SpkButton>
                    )}
                </Modal.Footer>
            </Modal>

            {/* ── Cloud Import Modal ── */}
            <Modal show={showImportModal} onHide={handleCloseImport} centered size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {importSource === "google"
                            ? <><svg width="18" height="18" viewBox="0 0 48 48" className="me-2"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Importar desde Google Drive</>
                            : <><svg width="18" height="18" viewBox="0 0 48 48" className="me-2"><path fill="#0364B8" d="M29 21l-5.2-3.1L17 29h17l-5-8z"/><path fill="#0078D4" d="M19.8 17.9L14 24l17 5-2-12z"/><path fill="#1490DF" d="M14 24l-5 4c-2.2 1.7-3 4.8-1.7 7.3C8.5 37.7 11 39 13.5 39H34l-3-10z"/><path fill="#28A8E8" d="M29 21L20 18c-4.7-1.5-9.8 1.1-11.3 5.8-.3 1-.4 2-.3 3L14 24z"/></svg>Importar desde OneDrive</>
                        }
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cloudError && <Alert variant="danger" className="py-2">{cloudError}</Alert>}

                    <div className="mb-3">
                        <Form.Label className="fw-semibold">Token de Acceso <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex gap-2">
                            <Form.Control
                                type="password"
                                placeholder={importSource === "google" ? "ya29.xxxxx (Google access_token)" : "eyJ0eXAi... (Microsoft access_token)"}
                                value={cloudAccessToken}
                                onChange={(e) => setCloudAccessToken(e.target.value)}
                                disabled={isLoadingCloud}
                            />
                            <button className="btn btn-outline-primary text-nowrap" onClick={handleLoadCloudFiles} disabled={isLoadingCloud}>
                                {isLoadingCloud ? <Spinner as="span" animation="border" size="sm" /> : <><i className="ri-refresh-line me-1"></i>Cargar</>}
                            </button>
                        </div>
                        <div className="text-muted fs-12 mt-1">
                            {importSource === "google"
                                ? <>Obtén el token en <strong>Google OAuth Playground</strong> → Step 2 → access_token</>
                                : <>Obtén el token en <strong>Microsoft Graph Explorer</strong> → pestaña Access token</>
                            }
                        </div>
                    </div>

                    {cloudFiles.length > 0 && (
                        <>
                            <Form.Label className="fw-semibold">Archivos disponibles ({cloudFiles.length})</Form.Label>
                            <ListGroup className="mb-3" style={{ maxHeight: "240px", overflowY: "auto" }}>
                                {cloudFiles.map((file) => (
                                    <ListGroup.Item key={file.id} action active={selectedCloudFile?.id === file.id} onClick={() => setSelectedCloudFile(file)} className="d-flex align-items-center gap-2 py-2">
                                        <i className={`fs-5 ${file.name.endsWith(".pdf") ? "ri-file-pdf-2-line" : "ri-file-word-line"} ${selectedCloudFile?.id === file.id ? "text-white" : "text-danger"}`}></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-medium fs-13">{file.name}</div>
                                            {file.size && <div className="fs-11 opacity-75">{formatBytes(Number(file.size))}</div>}
                                        </div>
                                        {selectedCloudFile?.id === file.id && <i className="ri-check-circle-fill"></i>}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <Form.Group>
                                <Form.Label className="fw-semibold">Asignar al curso <span className="text-danger">*</span></Form.Label>
                                <Form.Select value={importCourseId} onChange={(e) => setImportCourseId(e.target.value)}>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}

                    {!isLoadingCloud && cloudFiles.length === 0 && (
                        <div className="text-center text-muted py-4">
                            <i className="ri-cloud-line fs-1 mb-2 d-block"></i>
                            <p className="mb-0">Ingresa tu token y haz clic en <strong>Cargar</strong></p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <SpkButton Customclass="btn btn-secondary" onClick={handleCloseImport} Disabled={isImporting}>Cancelar</SpkButton>
                    <SpkButton Customclass="btn btn-primary" onClick={handleImportCloudFile} Disabled={isImporting || !selectedCloudFile || !importCourseId}>
                        {isImporting
                            ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Importando...</>
                            : <><i className="ri-download-cloud-line me-1"></i>Importar a Azure Blob Storage</>
                        }
                    </SpkButton>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default SilabosPage;

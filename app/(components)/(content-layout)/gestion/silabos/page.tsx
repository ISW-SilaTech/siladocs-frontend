"use client";

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useState, useEffect, useRef } from "react";
import { Card, Col, Row, Spinner, Alert, Modal, Form, ListGroup } from "react-bootstrap";
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
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type ImportSource = "google" | "onedrive" | null;

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

    // Download state
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

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
        setIsLoading(true);
        setError(null);
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
    const handleOpenModal = () => {
        setSelectedCourseId(courses.length > 0 ? String(courses[0].id) : "");
        setSelectedFile(null); setFormError(null); setUploadResult(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (isUploading) return;
        setShowModal(false); setUploadResult(null); setFormError(null); setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFormError(null);
        if (!file) { setSelectedFile(null); return; }
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            setFormError("Tipo de archivo no permitido. Solo PDF, DOC o DOCX.");
            setSelectedFile(null); return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFormError("El archivo supera el tamaño máximo de 10 MB.");
            setSelectedFile(null); return;
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
            toast.error("Error al descargar el sílabo. Intente de nuevo.");
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
        if (!cloudAccessToken.trim()) {
            setCloudError("Ingrese un token de acceso válido.");
            return;
        }
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
            toast.success(`Archivo "${selectedCloudFile.name}" importado correctamente.`);
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

    const statusBadge: Record<string, string> = {
        confirmed: "bg-success-transparent",
        pending: "bg-warning-transparent",
        failed: "bg-danger-transparent",
        create: "bg-primary-transparent",
    };

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
                                    <button
                                        className="btn btn-light d-flex align-items-center gap-2"
                                        onClick={() => handleOpenImport("google")}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                        </svg>
                                        Importar desde Google Drive
                                    </button>
                                    <button
                                        className="btn btn-light d-flex align-items-center gap-2"
                                        onClick={() => handleOpenImport("onedrive")}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="#0364B8" d="M29 21l-5.2-3.1L17 29h17l-5-8z"/>
                                            <path fill="#0078D4" d="M19.8 17.9L14 24l17 5-2-12z"/>
                                            <path fill="#1490DF" d="M14 24l-5 4c-2.2 1.7-3 4.8-1.7 7.3C8.5 37.7 11 39 13.5 39H34l-3-10z"/>
                                            <path fill="#28A8E8" d="M29 21L20 18c-4.7-1.5-9.8 1.1-11.3 5.8-.3 1-.4 2-.3 3L14 24z"/>
                                        </svg>
                                        Importar desde OneDrive
                                    </button>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted fs-13">
                                    <i className="ri-shield-check-line text-success"></i>
                                    Sílabos registrados en Hyperledger Fabric
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
                                                <td>{s.uploadedAt ? new Date(s.uploadedAt).toLocaleDateString("es-PE") : "—"}</td>
                                                <td>
                                                    <SpkBadge variant="" Customclass={statusBadge[s.status?.toLowerCase()] ?? "bg-light text-default"}>
                                                        {s.status ?? "—"}
                                                    </SpkBadge>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <button
                                                            className="btn btn-sm btn-icon btn-success-light"
                                                            title="Descargar desde Azure"
                                                            onClick={() => handleDownload(s)}
                                                            disabled={downloadingId === s.id}
                                                        >
                                                            {downloadingId === s.id
                                                                ? <Spinner as="span" animation="border" size="sm" />
                                                                : <i className="ri-download-2-line"></i>
                                                            }
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-icon btn-danger-light"
                                                            title="Eliminar"
                                                            onClick={() => handleDelete(s.id)}
                                                        >
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

            {/* Upload Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="ri-upload-cloud-2-line me-2 text-primary"></i>
                        Subir Sílabo a Blockchain
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                                <Form.Select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} disabled={isUploading}>
                                    {courses.length === 0
                                        ? <option value="">Sin cursos disponibles</option>
                                        : courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)
                                    }
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Archivo (PDF, DOC, DOCX — máx. 10 MB) <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} onChange={handleFileChange} disabled={isUploading} />
                                {selectedFile && (
                                    <div className="mt-2 text-muted fs-12">
                                        <i className="ri-file-line me-1"></i>
                                        {selectedFile.name} ({formatBytes(selectedFile.size)})
                                    </div>
                                )}
                            </Form.Group>
                            <Alert variant="info" className="fs-12 mb-0">
                                <i className="ri-information-line me-1"></i>
                                El sistema calculará el hash SHA-256 y lo registrará en Hyperledger Fabric.
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
                            <SpkButton Customclass="btn btn-primary" onClick={handleUpload} Disabled={isUploading || !selectedFile}>
                                {isUploading ? (
                                    <><Spinner as="span" animation="border" size="sm" className="me-2" />Subiendo...</>
                                ) : (
                                    <><i className="ri-upload-cloud-2-line me-1"></i>Subir y Registrar</>
                                )}
                            </SpkButton>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Cloud Import Modal */}
            <Modal show={showImportModal} onHide={handleCloseImport} centered size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {importSource === "google"
                            ? <><i className="ri-google-line me-2 text-danger"></i>Importar desde Google Drive</>
                            : <><i className="ri-cloud-line me-2 text-primary"></i>Importar desde OneDrive</>
                        }
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cloudError && <Alert variant="danger">{cloudError}</Alert>}

                    {/* Step 1: Access Token */}
                    <div className="mb-3">
                        <Form.Label className="fw-semibold">
                            Token de Acceso <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="d-flex gap-2">
                            <Form.Control
                                type="password"
                                placeholder={importSource === "google" ? "Google OAuth access_token" : "Microsoft access_token"}
                                value={cloudAccessToken}
                                onChange={(e) => setCloudAccessToken(e.target.value)}
                                disabled={isLoadingCloud}
                            />
                            <button className="btn btn-outline-primary text-nowrap" onClick={handleLoadCloudFiles} disabled={isLoadingCloud}>
                                {isLoadingCloud ? <Spinner as="span" animation="border" size="sm" /> : <><i className="ri-refresh-line me-1"></i>Cargar archivos</>}
                            </button>
                        </div>
                        <div className="text-muted fs-12 mt-1">
                            {importSource === "google"
                                ? "Obtén el token desde Google OAuth Playground o tu aplicación."
                                : "Obtén el token desde Microsoft Graph Explorer o tu aplicación."
                            }
                        </div>
                    </div>

                    {/* Step 2: File list */}
                    {cloudFiles.length > 0 && (
                        <>
                            <Form.Label className="fw-semibold">Archivos disponibles</Form.Label>
                            <ListGroup className="mb-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
                                {cloudFiles.map((file) => (
                                    <ListGroup.Item
                                        key={file.id}
                                        action
                                        active={selectedCloudFile?.id === file.id}
                                        onClick={() => setSelectedCloudFile(file)}
                                        className="d-flex align-items-center gap-2 py-2"
                                    >
                                        <i className={`ri-file-${file.name.endsWith(".pdf") ? "pdf-2" : "word"}-line fs-5 ${selectedCloudFile?.id === file.id ? "text-white" : "text-danger"}`}></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-medium fs-13">{file.name}</div>
                                            {file.size && <div className="fs-11 opacity-75">{formatBytes(Number(file.size))}</div>}
                                        </div>
                                        {selectedCloudFile?.id === file.id && <i className="ri-check-line"></i>}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            {/* Step 3: Select course */}
                            <Form.Group>
                                <Form.Label className="fw-semibold">Asignar al curso <span className="text-danger">*</span></Form.Label>
                                <Form.Select value={importCourseId} onChange={(e) => setImportCourseId(e.target.value)}>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}

                    {cloudFiles.length === 0 && !isLoadingCloud && cloudAccessToken && (
                        <div className="text-center text-muted py-3">
                            <i className="ri-folder-open-line fs-2 mb-2 d-block"></i>
                            Ingresa un token y haz clic en "Cargar archivos"
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <SpkButton Customclass="btn btn-secondary" onClick={handleCloseImport} Disabled={isImporting}>Cancelar</SpkButton>
                    <SpkButton
                        Customclass="btn btn-primary"
                        onClick={handleImportCloudFile}
                        Disabled={isImporting || !selectedCloudFile || !importCourseId}
                    >
                        {isImporting ? (
                            <><Spinner as="span" animation="border" size="sm" className="me-2" />Importando...</>
                        ) : (
                            <><i className="ri-download-cloud-line me-1"></i>Importar a Azure Blob Storage</>
                        )}
                    </SpkButton>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default SilabosPage;

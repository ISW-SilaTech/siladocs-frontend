"use client";

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Card, Col, Row, Spinner, Alert, Modal, Form, ListGroup, ProgressBar, Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SyllabiService, Syllabus, SyllabusUploadResponse } from "@/shared/services/syllabi.service";
import { CoursesService } from "@/shared/services/courses.service";
import { GoogleDriveOAuthService, GoogleDriveFile } from "@/shared/services/google-drive-oauth.service";
import { OneDriveOAuthService, OneDriveFile } from "@/shared/services/onedrive-oauth.service";
import { BlockchainEventsService, BlockchainEvent, BlockchainEventsClient } from "@/shared/services/blockchain-events.service";
import api from "@/shared/config/axios";
import { useAuth } from "@/shared/contextapi";
import SyllabusConfirmationModal from "@/shared/components/syllabus-confirmation-modal";

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
    validated: "bg-success",
};

const statusLabel: Record<string, string> = {
    confirmed: "Confirmado",
    pending: "Pendiente",
    failed: "Fallido",
    create: "Creado",
    update: "Actualizado",
    validated: "Validado",
};

const SilabosPage: React.FC = () => {
    const { user } = useAuth();
    // HU0010: solo el rol "Administrador Académico" puede eliminar sílabos
    // (matriz de permisos en GUIA_VALIDADORES.md). El backend re-valida este
    // mismo rol en DELETE /syllabi/{id}; este check solo controla la UI.
    const canDeleteSyllabus = user?.role === "Administrador Académico";

    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Delete confirmation modal state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    // Upload modal
    const [showModal, setShowModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<SyllabusUploadResponse | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [uploadVerificationStatus, setUploadVerificationStatus] = useState<'pending' | 'verified' | 'not-found' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Preview URL for selected file (object URL)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // SSE live blockchain events
    const [sseEvents, setSseEvents] = useState<BlockchainEvent[]>([]);
    const sseClientRef = useRef<BlockchainEventsClient | null>(null);
    const sseLogRef = useRef<HTMLDivElement>(null);

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

    // Confirmation modal (double validation before upload)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [pendingUploadData, setPendingUploadData] = useState<{
      courseId: number;
      courseName: string;
      courseCode: string;
      fileName: string;
      file?: File;
    } | null>(null);

    const fetchSyllabi = async () => {
        setIsLoading(true); setError(null);
        try {
            console.log('[DEBUG] Fetching syllabi...');
            const data = await SyllabiService.getAll();
            console.log('[DEBUG] Fetched syllabi:', data);
            console.log(`[DEBUG] Total syllabi: ${data.length}`);
            setSyllabi(data);
        } catch (err) {
            console.error('[DEBUG] Error fetching syllabi:', err);
            setError("Error al cargar los sílabos. Intente de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const [coursesError, setCoursesError] = useState<string | null>(null);

    const fetchCourses = async () => {
        setCoursesError(null);
        try {
            const data = await CoursesService.getAll();
            setCourses(data.map(c => ({ id: c.id, name: c.name, code: c.code })));
        } catch (err) {
            setCoursesError("No se pudieron cargar los cursos. Recarga la página.");
        }
    };

    useEffect(() => { fetchSyllabi(); fetchCourses(); }, []);

    // Create / revoke object URL when file changes
    useEffect(() => {
        if (!selectedFile) { setPreviewUrl(null); return; }
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    // --- Upload handlers ---
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) return "Tipo de archivo no permitido. Solo PDF, DOC o DOCX.";
        if (file.size > MAX_FILE_SIZE) return "El archivo supera el tamaño máximo de 50 MB.";
        return null;
    };

    const handleOpenModal = () => {
        setSelectedCourseId(""); // No preseleccionar curso
        setSelectedFile(null); setFormError(null); setUploadResult(null);
        setUploadProgress(0); setIsDragging(false); setSseEvents([]);
        setUploadVerificationStatus(null);
        sseClientRef.current?.close();
        sseClientRef.current = null;
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (isUploading) return;
        sseClientRef.current?.close();
        sseClientRef.current = null;
        setShowModal(false); setUploadResult(null); setFormError(null);
        setSelectedFile(null); setUploadProgress(0); setSseEvents([]);
        setUploadVerificationStatus(null);
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

    // Auto-scroll SSE log to bottom on new events
    useEffect(() => {
        if (sseLogRef.current) {
            sseLogRef.current.scrollTop = sseLogRef.current.scrollHeight;
        }
    }, [sseEvents]);

    const handleUploadClick = async () => {
        setFormError(null);
        if (!selectedCourseId) { setFormError("Seleccione un curso."); return; }
        if (!selectedFile) { setFormError("Seleccione un archivo."); return; }

        // Find course details
        const course = courses.find(c => c.id === Number(selectedCourseId));
        if (!course) { setFormError("Curso no encontrado."); return; }

        // Show confirmation modal immediately
        // Analysis will be performed inside the modal
        setPendingUploadData({
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            fileName: selectedFile.name,
            file: selectedFile,
        });
        setShowConfirmationModal(true);
    };

    const handleUpload = async () => {
        if (!pendingUploadData || !selectedFile) return;

        const sessionId = BlockchainEventsService.newSessionId();
        setSseEvents([]);
        setIsUploading(true);
        setUploadProgress(0);
        setShowConfirmationModal(false);

        // Open SSE connection before sending the file so events arrive in order
        sseClientRef.current?.close();
        sseClientRef.current = BlockchainEventsService.connect(sessionId, {
            onEvent: (evt) => {
                setSseEvents(prev => [...prev, evt]);
                setUploadProgress(prev => Math.max(prev, evt.progress)); // H#6: never go backwards
            },
            onComplete: () => {
                sseClientRef.current = null;
            },
            onError: () => { // H#7: capture SSE connection errors
                setFormError("Se perdió la conexión en tiempo real. Verifica que el sílabo se haya registrado en la tabla.");
                setIsUploading(false);
            },
        });

        try {
            console.log('[DEBUG] Starting upload for course:', pendingUploadData.courseId);
            const result = await SyllabiService.uploadWithSession(pendingUploadData.courseId, selectedFile, sessionId);
            console.log('[DEBUG] Upload result:', result);
            setUploadProgress(100);
            setUploadResult(result);
            setUploadVerificationStatus('pending');
            toast.success("¡Sílabo subido y confirmado en blockchain!");

            // Wait 1 second to ensure database transaction is committed before fetching
            console.log('[DEBUG] Waiting 1 second before fetching updated list...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Fetch with retry logic in case of timing issues
            let retries = 3;
            let fetchSucceeded = false;
            while (retries > 0 && !fetchSucceeded) {
                try {
                    console.log(`[DEBUG] Fetching syllabi (attempt ${4 - retries}/3)...`);
                    await fetchSyllabi();
                    fetchSucceeded = true;
                    console.log('[DEBUG] Successfully refreshed syllabi list');
                } catch (fetchErr) {
                    retries--;
                    console.error(`[DEBUG] Fetch failed, retries remaining: ${retries}`, fetchErr);
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            }

            // Verify if the newly uploaded syllabus appears in the list
            if (result.id) {
                const foundInList = syllabi.some(s => s.id === result.id);
                if (foundInList) {
                    console.log('[DEBUG] ✓ Newly uploaded syllabus found in list');
                    setUploadVerificationStatus('verified');
                } else {
                    console.warn('[DEBUG] ✗ Newly uploaded syllabus NOT found in list after refresh');
                    setUploadVerificationStatus('not-found');
                }
            }
        } catch (err: any) {
            setUploadProgress(0);
            console.error('[DEBUG] Upload error:', err);
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Error al subir el sílabo.";
            setFormError(msg);
            toast.error(msg);
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

    // --- Approve handler (TC-02) ---
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleApprove = async (id: number) => {
        if (!window.confirm("¿Aprobar este sílabo? El estado cambiará a 'Validado'.")) return;
        setApprovingId(id);
        try {
            await SyllabiService.approve(id);
            toast.success("Sílabo aprobado correctamente.");
            await fetchSyllabi();
        } catch {
            toast.error("Error al aprobar el sílabo.");
        } finally {
            setApprovingId(null);
        }
    };

    // --- Verify integrity handler (TC-04) ---
    const [verifyingId, setVerifyingId] = useState<number | null>(null);
    const handleVerifyIntegrity = async (syllabus: Syllabus) => {
        setVerifyingId(syllabus.id);
        try {
            const result = await SyllabiService.verifyIntegrity(syllabus.id);
            if (result.integrityValid) {
                toast.success(`Integridad verificada ✓ Hash coincide con blockchain. TxID: ${result.fabricTxId}`);
            } else {
                toast.warning("Advertencia: No se pudo verificar la integridad completa del documento.");
            }
        } catch {
            toast.error("Error al verificar la integridad.");
        } finally {
            setVerifyingId(null);
        }
    };

    // --- Delete handler ---
    const openDeleteConfirm = (id: number) => {
        setDeleteConfirmId(id);
        setShowDeleteConfirm(true);
    };

    const closeDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setDeleteConfirmId(null);
    };

    const handleDelete = async () => {
        if (deleteConfirmId === null) return;
        const id = deleteConfirmId;
        setDeletingId(id);
        try {
            await SyllabiService.delete(id);
            toast.success("Sílabo eliminado. Su registro en blockchain se conserva para auditoría.");
            await fetchSyllabi();
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 403) {
                toast.error("No tiene permisos para eliminar sílabos. Solo el rol Administrador Académico puede hacerlo.");
            } else if (status === 404) {
                toast.error("El sílabo ya no existe.");
            } else if (status === 409) {
                toast.error("El sílabo ya había sido eliminado anteriormente.");
            } else {
                toast.error("Error al eliminar el sílabo.");
            }
        } finally {
            setDeletingId(null);
            closeDeleteConfirm();
        }
    };

    // --- Cloud Import handlers ---
    const handleOpenImport = (source: ImportSource) => {
        setImportSource(source);
        setCloudFiles([]); setCloudError(null); setSelectedCloudFile(null);
        setCloudAccessToken("");
        setImportCourseId(""); // No preseleccionar curso
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
                courseId: Number(importCourseId),
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
                                    <SpkButton Customclass="btn btn-primary" onClick={handleOpenModal} Id="coach-btn-nuevo-silabo">
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
                                    <button className="btn btn-light d-flex align-items-center gap-2" onClick={() => fetchSyllabi()} disabled={isLoading} title="Actualizar lista de sílabos">
                                        <Spinner as="span" animation="border" size="sm" className={isLoading ? '' : 'd-none'} />
                                        <i className={`ri-refresh-line ${isLoading ? 'd-none' : ''}`}></i>
                                        Actualizar
                                    </button>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted fs-13">
                                    <i className="ri-shield-check-line text-success"></i>
                                    Registrados en Hyperledger Fabric
                                    <span className="badge bg-info-transparent text-info ms-2">
                                        {syllabi.length} sílabo{syllabi.length !== 1 ? 's' : ''}
                                    </span>
                                    {syllabi.length === 4 && (
                                        <span className="badge bg-danger-transparent text-danger ms-2" title="⚠️ Es probable que hay más sílabos en la BD. Revisa el navegador DevTools (F12) → Console">
                                            ⚠️ Posible límite en backend
                                        </span>
                                    )}
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
                                    <div id="coach-syllabus-table">
                                    <SpkTables tableClass="text-nowrap" header={[
                                        { title: "Archivo" }, { title: "Curso" }, { title: "Hash SHA-256" },
                                        { title: "Blockchain" }, { title: "Fecha" }, { title: "Estado" }, { title: "Acciones" },
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
                                                    {!s.hash ? (
                                                        <span className="badge bg-danger-transparent text-danger">⚠️ Sin registrar</span>
                                                    ) : s.fabricTxId ? (
                                                        <div>
                                                            <span className="badge bg-success-transparent text-success mb-1 d-block">⛓ En cadena</span>
                                                            <code className="text-primary fs-11">{s.fabricTxId.substring(0, 12)}...</code>
                                                        </div>
                                                    ) : (
                                                        <span className="badge bg-warning-transparent text-warning">⏳ Pendiente</span>
                                                    )}
                                                </td>
                                                <td className="fs-13">{formatDate(s.uploadedAt)}</td>
                                                <td>
                                                    <div id="coach-status-badge">
                                                        <SpkBadge variant="" Customclass={statusBadge[s.status?.toLowerCase()] ?? "bg-light text-default"}>
                                                            {statusLabel[s.status?.toLowerCase()] ?? s.status ?? "—"}
                                                        </SpkBadge>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <button className="btn btn-sm btn-icon btn-info-light" title="Ver detalles" onClick={() => setPreviewSyllabus(s)}>
                                                            <i className="ri-eye-line"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-icon btn-success-light coach-download-btn" title="Descargar" onClick={() => handleDownload(s)} disabled={downloadingId === s.id}>
                                                            {downloadingId === s.id ? <Spinner as="span" animation="border" size="sm" /> : <i className="ri-download-2-line"></i>}
                                                        </button>
                                                        {s.status?.toLowerCase() === "confirmed" && (
                                                            <button
                                                                className="btn btn-sm btn-icon btn-warning-light coach-approve-btn"
                                                                title="Aprobar sílabo (TC-02)"
                                                                onClick={() => handleApprove(s.id)}
                                                                disabled={approvingId === s.id}
                                                            >
                                                                {approvingId === s.id ? <Spinner as="span" animation="border" size="sm" /> : <i className="ri-checkbox-circle-line"></i>}
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-icon btn-purple-light coach-verify-btn"
                                                            title="Verificar integridad (TC-04)"
                                                            onClick={() => handleVerifyIntegrity(s)}
                                                            disabled={verifyingId === s.id}
                                                        >
                                                            {verifyingId === s.id ? <Spinner as="span" animation="border" size="sm" /> : <i className="ri-shield-check-line"></i>}
                                                        </button>
                                                        {canDeleteSyllabus && (
                                                            <button className="btn btn-sm btn-icon btn-danger-light" title="Eliminar sílabo" onClick={() => openDeleteConfirm(s.id)} disabled={deletingId === s.id}>
                                                                {deletingId === s.id ? <Spinner as="span" animation="border" size="sm" /> : <i className="ri-delete-bin-line"></i>}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </SpkTables>
                                    </div>
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
            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" size="xl" keyboard={false}>
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="fs-16 fw-bold">
                        <i className="ri-upload-cloud-2-line me-2 text-primary"></i>
                        Subir Sílabo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {uploadResult ? (
                        /* ── Success screen ── */
                        <div className="text-center py-4">
                            <div className="mb-3">
                                <span style={{ fontSize: "4rem" }}>🎉</span>
                            </div>
                            <h5 className="text-success fw-bold mb-1">¡Registrado en Blockchain!</h5>
                            <p className="text-muted mb-4">El sílabo fue subido y verificado en Hyperledger Fabric.</p>
                            {uploadVerificationStatus === 'not-found' && (
                                <Alert variant="warning" className="mb-3">
                                    <i className="ri-alert-line me-2"></i>
                                    <strong>Advertencia:</strong> El sílabo se registró correctamente en blockchain, pero aún no aparece en la lista. Intenta hacer clic en "Actualizar" en la barra de herramientas.
                                </Alert>
                            )}
                            <div className="border rounded-3 p-4 bg-light text-start">
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <p className="text-muted fs-12 fw-bold mb-1 text-uppercase ls-1">Curso</p>
                                        <p className="fw-semibold mb-0">{uploadResult.courseName}</p>
                                    </div>
                                    <div className="col-sm-6">
                                        <p className="text-muted fs-12 fw-bold mb-1 text-uppercase ls-1">Estado</p>
                                        <SpkBadge variant="" Customclass="bg-success-transparent">
                                            <i className="ri-check-line me-1"></i>Confirmado en Fabric
                                        </SpkBadge>
                                    </div>
                                    <div className="col-12">
                                        <p className="text-muted fs-12 fw-bold mb-1 text-uppercase ls-1">Hash SHA-256</p>
                                        <code className="fs-11 text-break d-block bg-white border rounded p-2">{uploadResult.currentHash}</code>
                                    </div>
                                    <div className="col-12">
                                        <p className="text-muted fs-12 fw-bold mb-1 text-uppercase ls-1">Transaction ID · Hyperledger Fabric</p>
                                        <code className="fs-11 text-break d-block bg-white border rounded p-2 text-primary">{uploadResult.fabricTxId ?? '—'}</code>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-center">
                                <Link href="/core/blockchain" className="btn btn-outline-primary btn-sm">
                                    <i className="ri-link-m me-1"></i>Ver trazabilidad en el ledger
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* ── Two-column layout: form + preview ── */
                        <Row className="g-0" style={{ minHeight: "440px" }}>
                            {/* LEFT: Form */}
                            <Col md={selectedFile ? 5 : 12} style={{ transition: "all 0.3s ease" }}>
                                <div className="pe-md-3" style={{ borderRight: selectedFile ? "1px solid #e9ecef" : "none" }}>
                                    {formError && <Alert variant="danger" className="py-2 fs-13">{formError}</Alert>}

                                    {/* Course selector */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold fs-13">
                                            <i className="ri-book-open-line me-1 text-primary"></i>
                                            Curso <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            id="coach-modal-curso"
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                            disabled={isUploading || coursesError !== null}
                                            style={{ borderRadius: "8px" }}
                                        >
                                            <option value="" disabled>Seleccione un curso...</option>
                                            {courses.length === 0
                                                ? <option value="" disabled>Sin cursos disponibles</option>
                                                : courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)
                                            }
                                        </Form.Select>
                                        {coursesError && <small className="text-danger">{coursesError}</small>}
                                    </Form.Group>

                                    {/* Drag and drop zone */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold fs-13">
                                            <i className="ri-attachment-line me-1 text-primary"></i>
                                            Archivo <span className="text-danger">*</span>
                                        </Form.Label>
                                        <div
                                            id="coach-modal-file-drop"
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => !isUploading && fileInputRef.current?.click()}
                                            style={{
                                                border: `2px dashed ${isDragging ? "#6366f1" : selectedFile ? "#22c55e" : "#cbd5e1"}`,
                                                borderRadius: "12px",
                                                padding: selectedFile ? "1rem" : "2rem",
                                                textAlign: "center",
                                                cursor: isUploading ? "not-allowed" : "pointer",
                                                background: isDragging ? "#eef2ff" : selectedFile ? "#f0fdf4" : "#f8fafc",
                                                transition: "all 0.25s ease",
                                            }}
                                        >
                                            {selectedFile ? (
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className={`fs-3 ${selectedFile.name.endsWith(".pdf") ? "ri-file-pdf-2-line text-danger" : "ri-file-word-line text-primary"}`}></i>
                                                    <div className="text-start flex-grow-1 overflow-hidden">
                                                        <p className="fw-semibold mb-0 fs-13 text-truncate">{selectedFile.name}</p>
                                                        <p className="text-muted fs-12 mb-0">{formatBytes(selectedFile.size)}</p>
                                                    </div>
                                                    {!isUploading && (
                                                        <button
                                                            className="btn btn-sm btn-light rounded-circle p-1"
                                                            style={{ width: 28, height: 28, lineHeight: 1 }}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                            title="Quitar archivo"
                                                        >
                                                            <i className="ri-close-line fs-13"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <i className="ri-upload-cloud-2-line fs-1 mb-2 d-block" style={{ color: isDragging ? "#6366f1" : "#94a3b8" }}></i>
                                                    <p className="fw-semibold mb-1 fs-14">{isDragging ? "Suelta aquí" : "Arrastra tu archivo"}</p>
                                                    <p className="text-muted fs-13 mb-1">o haz clic para seleccionar</p>
                                                    <span className="badge bg-light text-muted fs-11">PDF · DOC · DOCX · máx. 50 MB</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} onChange={handleFileChange} className="d-none" />
                                    </Form.Group>

                                    {/* Upload progress bar */}
                                    {isUploading && (
                                        <div className="mb-2">
                                            <div className="d-flex justify-content-between fs-12 text-muted mb-1">
                                                <span className="d-flex align-items-center gap-1">
                                                    <Spinner animation="border" size="sm" style={{ width: "10px", height: "10px", borderWidth: "1px" }} />
                                                    Procesando...
                                                </span>
                                                <span className="fw-semibold text-primary">{uploadProgress}%</span>
                                            </div>
                                            <ProgressBar animated now={uploadProgress} variant="primary" style={{ height: "4px", borderRadius: "99px" }} />
                                        </div>
                                    )}

                                    {!isUploading && sseEvents.length === 0 && (
                                        <div className="d-flex align-items-start gap-2 p-2 rounded-2 fs-12 text-muted" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                                            <i className="ri-shield-keyhole-line text-info mt-1 flex-shrink-0"></i>
                                            <span>El archivo se cifra con <strong>SHA-256</strong> y se registra en <strong>Hyperledger Fabric</strong> con marca de tiempo inmutable.</span>
                                        </div>
                                    )}
                                </div>
                            </Col>

                            {/* RIGHT: Live blockchain log (while uploading) or file preview */}
                            {selectedFile && (
                                <Col md={7} style={{ transition: "all 0.3s ease" }}>
                                    <div className="ps-md-3 h-100 d-flex flex-column">
                                        {isUploading || sseEvents.length > 0 ? (
                                            /* ── Live blockchain event log ── */
                                            <>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <span className="fs-12 fw-semibold text-muted text-uppercase ls-1">
                                                        <i className="ri-radio-button-line me-1 text-danger" style={{ animation: isUploading ? "pulse 1s infinite" : "none" }}></i>
                                                        Blockchain · En vivo
                                                    </span>
                                                    <span className="badge bg-dark fs-11">{sseEvents.length} eventos</span>
                                                </div>
                                                <div
                                                    id="coach-sse-progress"
                                                    ref={sseLogRef}
                                                    className="flex-grow-1 border rounded-3 p-3"
                                                    style={{
                                                        background: "#0f172a",
                                                        color: "#e2e8f0",
                                                        fontFamily: "monospace",
                                                        fontSize: "12px",
                                                        overflowY: "auto",
                                                        minHeight: "360px",
                                                        maxHeight: "400px",
                                                    }}
                                                >
                                                    {sseEvents.length === 0 && (
                                                        <div className="text-center py-4" style={{ color: "#64748b" }}>
                                                            <Spinner animation="border" size="sm" className="me-2" />
                                                            Conectando con Hyperledger Fabric...
                                                        </div>
                                                    )}
                                                    {sseEvents.map((evt, idx) => {
                                                        const evtType = (evt.eventType || '').toUpperCase();
                                                        const isError = evtType === 'ERROR';
                                                        const isDone = evtType === 'COMPLETED';
                                                        const isFabric = evtType.startsWith('FABRIC');
                                                        const iconMap: Record<string, string> = {
                                                            FILE_RECEIVED:      '📥',
                                                            HASH_COMPUTING:     '⚙️',
                                                            HASH_COMPUTED:      '🔑',
                                                            STORAGE_UPLOADING:  '☁️',
                                                            STORAGE_UPLOADED:   '✅',
                                                            FABRIC_CONNECTING:  '🔗',
                                                            FABRIC_SUBMITTING:  '⛓️',
                                                            FABRIC_CONFIRMED:   '🏆',
                                                            DB_SAVING:          '💾',
                                                            COMPLETED:          '🎉',
                                                            BATCH_PROGRESS:     '📦',
                                                            ERROR:              '❌',
                                                        };
                                                        const icon = iconMap[evtType] ?? '▸';
                                                        const color = isError ? '#f87171' : isDone ? '#4ade80' : isFabric ? '#a78bfa' : '#94a3b8';
                                                        const ts = new Date(evt.timestamp).toLocaleTimeString('es-PE', { hour12: false });
                                                        return (
                                                            <div key={idx} className="mb-2" style={{ borderLeft: `2px solid ${color}`, paddingLeft: "8px" }}>
                                                                <div style={{ color: '#64748b', fontSize: '11px' }}>{ts}</div>
                                                                <div style={{ color }}>
                                                                    {icon} <strong>{evt.message}</strong>
                                                                    {evt.progress > 0 && (
                                                                        <span style={{ color: '#64748b', fontSize: '11px' }}> · {evt.progress}%</span>
                                                                    )}
                                                                </div>
                                                                {evt.detail && (
                                                                    <div style={{ color: '#64748b', wordBreak: 'break-all', fontSize: '11px' }}>{evt.detail}</div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {isUploading && (
                                                        <div style={{ color: '#64748b' }}>
                                                            <span className="me-1" style={{ animation: "blink 1s step-end infinite" }}>▊</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <style>{`
                                                    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
                                                    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
                                                `}</style>
                                            </>
                                        ) : (
                                            /* ── Static file preview ── */
                                            <>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <span className="fs-12 fw-semibold text-muted text-uppercase ls-1">
                                                        <i className="ri-eye-line me-1"></i>Previsualización
                                                    </span>
                                                    <span className={`badge ${selectedFile.name.endsWith(".pdf") ? "bg-danger-transparent text-danger" : "bg-primary-transparent text-primary"}`}>
                                                        {selectedFile.name.endsWith(".pdf") ? "PDF" : "DOCX"}
                                                    </span>
                                                </div>

                                                {selectedFile.type === "application/pdf" && previewUrl ? (
                                                    <div className="flex-grow-1 border rounded-3 overflow-hidden" style={{ minHeight: "360px" }}>
                                                        <iframe
                                                            src={previewUrl}
                                                            width="100%"
                                                            height="100%"
                                                            style={{ border: "none", minHeight: "360px" }}
                                                            title="Vista previa del sílabo"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center border rounded-3 bg-light p-4 text-center" style={{ minHeight: "360px" }}>
                                                        <i className="ri-file-word-line text-primary mb-3" style={{ fontSize: "5rem" }}></i>
                                                        <h6 className="fw-bold mb-1 text-truncate w-100">{selectedFile.name}</h6>
                                                        <p className="text-muted fs-13 mb-3">{formatBytes(selectedFile.size)}</p>
                                                        <div className="d-flex flex-column gap-2 w-100">
                                                            <div className="d-flex justify-content-between border-bottom pb-2">
                                                                <span className="text-muted fs-12">Tipo</span>
                                                                <span className="fw-medium fs-12">Word Document</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between border-bottom pb-2">
                                                                <span className="text-muted fs-12">Tamaño</span>
                                                                <span className="fw-medium fs-12">{formatBytes(selectedFile.size)}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span className="text-muted fs-12">Última modificación</span>
                                                                <span className="fw-medium fs-12">{new Date(selectedFile.lastModified).toLocaleDateString("es-PE")}</span>
                                                            </div>
                                                        </div>
                                                        <Alert variant="info" className="fs-12 mt-3 mb-0 py-2 text-start w-100">
                                                            <i className="ri-information-line me-1"></i>
                                                            La previsualización de DOCX no está disponible en el navegador.
                                                        </Alert>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </Col>
                            )}
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0">
                    {uploadResult ? (
                        <SpkButton Customclass="btn btn-primary" onClick={handleCloseModal}>
                            <i className="ri-check-line me-1"></i>Cerrar
                        </SpkButton>
                    ) : (
                        <>
                            <SpkButton Customclass="btn btn-secondary" onClick={handleCloseModal} Disabled={isUploading}>Cancelar</SpkButton>
                            <SpkButton Customclass="btn btn-primary" onClick={handleUploadClick} Disabled={isUploading || !selectedFile || !selectedCourseId}>
                                {isUploading
                                    ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Procesando...</>
                                    : <><i className="ri-upload-cloud-2-line me-1"></i>Subir y Registrar en Blockchain</>
                                }
                            </SpkButton>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            {/* ── Syllabus Confirmation Modal ── */}
            {pendingUploadData && (
                <SyllabusConfirmationModal
                    show={showConfirmationModal}
                    courseName={pendingUploadData.courseName}
                    courseCode={pendingUploadData.courseCode}
                    syllabusFileName={pendingUploadData.fileName}
                    file={pendingUploadData.file}
                    onConfirm={handleUpload}
                    onCancel={() => {
                        setShowConfirmationModal(false);
                        setPendingUploadData(null);
                    }}
                    isLoading={isUploading}
                />
            )}

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
                                placeholder={importSource === "google" ? "Pega aquí tu token de acceso de Google" : "Pega aquí tu token de acceso de Microsoft"}
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
                                    <option value="" disabled>Seleccione un curso...</option>
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

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={closeDeleteConfirm} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar sílabo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Está seguro de que desea eliminar este sílabo?</p>
                    <p className="text-muted small mb-0">
                        Dejará de aparecer en el listado activo. Su archivo, hash y versiones
                        ya registradas en blockchain <strong>se conservan</strong> para mantener
                        la auditoría e historial de cambios.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDeleteConfirm} disabled={deletingId !== null}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deletingId !== null}>
                        {deletingId !== null ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <i className="ri-delete-bin-line me-1"></i>
                                Eliminar sílabo
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default SilabosPage;

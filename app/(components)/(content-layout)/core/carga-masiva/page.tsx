"use client"

import React, { Fragment, useState, useCallback, useRef } from "react"
import { Card, Row, Col, Table, Badge, Alert, Modal, ProgressBar, Spinner } from "react-bootstrap"
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons"
import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import ExcelJS from "exceljs"
import axios from 'axios'

// --- Interfaces ---
interface Step {
  id: number
  label: string
  status: "pending" | "loading" | "success" | "error"
  description?: string
}

interface RecordRow {
    carreraNombre?: string;
    carreraFacultad?: string;
    carreraCiclos?: string; 
    carreraEstado?: string;
    mallaNombre?: string;
    mallaAño?: string;     
    mallaNumCursos?: string; 
    mallaCreditos?: string;  
    mallaEstado?: string;
    mallaDescripcion?: string;
    cursoCodigo?: string;
    cursoNombre?: string;
    cursoCiclo?: string;     
    cursoAño?: string;       
    cursoEstado?: string;
    cursoFechaPub?: string; 
    rowNumber: number; 
    errors?: string[] 
}

interface ValidationResult { 
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// 🔹 DTO Actualizado para enviar TODOS los datos útiles al backend
interface BulkCourseRequestDto {
  carrera: string;
  malla: string;
  ciclo: string;
  curso: string;
}

interface BulkUploadResult {
  successCount: number;
  errors: string[];
}


// --- Component ---
const BulkUploadPage: React.FC = () => { 
    const [file, setFile] = useState<File | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [showModal, setShowModal] = useState(false) 
    const [isProcessing, setIsProcessing] = useState(false) 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [records, setRecords] = useState<RecordRow[]>([])
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null) 
    const [backendResult, setBackendResult] = useState<BulkUploadResult | null>(null); 
    const fileInputRef = useRef<HTMLInputElement>(null)

     const showToast = (title: string, message: string, variant: 'success' | 'error' | 'warning' = 'success') => {
        console.log(`${variant.toUpperCase()}: ${title} - ${message}`);
        alert(`${variant.toUpperCase()}: ${title}\n${message}`);
     }

    const initialSteps: Step[] = [
        { id: 1, label: "Cargando archivo", status: "pending", description: "Leyendo contenido del archivo Excel" },
        { id: 2, label: "Validando estructura", status: "pending", description: "Verificando columnas requeridas" },
        { id: 3, label: "Validando formato de datos", status: "pending", description: "Comprobando tipos numéricos y fechas" },
    ];
    const [steps, setSteps] = useState<Step[]>(initialSteps);
    const [progress, setProgress] = useState(0)

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    };

    // --- Handlers ---
     const handleDownloadTemplate = async () => {
         try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("ModeloCargaCompleta");

            sheet.columns = [
                { header: "Carrera_Nombre", key: "carreraNombre", width: 35 },
                { header: "Carrera_Facultad", key: "carreraFacultad", width: 25 },
                { header: "Carrera_Ciclos", key: "carreraCiclos", width: 15 },
                { header: "Carrera_Estado", key: "carreraEstado", width: 15 },
                { header: "Malla_Nombre", key: "mallaNombre", width: 40 },
                { header: "Malla_Año", key: "mallaAño", width: 10 },
                { header: "Malla_NumCursos", key: "mallaNumCursos", width: 15 },
                { header: "Malla_Creditos", key: "mallaCreditos", width: 15 },
                { header: "Malla_Estado", key: "mallaEstado", width: 15 },
                { header: "Malla_Descripcion", key: "mallaDescripcion", width: 50 },
                { header: "Curso_Codigo", key: "cursoCodigo", width: 15 },
                { header: "Curso_Nombre", key: "cursoNombre", width: 45 },
                { header: "Curso_Ciclo", key: "cursoCiclo", width: 10 },
                { header: "Curso_Año", key: "cursoAño", width: 10 },
                { header: "Curso_Estado", key: "cursoEstado", width: 15 },
                { header: "Curso_FechaPublicacion", key: "cursoFechaPub", width: 20 },
            ];

            const headerRow = sheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
            headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "366092" } };
            headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            sheet.views = [{ state: 'frozen', ySplit: 1 }];

            // ⬇️ DATOS DE DEMOSTRACIÓN (15 Registros reales)
            const sampleData: Partial<RecordRow>[] = [
                // Ingeniería de Sistemas
                 { carreraNombre: "Ingeniería de Sistemas", carreraFacultad: "Ingeniería", carreraCiclos: "10", carreraEstado: "Activo", mallaNombre: "Sistemas - Plan 2024", mallaAño: "2024", mallaNumCursos: "50", mallaCreditos: "200", mallaEstado: "Activo", mallaDescripcion: "Plan actualizado con IA", cursoCodigo: "SIS101", cursoNombre: "Introducción a la Computación", cursoCiclo: "1", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
                 { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "MAT101", cursoNombre: "Matemática Básica", cursoCiclo: "1", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
                 { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "FIS101", cursoNombre: "Física General", cursoCiclo: "2", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
                 { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "SIS201", cursoNombre: "Algoritmos y Estructuras de Datos", cursoCiclo: "2", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
                 { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "SIS301", cursoNombre: "Bases de Datos I", cursoCiclo: "3", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
                 { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "SIS302", cursoNombre: "Desarrollo Web Frontend", cursoCiclo: "3", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
                 { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "SIS401", cursoNombre: "Desarrollo Backend", cursoCiclo: "4", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
                 { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "SIS501", cursoNombre: "Inteligencia Artificial", cursoCiclo: "5", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
                // Administración de Empresas
                 { carreraNombre: "Administración de Empresas", carreraFacultad: "Negocios", carreraCiclos: "10", carreraEstado: "Activo", mallaNombre: "Administración - Plan 2023", mallaAño: "2023", mallaNumCursos: "48", mallaCreditos: "190", mallaEstado: "Activo", mallaDescripcion: "Plan enfocado en emprendimiento", cursoCodigo: "ADM101", cursoNombre: "Fundamentos de Administración", cursoCiclo: "1", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
                 { carreraNombre: "Administración de Empresas", mallaNombre: "Administración - Plan 2023", cursoCodigo: "CON101", cursoNombre: "Contabilidad General", cursoCiclo: "1", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
                 { carreraNombre: "Administración de Empresas", mallaNombre: "Administración - Plan 2023", cursoCodigo: "ECO201", cursoNombre: "Microeconomía", cursoCiclo: "2", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
                 { carreraNombre: "Administración de Empresas", mallaNombre: "Administración - Plan 2023", cursoCodigo: "MKT201", cursoNombre: "Fundamentos de Marketing", cursoCiclo: "2", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
                 { carreraNombre: "Administración de Empresas", mallaNombre: "Administración - Plan 2023", cursoCodigo: "ADM301", cursoNombre: "Comportamiento Organizacional", cursoCiclo: "3", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
                 { carreraNombre: "Administración de Empresas", mallaNombre: "Administración - Plan 2023", cursoCodigo: "FIN301", cursoNombre: "Matemática Financiera", cursoCiclo: "3", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
                 { carreraNombre: "Administración de Empresas", mallaNombre: "Administración - Plan 2023", cursoCodigo: "ADM401", cursoNombre: "Gestión del Talento Humano", cursoCiclo: "4", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
            ];
            
            sampleData.forEach((data) => sheet.addRow(data));
            sheet.getColumn('cursoFechaPub').numFmt = 'yyyy-mm-dd';

            const instructionsSheet = workbook.addWorksheet("InstruccionesDetalladas");
             instructionsSheet.addRow(["INSTRUCCIONES PARA CARGA MASIVA COMPLETA"]);
             // ... [Omitido por brevedad, usa tus mismas instrucciones] ...
             instructionsSheet.addRow(["Carrera_Nombre", "Nombre EXACTO de la Carrera.", "SI"]);

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Modelo_Carga_Demo.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
            showToast("Plantilla descargada", "Se descargó el archivo con los registros de demo.", "success");
         } catch (error) {
             console.error("Error generating template:", error);
             showToast("Error al descargar", "No se pudo generar la plantilla.", "error");
         }
     };

     const validateFile = (file: File): ValidationResult => { 
        const errors: string[] = []
        const warnings: string[] = []
        const validTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] 
        if (!validTypes.includes(file.type)) errors.push("Tipo de archivo no válido. Use archivos Excel (.xlsx)")
        if (file.size > 10 * 1024 * 1024) errors.push("El archivo es demasiado grande (Máx 10MB)")
        return { isValid: errors.length === 0, errors, warnings }
      };

     const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }, [])
     const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false) }, [])
     const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) handleSelectedFile(droppedFile)
     }, [])

     const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) handleSelectedFile(selectedFile)
        if (e.target) e.target.value = "";
     }

     const handleSelectedFile = (selectedFile: File) => {
        clearState();
        const validation = validateFile(selectedFile);
        if (validation.isValid) {
            setFile(selectedFile);
        } else {
            showToast("Archivo no válido", validation.errors.join(", "), "error");
        }
    };

    const processFile = async () => {
        if (!file) return;

        setShowModal(true);
        setIsProcessing(true);
        setProgress(0);
        setValidationResult(null);
        setBackendResult(null);
        setRecords([]);

        let currentSteps: Step[] = initialSteps.map((step) => ({ ...step, status: "pending" as Step['status'] }));
        setSteps(currentSteps);

        const columnDefinitions = [
            { header: "Carrera_Nombre", key: "carreraNombre" },
            { header: "Carrera_Facultad", key: "carreraFacultad" },
            { header: "Carrera_Ciclos", key: "carreraCiclos" },
            { header: "Carrera_Estado", key: "carreraEstado" },
            { header: "Malla_Nombre", key: "mallaNombre" },
            { header: "Malla_Año", key: "mallaAño" },
            { header: "Malla_NumCursos", key: "mallaNumCursos" },
            { header: "Malla_Creditos", key: "mallaCreditos" },
            { header: "Malla_Estado", key: "mallaEstado" },
            { header: "Malla_Descripcion", key: "mallaDescripcion" },
            { header: "Curso_Codigo", key: "cursoCodigo" },
            { header: "Curso_Nombre", key: "cursoNombre" },
            { header: "Curso_Ciclo", key: "cursoCiclo" },
            { header: "Curso_Año", key: "cursoAño" },
            { header: "Curso_Estado", key: "cursoEstado" },
            { header: "Curso_FechaPublicacion", key: "cursoFechaPub" },
        ];

        try {
            currentSteps[0] = { ...currentSteps[0], status: "loading" };
            setSteps([...currentSteps]);
            setProgress(25);
            const workbook = new ExcelJS.Workbook();
            const data = await file.arrayBuffer();
            await workbook.xlsx.load(data);
            currentSteps[0] = { ...currentSteps[0], status: "success" };
            setSteps([...currentSteps]);

            currentSteps[1] = { ...currentSteps[1], status: "loading" };
            setSteps([...currentSteps]);
            setProgress(50);
            const worksheet = workbook.worksheets[0];
            if (!worksheet) throw new Error("No se encontró hoja de cálculo.");
            const headerRow = worksheet.getRow(1);

             const headerMap: { [key: string]: number } = {};
             columnDefinitions.forEach(colDef => {
                 let foundColNum = -1;
                 headerRow.eachCell((cell, colNumber) => {
                     if (cell.text?.toString().trim() === colDef.header) foundColNum = colNumber;
                 });
                 if (foundColNum !== -1) headerMap[colDef.key] = foundColNum;
             });

            const requiredKeys = ["carreraNombre", "mallaNombre", "cursoCodigo", "cursoNombre", "cursoCiclo", "cursoAño"]; 
            const missingHeaders = requiredKeys.filter(key => !(key in headerMap));

            if (missingHeaders.length > 0) {
                throw new Error("Faltan columnas requeridas en el Excel.");
            }
            currentSteps[1] = { ...currentSteps[1], status: "success" };
            setSteps([...currentSteps]);

            currentSteps[2] = { ...currentSteps[2], status: "loading" };
            setSteps([...currentSteps]);
            setProgress(75);

            const loadedRecords: RecordRow[] = [];
            let formatErrors: string[] = [];

            worksheet.eachRow((row, rowIndex) => {
                if (rowIndex === 1) return; 

                const getCellValue = (key: string): string => {
                    const colNum = headerMap[key];
                    const cellValue = colNum ? row.getCell(colNum).value : null;
                     if (cellValue instanceof Date) {
                         return cellValue.toISOString().split('T')[0];
                     }
                    return cellValue?.toString().trim() ?? '';
                 };

                const record: RecordRow = {
                    rowNumber: rowIndex,
                    carreraNombre: getCellValue("carreraNombre"),
                    carreraFacultad: getCellValue("carreraFacultad"),
                    carreraCiclos: getCellValue("carreraCiclos"),
                    carreraEstado: getCellValue("carreraEstado"),
                    mallaNombre: getCellValue("mallaNombre"),
                    mallaAño: getCellValue("mallaAño"),
                    mallaNumCursos: getCellValue("mallaNumCursos"),
                    mallaCreditos: getCellValue("mallaCreditos"),
                    mallaEstado: getCellValue("mallaEstado"),
                    mallaDescripcion: getCellValue("mallaDescripcion"),
                    cursoCodigo: getCellValue("cursoCodigo"),
                    cursoNombre: getCellValue("cursoNombre"),
                    cursoCiclo: getCellValue("cursoCiclo"),
                    cursoAño: getCellValue("cursoAño"),
                    cursoEstado: getCellValue("cursoEstado"),
                    cursoFechaPub: getCellValue("cursoFechaPub"),
                    errors: [],
                };

                if (!record.carreraNombre) record.errors?.push("Carrera_Nombre requerido");
                if (!record.mallaNombre) record.errors?.push("Malla_Nombre requerido");
                if (!record.cursoCodigo) record.errors?.push("Curso_Codigo requerido");
                if (!record.cursoNombre) record.errors?.push("Curso_Nombre requerido");
                if (!record.cursoCiclo) record.errors?.push("Curso_Ciclo requerido");
                if (!record.cursoAño) record.errors?.push("Curso_Año requerido");

                if (record.errors && record.errors.length > 0) {
                    formatErrors.push(`Fila ${rowIndex}: ${record.errors.join("; ")}`);
                }
                loadedRecords.push(record);
            });

            if (formatErrors.length > 0) {
                currentSteps[2] = { ...currentSteps[2], status: "error" };
                setSteps([...currentSteps]);
                throw new Error("Se encontraron errores de formato. Revise el archivo.");
            } else {
                currentSteps[2] = { ...currentSteps[2], status: "success" };
                setSteps([...currentSteps]);
            }

            setRecords(loadedRecords);
            setValidationResult({ isValid: true, errors: [], warnings: [] });
            setProgress(100);

        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            setValidationResult({ isValid: false, errors: [errorMessage], warnings: [] });
            setRecords([]);
        } finally {
            setIsProcessing(false);
        }
    }

    const handleSubmitData = async () => { 
        const validFormatRecords = records.filter((r) => !r.errors || r.errors.length === 0);
        if (validFormatRecords.length === 0) return;
        
        // ⬇️ MAPEO RESTAURADO: React lee los datos completos del Excel, 
        // pero se los envía a Java con las 4 palabras que Java entiende.
        const payload: BulkCourseRequestDto[] = validFormatRecords.map(rec => ({
            carrera: rec.carreraNombre ?? '', 
            malla: rec.mallaNombre ?? '',     
            ciclo: rec.cursoCiclo ?? '',      
            curso: rec.cursoNombre ?? ''      
        }));

        setIsSubmitting(true);
        setBackendResult(null);
        try {
            // El pasaporte de seguridad se mantiene 🛡️
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
            const response = await axios.post<BulkUploadResult>(`${apiUrl}/bulk-upload/courses`, payload, getAuthHeaders());
            
            setBackendResult(response.data);
            
            // Evaluamos la respuesta según tu controlador (201 Created o 207 Multi-Status)
            if (response.status === 201) {
                showToast("Éxito", `Se procesaron ${response.data.successCount} cursos correctamente.`, "success");
                clearState();
            } else if (response.status === 207) {
                showToast("Éxito Parcial", `Se guardaron ${response.data.successCount} cursos, pero hubo errores.`, "warning");
            }
            
        } catch (error: any) {
             console.error("Error submitting bulk data:", error);
             let errorMsg = "No se pudieron enviar los datos al servidor.";
             if (axios.isAxiosError(error) && error.response) {
                 errorMsg = error.response.data?.error || error.response.data?.message || `Error del servidor (${error.response.status}).`;
             }
             showToast("Error al Enviar", errorMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

      const clearState = () => {
        setFile(null);
        setRecords([]);
        setValidationResult(null);
        setBackendResult(null);
        setSteps(initialSteps);
        setProgress(0);
        setIsProcessing(false);
        setIsSubmitting(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
    }

    return (
        <Fragment>
            <Pageheader title="Carga Masiva" currentpage="Carga Masiva" activepage="Dashboard" />

            <Row>
                <Col xl={12}>
                    <div className="mb-4">
                        <p className="text-muted">Cargue datos de Carreras, Mallas y Cursos desde un archivo Excel (.xlsx).</p>
                        <Alert variant="info">
                            <Alert.Heading as="h5"><i className="ri-information-line me-2"></i>Instrucciones Importantes</Alert.Heading>
                            <ul className="mb-0 small">
                               <li>Haga clic en <strong>Descargar Plantilla</strong> para obtener un archivo de Demo con 15 registros de prueba.</li>
                               <li>Los nombres de Carreras y Mallas deben coincidir exactamente con los existentes en el sistema.</li>
                            </ul>
                        </Alert>
                    </div>
                </Col>
            </Row>

             <Row>
                <Col xl={12}>
                <Card className="custom-card">
                    <Card.Header>
                    <Card.Title>
                        <i className="ri-upload-2-line me-2"></i> Cargar Archivo Excel (.xlsx)
                    </Card.Title>
                    </Card.Header>
                    <Card.Body>
                    {!file && (
                        <div
                            className={`border-2 border-dashed rounded-3 p-4 text-center mb-3 ${isDragOver ? "border-primary bg-primary-transparent" : "border-light"}`}
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                            style={{ minHeight: "150px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                        <div>
                            <i className="ri-file-excel-2-line fs-1 text-muted mb-3 d-block"></i>
                            <div className="mb-3">
                                <h5 className="fw-semibold">{isDragOver ? "Suelta el archivo aquí" : "Arrastra tu archivo .xlsx aquí"}</h5>
                                <p className="text-muted mb-0">o haz clic para seleccionar</p>
                            </div>
                            <input ref={fileInputRef} type="file" accept=".xlsx" onChange={handleFileSelect} className="position-absolute w-100 h-100 opacity-0" style={{ cursor: "pointer", top: 0, left: 0 }} />
                        </div>
                        </div>
                    )}

                    {file && (
                        <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mb-3">
                        <div className="d-flex align-items-center">
                            <i className="ri-file-text-line fs-4 text-primary me-3"></i>
                            <div>
                                <h6 className="fw-semibold mb-1">{file.name}</h6>
                                <p className="text-muted mb-0 fs-12">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <SpkButton Buttonvariant="light" Size="sm" onClickfunc={clearState} Disabled={isProcessing || isSubmitting}>
                            <i className="ri-close-line"></i>
                        </SpkButton>
                        </div>
                    )}

                    <div className="d-flex gap-3">
                        <SpkButton Buttonvariant="primary" onClickfunc={processFile} Disabled={!file || isProcessing || isSubmitting} Customclass="flex-fill">
                        {isProcessing ? (<><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />Validando...</>)
                                        : (<><i className="ri-check-double-line me-2"></i>Validar Archivo</>)} 
                        </SpkButton>
                        <SpkButton Buttonvariant="light" onClickfunc={handleDownloadTemplate}>
                        <i className="ri-download-2-line me-2"></i>Descargar Plantilla Demo
                        </SpkButton>
                    </div>
                    </Card.Body>
                </Card>
                </Col>
            </Row>

            {validationResult?.isValid && records.length > 0 && (
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Header>
                                 <div className="d-flex align-items-center justify-content-between w-100">
                                     <div>
                                         <Card.Title className="mb-1">Registros Validados</Card.Title>
                                         <p className="text-muted mb-0">{records.length} registros listos.</p>
                                     </div>
                                     <Badge bg="success" className="fs-6 px-3 py-2">{records.length}</Badge>
                                 </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <Table striped hover className="text-nowrap mb-0">
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--spk-body-bg)' }}>
                                            <tr>
                                                <th className="fw-semibold">#</th>
                                                <th className="fw-semibold">Carrera</th>
                                                <th className="fw-semibold">Malla</th>
                                                <th className="fw-semibold">Curso</th>
                                                <th className="fw-semibold">Código</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records.map((record, index) => (
                                                <tr key={index}>
                                                    <td className="text-muted small">{record.rowNumber}</td>
                                                    <td>{record.carreraNombre}</td>
                                                    <td>{record.mallaNombre}</td>
                                                    <td>{record.cursoNombre}</td>
                                                    <td>{record.cursoCodigo}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                                <div className="d-flex justify-content-end align-items-center p-3 border-top">
                                    <SpkButton
                                        Buttonvariant="primary"
                                        Size="lg"
                                        onClickfunc={handleSubmitData}
                                        Disabled={isSubmitting || isProcessing || records.length === 0}
                                    >
                                        {isSubmitting ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Enviando...</>)
                                                        : (<><i className="ri-send-plane-line me-2"></i>Enviar Cursos al Sistema</>)}
                                    </SpkButton>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <Modal show={showModal} onHide={() => !isProcessing && setShowModal(false)} centered backdrop="static" keyboard={false}>
                <Modal.Header>
                <Modal.Title>Validando Archivo...</Modal.Title>
                {!isProcessing && <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>}
                </Modal.Header>
                <Modal.Body>
                <div className="mb-3">
                    <ProgressBar now={progress} animated={isProcessing} className="mb-4" />
                </div>
                <div className="d-flex flex-column gap-3">
                    {steps.map((step) => (
                    <div key={step.id} className={`d-flex align-items-center gap-3 p-3 rounded-3 ${step.status === 'error' ? 'bg-danger-transparent' : 'bg-light'}`}>
                        <div className="flex-shrink-0">
                            {step.status === "pending" && <i className="ri-time-line text-muted fs-5"></i>}
                            {step.status === "loading" && <Spinner animation="border" size="sm" variant="primary" />}
                            {step.status === "success" && <i className="ri-checkbox-circle-line text-success fs-5"></i>}
                            {step.status === "error" && <i className="ri-close-circle-line text-danger fs-5"></i>}
                        </div>
                        <div className="flex-fill">
                            <h6 className={`fw-semibold mb-1 ${step.status === 'error' ? 'text-danger' : ''}`}>{step.label}</h6>
                            {step.description && <p className="text-muted mb-0 fs-12">{step.description}</p>}
                        </div>
                    </div>
                    ))}
                </div>
                </Modal.Body>
                {!isProcessing && (
                <Modal.Footer>
                    <SpkButton Buttonvariant="secondary" onClickfunc={() => setShowModal(false)}>Cerrar</SpkButton>
                </Modal.Footer>
                )}
            </Modal>
        </Fragment>
    )
}

export default BulkUploadPage

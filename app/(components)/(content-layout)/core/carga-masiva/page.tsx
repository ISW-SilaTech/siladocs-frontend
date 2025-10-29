"use client"

import React, { Fragment, useState, useCallback, useRef } from "react"
import { Card, Row, Col, Table, Badge, Alert, Modal, ProgressBar, Spinner } from "react-bootstrap" // 🔹 Import Spinner
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons"
import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import ExcelJS from "exceljs"
import axios from 'axios' // 🔹 Import axios

// --- Interfaces ---
interface Step {
  id: number
  label: string
  status: "pending" | "loading" | "success" | "error"
  description?: string
}

// 🔹 Updated RecordRow to match all columns from the comprehensive template
interface RecordRow {
    // Career
    carreraNombre?: string;
    carreraFacultad?: string;
    carreraCiclos?: string; // Read as string initially
    carreraEstado?: string;
    // Curriculum
    mallaNombre?: string;
    mallaAño?: string;     // Read as string initially
    mallaNumCursos?: string; // Read as string initially
    mallaCreditos?: string;  // Read as string initially
    mallaEstado?: string;
    mallaDescripcion?: string;
    // Course
    cursoCodigo?: string;
    cursoNombre?: string;
    cursoCiclo?: string;     // Read as string initially
    cursoAño?: string;       // Read as string initially
    cursoEstado?: string;
    cursoFechaPub?: string; // Can be string or Date object after parsing

    rowNumber: number; // Store original row number for error reporting
    errors?: string[] // Validation errors found during frontend processing
}


interface ValidationResult { // Frontend file validation result
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Interface for the data sent TO the *current* backend endpoint
interface BulkCourseRequestDto {
  carrera: string; // Corresponds to carreraNombre in Excel
  malla: string;   // Corresponds to mallaNombre in Excel
  ciclo: string;   // Corresponds to cursoCiclo in Excel
  curso: string;   // Corresponds to cursoNombre in Excel
}

// Interface for the data received FROM the backend
interface BulkUploadResult {
  successCount: number;
  errors: string[];
}


// --- Component ---
const BulkUploadPage: React.FC = () => { // Removed unused interface prop
    // ... (Keep existing state variables: file, isDragOver, showModal, etc.) ...
    const [file, setFile] = useState<File | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [showModal, setShowModal] = useState(false) // Modal for processing steps
    const [isProcessing, setIsProcessing] = useState(false) // Loading state for "Procesar Archivo"
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for "Enviar al Sistema"
    const [records, setRecords] = useState<RecordRow[]>([])
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null) // Frontend file validation result
    const [backendResult, setBackendResult] = useState<BulkUploadResult | null>(null); // Result from backend API call
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ... (Keep showToast function) ...
     const showToast = (title: string, message: string, variant: 'success' | 'error' | 'warning' = 'success') => {
        console.log(`${variant.toUpperCase()}: ${title} - ${message}`);
        alert(`${variant.toUpperCase()}: ${title}\n${message}`);
     }

    // Processing steps state
    const initialSteps: Step[] = [
        { id: 1, label: "Cargando archivo", status: "pending", description: "Leyendo contenido del archivo Excel" },
        { id: 2, label: "Validando estructura", status: "pending", description: "Verificando columnas requeridas" },
        { id: 3, label: "Validando formato de datos", status: "pending", description: "Comprobando tipos numéricos y fechas" },
    ];
    const [steps, setSteps] = useState<Step[]>(initialSteps);
    const [progress, setProgress] = useState(0)

    // --- Handlers ---

    // ... (Keep handleDownloadTemplate function as updated previously) ...
     const handleDownloadTemplate = async () => {
         // This function remains the same as provided in the previous response
         // It generates the Excel template with all Career, Malla, and Course columns
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

            const sampleData: Partial<RecordRow>[] = [
                 {
                   carreraNombre: "Ingeniería de Software", carreraFacultad: "Ingeniería", carreraCiclos: "10", carreraEstado: "Activo",
                   mallaNombre: "Ingeniería de Software - Plan 2023", mallaAño: "2023", mallaNumCursos: "45", mallaCreditos: "200", mallaEstado: "Activo", mallaDescripcion: "Malla principal",
                   cursoCodigo: "INF101", cursoNombre: "Programación I", cursoCiclo: "1", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-03-01"
                 },
                 {
                   carreraNombre: "Ingeniería de Software", // Reusing existing
                   mallaNombre: "Ingeniería de Software - Plan 2023", // Reusing existing
                   cursoCodigo: "MAT101", cursoNombre: "Matemática Básica", cursoCiclo: "1", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-20"
                 },
                  {
                   carreraNombre: "Medicina", carreraFacultad: "Ciencias de la Salud", carreraCiclos: "14", carreraEstado: "Activo",
                   mallaNombre: "Medicina - Plan 2025", mallaAño: "2025", mallaNumCursos: "60", mallaCreditos: "300", mallaEstado: "Activo", mallaDescripcion: "Nueva malla",
                   cursoCodigo: "MED101", cursoNombre: "Anatomía Humana I", cursoCiclo: "1", cursoAño: "2025", cursoEstado: "Active", cursoFechaPub: "2025-01-05"
                 },
                  {
                   carreraNombre: "Medicina", // Reusing existing
                   mallaNombre: "Medicina - Plan 2025", // Reusing existing
                   cursoCodigo: "BIO101", cursoNombre: "Biología Celular", cursoCiclo: "1", cursoAño: "2025", cursoEstado: "Active", cursoFechaPub: "2025-01-10"
                 },
             ];
            sampleData.forEach((data) => sheet.addRow(data));
            sheet.getColumn('cursoFechaPub').numFmt = 'yyyy-mm-dd';

            const instructionsSheet = workbook.addWorksheet("InstruccionesDetalladas");
             instructionsSheet.addRow(["INSTRUCCIONES PARA CARGA MASIVA COMPLETA"]);
             instructionsSheet.addRow([]);
             instructionsSheet.addRow(["Columnas:", "Descripción", "Obligatorio?"]);
             instructionsSheet.addRow(["Carrera_Nombre", "Nombre EXACTO de la Carrera. Si no existe, se intentará crear (requiere Facultad y Ciclos).", "SI"]);
             instructionsSheet.addRow(["Carrera_Facultad", "Facultad a la que pertenece la Carrera.", "SI (si Carrera_Nombre es nueva)"]);
             instructionsSheet.addRow(["Carrera_Ciclos", "Número total de ciclos de la Carrera (ej: 10).", "SI (si Carrera_Nombre es nueva)"]);
             instructionsSheet.addRow(["Carrera_Estado", "Estado de la Carrera (ej: Activo, Inactivo).", "NO (Defecto: Activo)"]);
             instructionsSheet.addRow([]);
             instructionsSheet.addRow(["Malla_Nombre", "Nombre EXACTO de la Malla (Plan). Debe ser único dentro de la Carrera. Si no existe para esa Carrera, se intentará crear.", "SI"]);
             instructionsSheet.addRow(["Malla_Año", "Año de la Malla (ej: 2023).", "SI (si Malla_Nombre es nueva para la Carrera)"]);
             instructionsSheet.addRow(["Malla_NumCursos", "Número total de cursos planeados para la Malla.", "SI (si Malla_Nombre es nueva para la Carrera)"]);
             instructionsSheet.addRow(["Malla_Creditos", "Número total de créditos de la Malla.", "SI (si Malla_Nombre es nueva para la Carrera)"]);
             instructionsSheet.addRow(["Malla_Estado", "Estado de la Malla (ej: Activo, Inactivo).", "NO (Defecto: Activo)"]);
             instructionsSheet.addRow(["Malla_Descripcion", "Descripción breve de la Malla.", "NO"]);
             instructionsSheet.addRow([]);
             instructionsSheet.addRow(["Curso_Codigo", "Código único del Curso (ej: INF101).", "SI"]);
             instructionsSheet.addRow(["Curso_Nombre", "Nombre completo del Curso.", "SI"]);
             instructionsSheet.addRow(["Curso_Ciclo", "Número del ciclo al que pertenece el Curso DENTRO DE LA MALLA (ej: 1, 2...).", "SI"]);
             instructionsSheet.addRow(["Curso_Año", "Año académico del Curso (usualmente coincide con Malla_Año).", "SI"]);
             instructionsSheet.addRow(["Curso_Estado", "Estado del Curso (ej: Active, Closed).", "NO (Defecto: Active)"]);
             instructionsSheet.addRow(["Curso_FechaPublicacion", "Fecha de publicación (formato YYYY-MM-DD).", "NO"]);
             instructionsSheet.addRow([]);
             instructionsSheet.addRow(["IMPORTANTE:", "No modifique los encabezados. El sistema busca Carreras y Mallas existentes por NOMBRE EXACTO."]);
             instructionsSheet.addRow(["Orden:", "Si crea una Carrera y Malla nuevas en la misma fila que un Curso, asegúrese de que la lógica del backend lo soporte."]);
            instructionsSheet.getColumn(1).width = 25;
            instructionsSheet.getColumn(2).width = 80;
            instructionsSheet.getColumn(3).width = 15;

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Modelo_Carga_Masiva_Completa.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
            showToast("Plantilla descargada", "El archivo modelo completo se ha descargado.", "success");
         } catch (error) {
             console.error("Error generating template:", error);
             showToast("Error al descargar", "No se pudo generar la plantilla.", "error");
         }
     };

    // ... (Keep validateFile, drag/drop/select handlers as before) ...
     const validateFile = (file: File): ValidationResult => { /* ... */
        const errors: string[] = []
        const warnings: string[] = []
        const validTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] // Only allow .xlsx for simplicity with ExcelJS
        if (!validTypes.includes(file.type)) errors.push("Tipo de archivo no válido. Use archivos Excel (.xlsx)")
        if (file.size > 10 * 1024 * 1024) errors.push("El archivo es demasiado grande (Máx 10MB)")
        if (file.name.length > 100) warnings.push("El nombre del archivo es muy largo")
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
            if (validation.warnings.length > 0) showToast("Advertencias", validation.warnings.join(", "), "warning");
        } else {
            showToast("Archivo no válido", validation.errors.join(", "), "error");
        }
    };

    // 🔹 Updated processFile to read all columns and validate formats
    const processFile = async () => {
        if (!file) {
            showToast("Error", "Por favor selecciona un archivo.", "error");
            return;
        }

        setShowModal(true);
        setIsProcessing(true);
        setProgress(0);
        setValidationResult(null);
        setBackendResult(null);
        setRecords([]);

        let currentSteps: Step[] = initialSteps.map((step) => ({ ...step, status: "pending" as Step['status'] }));
        setSteps(currentSteps);

        // Define column definitions here to use in multiple places
        const columnDefinitions = [
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


        try {
            // Step 1: Load file
            currentSteps[0] = { ...currentSteps[0], status: "loading" };
            setSteps([...currentSteps]);
            setProgress(25);
            const workbook = new ExcelJS.Workbook();
            const data = await file.arrayBuffer();
            await workbook.xlsx.load(data);
            await new Promise((resolve) => setTimeout(resolve, 300));
            currentSteps[0] = { ...currentSteps[0], status: "success" };
            setSteps([...currentSteps]);

            // Step 2: Validate structure (Headers)
            currentSteps[1] = { ...currentSteps[1], status: "loading" };
            setSteps([...currentSteps]);
            setProgress(50);
            const worksheet = workbook.worksheets[0];
            if (!worksheet) throw new Error("No se encontró hoja de cálculo.");
            const headerRow = worksheet.getRow(1);

            // Build header map dynamically from column definitions
             const headerMap: { [key: string]: number } = {};
             columnDefinitions.forEach(colDef => {
                 // Find the column number matching the header text
                 let foundColNum = -1;
                 headerRow.eachCell((cell, colNumber) => {
                     if (cell.text?.toString().trim() === colDef.header) {
                         foundColNum = colNumber;
                     }
                 });
                 if (foundColNum !== -1) {
                     headerMap[colDef.key] = foundColNum;
                 }
             });


            // Check if all *required* headers were found using the *keys*
            const requiredKeys = ["carreraNombre", "mallaNombre", "cursoCodigo", "cursoNombre", "cursoCiclo", "cursoAño"]; // Adjust as needed
            const missingHeaders = requiredKeys.filter(key => !(key in headerMap));

            if (missingHeaders.length > 0) {
                // Map missing internal keys back to the expected Excel header text
                const missingHeaderNames = missingHeaders.map(key => {
                     const colDef = columnDefinitions.find(c => c.key === key);
                     return colDef ? colDef.header : key; // Fallback to key if not found (shouldn't happen)
                });
                throw new Error(`Columnas requeridas faltantes o con nombre incorrecto: ${missingHeaderNames.join(", ")}`);
            }
            await new Promise((resolve) => setTimeout(resolve, 300));
            currentSteps[1] = { ...currentSteps[1], status: "success" };
            setSteps([...currentSteps]);

            // Step 3: Validate data format (Frontend)
            currentSteps[2] = { ...currentSteps[2], status: "loading" };
            setSteps([...currentSteps]);
            setProgress(75);

            const loadedRecords: RecordRow[] = [];
            let formatErrors: string[] = [];

            worksheet.eachRow((row, rowIndex) => {
                if (rowIndex === 1) return; // Skip header

                // Helper to get cell value by key, trimming strings
                const getCellValue = (key: string): string => {
                    const colNum = headerMap[key];
                    // Handle different cell types (especially dates which might be Date objects)
                    const cellValue = colNum ? row.getCell(colNum).value : null;
                     if (cellValue instanceof Date) {
                         // Format date consistently as YYYY-MM-DD
                         return cellValue.toISOString().split('T')[0];
                     }
                    return cellValue?.toString().trim() ?? '';
                 };

                const record: RecordRow = {
                    rowNumber: rowIndex,
                    // Career
                    carreraNombre: getCellValue("carreraNombre"),
                    carreraFacultad: getCellValue("carreraFacultad"),
                    carreraCiclos: getCellValue("carreraCiclos"),
                    carreraEstado: getCellValue("carreraEstado"),
                    // Malla
                    mallaNombre: getCellValue("mallaNombre"),
                    mallaAño: getCellValue("mallaAño"),
                    mallaNumCursos: getCellValue("mallaNumCursos"),
                    mallaCreditos: getCellValue("mallaCreditos"),
                    mallaEstado: getCellValue("mallaEstado"),
                    mallaDescripcion: getCellValue("mallaDescripcion"),
                    // Curso
                    cursoCodigo: getCellValue("cursoCodigo"),
                    cursoNombre: getCellValue("cursoNombre"),
                    cursoCiclo: getCellValue("cursoCiclo"),
                    cursoAño: getCellValue("cursoAño"),
                    cursoEstado: getCellValue("cursoEstado"),
                    cursoFechaPub: getCellValue("cursoFechaPub"),
                    errors: [],
                };

                // --- Basic Presence Checks (Required Fields) ---
                if (!record.carreraNombre) record.errors?.push("Carrera_Nombre requerido");
                if (!record.mallaNombre) record.errors?.push("Malla_Nombre requerido");
                if (!record.cursoCodigo) record.errors?.push("Curso_Codigo requerido");
                if (!record.cursoNombre) record.errors?.push("Curso_Nombre requerido");
                if (!record.cursoCiclo) record.errors?.push("Curso_Ciclo requerido");
                if (!record.cursoAño) record.errors?.push("Curso_Año requerido");

                // --- Format Checks ---
                const checkNumeric = (value: string | undefined, fieldName: string, allowEmpty: boolean = false) => {
                    if (value && isNaN(Number(value))) {
                        record.errors?.push(`${fieldName} debe ser un número`);
                    } else if (!allowEmpty && !value) {
                         // Only mark as required error if it's truly missing after potential trimming
                         if (value === undefined || value === '') record.errors?.push(`${fieldName} requerido`);
                    }
                };
                checkNumeric(record.carreraCiclos, "Carrera_Ciclos", true);
                checkNumeric(record.mallaAño, "Malla_Año", true);
                checkNumeric(record.mallaNumCursos, "Malla_NumCursos", true);
                checkNumeric(record.mallaCreditos, "Malla_Creditos", true);
                checkNumeric(record.cursoCiclo, "Curso_Ciclo");
                checkNumeric(record.cursoAño, "Curso_Año");

                // Date format check (YYYY-MM-DD) if provided
                if (record.cursoFechaPub && !/^\d{4}-\d{2}-\d{2}$/.test(record.cursoFechaPub)) {
                    record.errors?.push("Curso_FechaPublicacion debe tener formato YYYY-MM-DD");
                }

                if (record.errors && record.errors.length > 0) {
                    formatErrors.push(`Fila ${rowIndex}: ${record.errors.join("; ")}`);
                }
                loadedRecords.push(record);
            });

            await new Promise((resolve) => setTimeout(resolve, 300));
            if (formatErrors.length > 0) {
                currentSteps[2] = { ...currentSteps[2], status: "error" };
                setSteps([...currentSteps]);
                const errorMessage = formatErrors.length > 5
                    ? `Se encontraron ${formatErrors.length} errores de formato (primeros 5: ${formatErrors.slice(0, 5).join(' | ')})`
                    : `Se encontraron errores de formato: ${formatErrors.join(' | ')}`;
                throw new Error(errorMessage);
            } else {
                currentSteps[2] = { ...currentSteps[2], status: "success" };
                setSteps([...currentSteps]);
            }

            setRecords(loadedRecords);
            setValidationResult({ isValid: true, errors: [], warnings: [] });
            setProgress(100);
            showToast("Validación completada", `Se leyeron ${loadedRecords.length} registros. Revise la tabla y envíe al sistema.`, "success");

        } catch (error: any) {
            // ... (keep error handling as before) ...
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            const errorStepIndex = currentSteps.findIndex(s => s.status === 'loading');
            if (errorStepIndex !== -1) {
                currentSteps[errorStepIndex] = { ...currentSteps[errorStepIndex], status: 'error' };
                for(let i = errorStepIndex + 1; i < currentSteps.length; i++){
                    currentSteps[i] = { ...currentSteps[i], status: 'pending' };
                }
                setSteps([...currentSteps]);
            }
            setValidationResult({ isValid: false, errors: [errorMessage], warnings: [] });
            showToast("Error en Validación", errorMessage, "error");
            setRecords([]);
        } finally {
            setIsProcessing(false);
        }
    }

    // ... (Keep handleSubmitData function as updated previously) ...
     const handleSubmitData = async () => { /* ... as before ... */
        const validFormatRecords = records.filter((r) => !r.errors || r.errors.length === 0);
        if (validFormatRecords.length === 0) {
            showToast("No hay datos válidos", "No hay registros con formato válido para enviar.", "warning");
            return;
        }
        const payload: BulkCourseRequestDto[] = validFormatRecords.map(rec => ({
            carrera: rec.carreraNombre ?? '', // Use Carrera_Nombre
            malla: rec.mallaNombre ?? '',     // Use Malla_Nombre
            ciclo: rec.cursoCiclo ?? '',      // Use Curso_Ciclo
            curso: rec.cursoNombre ?? ''      // Use Curso_Nombre
        }));
        setIsSubmitting(true);
        setBackendResult(null);
        try {
            const response = await axios.post<BulkUploadResult>('http://localhost:8080/api/bulk-upload/courses', payload);
            setBackendResult(response.data);
            if (response.status === 201) {
                showToast("Éxito Total", `Se procesaron ${response.data.successCount} cursos correctamente.`, "success");
                clearState();
            } else if (response.status === 207) {
                showToast("Éxito Parcial", `Se procesaron ${response.data.successCount} cursos. Hubo ${response.data.errors.length} errores (ver sección de errores).`, "warning");
                console.warn("Errores de carga masiva (Backend):", response.data.errors);
            } else {
                showToast("Respuesta Inesperada", `El servidor respondió con estado ${response.status}.`, "warning");
            }
        } catch (error: any) {
             console.error("Error submitting bulk data:", error);
             let errorMsg = "No se pudieron enviar los datos al servidor.";
             if (axios.isAxiosError(error) && error.response) {
                 if (typeof error.response.data === 'string') {
                     errorMsg = error.response.data;
                 } else if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
                     errorMsg = `Errores del servidor: ${error.response.data.errors.join('; ')}`;
                     setBackendResult({ successCount: error.response.data.successCount || 0, errors: error.response.data.errors });
                 } else if (error.response.data?.message) {
                     errorMsg = `Error del servidor: ${error.response.data.message}`;
                 }
                  else {
                     errorMsg = `Error del servidor (${error.response.status}).`;
                 }
             }
             showToast("Error al Enviar", errorMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };


    // ... (Keep clearState function) ...
      const clearState = () => {
        setFile(null);
        setRecords([]);
        setValidationResult(null);
        setBackendResult(null);
        setSteps(initialSteps);
        setProgress(0);
        setIsProcessing(false);
        setIsSubmitting(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Allows re-selecting the same file
        }
    }


    return (
        <Fragment>
            <Pageheader /* ... props ... */ />

            {/* Description Row with updated Alert */}
            <Row>
                <Col xl={12}>
                    <div className="mb-4">
                        <p className="text-muted">
                           {/* 🔹 Updated description */}
                            Cargue datos de Carreras, Mallas y Cursos desde un archivo Excel (.xlsx).
                        </p>
                        <Alert variant="info">
                            <Alert.Heading as="h5"><i className="ri-information-line me-2"></i>Instrucciones Importantes</Alert.Heading>
                            <ul className="mb-0 small">
                               <li>Descargue la plantilla para ver el formato y columnas requeridas.</li>
                               <li>Los nombres de <strong>Carreras</strong> y <strong>Mallas</strong> deben coincidir <i>exactamente</i> con los existentes en el sistema para asociar cursos.</li>
                               <li>Actualmente, esta carga masiva <strong>solo crea Cursos</strong>. La creación de Carreras o Mallas debe hacerse manualmente o requiere una actualización del backend.</li>
                               <li>Rellene los campos `Carrera_Facultad`, `Carrera_Ciclos`, etc., solo si el backend fuera actualizado para crear carreras/mallas desde el archivo.</li>
                            </ul>
                        </Alert>
                    </div>
                </Col>
            </Row>

            {/* Upload Section (No changes needed here) */}
             <Row>
                <Col xl={12}>
                <Card className="custom-card">
                    <Card.Header>
                    <Card.Title>
                        <i className="ri-upload-2-line me-2"></i> Cargar Archivo Excel (.xlsx)
                    </Card.Title>
                    </Card.Header>
                    <Card.Body>
                    {/* Drag and Drop Area */}
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

                    {/* Selected File Info */}
                    {file && (
                        <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mb-3">
                        <div className="d-flex align-items-center">
                            <i className="ri-file-text-line fs-4 text-primary me-3"></i>
                            <div>
                                <h6 className="fw-semibold mb-1">{file.name}</h6>
                                <p className="text-muted mb-0 fs-12">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        {/* Clear button uses clearState */}
                        <SpkButton Buttonvariant="light" Size="sm" onClickfunc={clearState} Disabled={isProcessing || isSubmitting}>
                            <i className="ri-close-line"></i> {/* Changed icon */}
                        </SpkButton>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex gap-3">
                        <SpkButton Buttonvariant="primary" onClickfunc={processFile} Disabled={!file || isProcessing || isSubmitting} Customclass="flex-fill">
                        {isProcessing ? (<><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />Validando...</>)
                                        : (<><i className="ri-check-double-line me-2"></i>Validar Archivo</>)} {/* Changed Text */}
                        </SpkButton>
                        <SpkButton Buttonvariant="light" onClickfunc={handleDownloadTemplate}>
                        <i className="ri-download-2-line me-2"></i>Descargar Plantilla
                        </SpkButton>
                    </div>
                    </Card.Body>
                </Card>
                </Col>
            </Row>


            {/* Backend Validation Errors Section (No changes needed here) */}
             {backendResult && backendResult.errors.length > 0 && (
                 <Row>
                     <Col xl={12}>
                     <Alert variant="danger">
                         <Alert.Heading as="h5"><i className="ri-error-warning-line me-2"></i>Errores al Enviar al Sistema</Alert.Heading>
                         <p>Los siguientes registros no pudieron ser creados por errores de lógica de negocio (ej: carrera/malla no encontrada, curso duplicado, etc.):</p>
                         <ul>
                             {backendResult.errors.map((errMsg, index) => (
                                 <li key={index}><small>{errMsg}</small></li>
                             ))}
                         </ul>
                     </Alert>
                     </Col>
                 </Row>
             )}


            {/* Records Table - Show AFTER successful frontend validation */}
            {validationResult?.isValid && records.length > 0 && (
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Header>
                                 <div className="d-flex align-items-center justify-content-between w-100">
                                     <div>
                                         <Card.Title className="mb-1">Registros Validados (Formato Correcto)</Card.Title>
                                         <p className="text-muted mb-0">{records.length} registros listos para enviar al sistema.</p>
                                     </div>
                                     <Badge bg="success" className="fs-6 px-3 py-2">
                                         {records.length}
                                     </Badge>
                                 </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <Table striped hover className="text-nowrap mb-0">
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--spk-body-bg)' }}>
                                            <tr>
                                                <th className="fw-semibold">#</th>
                                                {/* 🔹 Show relevant columns for submission */}
                                                <th className="fw-semibold">Carrera (Nombre)</th>
                                                <th className="fw-semibold">Malla (Nombre)</th>
                                                <th className="fw-semibold">Curso (Ciclo)</th>
                                                <th className="fw-semibold">Curso (Nombre)</th>
                                                {/* Optional: Add other columns if needed for review */}
                                                <th className="fw-semibold">Curso (Código)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records.map((record, index) => (
                                                <tr key={index}>
                                                    <td className="text-muted small">{record.rowNumber}</td>
                                                    <td>{record.carreraNombre}</td>
                                                    <td>{record.mallaNombre}</td>
                                                    <td>{record.cursoCiclo}</td>
                                                    <td>{record.cursoNombre}</td>
                                                     {/* Optional */}
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
                                                        : (<><i className="ri-send-plane-line me-2"></i>Enviar Cursos al Sistema ({records.length})</>)}
                                    </SpkButton>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Processing Modal */}
            <Modal show={showModal} onHide={() => !isProcessing && setShowModal(false)} centered backdrop="static" keyboard={false}>
                <Modal.Header>
                <Modal.Title>Validando Archivo...</Modal.Title>
                {/* Add close button only if NOT processing */}
                {!isProcessing && <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>}
                </Modal.Header>
                <Modal.Body>
                <div className="mb-3">
                    <p className="text-muted mb-3">Por favor espera mientras validamos la estructura y formato de tu archivo.</p>
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

                {/* Display validation errors from frontend processing */}
                {validationResult && !validationResult.isValid && validationResult.errors.length > 0 && (
                    <Alert variant="danger" className="mt-4">
                    <Alert.Heading as="h6">Error de Validación:</Alert.Heading>
                    <ul className="mb-0 small">
                        {validationResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                    </Alert>
                )}

                </Modal.Body>
                {/* Footer only shown when processing is done (success or error) */}
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

"use client"

import React, { Fragment, useState, useCallback, useRef, useEffect } from "react"
import { Card, Row, Col, Table, Badge, Alert, Modal, ProgressBar, Spinner, Form } from "react-bootstrap"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons"
import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import ExcelJS from "exceljs"
import api from "@/shared/config/axios"
import { CoursesService, Course } from "@/shared/services/courses.service"
import { SyllabiService } from "@/shared/services/syllabi.service"

// ─── Phase 1 types ────────────────────────────────────────────────────────────
interface Step {
  id: number
  label: string
  status: "pending" | "loading" | "success" | "error"
  description?: string
}

interface RecordRow {
  carreraNombre?: string
  carreraFacultad?: string
  carreraCiclos?: string
  carreraEstado?: string
  mallaNombre?: string
  mallaAño?: string
  mallaNumCursos?: string
  mallaCreditos?: string
  mallaEstado?: string
  mallaDescripcion?: string
  cursoCodigo?: string
  cursoNombre?: string
  cursoCiclo?: string
  cursoAño?: string
  cursoEstado?: string
  cursoFechaPub?: string
  rowNumber: number
  errors?: string[]
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Enhanced DTO with full data for backend to create/update entities
interface CarreraData {
  nombre: string
  facultad?: string
  ciclos?: number
  estado?: string
}

interface MallaData {
  nombre: string
  año?: number
  numCursos?: number
  creditos?: number
  descripcion?: string
  estado?: string
}

interface CursoData {
  codigo: string
  nombre: string
  ciclo: number
  año?: number
  estado?: string
  fechaPublicacion?: string
}

interface BulkCourseRequestDto {
  carrera: CarreraData
  malla: MallaData
  curso: CursoData
}

interface BulkUploadResult {
  successCount: number
  errors: string[]
}

// ─── Phase 2 types ────────────────────────────────────────────────────────────
interface SyllabusPDFItem {
  id: string
  file: File
  fileName: string
  detectedCode: string | null
  courseId: number | null
  courseName: string | null
  courseCode: string | null
  status: "pending" | "uploading" | "confirmed" | "error"
  txId?: string
  hash?: string
  error?: string
}

// ─── Component ────────────────────────────────────────────────────────────────
const BulkUploadPage: React.FC = () => {

  // Phase 1 state
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [records, setRecords] = useState<RecordRow[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [backendResult, setBackendResult] = useState<BulkUploadResult | null>(null)
  const [formattingErrors, setFormattingErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initialSteps: Step[] = [
    { id: 1, label: "Cargando archivo", status: "pending", description: "Leyendo contenido del archivo Excel" },
    { id: 2, label: "Validando estructura", status: "pending", description: "Verificando columnas requeridas" },
    { id: 3, label: "Validando formato", status: "pending", description: "Comprobando tipos numéricos y fechas" },
  ]
  const [steps, setSteps] = useState<Step[]>(initialSteps)
  const [progress, setProgress] = useState(0)

  // Phase 2 state
  const [activePhase, setActivePhase] = useState<1 | 2>(1)
  const [pdfItems, setPdfItems] = useState<SyllabusPDFItem[]>([])
  const [isPdfDragOver, setIsPdfDragOver] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const coursesRef = useRef<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // Keep ref in sync to avoid stale closures in drag handlers
  useEffect(() => { coursesRef.current = availableCourses }, [availableCourses])

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (title: string, message: string, variant: "success" | "error" | "warning" = "success") => {
    const fullMessage = `${title}\n${message}`;
    if (variant === "success") toast.success(fullMessage);
    else if (variant === "error") toast.error(fullMessage);
    else toast.warning(fullMessage);
  }

  const phase1Success = !!(backendResult && backendResult.successCount > 0)

  // ─── Phase 1: Excel import ─────────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet("ModeloCargaCompleta")
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
      ]
      const headerRow = sheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } }
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "366092" } }
      headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
      sheet.views = [{ state: "frozen", ySplit: 1 }]

      const sampleData: Partial<RecordRow>[] = [
        { carreraNombre: "Ingeniería de Sistemas", carreraFacultad: "Ingeniería", carreraCiclos: "10", carreraEstado: "Activo", mallaNombre: "Sistemas - Plan 2024", mallaAño: "2024", mallaNumCursos: "50", mallaCreditos: "200", mallaEstado: "Activo", mallaDescripcion: "Plan actualizado con IA", cursoCodigo: "SIS101", cursoNombre: "Introducción a la Computación", cursoCiclo: "1", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
        { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "MAT101", cursoNombre: "Matemática Básica", cursoCiclo: "1", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
        { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "FIS101", cursoNombre: "Física General", cursoCiclo: "2", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
        { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "SIS201", cursoNombre: "Algoritmos y Estructuras de Datos", cursoCiclo: "2", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
        { carreraNombre: "Ingeniería de Sistemas", mallaNombre: "Sistemas - Plan 2024", cursoCodigo: "SIS301", cursoNombre: "Bases de Datos I", cursoCiclo: "3", cursoAño: "2024", cursoEstado: "Active", cursoFechaPub: "2024-01-15" },
        { carreraNombre: "Administración de Empresas", carreraFacultad: "Negocios", carreraCiclos: "10", carreraEstado: "Activo", mallaNombre: "Administración - Plan 2023", mallaAño: "2023", mallaNumCursos: "48", mallaCreditos: "190", mallaEstado: "Activo", mallaDescripcion: "Plan enfocado en emprendimiento", cursoCodigo: "ADM101", cursoNombre: "Fundamentos de Administración", cursoCiclo: "1", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
        { carreraNombre: "Administración de Empresas", mallaNombre: "Administración - Plan 2023", cursoCodigo: "CON101", cursoNombre: "Contabilidad General", cursoCiclo: "1", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
        { carreraNombre: "Administración de Empresas", mallaNombre: "Administración - Plan 2023", cursoCodigo: "MKT201", cursoNombre: "Fundamentos de Marketing", cursoCiclo: "2", cursoAño: "2023", cursoEstado: "Active", cursoFechaPub: "2023-02-10" },
      ]
      sampleData.forEach((data) => sheet.addRow(data))
      sheet.getColumn("cursoFechaPub").numFmt = "yyyy-mm-dd"

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "Modelo_CargaMasiva.xlsx"
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      showToast("Error", "No se pudo generar la plantilla.", "error")
    }
  }

  const validateExcelFile = (f: File): ValidationResult => {
    const errors: string[] = []
    if (f.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      errors.push("Tipo de archivo no válido. Use .xlsx")
    if (f.size > 10 * 1024 * 1024)
      errors.push("El archivo es demasiado grande (Máx 10 MB)")
    return { isValid: errors.length === 0, errors, warnings: [] }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleSelectedFile(f)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleSelectedFile(f)
    if (e.target) e.target.value = ""
  }

  const handleSelectedFile = (f: File) => {
    clearPhase1State()
    const v = validateExcelFile(f)
    if (v.isValid) setFile(f)
    else showToast("Archivo no válido", v.errors.join(", "), "error")
  }

  const processFile = async () => {
    if (!file) return
    setShowModal(true); setIsProcessing(true); setProgress(0)
    setValidationResult(null); setBackendResult(null); setRecords([])

    let cs: Step[] = initialSteps.map(s => ({ ...s, status: "pending" as const }))
    setSteps(cs)

    const colDefs = [
      { header: "Carrera_Nombre", key: "carreraNombre" }, { header: "Carrera_Facultad", key: "carreraFacultad" },
      { header: "Carrera_Ciclos", key: "carreraCiclos" }, { header: "Carrera_Estado", key: "carreraEstado" },
      { header: "Malla_Nombre", key: "mallaNombre" }, { header: "Malla_Año", key: "mallaAño" },
      { header: "Malla_NumCursos", key: "mallaNumCursos" }, { header: "Malla_Creditos", key: "mallaCreditos" },
      { header: "Malla_Estado", key: "mallaEstado" }, { header: "Malla_Descripcion", key: "mallaDescripcion" },
      { header: "Curso_Codigo", key: "cursoCodigo" }, { header: "Curso_Nombre", key: "cursoNombre" },
      { header: "Curso_Ciclo", key: "cursoCiclo" }, { header: "Curso_Año", key: "cursoAño" },
      { header: "Curso_Estado", key: "cursoEstado" }, { header: "Curso_FechaPublicacion", key: "cursoFechaPub" },
    ]

    try {
      cs[0] = { ...cs[0], status: "loading" }; setSteps([...cs]); setProgress(25)
      const wb = new ExcelJS.Workbook()
      await wb.xlsx.load(await file.arrayBuffer())
      cs[0] = { ...cs[0], status: "success" }; setSteps([...cs])

      cs[1] = { ...cs[1], status: "loading" }; setSteps([...cs]); setProgress(50)
      const ws = wb.worksheets[0]
      if (!ws) throw new Error("No se encontró hoja de cálculo.")

      const headerMap: Record<string, number> = {}
      ws.getRow(1).eachCell((cell, col) => {
        const def = colDefs.find(d => d.header === cell.text?.trim())
        if (def) headerMap[def.key] = col
      })

      const required = ["carreraNombre", "mallaNombre", "cursoCodigo", "cursoNombre", "cursoCiclo", "cursoAño"]
      if (required.some(k => !(k in headerMap))) throw new Error("Faltan columnas requeridas en el Excel.")
      cs[1] = { ...cs[1], status: "success" }; setSteps([...cs])

      cs[2] = { ...cs[2], status: "loading" }; setSteps([...cs]); setProgress(75)

      const loaded: RecordRow[] = []
      const formatErrors: string[] = []

      ws.eachRow((row, rowIdx) => {
        if (rowIdx === 1) return
        const get = (key: string): string => {
          const v = headerMap[key] ? row.getCell(headerMap[key]).value : null
          if (v instanceof Date) return v.toISOString().split("T")[0]
          return v?.toString().trim() ?? ""
        }
        const rec: RecordRow = {
          rowNumber: rowIdx,
          carreraNombre: get("carreraNombre"), carreraFacultad: get("carreraFacultad"),
          carreraCiclos: get("carreraCiclos"), carreraEstado: get("carreraEstado"),
          mallaNombre: get("mallaNombre"), mallaAño: get("mallaAño"),
          mallaNumCursos: get("mallaNumCursos"), mallaCreditos: get("mallaCreditos"),
          mallaEstado: get("mallaEstado"), mallaDescripcion: get("mallaDescripcion"),
          cursoCodigo: get("cursoCodigo"), cursoNombre: get("cursoNombre"),
          cursoCiclo: get("cursoCiclo"), cursoAño: get("cursoAño"),
          cursoEstado: get("cursoEstado"), cursoFechaPub: get("cursoFechaPub"),
          errors: [],
        }
        if (!rec.carreraNombre) rec.errors!.push("Carrera_Nombre requerido")
        if (!rec.mallaNombre) rec.errors!.push("Malla_Nombre requerido")
        if (!rec.cursoCodigo) rec.errors!.push("Curso_Codigo requerido")
        if (!rec.cursoNombre) rec.errors!.push("Curso_Nombre requerido")
        if (!rec.cursoCiclo) rec.errors!.push("Curso_Ciclo requerido")
        if (!rec.cursoAño) rec.errors!.push("Curso_Año requerido")
        if (rec.errors!.length > 0) formatErrors.push(`Fila ${rowIdx}: ${rec.errors!.join("; ")}`)
        loaded.push(rec)
      })

      cs[2] = { ...cs[2], status: formatErrors.length > 0 ? "error" : "success" }; setSteps([...cs])
      setRecords(loaded)
      setFormattingErrors(formatErrors)
      setValidationResult({
        isValid: formatErrors.length === 0,
        errors: formatErrors,
        warnings: formatErrors.length > 0 ? [`Se encontraron ${formatErrors.length} fila(s) con errores. Solo las filas válidas pueden ser importadas.`] : []
      })
      setProgress(100)
    } catch (err: any) {
      setValidationResult({ isValid: false, errors: [err.message ?? "Error desconocido"], warnings: [] })
      setRecords([])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitData = async () => {
    const valid = records.filter(r => !r.errors?.length)
    if (!valid.length) return

    const payload: BulkCourseRequestDto[] = valid.map(r => ({
      carrera: {
        nombre: r.carreraNombre ?? "",
        facultad: r.carreraFacultad ?? undefined,
        ciclos: r.carreraCiclos ? parseInt(r.carreraCiclos) : undefined,
        estado: r.carreraEstado || "Activo",
      },
      malla: {
        nombre: r.mallaNombre ?? "",
        año: r.mallaAño ? parseInt(r.mallaAño) : undefined,
        numCursos: r.mallaNumCursos ? parseInt(r.mallaNumCursos) : undefined,
        creditos: r.mallaCreditos ? parseInt(r.mallaCreditos) : undefined,
        descripcion: r.mallaDescripcion ?? undefined,
        estado: r.mallaEstado || "Activo",
      },
      curso: {
        codigo: r.cursoCodigo ?? "",
        nombre: r.cursoNombre ?? "",
        ciclo: r.cursoCiclo ? parseInt(r.cursoCiclo) : 1,
        año: r.cursoAño ? parseInt(r.cursoAño) : undefined,
        estado: r.cursoEstado || "Activo",
        fechaPublicacion: r.cursoFechaPub ?? undefined,
      },
    }))

    setIsSubmitting(true); setBackendResult(null)
    try {
      const res = await api.post<BulkUploadResult>(`/bulk-upload/courses`, payload)
      setBackendResult(res.data)
    } catch (err: any) {
      let msg = "No se pudieron enviar los datos al servidor."
      if (err.response) {
        msg = err.response.data?.error || err.response.data?.message || `Error (${err.response.status})`
      }
      showToast("Error al Enviar", msg, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearPhase1State = () => {
    setFile(null); setRecords([]); setValidationResult(null); setBackendResult(null); setFormattingErrors([])
    setSteps(initialSteps); setProgress(0); setIsProcessing(false); setIsSubmitting(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ─── Phase 2: Syllabi + Blockchain ────────────────────────────────────────
  const loadCourses = async () => {
    setIsLoadingCourses(true)
    try {
      const courses = await CoursesService.getAll()
      setAvailableCourses(courses)
    } catch {
      showToast("Error", "No se pudieron cargar los cursos del sistema.", "error")
    } finally {
      setIsLoadingCourses(false)
    }
  }

  const handleGoToPhase2 = async () => {
    setActivePhase(2)
    if (availableCourses.length === 0) await loadCourses()
  }

  const extractCode = (filename: string): string | null => {
    const name = filename.replace(/\.[^/.]+$/, "")
    const match = name.match(/[A-Z]{2,6}[-_]?\d{2,4}/i)
    return match ? match[0].toUpperCase().replace(/[-_]/, "") : null
  }

  const matchToCourse = (filename: string, courses: Course[]): Course | null => {
    const code = extractCode(filename)
    if (!code) return null
    return courses.find(c => c.code.toUpperCase().replace(/[-_]/, "") === code) ?? null
  }

  const addPDFFiles = useCallback((files: File[]) => {
    const courses = coursesRef.current
    const newItems: SyllabusPDFItem[] = files.map(f => {
      const matched = matchToCourse(f.name, courses)
      return {
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f, fileName: f.name,
        detectedCode: extractCode(f.name),
        courseId: matched?.id ?? null,
        courseName: matched?.name ?? null,
        courseCode: matched?.code ?? null,
        status: "pending",
      }
    })
    setPdfItems(prev => [...prev, ...newItems])
  }, [])

  const handlePDFDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsPdfDragOver(true) }, [])
  const handlePDFDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsPdfDragOver(false) }, [])
  const handlePDFDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsPdfDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf")
    if (files.length) addPDFFiles(files)
  }, [addPDFFiles])

  const handlePDFSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === "application/pdf")
    if (files.length) addPDFFiles(files)
    if (e.target) e.target.value = ""
  }

  const updatePDFCourse = (id: string, courseId: number) => {
    const course = availableCourses.find(c => c.id === courseId)
    setPdfItems(prev => prev.map(item =>
      item.id === id ? { ...item, courseId: course?.id ?? null, courseName: course?.name ?? null, courseCode: course?.code ?? null } : item
    ))
  }

  const removePDF = (id: string) => setPdfItems(prev => prev.filter(i => i.id !== id))

  const handleStartBlockchainUpload = async () => {
    const ready = pdfItems.filter(i => i.courseId && i.status === "pending")
    if (!ready.length) return

    setIsUploading(true); setUploadProgress(0)

    for (let i = 0; i < ready.length; i++) {
      const item = ready[i]
      setPdfItems(prev => prev.map(p => p.id === item.id ? { ...p, status: "uploading" } : p))
      try {
        const result = await SyllabiService.upload(item.courseId!, item.file)
        setPdfItems(prev => prev.map(p => p.id === item.id
          ? { ...p, status: "confirmed", txId: result.fabricTxId, hash: result.currentHash }
          : p
        ))
      } catch (err: any) {
        setPdfItems(prev => prev.map(p => p.id === item.id
          ? { ...p, status: "error", error: err.message || "Error al subir" }
          : p
        ))
      }
      setUploadProgress(Math.round(((i + 1) / ready.length) * 100))
    }
    setIsUploading(false)
  }

  const readyCount = pdfItems.filter(i => i.courseId && i.status === "pending").length
  const confirmedCount = pdfItems.filter(i => i.status === "confirmed").length
  const errorCount = pdfItems.filter(i => i.status === "error").length
  const unmappedCount = pdfItems.filter(i => !i.courseId && i.status === "pending").length

  return (
    <Fragment>
      <ToastContainer />
      <Pageheader title="Carga Masiva" currentpage="Carga Masiva" activepage="Dashboard" />

      {/* ─── Phase indicator ────────────────────────────────────────────── */}
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card border-0 shadow-sm">
            <Card.Body className="py-3">
              <div className="d-flex align-items-center">
                <button
                  className={`d-flex align-items-center gap-2 px-4 py-2 rounded-pill border-0 fw-semibold small ${activePhase === 1 ? "bg-primary text-white" : phase1Success ? "bg-success-transparent text-success" : "bg-light text-muted"}`}
                  onClick={() => setActivePhase(1)}
                >
                  <span className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${activePhase === 1 ? "bg-white text-primary" : phase1Success ? "bg-success text-white" : "bg-secondary text-white"}`}
                    style={{ width: 22, height: 22, fontSize: 11 }}>
                    {phase1Success ? <i className="ri-check-line"></i> : "1"}
                  </span>
                  Importar Datos (Carreras · Mallas · Cursos)
                </button>

                <div className={`flex-grow-1 mx-3 border-top border-2 ${phase1Success ? "border-success" : "border-light"}`} style={{ maxWidth: 60 }} />

                <button
                  className={`d-flex align-items-center gap-2 px-4 py-2 rounded-pill border-0 fw-semibold small ${activePhase === 2 ? "bg-primary text-white" : "bg-light text-muted"}`}
                  onClick={() => handleGoToPhase2()}
                  style={{ opacity: 1 }}
                >
                  <span className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${activePhase === 2 ? "bg-white text-primary" : "bg-secondary text-white"}`}
                    style={{ width: 22, height: 22, fontSize: 11 }}>
                    2
                  </span>
                  <i className="ri-links-line me-1"></i>
                  Registrar Sílabos en Blockchain
                </button>

                {phase1Success && activePhase === 1 && (
                  <button
                    className="btn btn-success btn-sm ms-auto d-flex align-items-center gap-2"
                    onClick={() => handleGoToPhase2()}
                  >
                    <i className="ri-arrow-right-line"></i>
                    Continuar a Fase 2
                  </button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ═══════════════════════ PHASE 1 ═══════════════════════════════════ */}
      {activePhase === 1 && (
        <>
          <Row>
            <Col xl={12}>
              <Alert variant="info" className="border-0 shadow-sm">
                <div className="d-flex gap-3 align-items-start">
                  <i className="ri-information-line fs-5 mt-1 flex-shrink-0"></i>
                  <div>
                    <strong>Cómo funciona la carga masiva</strong>
                    <ol className="mb-0 mt-2 small ps-3">
                      <li>Descarga la plantilla y complétala con los datos de tus carreras, mallas y cursos.</li>
                      <li>Sube el Excel, valídalo y luego impórtalo al sistema.</li>
                      <li>En la <strong>Fase 2</strong>, arrastra los PDFs de los sílabos — se auto-mapean por código de curso y se registran en blockchain.</li>
                    </ol>
                  </div>
                </div>
              </Alert>
            </Col>
          </Row>

          <Row>
            <Col xl={12}>
              <Card className="custom-card">
                <Card.Header>
                  <Card.Title>
                    <i className="ri-upload-2-line me-2"></i>Subir Archivo Excel
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  {!file ? (
                    <div
                      className={`border-2 border-dashed rounded-3 p-5 text-center mb-3 position-relative ${isDragOver ? "border-primary bg-primary-transparent" : "border-light"}`}
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                      style={{ minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <div>
                        <i className="ri-file-excel-2-line fs-1 text-success mb-2 d-block"></i>
                        <h5 className="fw-semibold">{isDragOver ? "Suelta el archivo aquí" : "Arrastra tu archivo .xlsx aquí"}</h5>
                        <p className="text-muted mb-0 small">o haz clic para seleccionar — Máx. 10 MB</p>
                      </div>
                      <input ref={fileInputRef} type="file" accept=".xlsx" onChange={handleFileSelect}
                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{ cursor: "pointer" }} />
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <i className="ri-file-excel-2-line fs-3 text-success"></i>
                        <div>
                          <h6 className="fw-semibold mb-0">{file.name}</h6>
                          <small className="text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                        </div>
                      </div>
                      <SpkButton Buttonvariant="light" Size="sm" onClickfunc={clearPhase1State} Disabled={isProcessing || isSubmitting}>
                        <i className="ri-close-line"></i>
                      </SpkButton>
                    </div>
                  )}

                  <div className="d-flex gap-3">
                    <SpkButton Buttonvariant="primary" onClickfunc={processFile} Disabled={!file || isProcessing || isSubmitting} Customclass="flex-fill">
                      {isProcessing
                        ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Validando...</>
                        : <><i className="ri-shield-check-line me-2"></i>Validar Archivo</>}
                    </SpkButton>
                    <SpkButton Buttonvariant="light" onClickfunc={handleDownloadTemplate}>
                      <i className="ri-download-2-line me-2"></i>Descargar Plantilla
                    </SpkButton>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {validationResult && records.length > 0 && (
            <Row>
              <Col xl={12}>
                <Card className="custom-card">
                  <Card.Header>
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <div>
                        <Card.Title className="mb-1">Vista Previa — Registros Cargados</Card.Title>
                        <p className="text-muted mb-0 small">
                          {records.filter(r => !r.errors?.length).length} cursos válidos
                          {formattingErrors.length > 0 && ` — ${formattingErrors.length} fila(s) con errores`}
                        </p>
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        {/* Unique carreras count */}
                        <Badge bg="info-transparent" className="text-info border border-info">
                          {new Set(records.map(r => r.carreraNombre)).size} carreras
                        </Badge>
                        <Badge bg="warning-transparent" className="text-warning border border-warning">
                          {new Set(records.map(r => r.mallaNombre)).size} mallas
                        </Badge>
                        <Badge bg="success">{records.length} cursos</Badge>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive" style={{ maxHeight: 380, overflowY: "auto" }}>
                      <Table striped hover className="text-nowrap mb-0">
                        <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--spk-body-bg)" }}>
                          <tr>
                            <th className="ps-3">#</th>
                            <th>Carrera</th>
                            <th>Malla</th>
                            <th>Código</th>
                            <th>Curso</th>
                            <th>Ciclo</th>
                            <th>Año</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((rec, i) => (
                            <tr key={i} className={rec.errors?.length ? "table-danger" : ""} title={rec.errors?.length ? rec.errors.join("; ") : ""}>
                              <td className="ps-3 text-muted small">
                                {rec.rowNumber}
                                {rec.errors && rec.errors.length > 0 && <i className="ri-error-warning-fill text-danger ms-1" title={rec.errors.join("; ")}></i>}
                              </td>
                              <td className="small">{rec.carreraNombre}</td>
                              <td className="small text-muted">{rec.mallaNombre}</td>
                              <td><Badge bg="light" className="text-dark border">{rec.cursoCodigo}</Badge></td>
                              <td className="small">{rec.cursoNombre}</td>
                              <td className="text-center"><Badge bg="secondary">{rec.cursoCiclo}</Badge></td>
                              <td className="small text-muted">{rec.cursoAño}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {formattingErrors.length > 0 && (
                      <div className="px-3 pt-3">
                        <Alert variant="warning" className="mb-3">
                          <i className="ri-alert-line me-2"></i>
                          <strong>{formattingErrors.length} fila(s) con errores de validación:</strong>
                          <ul className="mb-0 mt-2 ps-3">
                            {formattingErrors.map((err, i) => <li key={i} className="text-muted small">{err}</li>)}
                          </ul>
                        </Alert>
                      </div>
                    )}

                    {backendResult && (
                      <div className="px-3 pt-3">
                        <Alert variant={backendResult.errors?.length ? "warning" : "success"} className="d-flex align-items-center gap-2 mb-0">
                          <i className={`ri-${backendResult.errors?.length ? "alert-line text-warning" : "checkbox-circle-line text-success"} fs-5`}></i>
                          <div>
                            <strong>{backendResult.successCount} cursos importados correctamente</strong>
                            {backendResult.errors?.length > 0 && (
                              <span className="text-muted ms-2">— {backendResult.errors.length} con errores</span>
                            )}
                          </div>
                        </Alert>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center p-3 border-top mt-3">
                      <SpkButton
                        Buttonvariant="success"
                        onClickfunc={() => handleGoToPhase2()}
                        Disabled={!phase1Success}
                      >
                        <i className="ri-links-line me-2"></i>
                        {phase1Success ? `Ir a Fase 2 — Subir Sílabos (${backendResult?.successCount} cursos)` : "Importa primero para continuar"}
                      </SpkButton>
                      <SpkButton
                        Buttonvariant="primary"
                        Size="lg"
                        onClickfunc={handleSubmitData}
                        Disabled={isSubmitting || isProcessing || !records.length || !!backendResult}
                      >
                        {isSubmitting
                          ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Importando...</>
                          : <><i className="ri-send-plane-line me-2"></i>Importar al Sistema</>}
                      </SpkButton>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {validationResult && !validationResult.isValid && (
            <Row>
              <Col xl={12}>
                <Alert variant="danger">
                  <i className="ri-close-circle-line me-2"></i>
                  <strong>Error de validación:</strong> {validationResult.errors.join(" — ")}
                </Alert>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* ═══════════════════════ PHASE 2 ═══════════════════════════════════ */}
      {activePhase === 2 && (
        <>
          {/* Header */}
          <Row className="mb-3">
            <Col xl={12}>
              <Card className="custom-card border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)" }}>
                <Card.Body className="py-4 text-white">
                  <div className="d-flex align-items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-25 rounded-3">
                      <i className="ri-links-fill fs-2"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="fw-bold mb-1">Registro de Sílabos en Blockchain</h4>
                      <p className="mb-0 opacity-75">
                        Arrastra los PDFs de los sílabos. El sistema los mapeará automáticamente por código de curso
                        y los registrará en Hyperledger Fabric — cada sílabo obtiene un hash y un Transaction ID único e inmutable.
                      </p>
                    </div>
                    {isLoadingCourses ? (
                      <Spinner animation="border" variant="light" />
                    ) : (
                      <div className="text-center text-white opacity-75">
                        <h5 className="fw-bold mb-0">{availableCourses.length}</h5>
                        <small>cursos disponibles</small>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* PDF Drop Zone */}
          <Row>
            <Col xl={12}>
              <Card className="custom-card">
                <Card.Header>
                  <Card.Title>
                    <i className="ri-file-pdf-line me-2 text-danger"></i>Arrastrar PDFs de Sílabos
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <div
                    className={`rounded-3 border-2 border-dashed p-5 text-center position-relative ${isPdfDragOver ? "border-primary bg-primary-transparent" : "border-light"}`}
                    onDragOver={handlePDFDragOver} onDragLeave={handlePDFDragLeave} onDrop={handlePDFDrop}
                    style={{ minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <div>
                      <i className="ri-file-pdf-2-line fs-1 text-danger mb-2 d-block"></i>
                      <h5 className="fw-semibold">{isPdfDragOver ? "¡Suelta los PDFs!" : "Arrastra múltiples PDFs aquí"}</h5>
                      <p className="text-muted mb-2 small">Nombra los archivos con el código del curso para auto-mapeo automático</p>
                      <div className="d-flex gap-2 justify-content-center flex-wrap">
                        {["SIS101.pdf", "MAT101.pdf", "Silabo_FIS201_2024.pdf"].map(ex => (
                          <code key={ex} className="bg-light px-2 py-1 rounded small">{ex}</code>
                        ))}
                      </div>
                    </div>
                    <input ref={pdfInputRef} type="file" accept=".pdf" multiple onChange={handlePDFSelect}
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{ cursor: "pointer" }} />
                  </div>

                  {pdfItems.length === 0 && !isLoadingCourses && (
                    <div className="mt-3 text-center text-muted small">
                      <i className="ri-information-line me-1"></i>
                      Puedes arrastrar múltiples PDFs a la vez. También puedes acceder a esta fase sin haber hecho una carga masiva.
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Mapping + Upload table */}
          {pdfItems.length > 0 && (
            <Row>
              <Col xl={12}>
                <Card className="custom-card">
                  <Card.Header>
                    <div className="d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
                      <div>
                        <Card.Title className="mb-1">Sílabos para Registrar en Blockchain</Card.Title>
                        <p className="text-muted mb-0 small">
                          {pdfItems.filter(i => i.courseId).length} de {pdfItems.length} mapeados a un curso
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        {readyCount > 0 && <Badge bg="warning">{readyCount} listos</Badge>}
                        {confirmedCount > 0 && <Badge bg="success">{confirmedCount} confirmados</Badge>}
                        {errorCount > 0 && <Badge bg="danger">{errorCount} con error</Badge>}
                        {unmappedCount > 0 && <Badge bg="secondary">{unmappedCount} sin mapear</Badge>}
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="ps-3">Archivo PDF</th>
                            <th>Código Detectado</th>
                            <th style={{ minWidth: 240 }}>Curso Asignado</th>
                            <th>Estado</th>
                            <th>TX Blockchain</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {pdfItems.map(item => (
                            <tr key={item.id} className={item.status === "confirmed" ? "table-success" : item.status === "error" ? "table-danger" : ""}>
                              <td className="ps-3">
                                <div className="d-flex align-items-center gap-2">
                                  <i className="ri-file-pdf-line text-danger fs-5 flex-shrink-0"></i>
                                  <div>
                                    <small className="fw-semibold d-block lh-1">{item.fileName}</small>
                                    <small className="text-muted">{(item.file.size / 1024).toFixed(0)} KB</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {item.detectedCode
                                  ? <Badge bg="primary-transparent" className="text-primary border border-primary">{item.detectedCode}</Badge>
                                  : <small className="text-muted">—</small>}
                              </td>
                              <td>
                                {item.status === "confirmed" || item.status === "uploading" ? (
                                  <span className="fw-semibold small">{item.courseName}</span>
                                ) : (
                                  <Form.Select
                                    size="sm"
                                    value={item.courseId ?? ""}
                                    onChange={e => updatePDFCourse(item.id, Number(e.target.value))}
                                    disabled={isUploading}
                                    className={!item.courseId ? "border-warning" : ""}
                                  >
                                    <option value="">— Seleccionar curso —</option>
                                    {availableCourses.map(c => (
                                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                                    ))}
                                  </Form.Select>
                                )}
                              </td>
                              <td>
                                {item.status === "pending" && (
                                  <Badge bg={item.courseId ? "warning" : "light"} className={item.courseId ? "" : "text-muted border"}>
                                    {item.courseId ? "Listo" : "Sin mapear"}
                                  </Badge>
                                )}
                                {item.status === "uploading" && (
                                  <div className="d-flex align-items-center gap-2">
                                    <Spinner animation="border" size="sm" variant="primary" />
                                    <small className="text-primary fw-semibold">Registrando...</small>
                                  </div>
                                )}
                                {item.status === "confirmed" && (
                                  <Badge bg="success">
                                    <i className="ri-checkbox-circle-line me-1"></i>En blockchain
                                  </Badge>
                                )}
                                {item.status === "error" && (
                                  <Badge bg="danger" title={item.error}>
                                    <i className="ri-close-circle-line me-1"></i>Error
                                  </Badge>
                                )}
                              </td>
                              <td>
                                {item.txId && (
                                  <div>
                                    <code className="text-success small d-block">{item.txId.substring(0, 18)}...</code>
                                    {item.hash && <small className="text-muted">SHA: {item.hash.substring(0, 12)}...</small>}
                                  </div>
                                )}
                                {item.status === "error" && item.error && (
                                  <small className="text-danger" title={item.error}>
                                    {item.error.substring(0, 35)}...
                                  </small>
                                )}
                              </td>
                              <td>
                                {item.status === "pending" && (
                                  <button className="btn btn-sm btn-light" onClick={() => removePDF(item.id)} disabled={isUploading}>
                                    <i className="ri-delete-bin-line text-danger"></i>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {isUploading && (
                      <div className="p-3 border-top bg-primary-transparent">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <Spinner animation="border" size="sm" variant="primary" />
                            <small className="fw-semibold text-primary">Registrando en Hyperledger Fabric...</small>
                          </div>
                          <small className="text-muted fw-semibold">{uploadProgress}%</small>
                        </div>
                        <ProgressBar now={uploadProgress} animated variant="primary" style={{ height: 6 }} />
                      </div>
                    )}

                    {confirmedCount > 0 && !isUploading && (
                      <div className="p-3 border-top">
                        <Alert variant="success" className="mb-0 d-flex align-items-center gap-2">
                          <i className="ri-shield-check-line fs-5 text-success"></i>
                          <div>
                            <strong>{confirmedCount} sílabo{confirmedCount > 1 ? "s" : ""} registrado{confirmedCount > 1 ? "s" : ""} en blockchain</strong>
                            <p className="mb-0 small text-muted">Cada sílabo tiene un Transaction ID único e inmutable en Hyperledger Fabric.</p>
                          </div>
                        </Alert>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center p-3 border-top">
                      <button className="btn btn-light" onClick={() => setActivePhase(1)}>
                        <i className="ri-arrow-left-line me-2"></i>Volver a Fase 1
                      </button>
                      <SpkButton
                        Buttonvariant="primary"
                        Size="lg"
                        onClickfunc={handleStartBlockchainUpload}
                        Disabled={isUploading || readyCount === 0}
                      >
                        {isUploading
                          ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Registrando en blockchain...</>
                          : <><i className="ri-links-line me-2"></i>Registrar {readyCount} sílabo{readyCount !== 1 ? "s" : ""} en Blockchain</>}
                      </SpkButton>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* ─── Validation modal ──────────────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => !isProcessing && setShowModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Validando Archivo Excel</Modal.Title>
          {!isProcessing && <button type="button" className="btn-close" onClick={() => setShowModal(false)} />}
        </Modal.Header>
        <Modal.Body>
          <ProgressBar now={progress} animated={isProcessing} className="mb-4" />
          <div className="d-flex flex-column gap-3">
            {steps.map(step => (
              <div key={step.id} className={`d-flex align-items-center gap-3 p-3 rounded-3 ${step.status === "error" ? "bg-danger-transparent" : "bg-light"}`}>
                <div className="flex-shrink-0">
                  {step.status === "pending" && <i className="ri-time-line text-muted fs-5"></i>}
                  {step.status === "loading" && <Spinner animation="border" size="sm" variant="primary" />}
                  {step.status === "success" && <i className="ri-checkbox-circle-line text-success fs-5"></i>}
                  {step.status === "error" && <i className="ri-close-circle-line text-danger fs-5"></i>}
                </div>
                <div>
                  <h6 className={`fw-semibold mb-1 ${step.status === "error" ? "text-danger" : ""}`}>{step.label}</h6>
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

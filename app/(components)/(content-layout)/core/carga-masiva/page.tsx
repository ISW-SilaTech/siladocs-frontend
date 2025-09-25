"use client"

import React, { Fragment, useState, useCallback, useRef } from "react"
import { Card, Row, Col, Table, Badge, Alert, Modal, ProgressBar } from "react-bootstrap"
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons"
import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import ExcelJS from "exceljs"

interface Step {
  id: number
  label: string
  status: "pending" | "loading" | "success" | "error"
  description?: string
}

interface RecordRow {
  carrera: string
  malla: string
  ciclo: string
  curso: string
  errors?: string[]
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface BulkUploadPageProps { }

const BulkUploadPage: React.FC<BulkUploadPageProps> = () => {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [records, setRecords] = useState<RecordRow[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toast personalizado para este proyecto
  const showToast = (title: string, message: string, variant: 'success' | 'error' | 'warning' = 'success') => {
    console.log(`${variant.toUpperCase()}: ${title} - ${message}`)
    // Aquí puedes implementar tu sistema de notificaciones personalizado
    // Por ejemplo, usando el sistema de alerts de Bootstrap o similar
  }

  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      label: "Cargando archivo",
      status: "pending",
      description: "Leyendo contenido del archivo Excel",
    },
    {
      id: 2,
      label: "Validando estructura",
      status: "pending",
      description: "Verificando columnas requeridas",
    },
    {
      id: 3,
      label: "Validando carreras",
      status: "pending",
      description: "Comprobando nombres de carreras",
    },
    {
      id: 4,
      label: "Validando mallas curriculares",
      status: "pending",
      description: "Verificando códigos de mallas",
    },
    {
      id: 5,
      label: "Validando ciclos y cursos",
      status: "pending",
      description: "Comprobando datos académicos",
    },
  ])
  const [progress, setProgress] = useState(0)

  const handleDownloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet("ModeloCarga")

      // Configure columns with better formatting
      sheet.columns = [
        { header: "Carrera", key: "carrera", width: 35 },
        { header: "Malla", key: "malla", width: 20 },
        { header: "Ciclo", key: "ciclo", width: 15 },
        { header: "Curso", key: "curso", width: 45 },
      ]

      // Style header row
      const headerRow = sheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } }
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "366092" } }
      headerRow.alignment = { horizontal: "center" }

      // Add sample data with more examples
      const sampleData = [
        { carrera: "Ingeniería de Sistemas", malla: "2025-I", ciclo: "1", curso: "Matemática Básica" },
        { carrera: "Administración", malla: "2025-I", ciclo: "2", curso: "Contabilidad General" },
        { carrera: "Ingeniería Industrial", malla: "2024-II", ciclo: "3", curso: "Estadística Aplicada" },
        { carrera: "Psicología", malla: "2025-I", ciclo: "1", curso: "Introducción a la Psicología" },
      ]

      sampleData.forEach((data) => sheet.addRow(data))

      // Add instructions sheet
      const instructionsSheet = workbook.addWorksheet("Instrucciones")
      instructionsSheet.addRow(["INSTRUCCIONES PARA CARGA MASIVA"])
      instructionsSheet.addRow([""])
      instructionsSheet.addRow(["1. Complete todas las columnas obligatorias"])
      instructionsSheet.addRow(["2. Carrera: Nombre completo de la carrera"])
      instructionsSheet.addRow(["3. Malla: Código de malla curricular (formato: YYYY-I/II)"])
      instructionsSheet.addRow(["4. Ciclo: Número del ciclo académico (1-10)"])
      instructionsSheet.addRow(["5. Curso: Nombre completo del curso"])
      instructionsSheet.addRow([""])
      instructionsSheet.addRow(["IMPORTANTE: No modifique los nombres de las columnas"])

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "Modelo_Carga_Masiva.xlsx"
      a.click()
      window.URL.revokeObjectURL(url)

      showToast("Plantilla descargada", "El archivo modelo se ha descargado correctamente", "success")
    } catch (error) {
      showToast("Error al descargar", "No se pudo generar la plantilla", "error")
    }
  }

  const validateFile = (file: File): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // File type validation
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ]

    if (!validTypes.includes(file.type)) {
      errors.push("Tipo de archivo no válido. Use archivos Excel (.xlsx) o CSV")
    }

    // File size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      errors.push("El archivo es demasiado grande. Máximo 10MB permitido")
    }

    // File name validation
    if (file.name.length > 100) {
      warnings.push("El nombre del archivo es muy largo")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        const validation = validateFile(droppedFile)
        if (validation.isValid) {
          setFile(droppedFile)
          if (validation.warnings.length > 0) {
            showToast("Advertencias", validation.warnings.join(", "), "warning")
          }
        } else {
          showToast("Archivo no válido", validation.errors.join(", "), "error")
        }
      }
    },
    []
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validation = validateFile(selectedFile)
      if (validation.isValid) {
        setFile(selectedFile)
        if (validation.warnings.length > 0) {
          showToast("Advertencias", validation.warnings.join(", "), "warning")
        }
      } else {
        showToast("Archivo no válido", validation.errors.join(", "), "error")
        e.target.value = ""
      }
    }
  }

  const processFile = async () => {
    if (!file) {
      showToast("Error", "Por favor selecciona un archivo", "error")
      return
    }

    setShowModal(true)
    setIsProcessing(true)
    setProgress(0)
    setValidationResult(null)

    const newSteps: Step[] = steps.map((step) => ({ ...step, status: "pending" }))
    setSteps(newSteps)

    try {
      // Step 1: Load file
      newSteps[0] = { ...newSteps[0], status: "loading" }
      setSteps([...newSteps])
      setProgress(20)

      const workbook = new ExcelJS.Workbook()
      const data = await file.arrayBuffer()
      await workbook.xlsx.load(data)

      await new Promise((resolve) => setTimeout(resolve, 800))
      newSteps[0] = { ...newSteps[0], status: "success" }
      setSteps([...newSteps])

      // Step 2: Validate structure
      newSteps[1] = { ...newSteps[1], status: "loading" }
      setSteps([...newSteps])
      setProgress(40)

      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        throw new Error("No se encontró ninguna hoja de cálculo")
      }

      const headerRow = worksheet.getRow(1)
      const expectedHeaders = ["Carrera", "Malla", "Ciclo", "Curso"]
      const actualHeaders = expectedHeaders.map((_, index) => headerRow.getCell(index + 1).text.trim())

      const missingHeaders = expectedHeaders.filter(
        (header, index) => actualHeaders[index].toLowerCase() !== header.toLowerCase(),
      )

      if (missingHeaders.length > 0) {
        throw new Error(`Columnas faltantes o incorrectas: ${missingHeaders.join(", ")}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 600))
      newSteps[1] = { ...newSteps[1], status: "success" }
      setSteps([...newSteps])

      // Step 3-5: Validate data
      const loadedRecords: RecordRow[] = []
      const errors: string[] = []
      const warnings: string[] = []

      worksheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return // Skip header

        const record: RecordRow = {
          carrera: row.getCell(1).text.trim(),
          malla: row.getCell(2).text.trim(),
          ciclo: row.getCell(3).text.trim(),
          curso: row.getCell(4).text.trim(),
          errors: [],
        }

        // Validate each field
        if (!record.carrera) record.errors?.push("Carrera requerida")
        if (!record.malla) record.errors?.push("Malla requerida")
        if (!record.ciclo) record.errors?.push("Ciclo requerido")
        if (!record.curso) record.errors?.push("Curso requerido")

        // Validate malla format
        if (record.malla && !/^\d{4}-(I|II)$/.test(record.malla)) {
          record.errors?.push("Formato de malla inválido (use YYYY-I o YYYY-II)")
        }

        // Validate ciclo
        if (record.ciclo && (isNaN(Number(record.ciclo)) || Number(record.ciclo) < 1 || Number(record.ciclo) > 10)) {
          record.errors?.push("Ciclo debe ser un número entre 1 y 10")
        }

        if (record.errors && record.errors.length > 0) {
          errors.push(`Fila ${rowIndex}: ${record.errors.join(", ")}`)
        }

        loadedRecords.push(record)
      })

      // Process validation steps
      for (let i = 2; i < 5; i++) {
        newSteps[i] = { ...newSteps[i], status: "loading" }
        setSteps([...newSteps])
        setProgress(40 + (i - 1) * 20)

        await new Promise((resolve) => setTimeout(resolve, 600))

        if (errors.length > 0 && i === 4) {
          newSteps[i] = { ...newSteps[i], status: "error" }
          setSteps([...newSteps])
          throw new Error(`Se encontraron ${errors.length} errores de validación`)
        } else {
          newSteps[i] = { ...newSteps[i], status: "success" }
          setSteps([...newSteps])
        }
      }

      setRecords(loadedRecords)
      setValidationResult({
        isValid: errors.length === 0,
        errors,
        warnings,
      })

      setProgress(100)

      showToast("Procesamiento completado", `Se cargaron ${loadedRecords.length} registros correctamente`, "success")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setValidationResult({
        isValid: false,
        errors: [errorMessage],
        warnings: [],
      })

      showToast("Error en el procesamiento", errorMessage, "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitData = async () => {
    if (records.length === 0) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      showToast("Datos enviados", `Se enviaron ${records.length} registros al sistema`, "success")

      // Reset form
      setFile(null)
      setRecords([])
      setValidationResult(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      showToast("Error al enviar", "No se pudieron enviar los datos al servidor", "error")
    }
  }

  const clearFile = () => {
    setFile(null)
    setRecords([])
    setValidationResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Fragment>
      <Pageheader
        title="Core"
        subtitle="Gestión"
        activepage="Carga Masiva"
        currentpage="Carga Masiva de Datos Académicos"
      />
      
      <Row>
        <Col xl={12}>
          <div className="mb-4">
            <p className="text-muted mb-0">
              Carga múltiples registros de carreras, mallas curriculares, ciclos y cursos desde un archivo Excel
            </p>
          </div>
        </Col>
      </Row>

      {/* Upload Section */}
      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <Card.Title>
                <i className="ri-upload-2-line me-2"></i>
                Cargar Archivo
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {/* Drag and Drop Area - Solo se muestra cuando no hay archivo */}
              {!file && (
                <div
                  className={`border-2 border-dashed rounded-3 p-4 text-center mb-3 ${
                    isDragOver ? "border-primary bg-primary-transparent" : "border-light"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{ minHeight: "200px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <div>
                    <i className="ri-file-excel-2-line fs-1 text-muted mb-3 d-block"></i>
                    <div className="mb-3">
                      <h5 className="fw-semibold">
                        {isDragOver ? "Suelta el archivo aquí" : "Arrastra tu archivo aquí"}
                      </h5>
                      <p className="text-muted mb-0">o haz clic para seleccionar un archivo</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="position-absolute w-100 h-100 opacity-0"
                      style={{ cursor: "pointer", top: 0, left: 0 }}
                    />
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
                  <SpkButton Buttonvariant="light" Size="sm" onClickfunc={clearFile}>
                    <i className="ri-delete-bin-line"></i>
                  </SpkButton>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-3">
                <SpkButton 
                  Buttonvariant="primary" 
                  onClickfunc={processFile} 
                  Disabled={!file || isProcessing}
                  Customclass="flex-fill"
                >
                  {isProcessing ? (
                    <>
                      <i className="ri-loader-2-line me-2 spin"></i>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="ri-upload-2-line me-2"></i>
                      Procesar Archivo
                    </>
                  )}
                </SpkButton>
                <SpkButton Buttonvariant="light" onClickfunc={handleDownloadTemplate}>
                  <i className="ri-download-2-line me-2"></i>
                  Descargar Plantilla
                </SpkButton>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Records Table */}
      {records.length > 0 && (
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Header>
                <div className="d-flex align-items-center justify-content-between w-100">
                  <div>
                    <Card.Title className="mb-1">Registros Cargados</Card.Title>
                    <p className="text-muted mb-0">{records.length} registros encontrados en el archivo</p>
                  </div>
                  <Badge bg="secondary" className="fs-6 px-3 py-2">
                    {records.length}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table striped className="text-nowrap">
                    <thead>
                      <tr>
                        <th className="fw-semibold">#</th>
                        <th className="fw-semibold">Carrera</th>
                        <th className="fw-semibold">Malla</th>
                        <th className="fw-semibold">Ciclo</th>
                        <th className="fw-semibold">Curso</th>
                        <th className="fw-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.slice(0, 50).map((record, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{index + 1}</td>
                          <td>{record.carrera}</td>
                          <td>{record.malla}</td>
                          <td>{record.ciclo}</td>
                          <td>{record.curso}</td>
                          <td>
                            {record.errors && record.errors.length > 0 ? (
                              <Badge bg="danger">Con errores</Badge>
                            ) : (
                              <Badge bg="success">Válido</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {records.length > 50 && (
                  <div className="p-3 text-center">
                    <p className="text-muted mb-0">
                      Mostrando los primeros 50 registros de {records.length} total
                    </p>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div className="text-muted">
                    Total de registros válidos: {records.filter((r) => !r.errors || r.errors.length === 0).length}
                  </div>
                  <SpkButton
                    Buttonvariant="primary"
                    Size="lg"
                    onClickfunc={handleSubmitData}
                    Disabled={records.filter((r) => !r.errors || r.errors.length === 0).length === 0}
                  >
                    <i className="ri-send-plane-line me-2"></i>
                    Enviar al Sistema
                  </SpkButton>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Processing Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header>
          <Modal.Title>Procesando Archivo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="text-muted mb-3">Por favor espera mientras validamos tu archivo</p>
            <ProgressBar now={progress} className="mb-4" />
          </div>

          <div className="d-flex flex-column gap-3">
            {steps.map((step) => (
              <div key={step.id} className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light">
                <div className="flex-shrink-0">
                  {step.status === "pending" && (
                    <div className="bg-light border rounded-circle d-flex align-items-center justify-content-center" style={{width: "24px", height: "24px"}}>
                      <div className="bg-secondary rounded-circle" style={{width: "8px", height: "8px"}}></div>
                    </div>
                  )}
                  {step.status === "loading" && (
                    <i className="ri-loader-2-line text-primary spin fs-5"></i>
                  )}
                  {step.status === "success" && (
                    <i className="ri-checkbox-circle-line text-success fs-5"></i>
                  )}
                  {step.status === "error" && (
                    <i className="ri-close-circle-line text-danger fs-5"></i>
                  )}
                </div>
                <div className="flex-fill">
                  <h6 className="fw-semibold mb-1">{step.label}</h6>
                  {step.description && (
                    <p className="text-muted mb-0 fs-12">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}

export default BulkUploadPage

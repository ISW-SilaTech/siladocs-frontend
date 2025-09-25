"use client"
import React, { useState, useCallback, useMemo } from "react"
import { Fragment } from "react"
import { Row, Col, Card, Button, Form, Modal, Badge, Dropdown, InputGroup, Table } from "react-bootstrap"
import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import Seo from "@/shared/layouts-components/seo/seo"
import Swal from 'sweetalert2'

interface BlockchainDocument {
  id: string
  nombre: string
  hash: string
  estado: "Registrado" | "Pendiente" | "Verificando" | "Error"
  fecha: string
  tamaño: string
  tipo: string
  descripcion?: string
  transaccionId?: string
}

const BlockchainDocsData: BlockchainDocument[] = [
  {
    id: "1",
    nombre: "Contrato de servicio 2025",
    hash: "0xabc123def456789012345678901234567890abcdef",
    estado: "Registrado",
    fecha: "2025-09-20",
    tamaño: "2.4 MB",
    tipo: "PDF",
    descripcion: "Contrato principal de servicios académicos",
    transaccionId: "0x789abc...def123",
  },
  {
    id: "2",
    nombre: "Sílabo Matemáticas 2025",
    hash: "0xdef456abc789012345678901234567890123456789",
    estado: "Pendiente",
    fecha: "2025-09-21",
    tamaño: "1.8 MB",
    tipo: "PDF",
    descripcion: "Sílabo actualizado para el período académico 2025",
  },
  {
    id: "3",
    nombre: "Certificado ISO 9001",
    hash: "0x123456789abcdef0123456789abcdef0123456789",
    estado: "Verificando",
    fecha: "2025-09-19",
    tamaño: "856 KB",
    tipo: "PDF",
    descripcion: "Certificación de calidad institucional",
  },
]

type SortField = "nombre" | "fecha" | "estado" | "tamaño"
type SortOrder = "asc" | "desc"

const BlockchainPage: React.FC = () => {
  const [documents, setDocuments] = useState<BlockchainDocument[]>(BlockchainDocsData)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("fecha")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [filterEstado, setFilterEstado] = useState<string>("todos")

  // Form state with validation
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    archivo: null as File | null,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const filteredAndSortedDocuments = useMemo(() => {
    const filtered = documents.filter((doc) => {
      const matchesSearch =
        doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.hash.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterEstado === "todos" || doc.estado === filterEstado
      return matchesSearch && matchesFilter
    })

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === "fecha") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [documents, searchTerm, sortField, sortOrder, filterEstado])

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre del documento es requerido"
    }

    if (!formData.archivo) {
      errors.archivo = "Debe seleccionar un archivo"
    } else if (formData.archivo.size > 10 * 1024 * 1024) {
      errors.archivo = "El archivo no puede ser mayor a 10MB"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const handleSave = useCallback(async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Simulate blockchain registration process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newDoc: BlockchainDocument = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        estado: "Verificando",
        fecha: new Date().toISOString().split("T")[0],
        tamaño: `${(formData.archivo!.size / 1024 / 1024).toFixed(1)} MB`,
        tipo: formData.archivo!.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
        descripcion: formData.descripcion || undefined,
      }

      setDocuments((prev) => [newDoc, ...prev])
      setShowModal(false)
      setFormData({ nombre: "", descripcion: "", archivo: null })
      setFormErrors({})

      Swal.fire({
        title: "Documento registrado",
        text: "El documento se está verificando en la blockchain",
        icon: "success",
        confirmButtonText: "OK"
      })

      // Simulate verification completion
      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === newDoc.id
              ? {
                  ...doc,
                  estado: "Registrado" as const,
                  transaccionId: `0x${Math.random().toString(16).substr(2, 10)}...${Math.random().toString(16).substr(2, 6)}`,
                }
              : doc,
          ),
        )

        Swal.fire({
          title: "Verificación completada",
          text: "El documento ha sido registrado exitosamente en la blockchain",
          icon: "success",
          confirmButtonText: "OK"
        })
      }, 5000)
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo registrar el documento. Intente nuevamente.",
        icon: "error",
        confirmButtonText: "OK"
      })
    } finally {
      setIsLoading(false)
    }
  }, [formData, validateForm])

  const handleDelete = useCallback(
    (id: string) => {
      const doc = documents.find((d) => d.id === id)
      if (!doc) return

      Swal.fire({
        title: '¿Está seguro?',
        text: `¿Desea eliminar "${doc.nombre}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          setDocuments((prev) => prev.filter((d) => d.id !== id))
          Swal.fire({
            title: "Documento eliminado",
            text: "El documento ha sido removido de la lista",
            icon: "success",
            confirmButtonText: "OK"
          })
        }
      })
    },
    [documents],
  )

  const getStatusBadge = (estado: BlockchainDocument["estado"]) => {
    switch (estado) {
      case "Registrado":
        return <Badge bg="success" className="d-flex align-items-center gap-1">
          <i className="ri-check-line"></i> {estado}
        </Badge>
      case "Pendiente":
        return <Badge bg="warning" className="d-flex align-items-center gap-1">
          <i className="ri-time-line"></i> {estado}
        </Badge>
      case "Verificando":
        return <Badge bg="info" className="d-flex align-items-center gap-1">
          <i className="ri-shield-check-line"></i> {estado}
        </Badge>
      case "Error":
        return <Badge bg="danger" className="d-flex align-items-center gap-1">
          <i className="ri-error-warning-line"></i> {estado}
        </Badge>
    }
  }

  return (
    <Fragment>
      <Seo title="Documentos en Blockchain" />
      <Pageheader 
        currentpage="Blockchain" 
        activepage="Core" 
        mainpage="Blockchain" 
        activepageclickable
      />
      
      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title>
                <i className="ri-shield-check-line me-2"></i>
                Documentos en Blockchain
              </Card.Title>
              <Button 
                variant="primary" 
                onClick={() => setShowModal(true)}
                className="d-flex align-items-center gap-2"
              >
                <i className="ri-file-add-line"></i>
                Registrar Documento
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col lg={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="ri-search-line"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col lg={3}>
                  <Form.Select 
                    value={filterEstado} 
                    onChange={(e) => setFilterEstado(e.target.value)}
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="Registrado">Registrado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Verificando">Verificando</option>
                    <option value="Error">Error</option>
                  </Form.Select>
                </Col>
                <Col lg={3}>
                  <Form.Select 
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-") as [SortField, SortOrder]
                      setSortField(field)
                      setSortOrder(order)
                    }}
                  >
                    <option value="fecha-desc">Fecha (más reciente)</option>
                    <option value="fecha-asc">Fecha (más antiguo)</option>
                    <option value="nombre-asc">Nombre (A-Z)</option>
                    <option value="nombre-desc">Nombre (Z-A)</option>
                    <option value="estado-asc">Estado</option>
                  </Form.Select>
                </Col>
              </Row>

              {filteredAndSortedDocuments.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ri-file-text-line fs-1 text-muted mb-3 d-block"></i>
                  <h5>No se encontraron documentos</h5>
                  <p className="text-muted mb-3">
                    {searchTerm || filterEstado !== "todos"
                      ? "Intenta ajustar los filtros de búsqueda"
                      : "Comienza registrando tu primer documento en blockchain"}
                  </p>
                  {!searchTerm && filterEstado === "todos" && (
                    <Button 
                      variant="primary" 
                      onClick={() => setShowModal(true)}
                      className="d-flex align-items-center gap-2 mx-auto"
                    >
                      <i className="ri-file-add-line"></i>
                      Registrar primer documento
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table className="table-bordered text-nowrap">
                    <thead>
                      <tr>
                        <th>Documento</th>
                        <th>Estado</th>
                        <th>Hash</th>
                        <th>Fecha</th>
                        <th>Tamaño</th>
                        <th>Transacción</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedDocuments.map((doc) => (
                        <tr key={doc.id}>
                          <td>
                            <div>
                              <div className="d-flex align-items-center">
                                <i className="ri-file-text-line me-2 text-primary fs-16"></i>
                                <div>
                                  <div className="fw-semibold">{doc.nombre}</div>
                                  {doc.descripcion && (
                                    <small className="text-muted">{doc.descripcion}</small>
                                  )}
                                  <div className="text-muted small">
                                    {doc.tipo} • {doc.tamaño}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{getStatusBadge(doc.estado)}</td>
                          <td>
                            <code className="text-primary small" title={doc.hash}>
                              {doc.hash.slice(0, 12)}...{doc.hash.slice(-8)}
                            </code>
                          </td>
                          <td>{new Date(doc.fecha).toLocaleDateString("es-ES")}</td>
                          <td>{doc.tamaño}</td>
                          <td>
                            {doc.transaccionId ? (
                              <small className="font-monospace text-muted">
                                {doc.transaccionId}
                              </small>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button variant="outline-primary" size="sm">
                                <i className="ri-eye-line"></i>
                              </Button>
                              <Button variant="outline-success" size="sm">
                                <i className="ri-download-line"></i>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDelete(doc.id)}
                              >
                                <i className="ri-delete-bin-line"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {filteredAndSortedDocuments.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <small className="text-muted">
                    Mostrando {filteredAndSortedDocuments.length} de {documents.length} documentos
                  </small>
                  <small className="text-success">
                    <i className="ri-shield-check-line me-1"></i>
                    {filteredAndSortedDocuments.filter((d) => d.estado === "Registrado").length} registrados en blockchain
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para registrar documento */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-shield-check-line me-2"></i>
            Registrar en Blockchain
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del documento *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. Contrato de servicios 2025"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    isInvalid={!!formErrors.nombre}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.nombre}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Descripción opcional del documento"
                    value={formData.descripcion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Archivo *</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement
                      setFormData((prev) => ({
                        ...prev,
                        archivo: target.files?.[0] || null,
                      }))
                    }}
                    isInvalid={!!formErrors.archivo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.archivo}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Se calculará el hash SHA-256 para registro en blockchain. Máximo 10MB.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={isLoading}
            className="d-flex align-items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Registrando...
              </>
            ) : (
              <>
                <i className="ri-upload-line"></i>
                Registrar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}

export default BlockchainPage

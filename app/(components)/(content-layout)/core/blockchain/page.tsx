"use client"
import React, { useState, useCallback, useMemo, useEffect } from "react"
import { Fragment } from "react"
import { Row, Col, Card, Button, Form, Modal, Badge, InputGroup, Table } from "react-bootstrap"
import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import Seo from "@/shared/layouts-components/seo/seo"
import Swal from "sweetalert2"
import { API_BASE_URL, API_ENDPOINTS, FILE_CONFIG, ERROR_MESSAGES } from "@/shared/config/api"
import { SAMPLE_DOCUMENTS } from "@/shared/data/sample-documents"
import { registerDocument } from "@/app/(components)/(content-layout)/core/blockchain/blockchain";

interface BlockchainDocument {
  document_id: string
  file_name: string
  hash: string
  uploaded_at: string
  file_size: number
  file_type: string
  // Campos opcionales que pueden añadirse en el futuro
  estado?: "Registrado" | "Pendiente" | "Verificando" | "Error"
  descripcion?: string
  transaccionId?: string
}

type SortField = "file_name" | "uploaded_at" | "estado" | "file_size"
type SortOrder = "asc" | "desc"

const BlockchainPage: React.FC = () => {
  const [documents, setDocuments] = useState<BlockchainDocument[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [backendConnected, setBackendConnected] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("uploaded_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  // ---- Estados para modal de trazabilidad ----
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [traceDocument, setTraceDocument] = useState<BlockchainDocument | null>(null);
  const [traceHistory, setTraceHistory] = useState<BlockchainDocument[]>([]);
  const [isTraceLoading, setIsTraceLoading] = useState(false);


  // Form state with validation
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    archivo: null as File | null,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // ---------- API calls ----------
  const fetchDocumentsFromAPI = async () => {
    try {
      if (!isInitialLoading) setIsLoading(true);

      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOCUMENTS}`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

      const data = await res.json();

      // Mapear los campos del backend a los que espera el frontend
      const mappedData: BlockchainDocument[] = data.map((doc: any) => ({
        document_id: doc.id?.toString() ?? doc.hash ?? crypto.randomUUID(),
        file_name: doc.fileName ?? "Documento sin nombre",
        file_type: doc.fileType ?? "application/octet-stream",
        file_size: doc.fileSize ?? 0,
        hash: doc.hash ?? "N/A",
        uploaded_at: doc.uploadedAt ?? new Date().toISOString(),
        estado: "Registrado",
        descripcion: doc.descripcion ?? "",
        transaccionId: doc.transaccionId ?? "",
      }));



      setDocuments(mappedData);
      setBackendConnected(true);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setBackendConnected(false);
      Swal.fire("Error", "No se pudieron cargar los documentos del backend", "error");
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };


  const uploadDocumentToAPI = async (file: File, nombre: string, descripcion?: string) => {
    const formDataAPI = new FormData()
    formDataAPI.append("file", file)
    formDataAPI.append("nombre", nombre)
    if (descripcion) formDataAPI.append("descripcion", descripcion)

    console.log('Subiendo archivo:', {
      fileName: file.name,
      fileSize: file.size,
      nombre,
      descripcion
    })

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD}`, {
      method: "POST",
      body: formDataAPI,
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Error ${res.status}: ${errorText}`)
    }

    const result = await res.json() as BlockchainDocument
    console.log('Documento subido exitosamente:', result)
    if (file.size > FILE_CONFIG.MAX_SIZE) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE)
    }

    return result
  }

  useEffect(() => {
    fetchDocumentsFromAPI()
  }, [])

  // Función para reintentar la conexión
  const retryConnection = () => {
    setIsInitialLoading(true)
    fetchDocumentsFromAPI()
  }

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Función para obtener el ícono según el tipo de archivo
  const getFileIcon = (fileType?: string): string => {
    if (!fileType) return "ri-file-line";
    if (fileType.includes("pdf")) return "ri-file-pdf-line";
    if (fileType.includes("word") || fileType.includes("document")) return "ri-file-word-line";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "ri-file-excel-line";
    if (fileType.includes("text")) return "ri-file-text-line";
    return "ri-file-line";
  };


  // ---------- Filter and sort ----------
  const filteredAndSortedDocuments = useMemo(() => {
    const filtered = documents.filter((doc) => {
      const fileName = (doc.file_name ?? "").toLowerCase()
      const hash = (doc.hash ?? "").toLowerCase()
      const search = searchTerm.toLowerCase()

      const matchesSearch = fileName.includes(search) || hash.includes(search)
      const matchesFilter = filterEstado === "todos" || (doc.estado && doc.estado === filterEstado)

      return matchesSearch && matchesFilter
    })

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === "uploaded_at") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortOrder === "asc") return aValue > bValue ? 1 : -1
      else return aValue < bValue ? 1 : -1
    })
  }, [documents, searchTerm, sortField, sortOrder, filterEstado])



  // ---------- Form validation ----------
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!formData.nombre.trim()) errors.nombre = "El nombre del documento es requerido"
    if (!formData.archivo) {
      errors.archivo = "Debe seleccionar un archivo"
    } else {
      if (formData.archivo.size > FILE_CONFIG.MAX_SIZE) {
        errors.archivo = ERROR_MESSAGES.FILE_TOO_LARGE
      }
      // Validar tipo de archivo por extensión
      const fileName = formData.archivo.name.toLowerCase()
      const hasValidExtension = FILE_CONFIG.ALLOWED_TYPES.some(ext => fileName.endsWith(ext))
      if (!hasValidExtension) {
        errors.archivo = ERROR_MESSAGES.INVALID_FILE_TYPE
      }
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // ---------- Handle save ----------
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    if (!backendConnected) {
      Swal.fire("Error", "No hay conexión con el backend. Intenta reconectar primero.", "error");
      return;
    }

    setIsLoading(true);

    try {
      // 1️⃣ Subir documento al backend
      const newDoc = await uploadDocumentToAPI(
        formData.archivo!,
        formData.nombre,
        formData.descripcion || undefined
      );

      // 2️⃣ Registrar documento en blockchain
      try {
        const { documentId, hash, txHash } = await registerDocument(formData.archivo!);
        console.log("Documento registrado en blockchain:", { documentId, hash, txHash });
        newDoc.hash = hash;
        newDoc.transaccionId = txHash;
        newDoc.estado = "Registrado";
      } catch (bcError) {
        console.error("Error registrando en blockchain:", bcError);
        newDoc.estado = "Error";
        Swal.fire(
          "Advertencia",
          "El documento se subió al backend, pero no se pudo registrar en blockchain",
          "warning"
        );
      }

      // 3️⃣ Actualizar lista de documentos
      setDocuments((prev) => [newDoc, ...prev]);

      // 4️⃣ Cerrar modal y limpiar formulario
      setShowModal(false);
      setFormData({ nombre: "", descripcion: "", archivo: null });
      setFormErrors({});

      Swal.fire({
        title: "¡Documento registrado!",
        text: `El documento "${newDoc.file_name}" se ha subido correctamente`,
        icon: "success",
        timer: 3000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Error uploading document:", error);
      let errorMessage = "No se pudo registrar el documento";

      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage = ERROR_MESSAGES.CONNECTION_FAILED;
          setBackendConnected(false);
        } else if (error.message.includes("413")) {
          errorMessage = ERROR_MESSAGES.FILE_TOO_LARGE;
        } else if (error.message.includes("400")) {
          errorMessage = "Error en los datos enviados";
        } else {
          errorMessage = ERROR_MESSAGES.UPLOAD_FAILED;
        }
      }

      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, backendConnected]);



  // ---------- Handle delete ----------
  const handleDelete = useCallback(
    async (id: string) => {
      const doc = documents.find((d) => d.document_id === id)
      if (!doc) return
      const result = await Swal.fire({
        title: "¿Está seguro?",
        text: `¿Desea eliminar "${doc.file_name}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DELETE(id)}`, {
            method: "DELETE",
          })
          if (!res.ok) throw new Error("Error deleting document")
          setDocuments((prev) => prev.filter((d) => d.document_id !== id))
          Swal.fire("Documento eliminado", "El documento ha sido removido", "success")
        } catch (err) {
          console.error(err)
          Swal.fire("Error", "No se pudo eliminar el documento", "error")
        }
      }
    },
    [documents]
  )

  const getStatusBadge = (estado: BlockchainDocument["estado"]) => {
    switch (estado) {
      case "Registrado":
        return (
          <Badge bg="success" className="d-flex align-items-center gap-1">
            <i className="ri-check-line"></i> {estado}
          </Badge>
        )
      case "Pendiente":
        return (
          <Badge bg="warning" className="d-flex align-items-center gap-1">
            <i className="ri-time-line"></i> {estado}
          </Badge>
        )
      case "Verificando":
        return (
          <Badge bg="info" className="d-flex align-items-center gap-1">
            <i className="ri-shield-check-line"></i> {estado}
          </Badge>
        )
      case "Error":
        return (
          <Badge bg="danger" className="d-flex align-items-center gap-1">
            <i className="ri-error-warning-line"></i> {estado}
          </Badge>
        )
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
              <div className="d-flex align-items-center gap-3">
                <Card.Title className="mb-0">
                  <i className="ri-shield-check-line me-2"></i>
                  Documentos en Blockchain
                </Card.Title>
                {/* Indicador de estado de conexión */}
                <div className="d-flex align-items-center gap-2">
                  {backendConnected ? (
                    <Badge bg="success" className="d-flex align-items-center gap-1">
                      <i className="ri-wifi-line"></i>
                      Conectado
                    </Badge>
                  ) : (
                    <Badge bg="danger" className="d-flex align-items-center gap-1">
                      <i className="ri-wifi-off-line"></i>
                      Desconectado
                    </Badge>
                  )}
                </div>
              </div>
              <div className="d-flex gap-2">
                {!backendConnected && (
                  <Button
                    variant="outline-primary"
                    onClick={retryConnection}
                    disabled={isLoading}
                    className="d-flex align-items-center gap-2"
                  >
                    <i className="ri-refresh-line"></i>
                    Reconectar
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => setShowModal(true)}
                  className="d-flex align-items-center gap-2"
                  disabled={!backendConnected}
                >
                  <i className="ri-file-add-line"></i>
                  Registrar Documento
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {isInitialLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <h5>Conectando al backend...</h5>
                  <p className="text-muted">Cargando documentos desde http://localhost:8080</p>
                </div>
              ) : !backendConnected ? (
                <div className="text-center py-5">
                  <i className="ri-wifi-off-line fs-1 text-danger mb-3 d-block"></i>
                  <h5>No se puede conectar al backend</h5>
                  <p className="text-muted mb-3">
                    Asegúrate de que el servidor esté ejecutándose en <code>http://localhost:8080</code>
                  </p>
                  <Button
                    variant="primary"
                    onClick={retryConnection}
                    disabled={isLoading}
                    className="d-flex align-items-center gap-2 mx-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Conectando...
                      </>
                    ) : (
                      <>
                        <i className="ri-refresh-line"></i>
                        Intentar conexión
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
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
                        <option value="uploaded_at-desc">Fecha (más reciente)</option>
                        <option value="uploaded_at-asc">Fecha (más antiguo)</option>
                        <option value="file_name-asc">Nombre (A-Z)</option>
                        <option value="file_name-desc">Nombre (Z-A)</option>
                        <option value="file_size-desc">Tamaño (mayor)</option>
                        <option value="file_size-asc">Tamaño (menor)</option>
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
                            <tr key={doc.hash || doc.document_id}>
                              <td>
                                <div>
                                  <div className="d-flex align-items-center">
                                    <i className={`${getFileIcon(doc.file_type)} me-2 text-primary fs-16`}></i>
                                    <div>
                                      <div className="fw-semibold">{doc.file_name}</div>
                                      {doc.descripcion && (
                                        <small className="text-muted">{doc.descripcion}</small>
                                      )}
                                      <div className="text-muted small">
                                        {doc.file_type} • {formatFileSize(doc.file_size)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {doc.estado ? (
                                  getStatusBadge(doc.estado)
                                ) : (
                                  <Badge bg="success" className="d-flex align-items-center gap-1">
                                    <i className="ri-check-line"></i> Registrado
                                  </Badge>
                                )}
                              </td>
                              <td>
                                <code className="text-primary small" title={doc.hash}>
                                  {doc.hash.slice(0, 12)}...{doc.hash.slice(-8)}
                                </code>
                              </td>
                              <td>{new Date(doc.uploaded_at).toLocaleDateString("es-ES", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</td>
                              <td>{formatFileSize(doc.file_size)}</td>
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
                                  <Button variant="outline-primary" size="sm" title="Ver detalles">
                                    <i className="ri-eye-line"></i>
                                  </Button>
                                  <Button variant="outline-success" size="sm" title="Descargar">
                                    <i className="ri-download-line"></i>
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    title="Eliminar"
                                    onClick={() => handleDelete(doc.document_id)}
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
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para registrar documento */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="ri-shield-check-line"></i>
            Registrar en Blockchain
            {backendConnected ? (
              <Badge bg="success" className="ms-auto">
                <i className="ri-wifi-line me-1"></i>
                Conectado
              </Badge>
            ) : (
              <Badge bg="danger" className="ms-auto">
                <i className="ri-wifi-off-line me-1"></i>
                Sin conexión
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!backendConnected && (
            <div className="alert alert-warning d-flex align-items-center mb-3" role="alert">
              <i className="ri-alert-line me-2"></i>
              <div>
                <strong>Sin conexión al backend</strong>
                <br />
                No se puede subir el documento. Verifica que el servidor esté ejecutándose en localhost:8080
              </div>
            </div>
          )}
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
                    accept={FILE_CONFIG.ALLOWED_TYPES.join(',')}
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
                    <br />
                    Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, TXT
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

/**
 * Configuración de la API para el backend de SilaDocs
 */

// URL base del backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Endpoints específicos
export const API_ENDPOINTS = {
  DOCUMENTS: "/documents",
  UPLOAD: "/documents/upload",
  DELETE: (id: string) => `/documents/${id}`,
} as const

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain'
  ]
} as const

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  CONNECTION_FAILED: "No se puede conectar al backend. Verifica que esté ejecutándose.",
  FILE_TOO_LARGE: "El archivo es demasiado grande. Máximo 10MB.",
  INVALID_FILE_TYPE: "Tipo de archivo no permitido. Solo PDF, DOC, DOCX, XLS, XLSX y TXT.",
  UPLOAD_FAILED: "Error al subir el archivo",
  FETCH_FAILED: "Error al cargar los documentos",
  DELETE_FAILED: "Error al eliminar el documento"
} as const

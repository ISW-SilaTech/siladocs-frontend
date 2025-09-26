// Datos de ejemplo para pruebas locales - basados en la estructura real de la BD
export const SAMPLE_DOCUMENTS = [
  {
    document_id: "1",
    file_name: "Modelo_Carga_Masiva.xlsx",
    file_size: 6624,
    file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    hash: "07985b2a17032e6e04f314218e6b5dc67a7e75081d82ec26b34a0d74eec172e3",
    uploaded_at: "2025-09-26T19:00:14.765383Z",
    descripcion: "Plantilla para carga masiva de datos"
  },
  {
    document_id: "2", 
    file_name: "Contrato_Servicios_2025.pdf",
    file_size: 145632,
    file_type: "application/pdf",
    hash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    uploaded_at: "2025-09-26T18:30:22.123456Z",
    descripcion: "Contrato de servicios profesionales"
  },
  {
    document_id: "3",
    file_name: "Manual_Usuario.docx", 
    file_size: 89456,
    file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    hash: "9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef",
    uploaded_at: "2025-09-26T17:15:08.987654Z"
  },
  {
    document_id: "4",
    file_name: "Requerimientos.txt",
    file_size: 2048, 
    file_type: "text/plain",
    hash: "fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    uploaded_at: "2025-09-26T16:45:33.654321Z",
    descripcion: "Lista de requerimientos del proyecto"
  }
] as const

export type SampleDocument = typeof SAMPLE_DOCUMENTS[0]

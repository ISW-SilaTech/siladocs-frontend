export const emissionCreditsData = {
  totalPurchased: 500,
  totalUsed: 145,
  available: 355,
  percentageUsed: 29,
  phase: 'Fase 0',
  purchaseDate: '2024-01-15',
  expiresAt: '2025-12-31',
};

export const certificateHistoryData = [
  {
    id: 1,
    studentName: 'Juan García López',
    studentEmail: 'juan.garcia@ejemplo.com',
    course: 'Análisis Matemático I',
    courseCode: 'MAT-101',
    issuedDate: '2024-11-20',
    fabricTxId: '0x2f3e4c5b9a8d7e6f4g3h2i1j0k9l8m7n6',
    status: 'issued',
    creditsUsed: 1,
  },
  {
    id: 2,
    studentName: 'María Rodríguez Pérez',
    studentEmail: 'maria.rodriguez@ejemplo.com',
    course: 'Física General',
    courseCode: 'FIS-102',
    issuedDate: '2024-11-18',
    fabricTxId: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7',
    status: 'issued',
    creditsUsed: 1,
  },
  {
    id: 3,
    studentName: 'Carlos Mendoza Soto',
    studentEmail: 'carlos.mendoza@ejemplo.com',
    course: 'Programación en Python',
    courseCode: 'INF-201',
    issuedDate: '2024-11-15',
    fabricTxId: '0x9h8g7f6e5d4c3b2a1z0y9x8w7v6u5t4s',
    status: 'issued',
    creditsUsed: 1,
  },
  {
    id: 4,
    studentName: 'Ana Martínez Gómez',
    studentEmail: 'ana.martinez@ejemplo.com',
    course: 'Base de Datos SQL',
    courseCode: 'INF-301',
    issuedDate: '2024-11-12',
    fabricTxId: '0x5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0',
    status: 'issued',
    creditsUsed: 1,
  },
  {
    id: 5,
    studentName: 'Roberto Pérez Flores',
    studentEmail: 'roberto.perez@ejemplo.com',
    course: 'Arquitectura de Software',
    courseCode: 'INF-401',
    issuedDate: '2024-11-10',
    fabricTxId: '0x3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8',
    status: 'issued',
    creditsUsed: 1,
  },
];

export const certificateStats = {
  totalIssued: 145,
  issuedThisMonth: 23,
  pending: 8,
  revoked: 2,
};

export const monthlyIssuanceData = [
  { month: 'Ene', issued: 12, revoked: 0 },
  { month: 'Feb', issued: 15, revoked: 0 },
  { month: 'Mar', issued: 18, revoked: 1 },
  { month: 'Abr', issued: 14, revoked: 0 },
  { month: 'May', issued: 16, revoked: 0 },
  { month: 'Jun', issued: 20, revoked: 0 },
  { month: 'Jul', issued: 13, revoked: 1 },
  { month: 'Ago', issued: 17, revoked: 0 },
  { month: 'Sep', issued: 19, revoked: 0 },
  { month: 'Oct', issued: 11, revoked: 0 },
  { month: 'Nov', issued: 23, revoked: 0 },
  { month: 'Dic', issued: 0, revoked: 0 },
];

export const creditUsageData = {
  series: [
    {
      name: 'Créditos Usados',
      data: [5, 8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42],
    },
    {
      name: 'Créditos Disponibles',
      data: [495, 492, 488, 485, 482, 478, 475, 472, 468, 465, 462, 458],
    },
  ],
  categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
};

export const institutionalMetrics = {
  totalInstitutions: 1,
  activeUsers: 42,
  totalCertificates: 145,
  blockchain: {
    certificatesOnChain: 145,
    transactionSuccess: 100,
    averageBlockTime: '2.5s',
  },
};

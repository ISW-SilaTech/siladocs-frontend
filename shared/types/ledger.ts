export interface LedgerRecord {
  txId: string;
  timestamp: string;
  action: "CREATION" | "UPDATE" | "VERIFICATION";
  actor: string;
}

export interface SyllabusVersion {
  versionId: number;
  versionNumber: number;
  fileUrl: string;
  fileHash: string;
  status: string;
  uploadedBy: string;
  createdAt: string;
  notes?: string;
  isOnBlockchain: boolean;
  fabricTxId?: string;
}

export interface SyllabusTrace {
  id: string;
  courseName: string;
  courseCode: string;
  career: string;
  fileName: string;
  fileUrl: string;
  currentHash: string;
  blockNumber: number;
  channel: string;
  status: "Inmutable" | "Modificado" | "Pendiente";
  history: LedgerRecord[];
  versions?: SyllabusVersion[];
}

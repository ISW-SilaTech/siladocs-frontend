export interface LedgerRecord {
  txId: string;
  timestamp: string;
  action: "CREATION" | "UPDATE" | "VERIFICATION";
  actor: string;
}

export interface SyllabusTrace {
  id: string;
  courseName: string;
  courseCode: string;
  career: string;
  fileName: string;
  currentHash: string;
  blockNumber: number;
  channel: string;
  status: "Inmutable" | "Modificado" | "Pendiente";
  history: LedgerRecord[];
}

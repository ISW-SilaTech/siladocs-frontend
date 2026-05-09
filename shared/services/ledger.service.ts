import api from '@/shared/config/axios';
import { SyllabusTrace, LedgerRecord } from '@/shared/types/ledger';

const mapToTrace = (s: any): SyllabusTrace => {
  const history: LedgerRecord[] = [];
  if (s.fabricTxId) {
    history.push({
      txId: s.fabricTxId,
      timestamp: s.uploadedAt ?? new Date().toISOString(),
      action: 'CREATION',
      actor: s.uploaderEmail ?? 'Sistema',
    });
  }
  return {
    id: String(s.id),
    courseName: s.courseName ?? '—',
    courseCode: s.courseCode ?? '—',
    career: s.careerName ?? '—',
    fileName: s.fileName ?? s.fileUrl?.split('/').pop() ?? '—',
    currentHash: s.currentHash ?? s.hash ?? '',
    blockNumber: s.blockNumber ?? 0,
    channel: s.channelName ?? 'silabos-channel',
    status: s.fabricTxId ? 'Inmutable' : 'Pendiente',
    history,
  };
};

export const LedgerService = {
  getAllSyllabus: async (): Promise<SyllabusTrace[]> => {
    const response = await api.get<any[]>('/syllabi');
    return response.data.map(mapToTrace);
  },

  getSyllabusHistory: async (id: string): Promise<SyllabusTrace> => {
    try {
      const response = await api.get<any>(`/syllabi/${id}`);
      return mapToTrace(response.data);
    } catch {
      const listResponse = await api.get<any[]>('/syllabi');
      const found = listResponse.data.find((s: any) => String(s.id) === id);
      if (!found) throw new Error(`Sílabo ${id} no encontrado`);
      return mapToTrace(found);
    }
  },

  verifyImmutability: async (id: string): Promise<{ verified: boolean; block: number }> => {
    try {
      const response = await api.post<{ verified: boolean; block: number }>(
        `/syllabi/${id}/verify`
      );
      return response.data;
    } catch {
      const listResponse = await api.get<any[]>('/syllabi');
      const found = listResponse.data.find((s: any) => String(s.id) === id);
      if (found?.fabricTxId) {
        return { verified: true, block: found.blockNumber ?? 1 };
      }
      return { verified: false, block: 0 };
    }
  },
};

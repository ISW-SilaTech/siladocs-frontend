import api from '@/shared/config/axios';
import { SyllabusTrace } from '@/shared/types/ledger'; // Mueve tus interfaces a un archivo de tipos

export const LedgerService = {
  // Obtiene la lista base de sílabos (resumen)
  getAllSyllabus: async () => {
    const response = await api.get<SyllabusTrace[]>('/ledger/syllabuses');
    return response.data;
  },

  // Obtiene el historial completo de un sílabo desde Fabric
  getSyllabusHistory: async (id: string) => {
    const response = await api.get<SyllabusTrace>(`/ledger/syllabuses/${id}/history`);
    return response.data;
  },

  // Dispara la verificación de inmutabilidad (llama al chaincode)
  verifyImmutability: async (id: string) => {
    const response = await api.post<{ verified: boolean; block: number }>(`/ledger/syllabuses/${id}/verify`);
    return response.data;
  }
};

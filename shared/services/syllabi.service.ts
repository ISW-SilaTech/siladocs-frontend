import api from '@/shared/config/axios';

export interface Syllabus {
  id: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  fileName: string;
  fileSize: number;
  hash: string;
  fabricTxId: string;
  uploadedAt: string;
  status: string;
}

export interface SyllabusUploadResponse {
  id: number;
  courseId: number;
  courseName: string;
  fileName: string;
  hash: string;
  fabricTxId: string;
  uploadedAt: string;
  status: string;
}

export const SyllabiService = {
  getAll: async (): Promise<Syllabus[]> => {
    const response = await api.get<Syllabus[]>('/syllabi');
    return response.data;
  },

  getByCourse: async (courseId: number): Promise<Syllabus[]> => {
    const response = await api.get<Syllabus[]>(`/syllabi?courseId=${courseId}`);
    return response.data;
  },

  upload: async (courseId: number, file: File): Promise<SyllabusUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', String(courseId));

    const response = await api.post<SyllabusUploadResponse>('/syllabi/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const data = response.data;
    // Blockchain confirmation: fabricTxId must be present
    if (!data.fabricTxId) {
      throw new Error(
        'El sílabo se guardó pero no se recibió confirmación de blockchain (fabricTxId es null). Intente de nuevo.'
      );
    }
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/syllabi/${id}`);
  },
};

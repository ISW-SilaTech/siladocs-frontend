import api from '@/shared/config/axios';

export interface Syllabus {
  id: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  hash: string;
  fabricTxId: string | null;
  uploadedAt: string;
  status: string;
}

export interface SyllabusUploadResponse {
  id: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  fileUrl: string;
  fileSize: number;
  currentHash: string;
  fabricTxId: string;
  uploadedAt: string;
  status: string;
}

const mapSyllabus = (s: any): Syllabus => ({
  id: s.id,
  courseId: s.courseId,
  courseName: s.courseName,
  courseCode: s.courseCode,
  fileUrl: s.fileUrl,
  fileName: s.fileUrl ? decodeURIComponent(s.fileUrl.split('/').pop() ?? s.fileUrl) : '—',
  fileSize: s.fileSize ?? 0,
  hash: s.currentHash ?? '',
  fabricTxId: s.fabricTxId ?? null,
  uploadedAt: s.uploadedAt,
  status: s.status,
});

export const SyllabiService = {
  getAll: async (): Promise<Syllabus[]> => {
    const response = await api.get<any[]>('/syllabi');
    return response.data.map(mapSyllabus);
  },

  getByCourse: async (courseId: number): Promise<Syllabus[]> => {
    const response = await api.get<any[]>(`/syllabi?courseId=${courseId}`);
    return response.data.map(mapSyllabus);
  },

  upload: async (courseId: number, file: File): Promise<SyllabusUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', String(courseId));
    formData.append('action', 'create');

    const response = await api.post<SyllabusUploadResponse>('/syllabi/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const data = response.data;
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

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

export interface DownloadUrlResponse {
  downloadUrl: string;
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
    return SyllabiService.uploadWithSession(courseId, file, undefined);
  },

  uploadWithSession: async (courseId: number, file: File, sessionId?: string): Promise<SyllabusUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', String(courseId));
    formData.append('action', 'create');
    if (sessionId) formData.append('sessionId', sessionId);

    const response = await api.post<SyllabusUploadResponse>('/syllabi/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/syllabi/${id}`);
  },

  getDownloadUrl: async (id: number): Promise<string> => {
    const response = await api.get<DownloadUrlResponse>(`/syllabi/${id}/download-url`);
    return response.data.downloadUrl;
  },

  download: async (id: number, fileName?: string): Promise<void> => {
    const downloadUrl = await SyllabiService.getDownloadUrl(id);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || `syllabus-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  approve: async (id: number): Promise<Syllabus> => {
    const response = await api.patch<any>(`/syllabi/${id}/approve`);
    return mapSyllabus(response.data);
  },

  verifyIntegrity: async (id: number): Promise<{
    syllabusId: number;
    storedHash: string;
    fabricTxId: string;
    integrityValid: boolean;
    status: string;
  }> => {
    const response = await api.get(`/syllabi/${id}/verify-integrity`);
    return response.data;
  },
};

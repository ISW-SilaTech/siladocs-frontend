import api from '@/shared/config/axios';

export interface Curriculum {
  id: number;
  careerId: number;
  careerName?: string;
  name: string;
  year: number;
  courseCount: number;
  totalCredits: number;
  status: string;
  description?: string;
}

export interface CurriculumRequest {
  careerId: number;
  name: string;
  year: number;
  courseCount: number;
  totalCredits: number;
  status: string;
  description?: string;
}

export const CurriculumsService = {
  getAll: async (): Promise<Curriculum[]> => {
    const response = await api.get<Curriculum[]>('/curriculums');
    return response.data;
  },

  create: async (data: CurriculumRequest): Promise<Curriculum> => {
    const response = await api.post<Curriculum>('/curriculums', data);
    return response.data;
  },

  update: async (id: number, data: CurriculumRequest): Promise<Curriculum> => {
    const response = await api.put<Curriculum>(`/curriculums/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/curriculums/${id}`);
  },
};

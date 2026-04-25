import api from '@/shared/config/axios';

export interface Course {
  id: number;
  curriculumId: number;
  curriculumName?: string;
  careerId: number;
  careerName?: string;
  code: string;
  name: string;
  faculty: string;
  syllabusCount: number;
  year: number;
  status: string;
  mallaStatus?: string;
  publicationDate?: string;
}

export interface CourseRequest {
  careerId: number;
  curriculumId: number;
  code: string;
  name: string;
  faculty: string;
  year: number;
  status: string;
  publicationDate?: string | null;
}

export const CoursesService = {
  getAll: async (): Promise<Course[]> => {
    const response = await api.get<Course[]>('/courses');
    return response.data;
  },

  create: async (data: CourseRequest): Promise<Course> => {
    const response = await api.post<Course>('/courses', data);
    return response.data;
  },

  update: async (id: number, data: CourseRequest): Promise<Course> => {
    const response = await api.put<Course>(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },
};

import api from '@/shared/config/axios';

export interface Career {
  id: number;
  name: string;
  faculty: string;
  cycles: number;
  lastUpdated: string;
  status: string;
}

export interface CareerRequest {
  name: string;
  faculty: string;
  cycles: number;
  status: string;
}

export const CareersService = {
  getAll: async (): Promise<Career[]> => {
    const response = await api.get<Career[]>('/careers');
    return response.data;
  },

  create: async (data: CareerRequest): Promise<Career> => {
    const response = await api.post<Career>('/careers', data);
    return response.data;
  },

  update: async (id: number, data: CareerRequest): Promise<Career> => {
    const response = await api.put<Career>(`/careers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/careers/${id}`);
  },
};

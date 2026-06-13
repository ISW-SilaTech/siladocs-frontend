import api from '@/shared/config/axios';
import adminApi from '@/shared/config/axios-admin';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface RegistrationRequest {
  id: number;
  fullName: string;
  email: string;
  institutionName: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface CreateRegistrationRequestDto {
  fullName: string;
  email: string;
  institutionName: string;
  message: string;
}

export interface ReviewRequestDto {
  reviewNote?: string;
}

export const RegistrationRequestsService = {
  submit: async (data: CreateRegistrationRequestDto): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/registration-requests', data);
    return response.data;
  },

  list: async (): Promise<RegistrationRequest[]> => {
    const response = await adminApi.get<RegistrationRequest[]>('/registration-requests');
    return response.data;
  },

  approve: async (id: number, dto?: ReviewRequestDto): Promise<RegistrationRequest> => {
    const response = await adminApi.patch<RegistrationRequest>(
      `/registration-requests/${id}/approve`,
      dto ?? {}
    );
    return response.data;
  },

  reject: async (id: number, dto?: ReviewRequestDto): Promise<RegistrationRequest> => {
    const response = await adminApi.patch<RegistrationRequest>(
      `/registration-requests/${id}/reject`,
      dto ?? {}
    );
    return response.data;
  },
};

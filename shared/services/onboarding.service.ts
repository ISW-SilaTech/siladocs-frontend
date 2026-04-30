import api from '@/shared/config/axios';

export interface Institution {
  id: number;
  name: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface InstitutionRequest {
  name: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface AccessCode {
  id: number;
  code: string;
  institutionId: number;
  institutionName?: string;
  used: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface GenerateCodeRequest {
  institutionId: number;
}

export const OnboardingService = {
  createInstitution: async (data: InstitutionRequest): Promise<Institution> => {
    const response = await api.post<Institution>('/institutions', data);
    return response.data;
  },

  getInstitutions: async (): Promise<Institution[]> => {
    const response = await api.get<Institution[]>('/institutions');
    return response.data;
  },

  generateAccessCode: async (data: GenerateCodeRequest): Promise<AccessCode> => {
    const response = await api.post<AccessCode>('/access-codes/generate', data);
    return response.data;
  },

  getAccessCodes: async (): Promise<AccessCode[]> => {
    const response = await api.get<AccessCode[]>('/access-codes');
    return response.data;
  },
};

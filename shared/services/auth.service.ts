import api from '@/shared/config/axios';
import { safeStorage } from '@/shared/utils/safeStorage';
import { extractErrorMessage } from '@/shared/utils/errors';

export interface ValidateCodeResponse {
  institutionName: string;
}

export interface RegisterRequest {
  accessCode: string;
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthInstitution {
  id: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  institution: AuthInstitution;
}

export const AuthService = {
  validateCode: async (code: string): Promise<ValidateCodeResponse> => {
    try {
      const response = await api.get<ValidateCodeResponse>(`/auth/validate-code?code=${encodeURIComponent(code)}`);
      return response.data;
    } catch (error: any) {
      throw {
        ...error,
        message: extractErrorMessage(error, 'Error validating access code'),
        statusCode: error?.response?.status,
      };
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: AuthUser; institution: AuthInstitution }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    safeStorage.removeItem('accessToken');
    safeStorage.removeItem('user');
  },

  forgotPasswordRequest: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password/request', { email });
    return response.data;
  },

  forgotPasswordVerify: async (email: string, code: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password/verify', { email, code });
    return response.data;
  },

  forgotPasswordReset: async (email: string, code: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password/reset', { email, code, newPassword });
    return response.data;
  },

};

export default api;

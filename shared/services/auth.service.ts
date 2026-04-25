import api from '@/shared/config/axios';

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
    const response = await api.get<ValidateCodeResponse>(`/auth/validate-code?code=${code}`);
    return response.data;
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },
};

export default api;

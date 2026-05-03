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

const DEMO_USERS = [
  {
    email: 'academico@demo.siladocs.com',
    password: 'Demo@Academico123',
    role: 'Administrador Académico',
  },
  {
    email: 'rector@demo.siladocs.com',
    password: 'Demo@Rector123',
    role: 'Rector',
  },
];

const getDemoResponse = (email: string, password: string): AuthResponse | null => {
  const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password);

  if (!demoUser) return null;

  return {
    accessToken: 'demo-token-' + Date.now(),
    user: {
      id: 'demo-user-' + demoUser.role.replace(/\s+/g, '-').toLowerCase(),
      email: demoUser.email,
      role: demoUser.role,
    },
    institution: {
      id: 'demo-institution-id',
      name: 'Universidad Demo - SilaDocs',
    },
  };
};

export const AuthService = {
  validateCode: async (code: string): Promise<ValidateCodeResponse> => {
    try {
      const response = await api.get<ValidateCodeResponse>(`/auth/validate-code?code=${code}`);
      return response.data;
    } catch (error: any) {
      // Re-throw with enhanced error context
      throw {
        ...error,
        message: error?.response?.data?.message || error?.message || 'Error validating access code',
        statusCode: error?.response?.status,
      };
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const demoResponse = getDemoResponse(data.email, data.password);
    if (demoResponse) {
      return demoResponse;
    }

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

  getDemoUsers: () => DEMO_USERS,
};

export default api;

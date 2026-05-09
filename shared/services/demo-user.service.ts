import { AuthResponse, AuthUser, AuthInstitution } from './auth.service';

const DEMO_USERS = {
  admin_academico: {
    email: 'academico@demo.siladocs.com',
    password: 'Demo@Academico123',
    role: 'Administrador Académico',
  },
  rector: {
    email: 'rector@demo.siladocs.com',
    password: 'Demo@Rector123',
    role: 'Rector',
  },
};

const DEMO_RESPONSE: AuthResponse = {
  accessToken: 'demo-token-' + Date.now(),
  user: {
    id: 'demo-user-id',
    email: '',
    role: '',
  },
  institution: {
    id: 'demo-institution-id',
    name: 'Universidad Demo - SilaDocs',
  },
};

export const DemoUserService = {
  isDemoCredentials: (email: string, password: string): boolean => {
    const demoUser = Object.values(DEMO_USERS).find(
      (u) => u.email === email && u.password === password
    );
    return !!demoUser;
  },

  getDemoUserResponse: (email: string, password: string): AuthResponse | null => {
    const demoUser = Object.values(DEMO_USERS).find(
      (u) => u.email === email && u.password === password
    );

    if (!demoUser) return null;

    return {
      ...DEMO_RESPONSE,
      user: {
        id: 'demo-user-' + demoUser.role.replace(/\s+/g, '-').toLowerCase(),
        email: demoUser.email,
        role: demoUser.role,
      },
    };
  },

  getDemoUsers: () => DEMO_USERS,
};

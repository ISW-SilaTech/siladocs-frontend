import axios from 'axios';
import { safeStorage } from '@/shared/utils/safeStorage';
import { API_BASE_URL } from '@/shared/config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = safeStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string = error.config?.url || '';
    // Un 401/403 en los propios endpoints de autenticación (login, registro,
    // validación de código, recuperación) es un error de dominio —credenciales
    // o código inválidos—, NO una sesión expirada. No debe disparar el cierre
    // de sesión ni la redirección (que recargaba la página de login).
    const isAuthEndpoint = requestUrl.includes('/auth/');
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      if (typeof window !== 'undefined') {
        // Las rutas públicas y de autenticación no deben redirigir a login
        const publicPaths = ['/public', '/verificador-silabos', '/landing', '/terminos-condiciones', '/contacto', '/authentication'];
        const isPublicPath = publicPaths.some((p) => window.location.pathname.startsWith(p));
        if (!isPublicPath) {
          safeStorage.removeItem('accessToken');
          safeStorage.removeItem('user');
          window.location.href = '/authentication/sign-in/cover';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

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
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        // Las rutas públicas (verificación, landing) no deben redirigir a login
        const publicPaths = ['/public', '/verificador-silabos', '/landing', '/terminos-condiciones', '/contacto'];
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

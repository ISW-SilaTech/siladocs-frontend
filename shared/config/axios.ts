import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token JWT
api.interceptors.request.use(
  (config) => {
    // Verificamos que estemos en el cliente (browser) para acceder a localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('siladocs_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo global de errores (ej: token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Lógica para redirigir al login o limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('siladocs_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

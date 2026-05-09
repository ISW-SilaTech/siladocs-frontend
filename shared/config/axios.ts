import axios from 'axios';
import { safeStorage } from '@/shared/utils/safeStorage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api',
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
        safeStorage.removeItem('accessToken');
        safeStorage.removeItem('user');
        window.location.href = '/authentication/sign-in/cover';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

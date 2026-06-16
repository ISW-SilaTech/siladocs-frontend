import axios from 'axios';
import { API_BASE_URL } from '@/shared/config/api';

export const ADMIN_TOKEN_KEY = 'siladocs_admin_token';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default adminApi;


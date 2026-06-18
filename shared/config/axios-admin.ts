import axios from 'axios';
import { API_BASE_URL } from '@/shared/config/api';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // 1. Admin JWT (future use)
    const adminBearer = sessionStorage.getItem('siladocs_admin_token');
    if (adminBearer) {
      config.headers.Authorization = `Bearer ${adminBearer}`;
      return config;
    }
    // 2. Regular user JWT from localStorage (same endpoints work for logged-in admins)
    const userBearer = localStorage.getItem('accessToken');
    if (userBearer) {
      config.headers.Authorization = `Bearer ${userBearer}`;
      return config;
    }
    // 3. HTTP Basic Auth fallback
    const basic = sessionStorage.getItem('siladocs_admin_basic');
    if (basic) {
      config.headers.Authorization = `Basic ${basic}`;
    }
  }
  return config;
});

export default adminApi;


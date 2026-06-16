import axios from 'axios';
import { API_BASE_URL } from '@/shared/config/api';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Prefer Bearer token if present (future JWT-based admin auth)
    const bearer = sessionStorage.getItem('siladocs_admin_token');
    if (bearer) {
      config.headers.Authorization = `Bearer ${bearer}`;
      return config;
    }
    // Fallback: HTTP Basic Auth with encoded admin credentials
    const basic = sessionStorage.getItem('siladocs_admin_basic');
    if (basic) {
      config.headers.Authorization = `Basic ${basic}`;
    }
  }
  return config;
});

export default adminApi;


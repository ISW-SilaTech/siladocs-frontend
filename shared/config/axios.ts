import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      console.log('🔐 Token from localStorage:', token ? '✅ Token exists' : '❌ No token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Authorization header added');
      } else {
        console.warn('⚠️ No token found, request will be sent without Authorization');
      }
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/authentication/sign-in/cover';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

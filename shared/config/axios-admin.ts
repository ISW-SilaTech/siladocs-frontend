import axios from 'axios';
import { API_BASE_URL } from '@/shared/config/api';

// Instancia de axios para el admin backoffice — sin redirección a login de usuario
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default adminApi;

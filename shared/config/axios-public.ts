import axios from 'axios';
import { API_BASE_URL } from '@/shared/config/api';

// Unauthenticated axios instance for public pages (no JWT required)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default publicApi;

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Interceptor para agregar JWT automáticamente
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface ValidateCodeRequest {
  code: string;
}

export interface RegisterRequest {
  code: string;
  adminEmail: string;
  adminName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const AuthService = {
  validateCode: async (data: ValidateCodeRequest) => {
    const response = await api.post("/auth/validate-code", data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  },
};

export default api;

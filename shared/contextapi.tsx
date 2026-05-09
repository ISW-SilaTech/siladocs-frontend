"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthService, RegisterRequest } from "@/shared/services/auth.service";
import { useRouter } from "next/navigation";
import { safeStorage } from "@/shared/utils/safeStorage";

interface User {
  id: string;
  email: string;
  role: string;
}

interface Institution {
  id: string;
  name: string;
}

export const Initialload = React.createContext<{
  pageloading: boolean;
  setpageloading: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

interface AuthContextType {
  user: User | null;
  institution: Institution | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<void>;
}

const AUTH_DATA_KEY = "authUserData";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      const token = safeStorage.getItem("accessToken");

      if (token) {
        const savedData = safeStorage.getItem(AUTH_DATA_KEY);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setUser(parsed.user);
            setInstitution(parsed.institution);
          } catch {
            safeStorage.removeItem(AUTH_DATA_KEY);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await AuthService.login({ email, password });
    safeStorage.setItem("accessToken", data.accessToken);
    safeStorage.setItem(AUTH_DATA_KEY, JSON.stringify({ user: data.user, institution: data.institution }));
    setUser(data.user);
    setInstitution(data.institution);
    router.push("/dashboards/general");
  };

  const register = async (data: RegisterRequest) => {
    const response = await AuthService.register(data);
    safeStorage.setItem("accessToken", response.accessToken);
    safeStorage.setItem(AUTH_DATA_KEY, JSON.stringify({ user: response.user, institution: response.institution }));
    setUser(response.user);
    setInstitution(response.institution);
    router.push("/dashboards/general");
  };

  const logout = () => {
    AuthService.logout();
    safeStorage.removeItem(AUTH_DATA_KEY);
    setUser(null);
    setInstitution(null);
    router.push("/authentication/sign-in/cover");
  };

  return (
    <AuthContext.Provider
      value={{ user, institution, loading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

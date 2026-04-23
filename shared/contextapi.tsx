"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "@/shared/services/auth.service";
import { useRouter } from "next/navigation";

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
  register: (data: {
    code: string;
    adminEmail: string;
    adminName: string;
    password: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (token) {
        try {
          const data = await AuthService.getCurrentUser();
          setUser(data.user);
          setInstitution(data.institution);
        } catch (error) {
          localStorage.removeItem("accessToken");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await AuthService.login({ email, password });

    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
    setInstitution(data.institution);

    router.push("/dashboards/sales");
  };

  const register = async (data: {
    code: string;
    adminEmail: string;
    adminName: string;
    password: string;
  }) => {
    const response = await AuthService.register(data);

    localStorage.setItem("accessToken", response.accessToken);
    setUser(response.user);
    setInstitution(response.institution);

    router.push("/dashboards/sales");
  };

  const logout = () => {
    AuthService.logout();
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

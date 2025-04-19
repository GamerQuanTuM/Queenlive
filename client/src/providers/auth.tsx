"use client";
import axiosInstance, { baseURL } from "@/utils/axiosInstance";
import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export enum Role {
  MERCHANT = "MERCHANT",
  CUSTOMER = "CUSTOMER",
}

export type UserRole = Role.MERCHANT | Role.CUSTOMER;

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

type UserResponse = User & {
  token: string;
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{
    message: string;
    role: UserRole;
  }>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("token");
    if (session) {
      axiosInstance
        .get<User>("/auth/profile")
        .then((res) => {
          setUser(res.data);
          setIsAuthenticated(true);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await axios.post<UserResponse>(
        `${baseURL}/auth/signup`,
        {
          email,
          password,
          name,
          role,
        }
      );
      if (status === 201) {
        console.log("User registered successfully");
        setLoading(false);
        return "User registered successfully";
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      setLoading(false);
      setError("Registration failed. Please try again.");
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post<UserResponse>(`${baseURL}/auth/login`, {
        email,
        password,
      });

      const userData = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as User;

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      document.cookie = `token=${data.token}; path=/; max-age=${
        60 * 60 * 24
      }; SameSite=Lax`;
      document.cookie = `role=${data.role}; path=/; max-age=${
        60 * 60 * 24
      }; SameSite=Lax`;
      setLoading(false);
      return {
        message: "Login successful",
        role: data.role,
      };
    } catch (error) {
      setLoading(false);
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

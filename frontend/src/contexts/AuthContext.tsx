import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../api/client";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      api
        .get<User>("/auth/me")
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const response = await api.post<{ access_token: string }>(
      "/auth/login",
      new URLSearchParams({ username: email, password }),
    );
    const newToken = response.data.access_token;
    localStorage.setItem("token", newToken);
    setToken(newToken);

    const meResponse = await api.get<User>("/auth/me");
    setUser(meResponse.data);
  }

  async function register(name: string, email: string, password: string) {
    const response = await api.post<User>("/auth/register", {
      name,
      email,
      password,
    });
    const loginResponse = await api.post<{ access_token: string }>(
      "/auth/login",
      new URLSearchParams({ username: email, password }),
    );
    const newToken = loginResponse.data.access_token;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(response.data);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

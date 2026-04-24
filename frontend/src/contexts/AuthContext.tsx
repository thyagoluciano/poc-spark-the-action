import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, AuthResponse, RegisterResponse } from "../types";
import api from "../api/client";

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
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    api
      .get<User>("/auth/me")
      .then((response) => {
        setUser(response.data);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    const newToken = response.data.access_token;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    const meResponse = await api.get<User>("/auth/me");
    setUser(meResponse.data);
  }

  async function register(
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    const response = await api.post<RegisterResponse>("/auth/register", {
      name,
      email,
      password,
    });
    const newToken = response.data.access_token;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser({
      id: response.data.id,
      email: response.data.email,
      name: response.data.name,
    });
  }

  function logout(): void {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

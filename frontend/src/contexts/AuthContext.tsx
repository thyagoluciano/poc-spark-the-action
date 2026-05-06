import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { User, AuthResponse, RegisterResponse } from "../types";

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
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      api
        .get<User>("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    const { access_token } = res.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    const meRes = await api.get<User>("/auth/me");
    setUser(meRes.data);
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post<RegisterResponse>("/auth/register", {
      name,
      email,
      password,
    });
    const { access_token, ...userData } = res.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    setUser({ id: userData.id, name: userData.name, email: userData.email });
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/login");
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

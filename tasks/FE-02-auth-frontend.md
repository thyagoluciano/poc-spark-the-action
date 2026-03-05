# FE-02: Auth Frontend - AuthContext + API Client

**Agente:** `frontend-dev`
**Depende de:** FE-01
**Bloqueia:** FE-03, FE-04

---

## Objetivo

Implementar o sistema de autenticacao no frontend: API client com interceptors JWT, AuthContext para gerenciamento de estado de auth.

## Arquivos a Criar

```
frontend/src/
├── api/
│   └── client.ts
└── contexts/
    └── AuthContext.tsx
```

## Detalhamento

### 1. `api/client.ts` - Axios Instance

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Request interceptor: adiciona token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: logout em 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. `contexts/AuthContext.tsx`

Interface:

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

Comportamento:
- **Inicializacao**: verificar se ha token no localStorage; se sim, chamar `GET /auth/me` para obter dados do usuario
- **login()**: POST /auth/login, salvar token no localStorage, chamar /auth/me
- **register()**: POST /auth/register, salvar token no localStorage, setar user com dados da response
- **logout()**: remover token do localStorage, setar user = null, redirect para /login
- **isLoading**: true durante inicializacao (verificacao de token existente)

Provider deve envolver toda a app no `App.tsx`.

## Criterios de Aceite

- [ ] Axios instance com baseURL http://localhost:8000
- [ ] Request interceptor adiciona Bearer token
- [ ] Response interceptor faz logout em 401
- [ ] AuthContext com login, register, logout
- [ ] Token persistido no localStorage
- [ ] Verificacao de token existente ao inicializar
- [ ] isLoading durante verificacao inicial

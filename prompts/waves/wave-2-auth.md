# Wave 2 — Auth

**Issues:** #3 (BE-02) e #4 (FE-02)
**Paralelo:** sim — backend e frontend independentes
**Depende de:** Wave 1 mergeada

## Agentes a lançar em paralelo

| Agente | Issue | Branch |
|--------|-------|--------|
| `backend-dev` | #3 BE-02: Auth Backend | `feat/be-02-auth-backend` |
| `frontend-dev` | #4 FE-02: Auth Frontend | `feat/fe-02-auth-frontend` |

## Instruções para cada agente

Buscar detalhes completos da issue antes de implementar:
```bash
GIT_SSL_NO_VERIFY=1 gh issue view <N> --repo thyagoluciano/poc-spark-the-action --json title,body
```

### backend-dev (issue #3)
Implementar autenticação JWT:
- `backend/app/auth.py` — funções JWT: create_access_token, verify_token, get_current_user
- `backend/app/routers/auth_router.py` — endpoints POST /auth/register e POST /auth/login
- Hash de senhas com passlib/bcrypt
- Token JWT com expiração 24h

### frontend-dev (issue #4)
Implementar cliente de API e contexto de auth:
- `frontend/src/api/client.ts` — axios instance com interceptors (token no header, redirect 401)
- `frontend/src/contexts/AuthContext.tsx` — Provider com login, logout, register, estado do user
- `frontend/src/components/ProtectedRoute.tsx` — redireciona para /login se não autenticado

## Critério de conclusão
Cada agente abre PR com `closes #N` no body e retorna número do PR.

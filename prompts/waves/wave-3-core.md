# Wave 3 — Core Backend + Login Pages

**Issues:** #5 (BE-03) e #7 (FE-03)
**Paralelo:** sim — backend e frontend independentes
**Depende de:** Wave 2 mergeada

## Agentes a lançar em paralelo

| Agente | Issue | Branch |
|--------|-------|--------|
| `backend-dev` | #5 BE-03: CRUD Boards + Columns | `feat/be-03-boards-columns` |
| `frontend-dev` | #7 FE-03: Login/Register Pages | `feat/fe-03-login-register` |

## Instruções para cada agente

Buscar detalhes completos da issue antes de implementar:
```bash
GIT_SSL_NO_VERIFY=1 gh issue view <N> --repo thyagoluciano/poc-spark-the-action --json title,body
```

### backend-dev (issue #5)
Implementar CRUD de Boards e Columns:
- `backend/app/routers/boards.py` — CRUD completo de boards (owner validation)
- `backend/app/routers/columns.py` — CRUD de columns dentro de um board
- Todos os endpoints protegidos por JWT
- Validar que board pertence ao usuário autenticado

### frontend-dev (issue #7)
Implementar páginas de autenticação e estrutura de navegação:
- `frontend/src/pages/LoginPage.tsx` — formulário de login com validação
- `frontend/src/pages/RegisterPage.tsx` — formulário de registro
- `frontend/src/components/Header.tsx` — navbar com nome do usuário e logout
- Atualizar `frontend/src/App.tsx` com rotas: `/login`, `/register`, `/` (protegida)

## Critério de conclusão
Cada agente abre PR com `closes #N` no body e retorna número do PR.

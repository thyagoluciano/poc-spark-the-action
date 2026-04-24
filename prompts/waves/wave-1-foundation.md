# Wave 1 — Foundation

**Issues:** #1 (BE-01) e #2 (FE-01)
**Paralelo:** sim — backend e frontend independentes

## Agentes a lançar em paralelo

| Agente | Issue | Branch |
|--------|-------|--------|
| `backend-dev` | #1 BE-01: Backend Base | `feat/be-01-backend-base` |
| `frontend-dev` | #2 FE-01: Frontend Setup | `feat/fe-01-frontend-setup` |

## Instruções para cada agente

Buscar detalhes completos da issue antes de implementar:
```bash
GIT_SSL_NO_VERIFY=1 gh issue view <N> --repo thyagoluciano/poc-spark-the-action --json title,body
```

### backend-dev (issue #1)
Implementar a fundação do backend:
- `backend/requirements.txt`
- `backend/app/__init__.py`
- `backend/app/config.py` — Settings com SECRET_KEY, DATABASE_URL, etc
- `backend/app/database.py` — engine, SessionLocal, Base, get_db()
- `backend/app/models.py` — User, Board, Column, Task (SQLAlchemy)
- `backend/app/schemas.py` — Pydantic schemas request/response para cada model
- `backend/app/routers/__init__.py`

### frontend-dev (issue #2)
Inicializar o projeto frontend:
- Criar projeto com `npm create vite@latest frontend -- --template react-ts`
- Instalar dependências: tailwindcss, @dnd-kit/core, @dnd-kit/sortable, axios, react-router-dom
- Configurar Tailwind CSS
- Criar estrutura de pastas: `api/`, `components/`, `contexts/`, `pages/`, `types/`
- `frontend/src/types/index.ts` — interfaces Board, Column, Task, User
- `.prettierrc`

## Critério de conclusão
Cada agente abre PR com `closes #N` no body e retorna número do PR.

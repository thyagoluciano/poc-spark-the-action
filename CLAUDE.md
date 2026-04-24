# POC Spark The Action — Sistema Kanban

## Projeto

Monorepo com backend Python (FastAPI) e frontend React + Tailwind CSS.
Sistema de tarefas estilo Kanban com autenticacao JWT e banco SQLite.

```
backend/   → Python FastAPI (porta 8000)
frontend/  → React + Vite + Tailwind (porta 5173)
```

## Convencoes

### Backend
- Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2
- Sync SQLite (sem async)
- Routers em `app/routers/`, models em `app/models.py`, schemas em `app/schemas.py`
- Auth JWT com python-jose, senhas com passlib+bcrypt

### Frontend
- React 18+, TypeScript strict, Vite, Tailwind CSS v3
- @dnd-kit para drag and drop
- axios com interceptors para API calls
- react-router-dom v6

### Geral
- Responder sempre em Portugues
- Codigo em ingles (nomes de variaveis, funcoes, classes)
- Comentarios apenas quando a logica nao e auto-evidente

## Seguranca

- Nunca expor senhas, tokens ou secrets em logs/responses
- Validar ownership de recursos no backend
- CORS configurado apenas para origens conhecidas

## Agentes disponiveis

- `backend-dev` → Python/FastAPI (sempre com isolation: worktree)
- `frontend-dev` → React/TypeScript (sempre com isolation: worktree)
- `code-reviewer` → review de qualidade (sem worktree)
- `security-reviewer` → Snyk scans + revisao manual (sem worktree)

## Ferramentas de Formatacao

- Backend: `ruff` (lint + format)
- Frontend: `prettier`
- Hooks automaticos rodam apos Write/Edit

## Execucao de Waves

Use o skill `/wave N` para executar uma wave. Exemplo: `/wave 3`

O skill contem toda a logica de orquestracao com Agent Teams (ToolSearch, TeamCreate,
Teammates de dev e review, board updates, templates de prompt).

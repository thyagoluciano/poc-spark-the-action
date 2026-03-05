# Tasks - Sistema Kanban

## Mapa de Dependencias

```
FASE 1 (paralelo)
├── BE-01: Backend base (config, database, models, schemas)
├── FE-01: Frontend setup (Vite, React, Tailwind, dependencias)
│
FASE 2 (paralelo, depende da fase 1)
├── BE-02: Auth backend (auth.py, auth_router.py)         ← depende BE-01
├── FE-02: Auth frontend (AuthContext, API client)         ← depende FE-01
│
FASE 3 (paralelo, depende da fase 2)
├── BE-03: CRUD Boards + Columns router                   ← depende BE-02
├── BE-04: CRUD Tasks + reorder/move router                ← depende BE-02
├── FE-03: Pages Login/Register + ProtectedRoute           ← depende FE-02
│
FASE 4 (depende das fases anteriores)
├── BE-05: Main.py (montar app, CORS, lifespan, routers)   ← depende BE-02, BE-03, BE-04
├── FE-04: KanbanBoard + KanbanColumn + TaskCard            ← depende FE-02, FE-03
│
FASE 5 (paralelo, depende da fase 4)
├── FE-05: TaskModal (criar/editar/deletar)                 ← depende FE-04
├── FE-06: Drag and Drop (@dnd-kit)                         ← depende FE-04
│
FASE 6 (depende de tudo)
├── FE-07: Polish (loading, errors, responsividade)         ← depende FE-05, FE-06
│
FASE 7 (depende de tudo)
└── SEC-01: Security scan (Snyk code + SCA)                 ← depende de tudo
```

## Agente Recomendado por Task

| Task   | Agente              |
|--------|---------------------|
| BE-*   | `backend-dev`       |
| FE-*   | `frontend-dev`      |
| SEC-01 | `security-reviewer` |

## Status

- [ ] BE-01
- [ ] BE-02
- [ ] BE-03
- [ ] BE-04
- [ ] BE-05
- [ ] FE-01
- [ ] FE-02
- [ ] FE-03
- [ ] FE-04
- [ ] FE-05
- [ ] FE-06
- [ ] FE-07
- [ ] SEC-01

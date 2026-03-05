# Prompt 1: Setup do Board GitHub + Issues

Cole este prompt no Claude Code para configurar o board do projeto.

---

## Prompt

Preciso que voce configure o repositorio e board do GitHub para o projeto Kanban. Siga os passos abaixo na ordem exata.

**IMPORTANTE**: Use `GIT_SSL_NO_VERIFY=1` como prefixo em TODOS os comandos `gh` para evitar erros de SSL.

### Dados do Projeto

- **Repo**: `thyagoluciano/poc-spark-the-action`
- **Board (GitHub Projects)**: `4` (owner: `@me`)
- **Project ID**: `PVT_kwHOABAiv84BQ4yo`

### Campos do Board

| Campo  | Field ID                                  |
|--------|-------------------------------------------|
| Status | `PVTSSF_lAHOABAiv84BQ4yozg-4LAY`         |
| Priority | `PVTSSF_lAHOABAiv84BQ4yozg-4LIU`       |
| Size   | `PVTSSF_lAHOABAiv84BQ4yozg-4LIY`         |

### Status Options

| Status      | Option ID   |
|-------------|-------------|
| Backlog     | `f75ad846`  |
| Ready       | `61e4505c`  |
| In progress | `47fc9ee4`  |
| In review   | `df73e18b`  |
| Done        | `98236657`  |

### Priority Options

| Priority | Option ID   |
|----------|-------------|
| P0       | `79628723`  |
| P1       | `0a877460`  |
| P2       | `da944a9c`  |

### Size Options

| Size | Option ID   |
|------|-------------|
| XS   | `6c6483d2`  |
| S    | `f784b110`  |
| M    | `7515a9f1`  |
| L    | `817d0097`  |
| XL   | `db339eb2`  |

---

### Passo 1: Commit Inicial no Repositorio

O repositorio esta vazio. Faca o commit inicial:

1. Inicialize o git no diretorio do projeto: `/Users/zupper/Documents/develop/ZUP/poc-spark-the-action`
2. Adicione o remote: `git remote add origin git@github.com:thyagoluciano/poc-spark-the-action.git`
3. Crie o commit inicial com os arquivos existentes:
   - `spec/SPEC.md`
   - `tasks/*.md`
   - `prompts/*.md`
   - `CLAUDE.md`
   - `.claude/agents/*.md`
   - `.claude/hooks/*.sh`
   - `.claude/settings.json`
4. Push para `main`

### Passo 2: Criar Labels no Repositorio

Crie as seguintes labels:

```
backend     - #0E8A16 - Tarefas de backend Python/FastAPI
frontend    - #1D76DB - Tarefas de frontend React/TypeScript
security    - #D93F0B - Tarefas de seguranca
setup       - #FBCA04 - Setup e configuracao
phase-1     - #C2E0C6 - Fase 1 (paralelo)
phase-2     - #C2E0C6 - Fase 2 (paralelo)
phase-3     - #C2E0C6 - Fase 3 (paralelo)
phase-4     - #C2E0C6 - Fase 4
phase-5     - #C2E0C6 - Fase 5 (paralelo)
phase-6     - #C2E0C6 - Fase 6
phase-7     - #C2E0C6 - Fase 7
```

### Passo 3: Criar Issues e Adicionar ao Board

Para cada task abaixo, faca EXATAMENTE:

1. Crie a issue no repo com `gh issue create`
2. Adicione ao project board com `gh project item-add 4 --owner @me --url <issue_url>`
3. Capture o Item ID retornado
4. Defina Status, Priority e Size com `gh project item-edit` usando os IDs acima

**IMPORTANTE**: `gh project item-edit` usa estes parametros:
```bash
GIT_SSL_NO_VERIFY=1 gh project item-edit \
  --project-id PVT_kwHOABAiv84BQ4yo \
  --id <ITEM_ID> \
  --field-id <FIELD_ID> \
  --single-select-option-id <OPTION_ID>
```

---

#### Issue 1: BE-01 - Backend Base (config, database, models, schemas)

```
Titulo: BE-01: Backend Base - Config, Database, Models, Schemas
Labels: backend, phase-1
Priority: P0
Size: L
Status: Ready
```

Body:
```
## Objetivo
Criar a fundacao do backend: estrutura de pastas, configuracao, conexao com banco SQLite, models SQLAlchemy e schemas Pydantic.

## Arquivos
- `backend/requirements.txt`
- `backend/app/__init__.py`
- `backend/app/config.py` - Settings (SECRET_KEY, DB_URL, etc)
- `backend/app/database.py` - SQLAlchemy engine + session
- `backend/app/models.py` - User, Board, Column, Task
- `backend/app/schemas.py` - Pydantic request/response schemas
- `backend/app/routers/__init__.py`

## Spec detalhada
Ver `tasks/BE-01-backend-base.md`

## Depende de
Nenhuma

## Bloqueia
- BE-02, BE-03, BE-04, BE-05
```

---

#### Issue 2: BE-02 - Auth Backend (JWT, register, login)

```
Titulo: BE-02: Auth Backend - JWT Utils e Auth Router
Labels: backend, phase-2
Priority: P0
Size: M
Status: Backlog
```

Body:
```
## Objetivo
Implementar autenticacao JWT: utils para criar/verificar tokens, hashing de senhas, dependency get_current_user, e endpoints register/login/me.

## Arquivos
- `backend/app/auth.py` - JWT utils, password hashing, get_current_user
- `backend/app/routers/auth_router.py` - POST /auth/register, POST /auth/login, GET /auth/me

## Endpoints
- POST /auth/register → {email, password, name} → {id, email, name, token}
- POST /auth/login → {email, password} → {access_token, token_type}
- GET /auth/me → {id, email, name} (requer auth)

## Spec detalhada
Ver `tasks/BE-02-auth-backend.md`

## Depende de
- #1 (BE-01)

## Bloqueia
- BE-03, BE-04, BE-05
```

---

#### Issue 3: BE-03 - CRUD Boards + Columns

```
Titulo: BE-03: CRUD Boards + Columns Router
Labels: backend, phase-3
Priority: P0
Size: M
Status: Backlog
```

Body:
```
## Objetivo
CRUD de boards e columns. Ao criar board, criar 3 colunas default (To Do, In Progress, Done). Ownership validation.

## Arquivos
- `backend/app/routers/boards.py` - POST/GET/PUT/DELETE /boards
- `backend/app/routers/columns.py` - POST/PUT/DELETE columns

## Endpoints
- POST /boards → cria board + 3 colunas default
- GET /boards → lista boards do usuario
- GET /boards/{id} → board + columns + tasks (aninhado)
- PUT /boards/{id} → atualiza titulo
- DELETE /boards/{id} → cascade delete
- POST /boards/{board_id}/columns, PUT/DELETE /columns/{id}

## Spec detalhada
Ver `tasks/BE-03-boards-columns-router.md`

## Depende de
- #2 (BE-02)

## Bloqueia
- BE-05
```

---

#### Issue 4: BE-04 - CRUD Tasks + Reorder/Move

```
Titulo: BE-04: CRUD Tasks + Reorder/Move Router
Labels: backend, phase-3
Priority: P0
Size: L
Status: Backlog
```

Body:
```
## Objetivo
CRUD de tasks com move e reorder para suportar drag and drop. Batch update atomico para consistencia.

## Arquivos
- `backend/app/routers/tasks.py` - CRUD + move + reorder

## Endpoints
- POST /columns/{column_id}/tasks → cria task
- PUT /tasks/{id} → atualiza task
- DELETE /tasks/{id} → deleta task
- PATCH /tasks/{id}/move → move para outra coluna
- PATCH /tasks/reorder → batch update de posicoes (para drag and drop)

## Spec detalhada
Ver `tasks/BE-04-tasks-router.md`

## Depende de
- #2 (BE-02)

## Bloqueia
- BE-05
```

---

#### Issue 5: BE-05 - Main App (FastAPI setup)

```
Titulo: BE-05: Main App - FastAPI, CORS, Lifespan, Routers
Labels: backend, phase-4
Priority: P0
Size: S
Status: Backlog
```

Body:
```
## Objetivo
Montar main.py: inicializar FastAPI, configurar CORS, create_all no lifespan, incluir todos os routers.

## Arquivos
- `backend/app/main.py`

## Detalhes
- CORS para http://localhost:5173
- create_all no lifespan (cria tabelas SQLite)
- Include routers: auth, boards, columns, tasks
- Swagger UI em /docs

## Spec detalhada
Ver `tasks/BE-05-main-app.md`

## Depende de
- #2 (BE-02), #3 (BE-03), #4 (BE-04)

## Bloqueia
- SEC-01
```

---

#### Issue 6: FE-01 - Frontend Setup

```
Titulo: FE-01: Frontend Setup - Vite + React + Tailwind + Dependencias
Labels: frontend, setup, phase-1
Priority: P0
Size: M
Status: Ready
```

Body:
```
## Objetivo
Criar projeto frontend: Vite + React 18 + TypeScript + Tailwind CSS v3. Instalar dependencias e definir tipos.

## Detalhes
- npm create vite (template react-ts)
- Instalar: axios, react-router-dom, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- Configurar Tailwind CSS v3
- Definir types TypeScript (User, Board, Column, Task, etc.)
- App.tsx com React Router esqueleto
- Prettier config

## Spec detalhada
Ver `tasks/FE-01-frontend-setup.md`

## Depende de
Nenhuma

## Bloqueia
- FE-02, FE-03, FE-04
```

---

#### Issue 7: FE-02 - Auth Frontend (AuthContext + API Client)

```
Titulo: FE-02: Auth Frontend - AuthContext + API Client
Labels: frontend, phase-2
Priority: P0
Size: M
Status: Backlog
```

Body:
```
## Objetivo
Axios instance com interceptors JWT + AuthContext para gerenciamento de auth (login, register, logout, token persistence).

## Arquivos
- `frontend/src/api/client.ts` - Axios instance com interceptors
- `frontend/src/contexts/AuthContext.tsx` - Auth context provider

## Detalhes
- Request interceptor: adiciona Bearer token
- Response interceptor: logout automatico em 401
- AuthContext: login(), register(), logout(), isLoading
- Token no localStorage
- Verificacao de token existente ao inicializar

## Spec detalhada
Ver `tasks/FE-02-auth-frontend.md`

## Depende de
- #6 (FE-01)

## Bloqueia
- FE-03, FE-04
```

---

#### Issue 8: FE-03 - Login/Register Pages + ProtectedRoute + Header

```
Titulo: FE-03: Login/Register Pages + ProtectedRoute + Header
Labels: frontend, phase-3
Priority: P1
Size: M
Status: Backlog
```

Body:
```
## Objetivo
Paginas de login e registro, ProtectedRoute para rotas autenticadas, Header com logout.

## Arquivos
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/components/Header.tsx`
- `frontend/src/App.tsx` (atualizar rotas)

## Detalhes
- Login: email + password, redirect apos sucesso, erro para credenciais invalidas
- Register: nome + email + password, erro para email duplicado (409)
- ProtectedRoute: redirect para /login se nao autenticado
- Header: nome do usuario + botao logout
- Tailwind: cards centralizados, inputs estilizados

## Spec detalhada
Ver `tasks/FE-03-login-register-pages.md`

## Depende de
- #7 (FE-02)

## Bloqueia
- FE-04
```

---

#### Issue 9: FE-04 - KanbanBoard + KanbanColumn + TaskCard

```
Titulo: FE-04: KanbanBoard + KanbanColumn + TaskCard
Labels: frontend, phase-4
Priority: P0
Size: L
Status: Backlog
```

Body:
```
## Objetivo
Pagina principal do Kanban: BoardPage, KanbanBoard com colunas, KanbanColumn com lista de tasks, TaskCard com titulo e descricao.

## Arquivos
- `frontend/src/pages/BoardPage.tsx`
- `frontend/src/components/KanbanBoard.tsx`
- `frontend/src/components/KanbanColumn.tsx`
- `frontend/src/components/TaskCard.tsx`

## Detalhes
- BoardPage: carrega board ou cria default se nao existir
- KanbanBoard: fetch GET /boards/{id}, renderiza colunas em flex horizontal
- KanbanColumn: titulo, contador, botao "+", lista de tasks, scroll vertical
- TaskCard: titulo, descricao truncada, hover state
- Sem drag and drop ainda (sera FE-06)

## Spec detalhada
Ver `tasks/FE-04-kanban-board.md`

## Depende de
- #7 (FE-02), #8 (FE-03)

## Bloqueia
- FE-05, FE-06
```

---

#### Issue 10: FE-05 - TaskModal (criar/editar/deletar)

```
Titulo: FE-05: TaskModal - Criar/Editar/Deletar Tasks
Labels: frontend, phase-5
Priority: P1
Size: M
Status: Backlog
```

Body:
```
## Objetivo
Modal para criar, editar e deletar tarefas. Integrar com KanbanColumn (botao +) e TaskCard (click editar).

## Arquivos
- `frontend/src/components/TaskModal.tsx`
- Atualizar KanbanColumn.tsx e TaskCard.tsx

## Detalhes
- Modo criacao: titulo + descricao, POST /columns/{id}/tasks
- Modo edicao: campos pre-preenchidos, PUT /tasks/{id}
- Deletar com confirmacao, DELETE /tasks/{id}
- Fechar com click fora ou Esc
- Validacao: titulo obrigatorio

## Spec detalhada
Ver `tasks/FE-05-task-modal.md`

## Depende de
- #9 (FE-04)

## Bloqueia
- FE-07
```

---

#### Issue 11: FE-06 - Drag and Drop (@dnd-kit)

```
Titulo: FE-06: Drag and Drop com @dnd-kit
Labels: frontend, phase-5
Priority: P0
Size: XL
Status: Backlog
```

Body:
```
## Objetivo
Integrar @dnd-kit para drag and drop de tasks entre colunas e reordenacao dentro da mesma coluna.

## Arquivos (modificar)
- `frontend/src/components/KanbanBoard.tsx` - DndContext + DragOverlay
- `frontend/src/components/KanbanColumn.tsx` - SortableContext + useDroppable
- `frontend/src/components/TaskCard.tsx` - useSortable

## Detalhes
- DndContext com PointerSensor (distance: 5px)
- Optimistic update: atualiza UI antes da API
- PATCH /tasks/reorder com batch de posicoes
- Rollback se API falhar
- DragOverlay com preview do card
- Opacity 50% no card original durante drag

## Spec detalhada
Ver `tasks/FE-06-drag-and-drop.md`

## Depende de
- #9 (FE-04)

## Bloqueia
- FE-07
```

---

#### Issue 12: FE-07 - Polish (loading, errors, responsividade)

```
Titulo: FE-07: Polish - Loading States, Error Handling, Responsividade
Labels: frontend, phase-6
Priority: P2
Size: M
Status: Backlog
```

Body:
```
## Objetivo
Polimento: loading states, tratamento de erros com feedback, responsividade mobile.

## Detalhes
- Loading spinners em operacoes async
- Mensagens de erro contextuais (login invalido, email duplicado, etc.)
- Empty states ("Nenhuma tarefa")
- Responsividade: mobile (scroll horizontal), tablet, desktop
- Transicoes suaves, focus rings, cursor states

## Spec detalhada
Ver `tasks/FE-07-polish.md`

## Depende de
- #10 (FE-05), #11 (FE-06)

## Bloqueia
- SEC-01
```

---

#### Issue 13: SEC-01 - Security Scan (Snyk)

```
Titulo: SEC-01: Security Scan - Snyk Code + SCA
Labels: security, phase-7
Priority: P1
Size: M
Status: Backlog
```

Body:
```
## Objetivo
Scans de seguranca completos com Snyk MCP: SAST no backend e frontend, SCA nas dependencias. Corrigir vulnerabilidades critical/high.

## Detalhes
1. snyk_code_scan em backend/
2. snyk_code_scan em frontend/
3. snyk_sca_scan em requirements.txt e package.json
4. Review manual (OWASP checklist)
5. Corrigir findings critical/high
6. Re-scan para confirmar

## Spec detalhada
Ver `tasks/SEC-01-security-scan.md`

## Depende de
- #5 (BE-05), #12 (FE-07)
```

---

### Passo 4: Verificar

Ao final, execute:
1. `GIT_SSL_NO_VERIFY=1 gh issue list -R thyagoluciano/poc-spark-the-action` - deve listar 13 issues
2. `GIT_SSL_NO_VERIFY=1 gh project item-list 4 --owner @me --format json` - deve listar 13 items no board
3. Confirme que cada item tem Status, Priority e Size configurados

Reporte o resultado final com a lista de issues criadas e seus numeros.

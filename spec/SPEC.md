# Spec: Sistema Kanban - Monorepo (BE + FE)

## Context

Criar um sistema de tarefas estilo Kanban como POC. Monorepo com backend Python (FastAPI) e frontend React + Tailwind. Autenticacao basica com JWT. Banco SQLite. Funcionalidades: CRUD de tarefas + drag and drop entre colunas.

---

## 1. Estrutura do Monorepo

```
poc-spark-the-action/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, lifespan
│   │   ├── config.py            # Settings (SECRET_KEY, DB_URL, etc)
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models.py            # SQLAlchemy models (User, Board, Column, Task)
│   │   ├── schemas.py           # Pydantic schemas (request/response)
│   │   ├── auth.py              # JWT utils (create_token, verify_token, get_current_user)
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth_router.py   # POST /auth/register, POST /auth/login
│   │       ├── boards.py        # CRUD boards
│   │       ├── columns.py       # CRUD columns
│   │       └── tasks.py         # CRUD tasks + reorder/move
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   └── client.ts        # Axios instance com interceptor JWT
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # Context de auth (login, logout, token)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── BoardPage.tsx    # Pagina principal do Kanban
│   │   ├── components/
│   │   │   ├── KanbanBoard.tsx  # Container das colunas
│   │   │   ├── KanbanColumn.tsx # Coluna individual (droppable)
│   │   │   ├── TaskCard.tsx     # Card da tarefa (draggable)
│   │   │   ├── TaskModal.tsx    # Modal criar/editar tarefa
│   │   │   ├── Header.tsx       # Header com logout
│   │   │   └── ProtectedRoute.tsx
│   │   └── types/
│   │       └── index.ts         # TypeScript types
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
├── spec/
│   └── SPEC.md
└── README.md                    # Instrucoes de setup do monorepo
```

---

## 2. Backend - Detalhamento

### 2.1 Dependencias (`requirements.txt`)

```
fastapi==0.115.*
uvicorn[standard]==0.34.*
sqlalchemy==2.0.*
pydantic==2.*
python-jose[cryptography]==3.3.*
passlib[bcrypt]==1.7.*
python-multipart==0.0.*
```

### 2.2 Models (SQLAlchemy)

#### User
| Campo         | Tipo         | Detalhes                        |
|---------------|--------------|----------------------------------|
| id            | Integer      | PK, autoincrement               |
| email         | String(255)  | unique, not null, indexed        |
| hashed_password | String(255)| not null                         |
| name          | String(100)  | not null                         |
| created_at    | DateTime     | default=utcnow                  |

#### Board
| Campo      | Tipo        | Detalhes                         |
|------------|-------------|-----------------------------------|
| id         | Integer     | PK, autoincrement                |
| title      | String(200) | not null                         |
| owner_id   | Integer     | FK -> users.id, not null         |
| created_at | DateTime    | default=utcnow                   |

#### Column
| Campo    | Tipo        | Detalhes                           |
|----------|-------------|-------------------------------------|
| id       | Integer     | PK, autoincrement                  |
| title    | String(100) | not null                           |
| position | Integer     | not null (para ordenacao)          |
| board_id | Integer     | FK -> boards.id, not null          |

#### Task
| Campo       | Tipo        | Detalhes                          |
|-------------|-------------|-------------------------------------|
| id          | Integer     | PK, autoincrement                  |
| title       | String(200) | not null                           |
| description | Text        | nullable                           |
| position    | Integer     | not null (ordem dentro da coluna)  |
| column_id   | Integer     | FK -> columns.id, not null         |
| created_at  | DateTime    | default=utcnow                     |
| updated_at  | DateTime    | default=utcnow, onupdate=utcnow   |

### 2.3 API Endpoints

#### Auth
| Metodo | Rota             | Body                              | Resposta                     | Auth |
|--------|------------------|-----------------------------------|------------------------------|------|
| POST   | /auth/register   | {email, password, name}           | {id, email, name, token}     | No   |
| POST   | /auth/login      | {email, password}                 | {token, token_type}          | No   |
| GET    | /auth/me         | -                                 | {id, email, name}            | Yes  |

#### Boards
| Metodo | Rota             | Body/Params                       | Resposta                     | Auth |
|--------|------------------|-----------------------------------|------------------------------|------|
| POST   | /boards          | {title}                           | Board                        | Yes  |
| GET    | /boards          | -                                 | Board[]                      | Yes  |
| GET    | /boards/{id}     | -                                 | Board + columns + tasks      | Yes  |
| PUT    | /boards/{id}     | {title}                           | Board                        | Yes  |
| DELETE | /boards/{id}     | -                                 | 204                          | Yes  |

#### Columns
| Metodo | Rota                          | Body                        | Resposta    | Auth |
|--------|-------------------------------|-----------------------------|-------------|------|
| POST   | /boards/{board_id}/columns    | {title}                     | Column      | Yes  |
| PUT    | /columns/{id}                 | {title}                     | Column      | Yes  |
| DELETE | /columns/{id}                 | -                            | 204         | Yes  |

#### Tasks
| Metodo | Rota                          | Body                              | Resposta | Auth |
|--------|-------------------------------|-----------------------------------|----------|------|
| POST   | /columns/{column_id}/tasks    | {title, description?}             | Task     | Yes  |
| PUT    | /tasks/{id}                   | {title?, description?}            | Task     | Yes  |
| DELETE | /tasks/{id}                   | -                                 | 204      | Yes  |
| PATCH  | /tasks/{id}/move              | {column_id, position}             | Task     | Yes  |
| PATCH  | /tasks/reorder                | {tasks: [{id, column_id, position}]} | 200   | Yes  |

**Nota sobre `/tasks/reorder`**: Este endpoint recebe um batch de movimentacoes. Quando o usuario faz drag and drop, o frontend envia todas as posicoes atualizadas de uma vez. Isso garante consistencia.

### 2.4 Auth (JWT)

- `POST /auth/register`: hash da senha com `passlib.bcrypt`, cria user, retorna JWT
- `POST /auth/login`: verifica email+senha, retorna JWT
- JWT payload: `{sub: user_id, exp: now + 24h}`
- Dependency `get_current_user`: extrai token do header `Authorization: Bearer <token>`, decodifica, retorna User
- SECRET_KEY definido em `config.py` (variavel de ambiente ou default para dev)

### 2.5 CORS

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2.6 Seed Data

Ao criar um novo Board, automaticamente criar 3 colunas default:
- "To Do" (position=0)
- "In Progress" (position=1)
- "Done" (position=2)

### 2.7 Database Init

Usar `SQLAlchemy` com `create_all` no startup da app (via lifespan). Sem migrations para manter simples.

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield
```

---

## 3. Frontend - Detalhamento

### 3.1 Tooling

- **Vite** como bundler (template react-ts)
- **React 18+** com TypeScript
- **Tailwind CSS v3** para estilos
- **@dnd-kit/core** + **@dnd-kit/sortable** para drag and drop
- **axios** para HTTP
- **react-router-dom v6** para rotas

### 3.2 Paginas e Rotas

| Rota         | Componente     | Auth  | Descricao                     |
|--------------|----------------|-------|-------------------------------|
| /login       | LoginPage      | No    | Formulario de login           |
| /register    | RegisterPage   | No    | Formulario de registro        |
| /            | BoardPage      | Yes   | Redirect para primeiro board  |
| /boards/:id  | BoardPage      | Yes   | Visualizacao do kanban        |

### 3.3 AuthContext

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

- Token armazenado no `localStorage`
- Axios interceptor adiciona `Authorization: Bearer <token>` em todas as requests
- Interceptor de response: se 401, faz logout automatico

### 3.4 Componentes

#### Header
- Nome do usuario logado
- Botao de logout
- Sidebar ou dropdown para listar/criar boards

#### KanbanBoard
- Recebe `boardId` como prop
- Fetch `GET /boards/{id}` ao montar (retorna board com columns e tasks)
- Renderiza array de `KanbanColumn`
- Implementa `DndContext` do @dnd-kit
- Ao final do drag: chama `PATCH /tasks/reorder` com as novas posicoes

#### KanbanColumn
- Props: `column` (com tasks[])
- Header com titulo da coluna
- Botao "+" para adicionar task (abre TaskModal)
- Lista de `TaskCard` dentro de `SortableContext`
- Estilo: bg-gray-100 rounded-lg, min-width fixo, scroll vertical se overflow

#### TaskCard
- Props: `task`
- Draggable (useSortable do @dnd-kit)
- Exibe titulo e descricao truncada
- Click abre TaskModal para editar
- Botao de delete (com confirmacao)
- Estilo: bg-white shadow-sm rounded-md p-3, cursor grab

#### TaskModal
- Modal overlay
- Campos: titulo (required), descricao (textarea, opcional)
- Modo criar / editar (detecta pela presenca de task prop)
- Botoes: Salvar, Cancelar, Deletar (se editando)

### 3.5 Drag and Drop - Fluxo

1. Usuario inicia drag em um `TaskCard`
2. `DndContext` do @dnd-kit gerencia o estado
3. Overlay visual mostra o card sendo arrastado
4. Ao soltar (`onDragEnd`):
   a. Identificar coluna de origem e destino
   b. Recalcular `position` de todas as tasks afetadas
   c. Atualizar state local imediatamente (optimistic update)
   d. Chamar `PATCH /tasks/reorder` com as novas posicoes
   e. Se erro na API, reverter state local

### 3.6 Estilos (Tailwind)

- Layout: flex horizontal para colunas, gap-4
- Board ocupa viewport inteira (h-screen) com overflow-x-auto
- Cores neutras para colunas (gray-100), cards brancos
- Hover states nos cards (shadow-md)
- Drag state: opacity-50 no card original, shadow-lg no overlay
- Responsivo: em mobile, scroll horizontal entre colunas

### 3.7 API Client (`api/client.ts`)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 4. Comportamentos e Regras de Negocio

1. **Registro**: email unico. Se email ja existe, retornar 409.
2. **Board**: cada usuario ve apenas seus proprios boards. Ao criar board, 3 colunas default sao criadas.
3. **Colunas**: nao podem ser criadas/editadas/deletadas pelo usuario nesta versao (apenas as 3 default). Simplifica o escopo.
4. **Tasks**: pertencem a uma coluna. Position e um inteiro que define ordem. Ao criar task, position = max(position) + 1 na coluna.
5. **Move**: ao mover task entre colunas, atualizar column_id e position. Reordenar tasks afetadas.
6. **Delete board**: cascade delete em columns e tasks.
7. **Delete task**: apenas soft-remover da lista (hard delete no DB).

---

## 5. Instrucoes de Setup (README.md raiz)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

O frontend roda em `http://localhost:5173` e o backend em `http://localhost:8000`.
Docs da API disponivel em `http://localhost:8000/docs` (Swagger UI).

---

## 6. Verificacao / Testes

1. Subir o backend e verificar que `http://localhost:8000/docs` abre o Swagger
2. Registrar um usuario via POST /auth/register
3. Fazer login via POST /auth/login e obter token
4. Criar um board e verificar que 3 colunas default foram criadas
5. Criar tasks em diferentes colunas
6. Subir o frontend e verificar:
   - Tela de registro/login funciona
   - Board renderiza com 3 colunas
   - Tasks aparecem nos cards
   - Drag and drop move tasks entre colunas
   - Criar/editar/deletar tasks funciona
7. Rodar Snyk code scan no backend e frontend para verificar vulnerabilidades

---

## 7. Ordem de Implementacao

1. **Backend base**: config, database, models, schemas
2. **Auth**: auth.py, auth_router.py
3. **CRUD**: boards, columns, tasks routers
4. **main.py**: montar app, CORS, lifespan, include routers
5. **Frontend setup**: Vite + React + Tailwind + dependencias
6. **Auth frontend**: AuthContext, LoginPage, RegisterPage, ProtectedRoute
7. **API client**: axios instance com interceptors
8. **Board page**: KanbanBoard, KanbanColumn, TaskCard
9. **Drag and drop**: integrar @dnd-kit
10. **TaskModal**: criar/editar tasks
11. **Polish**: loading states, error handling basico, responsividade
12. **Security scan**: Snyk code scan em ambos

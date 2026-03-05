# BE-01: Backend Base - Config, Database, Models, Schemas

**Agente:** `backend-dev`
**Depende de:** nenhuma
**Bloqueia:** BE-02, BE-03, BE-04, BE-05

---

## Objetivo

Criar a fundacao do backend: estrutura de pastas, configuracao, conexao com banco, models SQLAlchemy e schemas Pydantic.

## Arquivos a Criar

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── routers/
│       └── __init__.py
└── requirements.txt
```

## Detalhamento

### 1. `requirements.txt`

```
fastapi==0.115.*
uvicorn[standard]==0.34.*
sqlalchemy==2.0.*
pydantic==2.*
python-jose[cryptography]==3.3.*
passlib[bcrypt]==1.7.*
python-multipart==0.0.*
```

### 2. `config.py`

- Classe Settings com:
  - `SECRET_KEY`: str (env var ou default "dev-secret-key-change-in-production")
  - `DATABASE_URL`: str (default "sqlite:///./kanban.db")
  - `ACCESS_TOKEN_EXPIRE_MINUTES`: int (default 1440 = 24h)
  - `ALGORITHM`: str (default "HS256")

### 3. `database.py`

- SQLAlchemy engine com `DATABASE_URL`
- `SessionLocal` factory
- `Base` declarative base
- Dependency `get_db()` que yield session e fecha no finally

### 4. `models.py`

Criar 4 models conforme spec:

**User**: id, email (unique, indexed), hashed_password, name, created_at
**Board**: id, title, owner_id (FK users.id), created_at
**Column**: id, title, position, board_id (FK boards.id)
**Task**: id, title, description (nullable), position, column_id (FK columns.id), created_at, updated_at

Relationships:
- User.boards → Board[]
- Board.owner → User
- Board.columns → Column[] (cascade delete, order_by position)
- Column.board → Board
- Column.tasks → Task[] (cascade delete, order_by position)
- Task.column → Column

### 5. `schemas.py`

Criar schemas Pydantic para request/response de cada entidade:

**User**: UserCreate(email, password, name), UserResponse(id, email, name), UserLogin(email, password)
**Board**: BoardCreate(title), BoardResponse(id, title, owner_id, created_at), BoardDetailResponse(id, title, columns com tasks)
**Column**: ColumnCreate(title), ColumnResponse(id, title, position, board_id), ColumnWithTasksResponse(id, title, position, tasks[])
**Task**: TaskCreate(title, description?), TaskUpdate(title?, description?), TaskResponse(id, title, description, position, column_id, created_at, updated_at), TaskMove(column_id, position), TaskReorderItem(id, column_id, position), TaskReorderRequest(tasks: TaskReorderItem[])
**Auth**: Token(access_token, token_type)

## Criterios de Aceite

- [ ] `requirements.txt` com todas as dependencias
- [ ] Config carregando de env vars com defaults
- [ ] Engine e session factory funcionando
- [ ] 4 models com relationships corretas
- [ ] Schemas Pydantic para todas as operacoes CRUD
- [ ] `__init__.py` nos pacotes

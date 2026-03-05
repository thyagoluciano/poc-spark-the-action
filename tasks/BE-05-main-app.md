# BE-05: Main App - Montar FastAPI, CORS, Lifespan, Routers

**Agente:** `backend-dev`
**Depende de:** BE-02, BE-03, BE-04
**Bloqueia:** SEC-01

---

## Objetivo

Montar o `main.py` que inicializa a aplicacao FastAPI, configura CORS, cria tabelas no startup e inclui todos os routers.

## Arquivo a Criar

```
backend/app/
└── main.py
```

## Detalhamento

### `main.py`

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth_router, boards, columns, tasks

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Kanban API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
app.include_router(boards.router, prefix="/boards", tags=["boards"])
app.include_router(columns.router, tags=["columns"])
app.include_router(tasks.router, tags=["tasks"])
```

### Notas

- Columns router tem prefixos mistos (`/boards/{board_id}/columns` e `/columns/{id}`), definir no proprio router
- Tasks router tem prefixos mistos (`/columns/{column_id}/tasks`, `/tasks/{id}`, `/tasks/reorder`), definir no proprio router
- CORS apenas para `http://localhost:5173`
- `create_all` no lifespan cria tabelas se nao existirem (SQLite)

### Verificacao

Apos implementar, o backend deve:
1. Iniciar com `uvicorn app.main:app --reload --port 8000`
2. Swagger UI acessivel em `http://localhost:8000/docs`
3. Todos os endpoints visiveis no Swagger

## Criterios de Aceite

- [ ] App FastAPI inicializa sem erros
- [ ] CORS configurado para localhost:5173
- [ ] Tabelas criadas automaticamente no startup
- [ ] Todos os routers incluidos com prefixos corretos
- [ ] Swagger UI funcional em /docs

# Kanban Board

Sistema de tarefas estilo Kanban com autenticacao JWT, drag and drop entre colunas e responsividade mobile.

**Backend:** Python 3.11+ / FastAPI / SQLAlchemy / SQLite
**Frontend:** React 18 / TypeScript / Tailwind CSS / @dnd-kit

## Pre-requisitos

- Python 3.11+
- Node.js 18+
- npm

## Backend

```bash
cd backend

# Criar e ativar virtualenv
python3 -m venv venv
source venv/bin/activate   # Linux/macOS
# venv\Scripts\activate    # Windows

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor (porta 8000)
uvicorn app.main:app --reload
```

O banco SQLite (`kanban.db`) e criado automaticamente na primeira execucao.

### Variaveis de ambiente (opcionais)

| Variavel | Default | Descricao |
|----------|---------|-----------|
| `SECRET_KEY` | auto-gerada | Chave JWT (min 32 chars) |
| `DATABASE_URL` | `sqlite:///./kanban.db` | URL do banco |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Expiracao do token (24h) |

## Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar dev server (porta 5173)
npm run dev
```

Abra http://localhost:5173 no navegador.

## Uso

1. Inicie o backend e o frontend em terminais separados
2. Acesse http://localhost:5173
3. Crie uma conta em "Cadastre-se"
4. Um board com 3 colunas (To Do, In Progress, Done) sera criado automaticamente
5. Use o botao "+" para criar tarefas
6. Arraste tarefas entre colunas com drag and drop

## API

Com o backend rodando, acesse a documentacao interativa:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

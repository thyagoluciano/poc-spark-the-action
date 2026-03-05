# BE-03: CRUD Boards + Columns Router

**Agente:** `backend-dev`
**Depende de:** BE-02
**Bloqueia:** BE-05

---

## Objetivo

Implementar CRUD de boards e columns. Ao criar board, criar automaticamente 3 colunas default. Colunas nao sao editaveis pelo usuario nesta versao.

## Arquivos a Criar

```
backend/app/routers/
├── boards.py
└── columns.py
```

## Detalhamento

### 1. `boards.py` - Board Router

Todos os endpoints requerem autenticacao (`current_user = Depends(get_current_user)`).

**POST /boards**
- Body: `BoardCreate(title)`
- Criar Board com `owner_id = current_user.id`
- Criar 3 colunas default:
  - "To Do" (position=0)
  - "In Progress" (position=1)
  - "Done" (position=2)
- Retornar Board criado

**GET /boards**
- Listar boards do usuario atual (`owner_id == current_user.id`)
- Retornar `BoardResponse[]`

**GET /boards/{id}**
- Buscar board por id, validar ownership
- Retornar 404 se nao encontrar ou nao pertencer ao usuario
- Retornar `BoardDetailResponse` com columns (ordenadas por position) e tasks de cada coluna (ordenadas por position)

**PUT /boards/{id}**
- Body: `BoardUpdate(title)`
- Validar ownership → 404 se nao pertencer ao usuario
- Atualizar title
- Retornar Board atualizado

**DELETE /boards/{id}**
- Validar ownership → 404 se nao pertencer ao usuario
- Deletar board (cascade deleta columns e tasks)
- Retornar 204

### 2. `columns.py` - Columns Router

Endpoints de columns (mantidos para extensibilidade, mas nao usados pelo frontend nesta versao).

**POST /boards/{board_id}/columns**
- Body: `ColumnCreate(title)`
- Validar ownership do board
- Position = max position + 1 (ou 0 se sem colunas)
- Retornar Column criada

**PUT /columns/{id}**
- Body: `ColumnUpdate(title)`
- Validar que o board da coluna pertence ao usuario
- Retornar Column atualizada

**DELETE /columns/{id}**
- Validar ownership via board
- Deletar coluna (cascade deleta tasks)
- Retornar 204

## Regras de Negocio

- Usuario so ve/edita seus proprios boards
- Ownership check: `board.owner_id == current_user.id`
- Cascade delete: board → columns → tasks
- Seed automatico: 3 colunas ao criar board

## Criterios de Aceite

- [ ] POST /boards cria board com 3 colunas default
- [ ] GET /boards retorna apenas boards do usuario logado
- [ ] GET /boards/{id} retorna board com columns e tasks aninhados
- [ ] PUT /boards/{id} atualiza titulo
- [ ] DELETE /boards/{id} faz cascade delete
- [ ] Ownership validation em todos os endpoints
- [ ] CRUD basico de columns implementado

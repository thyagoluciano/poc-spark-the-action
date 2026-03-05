# FE-04: KanbanBoard + KanbanColumn + TaskCard

**Agente:** `frontend-dev`
**Depende de:** FE-02, FE-03
**Bloqueia:** FE-05, FE-06

---

## Objetivo

Implementar a pagina principal do Kanban com o board, colunas e cards de tarefas. Sem drag and drop ainda (sera adicionado na FE-06).

## Arquivos a Criar

```
frontend/src/
├── pages/
│   └── BoardPage.tsx
└── components/
    ├── KanbanBoard.tsx
    ├── KanbanColumn.tsx
    └── TaskCard.tsx
```

## Detalhamento

### 1. `BoardPage.tsx`

- Obtem `id` do URL param (`useParams`)
- Se nao ha `id` (rota `/`):
  - Fetch `GET /boards` para listar boards do usuario
  - Se ha boards, redirect para `/boards/{primeiro_board.id}`
  - Se nao ha boards, criar board automaticamente (POST /boards com title "Meu Board") e redirect
- Se ha `id`:
  - Renderizar `<KanbanBoard boardId={id} />`

### 2. `KanbanBoard.tsx`

Props: `{ boardId: number }`

- Fetch `GET /boards/{boardId}` ao montar e quando boardId mudar
- State: `board: BoardDetail | null`
- Loading state enquanto carrega
- Renderizar titulo do board
- Renderizar colunas em flex horizontal com gap
- Cada coluna recebe seus dados + callbacks para refresh

```tsx
<div className="flex gap-6 overflow-x-auto p-6 h-full">
  {board.columns.map(column => (
    <KanbanColumn
      key={column.id}
      column={column}
      onRefresh={fetchBoard}
    />
  ))}
</div>
```

### 3. `KanbanColumn.tsx`

Props: `{ column: Column, onRefresh: () => void }`

- Header com titulo da coluna e contador de tasks
- Botao "+" para adicionar task
- Lista de TaskCards
- Estilo: bg-gray-100, rounded-lg, min-w-[300px], max-h com scroll

```tsx
<div className="bg-gray-100 rounded-lg p-4 min-w-[300px] max-w-[300px] flex flex-col max-h-[calc(100vh-12rem)]">
  <div className="flex justify-between items-center mb-4">
    <h3 className="font-semibold text-gray-700">{column.title}</h3>
    <span className="text-sm text-gray-500">{column.tasks.length}</span>
  </div>
  <button onClick={onAddTask}>+ Adicionar</button>
  <div className="flex-1 overflow-y-auto space-y-3">
    {column.tasks.map(task => (
      <TaskCard key={task.id} task={task} onRefresh={onRefresh} />
    ))}
  </div>
</div>
```

### 4. `TaskCard.tsx`

Props: `{ task: Task, onClick?: () => void, onRefresh: () => void }`

- Exibe titulo
- Exibe descricao truncada (max 2 linhas) se existir
- Click no card abre modal de edicao (callback)
- Estilo: bg-white, shadow-sm, rounded-md, hover:shadow-md, cursor-pointer

```tsx
<div className="bg-white rounded-md shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow">
  <h4 className="font-medium text-gray-800">{task.title}</h4>
  {task.description && (
    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
  )}
</div>
```

## Criterios de Aceite

- [ ] BoardPage carrega board ou cria um default
- [ ] KanbanBoard renderiza colunas em layout horizontal
- [ ] KanbanColumn exibe titulo, contador e lista de tasks
- [ ] TaskCard exibe titulo e descricao truncada
- [ ] Scroll horizontal entre colunas
- [ ] Scroll vertical dentro de colunas com overflow
- [ ] Loading state durante fetch
- [ ] Layout responsivo

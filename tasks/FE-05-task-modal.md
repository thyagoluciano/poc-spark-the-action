# FE-05: TaskModal - Criar/Editar/Deletar Tasks

**Agente:** `frontend-dev`
**Depende de:** FE-04
**Bloqueia:** FE-07

---

## Objetivo

Implementar modal para criar, editar e deletar tarefas. Integrar com os componentes KanbanColumn (botao +) e TaskCard (click para editar).

## Arquivo a Criar

```
frontend/src/components/
└── TaskModal.tsx
```

## Detalhamento

### `TaskModal.tsx`

Props:

```typescript
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;          // callback para refresh do board
  columnId: number;             // coluna onde criar/mover
  task?: Task;                  // se presente, modo edicao; se ausente, modo criacao
}
```

### Modo Criacao (task == undefined)

- Titulo: "Nova Tarefa"
- Campos: titulo (input, required), descricao (textarea, opcional)
- Botoes: "Cancelar", "Criar"
- Ao criar: POST /columns/{columnId}/tasks com {title, description}
- Apos sucesso: chamar onSave() e onClose()

### Modo Edicao (task != undefined)

- Titulo: "Editar Tarefa"
- Campos pre-preenchidos com dados da task
- Botoes: "Cancelar", "Salvar", "Deletar" (vermelho)
- Ao salvar: PUT /tasks/{task.id} com {title, description}
- Ao deletar: confirmacao "Tem certeza?" → DELETE /tasks/{task.id}
- Apos sucesso: chamar onSave() e onClose()

### Layout

- Overlay: fundo escuro semi-transparente (bg-black/50), click fora fecha
- Modal: centralizado, bg-white, rounded-lg, shadow-xl, max-w-lg, p-6
- Fechar com Esc tambem

### Integracao

Atualizar `KanbanColumn.tsx`:
- State para controlar abertura do modal e task selecionada
- Botao "+" abre modal em modo criacao
- Click no TaskCard abre modal em modo edicao

### Estilos

```
Overlay: fixed inset-0 bg-black/50 flex items-center justify-center z-50
Modal: bg-white rounded-lg shadow-xl p-6 w-full max-w-lg
Input: w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500
Textarea: w-full px-3 py-2 border rounded-md h-32 resize-none
Btn Criar/Salvar: bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700
Btn Cancelar: bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300
Btn Deletar: bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700
```

## Criterios de Aceite

- [ ] Modal abre em modo criacao ao clicar "+" na coluna
- [ ] Modal abre em modo edicao ao clicar no task card
- [ ] Criar task funciona (POST + refresh)
- [ ] Editar task funciona (PUT + refresh)
- [ ] Deletar task com confirmacao funciona (DELETE + refresh)
- [ ] Fechar modal com click fora ou Esc
- [ ] Validacao: titulo obrigatorio
- [ ] Loading/disabled nos botoes durante submit

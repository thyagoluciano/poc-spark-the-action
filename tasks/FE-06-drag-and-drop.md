# FE-06: Drag and Drop com @dnd-kit

**Agente:** `frontend-dev`
**Depende de:** FE-04
**Bloqueia:** FE-07

---

## Objetivo

Integrar @dnd-kit para permitir drag and drop de tasks entre colunas e reordenacao dentro da mesma coluna.

## Arquivos a Modificar

```
frontend/src/components/
├── KanbanBoard.tsx    # Adicionar DndContext
├── KanbanColumn.tsx   # Adicionar SortableContext + droppable
└── TaskCard.tsx       # Adicionar useSortable (draggable)
```

## Detalhamento

### 1. `KanbanBoard.tsx` - DndContext

- Envolver colunas com `DndContext` do @dnd-kit/core
- Usar `sensors` com `PointerSensor` (activationConstraint: distance 5px para evitar drag acidental)
- Implementar `onDragStart`, `onDragOver`, `onDragEnd`
- Adicionar `DragOverlay` para exibir preview do card durante drag
- State local para gerenciar posicoes (optimistic update)

```tsx
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

// Sensors
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
);

// State
const [activeTask, setActiveTask] = useState<Task | null>(null);
const [columns, setColumns] = useState<Column[]>([]);
```

### 2. `KanbanColumn.tsx` - SortableContext + Droppable

- Usar `useDroppable` para marcar coluna como area de drop
- Envolver tasks com `SortableContext` usando `verticalListSortingStrategy`
- IDs dos items: `task-{task.id}`

```tsx
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

const { setNodeRef } = useDroppable({ id: `column-${column.id}` });

<div ref={setNodeRef}>
  <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
    {column.tasks.map(task => <TaskCard key={task.id} task={task} />)}
  </SortableContext>
</div>
```

### 3. `TaskCard.tsx` - useSortable

- Usar `useSortable` com id `task-{task.id}`
- Aplicar transform e transition styles
- Opacity 50% quando sendo arrastado

```tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
  id: `task-${task.id}`,
  data: { task, columnId: task.column_id }
});

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.5 : 1,
};
```

### 4. Logica de onDragEnd

```
1. Identificar task arrastada (activeId)
2. Identificar destino (overId) - pode ser outra task ou uma coluna
3. Determinar coluna de origem e destino
4. Se mesma coluna: reordenar tasks dentro da coluna
5. Se coluna diferente: mover task para nova coluna na posicao correta
6. Optimistic update: atualizar state local imediatamente
7. Chamar PATCH /tasks/reorder com todas as posicoes afetadas
8. Se erro: reverter state local e mostrar erro
```

### 5. DragOverlay

- Renderizar copia do TaskCard durante drag
- Shadow-lg para destaque
- Cursor grabbing

## Criterios de Aceite

- [ ] Drag and drop funciona dentro da mesma coluna (reorder)
- [ ] Drag and drop funciona entre colunas diferentes (move)
- [ ] Overlay visual durante drag
- [ ] Opacity reduzida no card original durante drag
- [ ] Optimistic update (UI atualiza antes da API)
- [ ] Rollback se API falhar
- [ ] Activation constraint (5px) previne drag acidental
- [ ] Posicoes salvas corretamente no backend

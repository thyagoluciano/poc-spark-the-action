# Wave 6 — Interactivity

**Issues:** #11 (FE-06) e #12 (FE-07)
**Paralelo:** não — FE-07 (polish) depende de FE-06 (drag and drop)
**Depende de:** Wave 5 mergeada

## Sequência de execução

### Passo 1 — lançar frontend-dev para FE-06

| Agente | Issue | Branch |
|--------|-------|--------|
| `frontend-dev` | #11 FE-06: Drag and Drop | `feat/fe-06-drag-and-drop` |

Aguardar review + merge do PR antes de continuar.

### Passo 2 — lançar frontend-dev para FE-07

| Agente | Issue | Branch |
|--------|-------|--------|
| `frontend-dev` | #12 FE-07: Polish | `feat/fe-07-polish` |

Aguardar review + merge do PR antes de encerrar a wave.

## Instruções para cada agente

Buscar detalhes completos da issue antes de implementar:
```bash
GIT_SSL_NO_VERIFY=1 gh issue view <N> --repo thyagoluciano/poc-spark-the-action --json title,body
```

### frontend-dev (issue #11)
Implementar drag and drop com @dnd-kit:
- Atualizar `KanbanBoard.tsx` com `DndContext` e `SortableContext`
- Atualizar `KanbanColumn.tsx` com `useDroppable`
- Atualizar `TaskCard.tsx` com `useSortable`
- Handler `onDragEnd`: mover task entre colunas via PATCH /tasks/{id}/move
- Handler `onDragEnd`: reordenar task na mesma coluna via PATCH /tasks/{id}/reorder
- Optimistic update: atualizar UI antes da confirmação da API

### frontend-dev (issue #12)
Finalizar a experiência do usuário:
- Loading states com spinner em todas as operações async
- Error handling com toast/alert em erros de API
- Estado vazio para board sem colunas/tasks
- Responsividade: scroll horizontal no board em telas pequenas
- Ajustes de layout e espaçamento

## Critério de conclusão
Cada agente abre PR com `closes #N` no body e retorna número do PR.

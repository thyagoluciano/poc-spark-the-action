# Wave 5 — Kanban UI

**Issues:** #9 (FE-04) e #10 (FE-05)
**Paralelo:** não — FE-05 depende de FE-04
**Depende de:** Wave 4 mergeada (backend completo)

## Sequência de execução

### Passo 1 — lançar frontend-dev para FE-04

| Agente | Issue | Branch |
|--------|-------|--------|
| `frontend-dev` | #9 FE-04: KanbanBoard + Column + TaskCard | `feat/fe-04-kanban-board` |

Aguardar review + merge do PR antes de continuar.

### Passo 2 — lançar frontend-dev para FE-05

| Agente | Issue | Branch |
|--------|-------|--------|
| `frontend-dev` | #10 FE-05: TaskModal | `feat/fe-05-task-modal` |

Aguardar review + merge do PR antes de encerrar a wave.

## Instruções para cada agente

Buscar detalhes completos da issue antes de implementar:
```bash
GIT_SSL_NO_VERIFY=1 gh issue view <N> --repo thyagoluciano/poc-spark-the-action --json title,body
```

### frontend-dev (issue #9)
Implementar a tela principal do Kanban:
- `frontend/src/pages/BoardPage.tsx` — página principal que busca e exibe o board
- `frontend/src/components/KanbanBoard.tsx` — container do board com colunas lado a lado
- `frontend/src/components/KanbanColumn.tsx` — coluna com header e lista de cards
- `frontend/src/components/TaskCard.tsx` — card individual com título e botões
- Integração com API: GET /boards, GET /boards/{id}/columns e tasks
- Atualizar App.tsx com rota `/boards/:id`

### frontend-dev (issue #10)
Implementar modal de criação/edição/deleção de tasks:
- `frontend/src/components/TaskModal.tsx` — modal com form de criação e edição
- Campos: título (obrigatório), descrição (opcional)
- Integração com API: POST, PATCH, DELETE tasks
- Botão de deletar com confirmação
- Fechar modal ao salvar ou cancelar

## Critério de conclusão
Cada agente abre PR com `closes #N` no body e retorna número do PR.

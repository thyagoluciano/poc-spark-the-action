# Wave 4 — Tasks Backend + App Assembly

**Issues:** #6 (BE-04) e #8 (BE-05)
**Paralelo:** não — BE-04 deve ser mergeado antes de iniciar BE-05
**Depende de:** Wave 3 mergeada

## Sequência de execução

### Passo 1 — lançar backend-dev para BE-04

| Agente | Issue | Branch |
|--------|-------|--------|
| `backend-dev` | #6 BE-04: CRUD Tasks | `feat/be-04-tasks-router` |

Aguardar review + merge do PR antes de continuar.

### Passo 2 — lançar backend-dev para BE-05

| Agente | Issue | Branch |
|--------|-------|--------|
| `backend-dev` | #8 BE-05: Main App | `feat/be-05-main-app` |

Aguardar review + merge do PR antes de encerrar a wave.

## Instruções para cada agente

Buscar detalhes completos da issue antes de implementar:
```bash
GIT_SSL_NO_VERIFY=1 gh issue view <N> --repo thyagoluciano/poc-spark-the-action --json title,body
```

### backend-dev (issue #6)
Implementar CRUD de Tasks com reordenação:
- `backend/app/routers/tasks.py` — CRUD de tasks dentro de uma coluna
- Endpoint PATCH para reordenar tasks dentro da coluna (update position)
- Endpoint PATCH para mover task entre colunas
- Validar que a coluna pertence a um board do usuário autenticado

### backend-dev (issue #8)
Montar a aplicação FastAPI principal:
- `backend/app/main.py` — FastAPI app com CORS, lifespan (create_all), e todos os routers incluídos
- CORS configurado para `http://localhost:5173`
- Lifespan: criar tabelas no startup via `Base.metadata.create_all`
- Incluir routers: auth, boards, columns, tasks com prefixos corretos

## Critério de conclusão
Cada agente abre PR com `closes #N` no body e retorna número do PR.

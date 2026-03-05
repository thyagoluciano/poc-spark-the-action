# BE-04: CRUD Tasks + Reorder/Move Router

**Agente:** `backend-dev`
**Depende de:** BE-02
**Bloqueia:** BE-05

---

## Objetivo

Implementar CRUD de tasks com endpoints de move e reorder para suportar drag and drop do frontend.

## Arquivo a Criar

```
backend/app/routers/
└── tasks.py
```

## Detalhamento

### `tasks.py` - Tasks Router

Todos os endpoints requerem autenticacao.

**POST /columns/{column_id}/tasks**
- Body: `TaskCreate(title, description?)`
- Validar que a coluna pertence a um board do usuario
- Position = max(position de tasks na coluna) + 1 (ou 0 se vazia)
- Retornar Task criada

**PUT /tasks/{id}**
- Body: `TaskUpdate(title?, description?)`
- Validar ownership (task → column → board → owner)
- Atualizar apenas campos fornecidos
- Retornar Task atualizada

**DELETE /tasks/{id}**
- Validar ownership
- Hard delete no DB
- Retornar 204

**PATCH /tasks/{id}/move**
- Body: `TaskMove(column_id, position)`
- Validar ownership da task e da coluna destino
- Atualizar `column_id` e `position` da task
- Reordenar tasks afetadas na coluna de origem e destino
- Retornar Task atualizada

**PATCH /tasks/reorder**
- Body: `TaskReorderRequest(tasks: [{id, column_id, position}])`
- Batch update: para cada item, atualizar column_id e position
- Validar ownership de todas as tasks (todas devem pertencer a boards do usuario)
- Usar uma transacao unica para garantir consistencia
- Retornar 200 com `{"status": "ok"}`

### Logica de Reorder

O endpoint `/tasks/reorder` e o principal para drag and drop:
1. Frontend envia todas as posicoes atualizadas de uma vez
2. Backend faz update em batch dentro de uma transacao
3. Se qualquer validacao falhar, rollback de tudo

### Helper para Ownership Validation

Criar helper que verifica a cadeia: task → column → board → owner == current_user.

```python
def validate_task_ownership(task_id: int, user_id: int, db: Session) -> Task:
    task = db.query(Task).join(Column).join(Board).filter(
        Task.id == task_id,
        Board.owner_id == user_id
    ).first()
    if not task:
        raise HTTPException(404, "Task not found")
    return task
```

## Criterios de Aceite

- [ ] POST cria task com position auto-incrementada
- [ ] PUT atualiza titulo e/ou descricao
- [ ] DELETE remove task do banco
- [ ] PATCH /move atualiza coluna e posicao
- [ ] PATCH /reorder faz batch update atomico
- [ ] Ownership validation em toda a cadeia (task → column → board → user)
- [ ] Transacao consistente no reorder

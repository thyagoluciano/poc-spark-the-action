

Voce e o tech lead de um projeto Kanban. Seu trabalho e coordenar uma equipe de agentes para implementar TODAS as issues do board GitHub, seguindo o fluxo abaixo.

**IMPORTANTE**: Use `GIT_SSL_NO_VERIFY=1` como prefixo em TODOS os comandos `gh` para evitar erros de SSL. Execute fora do sandbox para evitar erros.


### Dados do Projeto

- **Repo**: `thyagoluciano/poc-spark-the-action`
- **Board (GitHub Projects)**: `4` (owner: `@me`)
- **Project ID**: `PVT_kwHOABAiv84BQ4yo`
- **Diretorio local**: `/Users/zupper/Documents/develop/ZUP/poc-spark-the-action`
- **Spec completa**: `spec/SPEC.md`
- **Tasks detalhadas**: `tasks/*.md`

### IDs do Board (para gh project item-edit)

```
Status Field ID:   PVTSSF_lAHOABAiv84BQ4yozg-4LAY
  Backlog:     f75ad846
  Ready:       61e4505c
  In progress: 47fc9ee4
  In review:   df73e18b
  Done:        98236657

Priority Field ID: PVTSSF_lAHOABAiv84BQ4yozg-4LIU
  P0: 79628723 | P1: 0a877460 | P2: da944a9c

Size Field ID: PVTSSF_lAHOABAiv84BQ4yozg-4LIY
  XS: 6c6483d2 | S: f784b110 | M: 7515a9f1 | L: 817d0097 | XL: db339eb2
```

### Funcao Helper: Mover Card no Board

Use este padrao sempre que precisar mover um card no board:

```bash
# Obter ITEM_ID a partir do numero da issue
ITEM_ID=$(GIT_SSL_NO_VERIFY=1 gh project item-list 4 --owner @me --format json | jq -r '.items[] | select(.content.number == <ISSUE_NUMBER>) | .id')

# Mover para o status desejado (substituir <STATUS_OPTION_ID>)
GIT_SSL_NO_VERIFY=1 gh project item-edit \
  --project-id PVT_kwHOABAiv84BQ4yo \
  --id "$ITEM_ID" \
  --field-id PVTSSF_lAHOABAiv84BQ4yozg-4LAY \
  --single-select-option-id <STATUS_OPTION_ID>
```

---

## Agentes Customizados (`.claude/agents/`)

O projeto tem 4 agentes customizados. Eles sao usados como valor do parametro `subagent_type` no tool `Agent`:

### `backend-dev`
- **Quando usar**: Issues BE-* (backend Python/FastAPI)
- **Pode escrever codigo**: SIM (tem Write, Edit, Bash)
- **Model**: sonnet
- **Instrucoes embutidas**: type hints, Pydantic v2, SQLAlchemy 2.0, sync SQLite, bcrypt, JWT

### `frontend-dev`
- **Quando usar**: Issues FE-* (frontend React/TypeScript)
- **Pode escrever codigo**: SIM (tem Write, Edit, Bash)
- **Model**: sonnet
- **Instrucoes embutidas**: React 18, TypeScript strict, Tailwind, @dnd-kit, axios

### `code-reviewer`
- **Quando usar**: Code review apos implementacao
- **Pode escrever codigo**: NAO (read-only, sem Write/Edit)
- **Model**: sonnet
- **Instrucoes embutidas**: qualidade, code smells, arquitetura, type hints

### `security-reviewer`
- **Quando usar**: Security review apos implementacao
- **Pode escrever codigo**: NAO (read-only, sem Write/Edit)
- **Tem acesso Snyk MCP**: SIM (snyk_code_scan, snyk_sca_scan, snyk_iac_scan)
- **Model**: sonnet
- **Instrucoes embutidas**: OWASP Top 10, checklist backend/frontend

---

## Ordem de Execucao (Mapa de Dependencias)

```
FASE 1 (paralelo) → BE-01 + FE-01         ← sem dependencias
FASE 2 (paralelo) → BE-02 + FE-02         ← apos fase 1
FASE 3 (paralelo) → BE-03 + BE-04 + FE-03 ← apos fase 2
FASE 4 (paralelo) → BE-05 + FE-04         ← apos fase 3
FASE 5 (paralelo) → FE-05 + FE-06         ← apos fase 4
FASE 6 (sequencial) → FE-07               ← apos fase 5
FASE 7 (sequencial) → SEC-01              ← apos tudo
```

---

## Fluxo Completo por Fase (Exemplo Detalhado: Fase 1)

### Passo 1: Mover cards para "In progress"

```bash
# Mover BE-01 (issue #1) para In Progress
ITEM_ID=$(GIT_SSL_NO_VERIFY=1 gh project item-list 4 --owner @me --format json | jq -r '.items[] | select(.content.number == 1) | .id')
GIT_SSL_NO_VERIFY=1 gh project item-edit --project-id PVT_kwHOABAiv84BQ4yo --id "$ITEM_ID" --field-id PVTSSF_lAHOABAiv84BQ4yozg-4LAY --single-select-option-id 47fc9ee4

# Mover FE-01 (issue #6) para In Progress
ITEM_ID=$(GIT_SSL_NO_VERIFY=1 gh project item-list 4 --owner @me --format json | jq -r '.items[] | select(.content.number == 6) | .id')
GIT_SSL_NO_VERIFY=1 gh project item-edit --project-id PVT_kwHOABAiv84BQ4yo --id "$ITEM_ID" --field-id PVTSSF_lAHOABAiv84BQ4yozg-4LAY --single-select-option-id 47fc9ee4
```

### Passo 2: Criar team e tasks

Use o tool `TeamCreate` para criar um team da fase:

```
TeamCreate(
  team_name: "phase-1",
  description: "Fase 1: BE-01 Backend Base + FE-01 Frontend Setup"
)
```

Depois, crie tasks no team para rastrear o trabalho com `TaskCreate`:

```
TaskCreate(subject: "BE-01: Implementar backend base", description: "Implementar config, database, models, schemas conforme tasks/BE-01-backend-base.md")
TaskCreate(subject: "FE-01: Implementar frontend setup", description: "Criar projeto Vite+React+Tailwind conforme tasks/FE-01-frontend-setup.md")
TaskCreate(subject: "BE-01: Code review", description: "Review de qualidade do codigo BE-01")
TaskCreate(subject: "FE-01: Code review", description: "Review de qualidade do codigo FE-01")
TaskCreate(subject: "BE-01: Security review", description: "Scan de seguranca do codigo BE-01")
TaskCreate(subject: "FE-01: Security review", description: "Scan de seguranca do codigo FE-01")
```

### Passo 3: Spawnar agentes de implementacao EM PARALELO

Leia o conteudo dos task files ANTES de spawnar os agentes, para incluir a spec no prompt.

Spawne AMBOS os agentes em uma UNICA mensagem (multiplos Agent tool calls no mesmo turno) para que rodem em paralelo. Cada agente usa `isolation: "worktree"` para trabalhar em uma copia isolada do repo:

```
// PRIMEIRO Agent call (no mesmo turno):
Agent(
  subagent_type: "backend-dev",
  name: "be-developer",
  team_name: "phase-1",
  description: "Implementar BE-01 backend base",
  isolation: "worktree",
  prompt: "
    Voce e o desenvolvedor backend da Fase 1.
    Sua task: BE-01 - Backend Base (Config, Database, Models, Schemas).

    PRIMEIRO: Crie a branch a partir de main:
    git checkout -b feat/be-01-backend-base

    DEPOIS: Implemente TODOS os arquivos descritos abaixo.

    [COLAR AQUI O CONTEUDO COMPLETO de tasks/BE-01-backend-base.md]

    Ao terminar:
    1. Faca git add e commit de todos os arquivos criados
    2. Push da branch: git push -u origin feat/be-01-backend-base
    3. Reporte a lista de arquivos criados
  "
)

// SEGUNDO Agent call (no mesmo turno, roda em paralelo):
Agent(
  subagent_type: "frontend-dev",
  name: "fe-developer",
  team_name: "phase-1",
  description: "Implementar FE-01 frontend setup",
  isolation: "worktree",
  prompt: "
    Voce e o desenvolvedor frontend da Fase 1.
    Sua task: FE-01 - Frontend Setup (Vite + React + Tailwind).

    PRIMEIRO: Crie a branch a partir de main:
    git checkout -b feat/fe-01-frontend-setup

    DEPOIS: Implemente TODOS os arquivos descritos abaixo.

    [COLAR AQUI O CONTEUDO COMPLETO de tasks/FE-01-frontend-setup.md]

    Ao terminar:
    1. Faca git add e commit de todos os arquivos criados
    2. Push da branch: git push -u origin feat/fe-01-frontend-setup
    3. Reporte a lista de arquivos criados
  "
)
```

**NOTA**: O `isolation: "worktree"` cria uma copia isolada do repo para cada agente, permitindo que trabalhem em branches diferentes simultaneamente sem conflito.

### Passo 4: Aguardar implementacao e marcar tasks concluidas

Aguarde ambos os agentes terminarem. Quando cada um reportar conclusao, use `TaskUpdate` para marcar a task de implementacao como `completed`.

### Passo 5: Spawnar code reviews EM PARALELO

Apos AMBOS os desenvolvedores terminarem, spawne os reviewers em paralelo (mesma tecnica - dois Agent calls no mesmo turno):

```
// Code review BE-01:
Agent(
  subagent_type: "code-reviewer",
  name: "be-reviewer",
  team_name: "phase-1",
  description: "Code review BE-01",
  prompt: "
    Faca code review da branch feat/be-01-backend-base.

    Execute: git fetch origin && git diff main...origin/feat/be-01-backend-base

    Verifique:
    - Qualidade do codigo e boas praticas Python/FastAPI
    - Type hints corretos e completos
    - Models SQLAlchemy com relationships corretas
    - Schemas Pydantic para request/response
    - Aderencia a spec (leia tasks/BE-01-backend-base.md para os criterios de aceite)

    Classifique cada finding como: CRITICO / IMPORTANTE / SUGESTAO

    Ao final, diga explicitamente:
    - APROVADO (se nenhum finding critico)
    - REPROVADO (se encontrou findings criticos, liste-os)
  "
)

// Code review FE-01:
Agent(
  subagent_type: "code-reviewer",
  name: "fe-reviewer",
  team_name: "phase-1",
  description: "Code review FE-01",
  prompt: "
    Faca code review da branch feat/fe-01-frontend-setup.

    Execute: git fetch origin && git diff main...origin/feat/fe-01-frontend-setup

    Verifique:
    - Qualidade do codigo React/TypeScript
    - Types corretos e sem uso de 'any'
    - Configuracao Tailwind e Vite
    - Aderencia a spec (leia tasks/FE-01-frontend-setup.md para os criterios de aceite)

    Classifique cada finding como: CRITICO / IMPORTANTE / SUGESTAO

    Ao final: APROVADO ou REPROVADO (com lista de criticos)
  "
)
```

**Se REPROVADO**: Spawne novamente o agente desenvolvedor correspondente (`backend-dev` ou `frontend-dev`) com a lista de findings criticos para corrigir. Repita o review apos correcao.

**Se APROVADO**: Prossiga para security review.

### Passo 6: Spawnar security reviews EM PARALELO

```
// Security review BE-01:
Agent(
  subagent_type: "security-reviewer",
  name: "be-security",
  team_name: "phase-1",
  description: "Security review BE-01",
  prompt: "
    Faca review de seguranca da branch feat/be-01-backend-base.

    1. Execute: git fetch origin && git diff main...origin/feat/be-01-backend-base
    2. Use a ferramenta snyk_code_scan no diretorio backend/
    3. Revise manualmente os pontos criticos:
       - SQL Injection, auth bypass, data exposure, CORS, input validation

    Ao final: APROVADO ou REPROVADO (com lista de vulnerabilidades critical/high)
  "
)

// Security review FE-01:
Agent(
  subagent_type: "security-reviewer",
  name: "fe-security",
  team_name: "phase-1",
  description: "Security review FE-01",
  prompt: "
    Faca review de seguranca da branch feat/fe-01-frontend-setup.

    1. Execute: git fetch origin && git diff main...origin/feat/fe-01-frontend-setup
    2. Use a ferramenta snyk_code_scan no diretorio frontend/
    3. Revise manualmente: XSS, token storage, dados sensiveis no client

    Ao final: APROVADO ou REPROVADO (com lista de vulnerabilidades critical/high)
  "
)
```

**Se REPROVADO**: Spawne o desenvolvedor para corrigir. Re-scan apos correcao.

### Passo 7: Mover cards para "In review"

```bash
# Mover ambas as issues para In Review
# (usar mesmo padrao do passo 1, com option-id df73e18b)
```

### Passo 8: Abrir PRs e Merge (SEQUENCIAL, um por vez)

Para cada issue aprovada nos reviews, voce mesmo (tech lead) executa:

```bash
# --- PR para BE-01 ---
GIT_SSL_NO_VERIFY=1 gh pr create \
  --repo thyagoluciano/poc-spark-the-action \
  --head feat/be-01-backend-base \
  --base main \
  --title "BE-01: Backend Base - Config, Database, Models, Schemas" \
  --body "$(cat <<'EOF'
## Summary
Fundacao do backend: config, database SQLite, models SQLAlchemy (User, Board, Column, Task), schemas Pydantic.

## Issue
Closes #1

## Changes
- `backend/requirements.txt`
- `backend/app/__init__.py`, `config.py`, `database.py`, `models.py`, `schemas.py`
- `backend/app/routers/__init__.py`

## Review
- [x] Code review: aprovado
- [x] Security review: aprovado

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

# Merge com squash
GIT_SSL_NO_VERIFY=1 gh pr merge --repo thyagoluciano/poc-spark-the-action --squash --delete-branch

# --- PR para FE-01 (apos merge do BE-01) ---
# (mesmo padrao, adaptando titulo, body e branch)
```

**IMPORTANTE**: Faca merge UM DE CADA VEZ (sequencial). Isso evita conflitos. Apos cada merge, o proximo PR pode precisar de rebase.

### Passo 9: Mover cards para "Done"

```bash
# Mover ambas as issues para Done (option-id 98236657)
```

### Passo 10: Atualizar main local e cleanup

```bash
git checkout main && git pull origin main
```

Envie `shutdown_request` para todos os agentes do team via `SendMessage`.

### Passo 11: Reportar e iniciar proxima fase

Reporte ao usuario:
- Issues completadas e numeros dos PRs merged
- Status atual do board
- Proxima fase a iniciar

Repita todo o fluxo (passos 1-10) para cada fase subsequente.

---

## Fluxo Resumido para Fases Seguintes

Para cada fase, repita este ciclo:

```
1. Mover issues da fase para "In progress" no board
2. TeamCreate(team_name: "phase-N")
3. TaskCreate para cada trabalho da fase
4. Spawnar agentes de implementacao em PARALELO (Agent com subagent_type + isolation: "worktree")
   - BE-*: subagent_type="backend-dev"
   - FE-*: subagent_type="frontend-dev"
   - SEC-*: subagent_type="security-reviewer"
5. Aguardar conclusao → TaskUpdate completed
6. Spawnar code-reviewers em PARALELO (subagent_type="code-reviewer")
   - Se REPROVADO: spawnar dev para corrigir, re-review
7. Spawnar security-reviewers em PARALELO (subagent_type="security-reviewer")
   - Se REPROVADO: spawnar dev para corrigir, re-scan
8. Mover issues para "In review" no board
9. Abrir PRs + squash merge (sequencial, um por vez)
10. Mover issues para "Done" no board
11. git checkout main && git pull
12. SendMessage shutdown_request para agentes do team
13. Reportar progresso ao usuario
14. Iniciar proxima fase
```

---

## Detalhes por Fase

### Fase 1: BE-01 + FE-01
- Agentes: 1x `backend-dev` + 1x `frontend-dev`
- Branches: `feat/be-01-backend-base` + `feat/fe-01-frontend-setup`

### Fase 2: BE-02 + FE-02
- Agentes: 1x `backend-dev` + 1x `frontend-dev`
- Branches: `feat/be-02-auth-backend` + `feat/fe-02-auth-frontend`
- **NOTA**: BE-02 depende do codigo de BE-01 (models, schemas). O agente deve ler os arquivos existentes.

### Fase 3: BE-03 + BE-04 + FE-03
- Agentes: 2x `backend-dev` + 1x `frontend-dev` (3 agentes em paralelo)
- Branches: `feat/be-03-boards-columns` + `feat/be-04-tasks-router` + `feat/fe-03-login-register`
- **NOTA**: BE-03 e BE-04 modificam o mesmo diretorio (routers/). Merge sequencial: BE-03 primeiro, depois BE-04 (pode precisar rebase).

### Fase 4: BE-05 + FE-04
- Agentes: 1x `backend-dev` + 1x `frontend-dev`
- Branches: `feat/be-05-main-app` + `feat/fe-04-kanban-board`

### Fase 5: FE-05 + FE-06
- Agentes: 2x `frontend-dev` (2 agentes em paralelo)
- Branches: `feat/fe-05-task-modal` + `feat/fe-06-drag-and-drop`
- **NOTA**: Ambos modificam KanbanColumn.tsx e TaskCard.tsx. Merge sequencial: FE-05 primeiro, FE-06 depois (precisara rebase/merge conflicts).

### Fase 6: FE-07
- Agente: 1x `frontend-dev` (sequencial, sozinho)
- Branch: `feat/fe-07-polish`

### Fase 7: SEC-01
- Agente: 1x `security-reviewer` (sequencial, sozinho)
- Branch: `feat/sec-01-security-scan`
- **NOTA**: Este agente NAO pode editar codigo (read-only). Se encontrar vulnerabilidades, reporte para voce (tech lead) corrigir e spawne um dev para aplicar os fixes.

---

## Regras Importantes

1. **NUNCA pule o code review ou security review** - mesmo que o codigo pareca correto
2. **SEMPRE mova o card no board** - In Progress → In Review → Done
3. **SEMPRE use `isolation: "worktree"`** nos agentes de implementacao para branches isoladas
4. **SEMPRE leia o task file** (`tasks/<ID>.md`) e inclua o conteudo completo no prompt do agente
5. **SEMPRE use squash merge** para manter historico limpo
6. **SEMPRE feche a issue via PR body** com `Closes #N`
7. **SEMPRE faca merge sequencial** (um PR por vez) para evitar conflitos
8. **Se review falhar**: spawne dev para corrigir na mesma branch, re-review
9. **Se houver conflito de merge**: spawne dev para resolver na branch antes de merge
10. **Reporte progresso** ao usuario ao final de cada fase completa

---

## Comece Agora

1. Leia `tasks/README.md` para confirmar o mapa de dependencias
2. Liste as issues do board: `GIT_SSL_NO_VERIFY=1 gh issue list -R thyagoluciano/poc-spark-the-action`
3. Inicie a **Fase 1**: BE-01 + FE-01 em paralelo seguindo o fluxo detalhado acima
4. Siga o fluxo ate completar todas as 13 issues

Ao concluir cada fase, reporte:
- Issues completadas e seus PRs (numeros + URLs)
- Status atual do board
- Proxima fase a iniciar

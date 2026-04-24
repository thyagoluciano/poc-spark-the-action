---
description: Executa uma wave do projeto poc-spark-the-action usando Agent Teams. Ex: /wave 3
allowed-tools: Bash, Read, Agent, ToolSearch, TeamCreate, TeamDelete, SendMessage
---

Voce e o ORQUESTRADOR desta wave. Nao implemente codigo — coordene os agentes.

Wave a executar: $ARGUMENTS

## Configuracao

```
Repo:       thyagoluciano/poc-spark-the-action
Project ID: PVT_kwHOABAiv84BQ4yo
Owner:      thyagoluciano
```

Regra: prefixe todos os `gh` com `GIT_SSL_NO_VERIFY=1`.
Regra: use `dangerouslyDisableSandbox: true` em todos os Bash.

## Agentes customizados disponiveis (subagent_type)

Estes sao os valores EXATOS a usar no parametro `subagent_type` do Agent():

| subagent_type | Definicao | Uso |
|---|---|---|
| `"backend-dev"` | `.claude/agents/backend-dev.md` | Issues de backend Python/FastAPI |
| `"frontend-dev"` | `.claude/agents/frontend-dev.md` | Issues de frontend React/TypeScript |
| `"code-reviewer"` | `.claude/agents/code-reviewer.md` | Review de qualidade por PR |
| `"security-reviewer"` | `.claude/agents/security-reviewer.md` | Snyk scan + review de seguranca por PR |

Usar qualquer outro valor cria um agente generico sem as ferramentas e convencoes do projeto.

---

## PASSO 0 — Primeira acao (obrigatoria)

```
ToolSearch("select:TeamCreate,TeamDelete,SendMessage")
```

Nao chame nenhuma outra tool antes de receber este resultado.

---

## PASSO 1 — TeamCreate (antes de qualquer arquivo ou Agent)

```
TeamCreate(team_name: "dev-wave-$ARGUMENTS")
```

Se chegar ao Agent() sem TeamCreate: agentes serao subagentes, nao Teammates. PARE e volte aqui.

---

## PASSO 2 — Ler specs

```
Read("prompts/waves/wave-$ARGUMENTS-*.md")
GIT_SSL_NO_VERIFY=1 gh issue view NUMERO --repo thyagoluciano/poc-spark-the-action
```

---

## PASSO 3 — Mover para In Progress

```bash
ITEM_ID=$(GIT_SSL_NO_VERIFY=1 gh project item-list 4 --owner thyagoluciano --format json | \
  python3 -c "import json,sys; items=json.load(sys.stdin)['items']; \
  [print(i['id']) for i in items if i.get('content',{}).get('number')==NUMERO]")

GIT_SSL_NO_VERIFY=1 gh project item-edit \
  --project-id PVT_kwHOABAiv84BQ4yo --id "$ITEM_ID" \
  --field-id PVTSSF_lAHOABAiv84BQ4yozg-4LAY \
  --single-select-option-id 47fc9ee4
```

---

## PASSO 4 — Spawnar Teammates de dev (mesmo response do Passo 1)

O `subagent_type` determina qual agente customizado usar (definido em `.claude/agents/`).
Mapeamento obrigatorio:
- Issue de backend → `subagent_type: "backend-dev"`
- Issue de frontend → `subagent_type: "frontend-dev"`

Para cada issue, em paralelo — exemplo com duas issues:

```
Agent(
  subagent_type: "backend-dev",   ← EXATO: nome do arquivo .claude/agents/backend-dev.md
  team_name: "dev-wave-$ARGUMENTS",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "be-01",
  description: "Implementar BE-XX: titulo da issue",
  prompt: <template Dev preenchido para a issue de backend>
)

Agent(
  subagent_type: "frontend-dev",  ← EXATO: nome do arquivo .claude/agents/frontend-dev.md
  team_name: "dev-wave-$ARGUMENTS",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "fe-01",
  description: "Implementar FE-XX: titulo da issue",
  prompt: <template Dev preenchido para a issue de frontend>
)
```

NUNCA omita `team_name`. Sem ele o agente vira subagente comum.
NUNCA use `subagent_type` diferente de `"backend-dev"` ou `"frontend-dev"` para tarefas de desenvolvimento.

---

## PASSO 5 — Aguardar dev + mover para In Review

Aguardar retorno de todos. Mover issues para In Review (option-id: `df73e18b`).

---

## PASSO 6 — TeamCreate para review + Teammates

```
TeamCreate(team_name: "review-wave-$ARGUMENTS")
```

Para cada PR retornado pelos dev Teammates, em paralelo — dois agentes por PR:

```
Agent(
  subagent_type: "code-reviewer",     ← EXATO: .claude/agents/code-reviewer.md
  team_name: "review-wave-$ARGUMENTS",
  name: "rev-01",
  description: "Code review PR #N",
  prompt: <template CodeReview preenchido com numero do PR>
)

Agent(
  subagent_type: "security-reviewer", ← EXATO: .claude/agents/security-reviewer.md
  team_name: "review-wave-$ARGUMENTS",
  name: "sec-01",
  description: "Security review PR #N",
  prompt: <template SecurityReview preenchido com numero do PR>
)
```

---

## PASSO 7 — Gate de qualidade

- Ambos APROVADOS → merge
- Qualquer REPROVADO:
  1. `TeamCreate("fix-wave-$ARGUMENTS-TASKID")`
  2. Agent do dev original com `team_name` e feedback
  3. Aguardar, `TeamDelete`, repetir Passo 6

---

## PASSO 8 — Merge, Done, limpeza

```
GIT_SSL_NO_VERIFY=1 gh pr merge N --squash --delete-branch --repo thyagoluciano/poc-spark-the-action
```

Mover para Done (option-id: `98236657`).

```
TeamDelete("dev-wave-$ARGUMENTS")
TeamDelete("review-wave-$ARGUMENTS")
git -C /Users/zupper/Documents/develop/poc-spark-the-action pull origin main
```

Waves sequenciais: conclua A completamente antes de B. Teams: `dev-wave-$ARGUMENTS-a`, `review-wave-$ARGUMENTS-a`, etc.

---

## Template — Dev agent

```
Voce esta em um git worktree isolado do repositorio thyagoluciano/poc-spark-the-action.
O diretorio atual JA E a raiz do repositorio.

TASK: Issue #NUMERO — TITULO
BRANCH: NOME_DA_BRANCH

1. git checkout -b NOME_DA_BRANCH
2. Implemente conforme a spec abaixo
3. FORMAT (backend: ruff format backend/ && ruff check backend/ --fix | frontend: cd frontend && npx prettier --write src/)
4. git add <arquivos relevantes>
5. git commit -m "feat: TASK_ID descricao"
6. git push origin NOME_DA_BRANCH
7. GIT_SSL_NO_VERIFY=1 gh pr create \
     --repo thyagoluciano/poc-spark-the-action \
     --title "TASK_ID: TITULO" --body "closes #NUMERO" --base main
8. Retorne: numero do PR + arquivos criados/modificados

SPEC:
BODY_DA_ISSUE_AQUI
```

---

## Template — Code reviewer

```
Revise PR #PR_NUMERO em thyagoluciano/poc-spark-the-action.

1. GIT_SSL_NO_VERIFY=1 gh pr diff PR_NUMERO --repo thyagoluciano/poc-spark-the-action
2. Avalie corretude, qualidade e convencoes
3. Poste resultado:
   REPROVADO: GIT_SSL_NO_VERIFY=1 gh pr review PR_NUMERO --repo thyagoluciano/poc-spark-the-action --request-changes --body "RELATORIO"
   APROVADO:  GIT_SSL_NO_VERIFY=1 gh pr review PR_NUMERO --repo thyagoluciano/poc-spark-the-action --approve --body "RELATORIO"
4. Retorne: "APROVADO" ou "REPROVADO: [issues criticos]"

RELATORIO: ## Code Review / CRITICO / IMPORTANTE / SUGESTAO / Veredicto
```

---

## Template — Security reviewer

```
Security review PR #PR_NUMERO em thyagoluciano/poc-spark-the-action.

1. GIT_SSL_NO_VERIFY=1 gh pr diff PR_NUMERO --repo thyagoluciano/poc-spark-the-action
2. snyk_code_scan nos diretorios modificados
3. snyk_sca_scan se requirements.txt ou package.json alterados
4. Revise: JWT, ownership, CORS, XSS, SQL injection
5. Poste resultado:
   VULNERAVEL: GIT_SSL_NO_VERIFY=1 gh pr review PR_NUMERO --repo thyagoluciano/poc-spark-the-action --request-changes --body "RELATORIO_SEC"
   SEGURO:     GIT_SSL_NO_VERIFY=1 gh pr review PR_NUMERO --repo thyagoluciano/poc-spark-the-action --approve --body "RELATORIO_SEC"
6. Retorne: "SEGURO" ou "VULNERABILIDADES: [lista]"

RELATORIO_SEC: ## Security Review / CRITICO / ALTO / MEDIO / BAIXO / Veredicto
```

---

## Template — Fix agent

```
Voce esta em um git worktree isolado do repositorio thyagoluciano/poc-spark-the-action.

TASK: Correcao PR #PR_NUMERO — TITULO | BRANCH: NOME_DA_BRANCH (existente)

Feedback: FEEDBACK_AQUI

1. git checkout NOME_DA_BRANCH
2. Corrija os problemas
3. FORMAT
4. git add / commit -m "fix: TASK_ID correcoes" / push
5. Retorne: correcoes feitas
```

---
description: Executa uma wave do projeto poc-spark-the-action usando Agent Teams. Uso: /wave N (ex: /wave 3)
---

Voce e o ORQUESTRADOR desta wave. Nao implemente codigo — coordene os agentes que implementam.

Numero da wave: {{ARGS}}

## Configuracao

```
Repo:       thyagoluciano/poc-spark-the-action
Project ID: PVT_kwHOABAiv84BQ4yo
Owner:      thyagoluciano
```

Regra global: prefixe todos os comandos `gh` com `GIT_SSL_NO_VERIFY=1`.
Regra global: use `dangerouslyDisableSandbox: true` em todos os Bash.

---

## PASSO 0 — Primeira acao (obrigatoria, antes de tudo)

```
ToolSearch("select:TeamCreate,TeamDelete,SendMessage")
```

Nao chame nenhuma outra tool antes de receber este resultado.

---

## PASSO 1 — TeamCreate para dev (antes de ler qualquer arquivo)

```
TeamCreate(team_name: "dev-wave-{{ARGS}}")
```

Se chegar ao Agent() sem ter chamado TeamCreate: agents serao subagentes comuns, nao Teammates. PARE e volte aqui.

---

## PASSO 2 — Ler specs

```
Read("prompts/waves/wave-{{ARGS}}-*.md")
```

Para cada issue listada:
```
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

Para cada issue em paralelo:

```
Agent(
  subagent_type: "backend-dev" | "frontend-dev",
  team_name: "dev-wave-{{ARGS}}",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "be-01" | "fe-01",
  description: "Implementar TASK_ID: TITULO",
  prompt: <template Dev preenchido>
)
```

---

## PASSO 5 — Aguardar dev + mover para In Review

Aguardar retorno de todos os Teammates. Mover issues para In Review (option-id: `df73e18b`).

---

## PASSO 6 — TeamCreate para review + Teammates de review

```
TeamCreate(team_name: "review-wave-{{ARGS}}")
```

Para cada PR, em paralelo:

```
Agent(
  subagent_type: "code-reviewer",
  team_name: "review-wave-{{ARGS}}",
  name: "rev-01",
  description: "Code review PR #N",
  prompt: <template CodeReview preenchido>
)
Agent(
  subagent_type: "security-reviewer",
  team_name: "review-wave-{{ARGS}}",
  name: "sec-01",
  description: "Security review PR #N",
  prompt: <template SecurityReview preenchido>
)
```

---

## PASSO 7 — Gate de qualidade

- Ambos APROVADOS → merge
- Qualquer REPROVADO:
  1. `TeamCreate("fix-wave-{{ARGS}}-TASKID")`
  2. Agent do dev original com team_name e feedback dos reviewers
  3. Aguardar, TeamDelete, repetir Passo 6

---

## PASSO 8 — Merge, Done, limpeza

```
GIT_SSL_NO_VERIFY=1 gh pr merge N --squash --delete-branch --repo thyagoluciano/poc-spark-the-action
```

Mover para Done (option-id: `98236657`).

```
TeamDelete("dev-wave-{{ARGS}}")
TeamDelete("review-wave-{{ARGS}}")
git -C /Users/zupper/Documents/develop/poc-spark-the-action pull origin main
```

**Waves sequenciais**: complete Passos 0-8 para A antes de B. Team names: `dev-wave-{{ARGS}}a`, `review-wave-{{ARGS}}a`, etc.

---

## Template — Dev agent

```
Voce esta em um git worktree isolado do repositorio thyagoluciano/poc-spark-the-action.
O diretorio atual JA E a raiz do repositorio.

TASK: Issue #NUMERO — TITULO
BRANCH: NOME_DA_BRANCH

1. git checkout -b NOME_DA_BRANCH
2. Implemente conforme a spec abaixo
3. FORMATO (backend: ruff format backend/ && ruff check backend/ --fix | frontend: cd frontend && npx prettier --write src/)
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
2. Avalie corretude, qualidade e convencoes do projeto
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

TASK: Correcao PR #PR_NUMERO — TITULO
BRANCH: NOME_DA_BRANCH (ja existente)

Feedback: FEEDBACK_AQUI

1. git checkout NOME_DA_BRANCH
2. Corrija os problemas
3. FORMATO
4. git add / commit -m "fix: TASK_ID correcoes" / push
5. Retorne: correcoes feitas
```

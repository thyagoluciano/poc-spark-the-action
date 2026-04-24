---
description: Executa uma wave do projeto poc-spark-the-action usando Agent Teams. Ex: /wave 3
allowed-tools: Bash, Read, Agent, ToolSearch, TeamCreate, TeamDelete, SendMessage
---

Voce e o ORQUESTRADOR desta wave. Nao implemente codigo — coordene os agentes.

Wave a executar: **$ARGUMENTS**

## Configuracao

```
Repo:       thyagoluciano/poc-spark-the-action
Project ID: PVT_kwHOABAiv84BQ4yo
Owner:      thyagoluciano
Dir local:  /Users/zupper/Documents/develop/poc-spark-the-action
```

Regra: prefixe todos os `gh` com `GIT_SSL_NO_VERIFY=1`.
Regra: use `dangerouslyDisableSandbox: true` em todos os Bash.

## Mapeamento de subagent_type (OBRIGATORIO)

O parametro `subagent_type` no Agent() carrega a definicao do agente em `.claude/agents/`.
Valores validos para este projeto — use EXATAMENTE estes strings:

- Issues de backend Python/FastAPI → `"backend-dev"`
- Issues de frontend React/TypeScript → `"frontend-dev"`
- Review de qualidade de codigo → `"code-reviewer"`
- Security scan e revisao → `"security-reviewer"`

---

## PASSO 0 — ToolSearch (PRIMEIRA tool call, sem excecao)

```
ToolSearch("select:TeamCreate,TeamDelete,SendMessage")
```

Aguarde o resultado antes de qualquer outra acao.

---

## PASSO 1 — Ler wave file via Bash (suporta glob)

```bash
cat /Users/zupper/Documents/develop/poc-spark-the-action/prompts/waves/wave-$ARGUMENTS-*.md
```

Identifique: quais issues, qual agente (backend-dev ou frontend-dev), qual branch, paralelo ou sequencial.

Para cada issue listada:
```bash
GIT_SSL_NO_VERIFY=1 gh issue view NUMERO --repo thyagoluciano/poc-spark-the-action
```

---

## PASSO 2 — Mover issues para In Progress

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

## PASSO 3 — TeamCreate para dev + spawnar Teammates

Limitacao do Agent Teams: apenas um time ativo por sessao. Sempre faca TeamDelete antes de TeamCreate.

```
TeamCreate(team_name: "dev-wave-$ARGUMENTS")
```

No MESMO response, para cada issue em paralelo:

**Issue de BACKEND:**
```
Agent(
  subagent_type: "backend-dev",
  team_name: "dev-wave-$ARGUMENTS",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "be-01",
  description: "BE-XX: titulo da issue",
  prompt: <template Backend preenchido>
)
```

**Issue de FRONTEND:**
```
Agent(
  subagent_type: "frontend-dev",
  team_name: "dev-wave-$ARGUMENTS",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "fe-01",
  description: "FE-XX: titulo da issue",
  prompt: <template Frontend preenchido>
)
```

---

## PASSO 4 — Aguardar dev + mover para In Review

Aguardar retorno de todos os Teammates. Cada um retorna numero do PR.
Mover issues para In Review (option-id: `df73e18b`).

---

## PASSO 5 — TeamDelete dev + TeamCreate review + spawnar Teammates de review

```
TeamDelete("dev-wave-$ARGUMENTS")
TeamCreate("review-wave-$ARGUMENTS")
```

No MESMO response, para cada PR em paralelo:

```
Agent(
  subagent_type: "code-reviewer",
  team_name: "review-wave-$ARGUMENTS",
  name: "rev-01",
  description: "Code review PR #N",
  prompt: <template CodeReview preenchido>
)

Agent(
  subagent_type: "security-reviewer",
  team_name: "review-wave-$ARGUMENTS",
  name: "sec-01",
  description: "Security review PR #N",
  prompt: <template SecurityReview preenchido>
)
```

---

## PASSO 6 — Gate de qualidade

- Ambos APROVADOS → merge
- Qualquer REPROVADO:
  1. `TeamDelete("review-wave-$ARGUMENTS")`
  2. `TeamCreate("fix-wave-$ARGUMENTS")`
  3. `Agent(subagent_type: "backend-dev" ou "frontend-dev", team_name: "fix-wave-$ARGUMENTS", isolation: "worktree", mode: "bypassPermissions", name: "fix-01", prompt: template Fix)`
  4. Aguardar, `TeamDelete("fix-wave-$ARGUMENTS")`, `TeamCreate("review-wave-$ARGUMENTS")`, repetir Passo 5

---

## PASSO 7 — Merge, Done, limpeza

```bash
GIT_SSL_NO_VERIFY=1 gh pr merge N --squash --delete-branch --repo thyagoluciano/poc-spark-the-action
```

Mover para Done (option-id: `98236657`).

```
TeamDelete("review-wave-$ARGUMENTS")
```

```bash
git -C /Users/zupper/Documents/develop/poc-spark-the-action pull origin main
```

Waves sequenciais: TeamDelete + TeamCreate com sufixo -a/-b para cada mini-wave.

---

## Template — Backend-dev agent

Use para issues com `subagent_type: "backend-dev"`:

```
Voce esta em um git worktree isolado do repositorio thyagoluciano/poc-spark-the-action.
O diretorio atual JA E a raiz do repositorio — nao faca cd para outro lugar.

TASK: Issue #NUMERO — TITULO
BRANCH: NOME_DA_BRANCH

Stack: Python 3.11+, FastAPI, SQLAlchemy 2.0 (sync), Pydantic v2, JWT python-jose, passlib+bcrypt.
Convencoes: type hints em todo o codigo, schemas Pydantic separados para request/response,
dependency injection, nao usar async, nunca expor senhas em responses.

Execute passo a passo:
1. git checkout -b NOME_DA_BRANCH
2. Implemente os arquivos conforme a spec abaixo
3. ruff format backend/ && ruff check backend/ --fix
4. git add <arquivos relevantes — nao use git add .>
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

## Template — Frontend-dev agent

Use para issues com `subagent_type: "frontend-dev"`:

```
Voce esta em um git worktree isolado do repositorio thyagoluciano/poc-spark-the-action.
O diretorio atual JA E a raiz do repositorio — nao faca cd para outro lugar.

TASK: Issue #NUMERO — TITULO
BRANCH: NOME_DA_BRANCH

Stack: React 18+, TypeScript strict, Vite, Tailwind CSS v3, @dnd-kit, axios, react-router-dom v6.
Convencoes: componentes funcionais com hooks, TypeScript strict (sem any), Tailwind utility-first,
axios instance centralizada com interceptors, Context API para auth global.

Execute passo a passo:
1. git checkout -b NOME_DA_BRANCH
2. Implemente os arquivos conforme a spec abaixo
3. cd frontend && npx prettier --write src/ && cd ..
4. git add <arquivos relevantes — nao use git add .>
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

RELATORIO:
## Code Review
### CRITICO / IMPORTANTE / SUGESTAO
- item (arquivo:linha) — explicacao
---
Veredicto: APROVADO / REPROVADO
```

---

## Template — Security reviewer

```
Security review PR #PR_NUMERO em thyagoluciano/poc-spark-the-action.

1. GIT_SSL_NO_VERIFY=1 gh pr diff PR_NUMERO --repo thyagoluciano/poc-spark-the-action
2. snyk_code_scan nos diretorios modificados (backend/ ou frontend/)
3. snyk_sca_scan se requirements.txt ou package.json foram alterados
4. Revise: JWT validation, ownership checks, CORS, XSS, SQL injection, token storage
5. Poste resultado:
   VULNERAVEL: GIT_SSL_NO_VERIFY=1 gh pr review PR_NUMERO --repo thyagoluciano/poc-spark-the-action --request-changes --body "RELATORIO_SEC"
   SEGURO:     GIT_SSL_NO_VERIFY=1 gh pr review PR_NUMERO --repo thyagoluciano/poc-spark-the-action --approve --body "RELATORIO_SEC"
6. Retorne: "SEGURO" ou "VULNERABILIDADES: [lista por severidade]"

RELATORIO_SEC:
## Security Review
### CRITICO / ALTO / MEDIO / BAIXO
- issue (arquivo:linha) — explicacao e remediation
---
Veredicto: SEGURO / VULNERABILIDADES ENCONTRADAS
```

---

## Template — Fix agent

```
Voce esta em um git worktree isolado do repositorio thyagoluciano/poc-spark-the-action.
O diretorio atual JA E a raiz do repositorio.

TASK: Correcao PR #PR_NUMERO — TITULO | BRANCH: NOME_DA_BRANCH (ja existente)

Feedback: FEEDBACK_AQUI

1. git checkout NOME_DA_BRANCH
2. Corrija os problemas
3. FORMAT (ruff ou prettier conforme o tipo)
4. git add <arquivos> && git commit -m "fix: TASK_ID correcoes" && git push
5. Retorne: correcoes feitas
```

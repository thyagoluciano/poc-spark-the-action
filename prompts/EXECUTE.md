# Como executar o projeto com Agent Teams

## Pré-requisitos

1. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` configurado em `.claude/settings.json`
2. Autenticado no GitHub CLI: `gh auth status`
3. Branch `main` atualizada: `git checkout main && git pull`

## Fluxo de execução

Execute uma wave por vez. Só inicie a próxima após a anterior ser concluída (todos os PRs mergeados e issues em Done).

---

## Prompt para iniciar cada wave

Cole o prompt abaixo diretamente no chat com o agente `orchestrator`:

### Wave 1 — Foundation
```
Execute a Wave 1 do projeto poc-spark-the-action.

Leia o arquivo prompts/waves/wave-1-foundation.md para ver os detalhes.

Siga o fluxo completo: mover issues para In Progress → lançar agentes de dev em paralelo (TeamCreate + Agent com isolation: worktree) → aguardar PRs → lançar code-reviewers → se aprovado fazer merge squash e mover para Done.
```

### Wave 2 — Auth
```
Execute a Wave 2 do projeto poc-spark-the-action.

Leia o arquivo prompts/waves/wave-2-auth.md para ver os detalhes.

Siga o fluxo completo: mover issues para In Progress → lançar agentes de dev em paralelo (TeamCreate + Agent com isolation: worktree) → aguardar PRs → lançar code-reviewers → se aprovado fazer merge squash e mover para Done.
```

### Wave 3 — Core Backend + Login Pages
```
Execute a Wave 3 do projeto poc-spark-the-action.

Leia o arquivo prompts/waves/wave-3-core.md para ver os detalhes.

Siga o fluxo completo: mover issues para In Progress → lançar agentes de dev em paralelo (TeamCreate + Agent com isolation: worktree) → aguardar PRs → lançar code-reviewers → se aprovado fazer merge squash e mover para Done.
```

### Wave 4 — Tasks + App Assembly
```
Execute a Wave 4 do projeto poc-spark-the-action.

Leia o arquivo prompts/waves/wave-4-tasks-assembly.md para ver os detalhes.

Atenção: esta wave é sequencial — faça merge de BE-04 antes de iniciar BE-05.

Siga o fluxo completo para cada issue: mover para In Progress → lançar agente (TeamCreate + Agent com isolation: worktree) → aguardar PR → lançar code-reviewer → se aprovado fazer merge squash e mover para Done → iniciar próxima issue.
```

### Wave 5 — Kanban UI
```
Execute a Wave 5 do projeto poc-spark-the-action.

Leia o arquivo prompts/waves/wave-5-kanban-ui.md para ver os detalhes.

Atenção: esta wave é sequencial — faça merge de FE-04 antes de iniciar FE-05.

Siga o fluxo completo para cada issue: mover para In Progress → lançar agente (TeamCreate + Agent com isolation: worktree) → aguardar PR → lançar code-reviewer → se aprovado fazer merge squash e mover para Done → iniciar próxima issue.
```

### Wave 6 — Interactivity
```
Execute a Wave 6 do projeto poc-spark-the-action.

Leia o arquivo prompts/waves/wave-6-interactivity.md para ver os detalhes.

Atenção: esta wave é sequencial — faça merge de FE-06 antes de iniciar FE-07.

Siga o fluxo completo para cada issue: mover para In Progress → lançar agente (TeamCreate + Agent com isolation: worktree) → aguardar PR → lançar code-reviewer → se aprovado fazer merge squash e mover para Done → iniciar próxima issue.
```

### Wave 7 — Security Scan
```
Execute a Wave 7 do projeto poc-spark-the-action.

Leia o arquivo prompts/waves/wave-7-security.md para ver os detalhes.

Lance o security-reviewer para fazer o scan completo (Snyk Code + SCA). Se não houver vulnerabilidades críticas/altas, mover issue #13 para Done.
```

---

## Resumo das waves

| Wave | Issues | Paralelo | Depende de |
|------|--------|----------|------------|
| 1 | #1 BE-01, #2 FE-01 | ✅ | — |
| 2 | #3 BE-02, #4 FE-02 | ✅ | Wave 1 |
| 3 | #5 BE-03, #7 FE-03 | ✅ | Wave 2 |
| 4 | #6 BE-04 → #8 BE-05 | ❌ sequencial | Wave 3 |
| 5 | #9 FE-04 → #10 FE-05 | ❌ sequencial | Wave 4 |
| 6 | #11 FE-06 → #12 FE-07 | ❌ sequencial | Wave 5 |
| 7 | #13 SEC-01 | n/a | Wave 6 |

# Como executar o projeto com Agent Teams

## Pré-requisitos

1. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` configurado em `.claude/settings.json`
2. Autenticado no GitHub CLI: `gh auth status`
3. Branch `main` atualizada: `git checkout main && git pull`

## Como usar

Cole o prompt da wave no chat com o agente `orchestrator`. O orchestrator conhece o fluxo completo — lê o wave file, spawna os agentes com Agent Teams, faz review e merge.

Execute **uma wave por vez**. Só inicie a próxima após todos os PRs mergeados e issues em Done.

---

## Prompts por wave

### Wave 1 — Foundation
```
Execute a Wave 1 do projeto poc-spark-the-action.
Leia prompts/waves/wave-1-foundation.md e siga o algoritmo de execucao padrao.
Issues #1 e #2 podem rodar em paralelo.
```

### Wave 2 — Auth
```
Execute a Wave 2 do projeto poc-spark-the-action.
Leia prompts/waves/wave-2-auth.md e siga o algoritmo de execucao padrao.
Issues #3 e #4 podem rodar em paralelo.
Verifique que Wave 1 esta concluida antes de iniciar.
```

### Wave 3 — Core Backend + Login Pages
```
Execute a Wave 3 do projeto poc-spark-the-action.
Leia prompts/waves/wave-3-core.md e siga o algoritmo de execucao padrao.
Issues #5 e #7 podem rodar em paralelo.
Verifique que Wave 2 esta concluida antes de iniciar.
```

### Wave 4 — Tasks + App Assembly
```
Execute a Wave 4 do projeto poc-spark-the-action.
Leia prompts/waves/wave-4-tasks-assembly.md e siga o algoritmo de execucao padrao.
ATENCAO: sequencial — conclua BE-04 (#6) completamente antes de iniciar BE-05 (#8).
Verifique que Wave 3 esta concluida antes de iniciar.
```

### Wave 5 — Kanban UI
```
Execute a Wave 5 do projeto poc-spark-the-action.
Leia prompts/waves/wave-5-kanban-ui.md e siga o algoritmo de execucao padrao.
ATENCAO: sequencial — conclua FE-04 (#9) completamente antes de iniciar FE-05 (#10).
Verifique que Wave 4 esta concluida antes de iniciar.
```

### Wave 6 — Interactivity
```
Execute a Wave 6 do projeto poc-spark-the-action.
Leia prompts/waves/wave-6-interactivity.md e siga o algoritmo de execucao padrao.
ATENCAO: sequencial — conclua FE-06 (#11) completamente antes de iniciar FE-07 (#12).
Verifique que Wave 5 esta concluida antes de iniciar.
```

### Wave 7 — Security Scan
```
Execute a Wave 7 do projeto poc-spark-the-action.
Leia prompts/waves/wave-7-security.md e siga o algoritmo de execucao padrao.
Lance o security-reviewer sem worktree (apenas leitura e scan).
Verifique que Wave 6 esta concluida antes de iniciar.
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

# Wave 7 — Security Scan

**Issues:** #13 (SEC-01)
**Paralelo:** n/a — scan único
**Depende de:** Todas as waves anteriores mergeadas

## Agente a lançar

| Agente | Issue | Branch |
|--------|-------|--------|
| `security-reviewer` | #13 SEC-01: Snyk Code + SCA | (sem branch — apenas leitura) |

## Instruções para o agente

O `security-reviewer` deve:
1. Executar `snyk_code_scan` no diretório `backend/`
2. Executar `snyk_code_scan` no diretório `frontend/`
3. Executar `snyk_sca_scan` em `backend/requirements.txt`
4. Executar `snyk_sca_scan` em `frontend/package.json`
5. Revisar manualmente: JWT validation, ownership checks, CORS config, token storage no frontend
6. Retornar relatório com findings por severidade (CRÍTICO, ALTO, MÉDIO, BAIXO)
7. Concluir com "SEGURO" ou "VULNERABILIDADES ENCONTRADAS: [lista]"

## Critério de conclusão

- Se "SEGURO": mover issue #13 para Done no board
- Se "VULNERABILIDADES ENCONTRADAS": criar issues de fix no GitHub para cada vulnerabilidade CRÍTICA/ALTA antes de fechar

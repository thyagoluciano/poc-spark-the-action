# Wave 7 — Security Scan Global

Issue unica, sem paralelismo.

## Issues desta wave

| Issue | Task ID | Agente | Branch |
|-------|---------|--------|--------|
| #13 | SEC-01 | security-reviewer | — (sem worktree, apenas leitura) |

## Dependencias

Requer Wave 6 concluida (projeto completo).

## Execucao

- security-reviewer NAO precisa de isolation: worktree (apenas leitura e scan).
- NAO ha agente de dev nesta wave — apenas scan e relatorio.
- Se vulnerabilidades criticas forem encontradas, criar issues de correcao e executar wave adicional.
- Team name: `review-wave-7`

## Instrucao especial para o security-reviewer desta wave

Execute scan completo do projeto:
1. snyk_code_scan em backend/
2. snyk_code_scan em frontend/
3. snyk_sca_scan em backend/requirements.txt
4. snyk_sca_scan em frontend/package.json
5. Revisao manual: JWT validation, ownership checks, CORS, token storage no frontend
6. Retorne relatorio por severidade: CRITICO / ALTO / MEDIO / BAIXO
7. Conclua com "SEGURO" ou "VULNERABILIDADES ENCONTRADAS: [lista]"

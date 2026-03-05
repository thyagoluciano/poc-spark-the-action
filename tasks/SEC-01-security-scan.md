# SEC-01: Security Scan - Snyk Code + SCA

**Agente:** `security-reviewer`
**Depende de:** BE-05, FE-07 (tudo implementado)
**Bloqueia:** nenhuma (task final)

---

## Objetivo

Executar scans de seguranca completos no backend e frontend usando Snyk MCP, revisar findings e corrigir vulnerabilidades.

## Detalhamento

### 1. Snyk Code Scan (SAST) - Backend

- Executar `snyk_code_scan` no diretorio `backend/`
- Analisar findings por severidade (critical, high, medium, low)
- Focar em:
  - SQL Injection
  - Authentication/Authorization bypass
  - Sensitive data exposure
  - Insecure deserialization
  - Path traversal

### 2. Snyk Code Scan (SAST) - Frontend

- Executar `snyk_code_scan` no diretorio `frontend/`
- Analisar findings por severidade
- Focar em:
  - XSS (Cross-Site Scripting)
  - Sensitive data in client code
  - Insecure communication
  - Open redirects

### 3. Snyk SCA Scan - Dependencias

- Executar `snyk_sca_scan` no `backend/requirements.txt`
- Executar `snyk_sca_scan` no `frontend/package.json`
- Verificar vulnerabilidades conhecidas em dependencias
- Avaliar se ha updates disponiveis para pacotes vulneraveis

### 4. Review Manual

Alem dos scans automatizados, verificar:

- [ ] SECRET_KEY nao esta hardcoded em producao (usa env var)
- [ ] Senhas nunca expostas em responses da API
- [ ] JWT com expiracao adequada
- [ ] CORS restrito a origens conhecidas
- [ ] Input validation via Pydantic em todos os endpoints
- [ ] Ownership validation em todos os recursos
- [ ] Sem console.log de dados sensiveis no frontend
- [ ] Token armazenado de forma adequada

### 5. Relatorio e Fixes

- Documentar todas as vulnerabilidades encontradas
- Classificar por severidade
- Para cada finding:
  - Descrever o problema
  - Indicar arquivo e linha
  - Propor fix
- Aplicar fixes para severidade critical e high
- Re-scan apos fixes para confirmar resolucao

## Criterios de Aceite

- [ ] Snyk code scan executado no backend
- [ ] Snyk code scan executado no frontend
- [ ] Snyk SCA scan executado em ambas as dependencias
- [ ] Vulnerabilidades critical/high corrigidas
- [ ] Re-scan confirma resolucao
- [ ] Relatorio de seguranca documentado

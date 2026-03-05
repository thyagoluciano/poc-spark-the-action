# FE-07: Polish - Loading States, Error Handling, Responsividade

**Agente:** `frontend-dev`
**Depende de:** FE-05, FE-06
**Bloqueia:** SEC-01

---

## Objetivo

Polimento final do frontend: loading states consistentes, tratamento de erros com feedback visual, responsividade mobile.

## Arquivos a Modificar

Todos os componentes existentes conforme necessidade.

## Detalhamento

### 1. Loading States

- **BoardPage**: skeleton ou spinner enquanto carrega board
- **Login/Register**: botao desabilitado com spinner durante submit
- **TaskModal**: botao desabilitado durante create/edit/delete
- **KanbanBoard**: loading overlay durante reorder API call

### 2. Error Handling

- **Login**: mensagem "Email ou senha incorretos" em vermelho abaixo do form
- **Register**: mensagem "Email ja cadastrado" para 409
- **Board fetch**: mensagem "Erro ao carregar board" com botao retry
- **Task operations**: toast/alert simples para erros de create/edit/delete
- **Network errors**: mensagem generica "Erro de conexao"

### 3. Responsividade

- **Mobile (< 768px)**:
  - Colunas em scroll horizontal (ja implementado com overflow-x-auto)
  - Header com menu hamburger ou simplificado
  - Modal full-width em mobile
  - Touch-friendly: botoes maiores, areas de toque adequadas
- **Tablet (768px - 1024px)**:
  - 2 colunas visiveis, scroll para a terceira
- **Desktop (> 1024px)**:
  - 3 colunas visiveis lado a lado

### 4. Empty States

- Board sem tasks: mensagem "Nenhuma tarefa. Clique em + para criar."
- Sem boards: criar board automatico (ja em BoardPage)

### 5. Detalhes Visuais

- Transicoes suaves nos hover states
- Focus rings nos inputs para acessibilidade
- Cursor pointer nos elementos clicaveis
- Truncamento de texto longo nos cards

## Criterios de Aceite

- [ ] Loading spinners em todas as operacoes async
- [ ] Mensagens de erro claras e contextuais
- [ ] Layout funcional em mobile, tablet e desktop
- [ ] Empty states informativos
- [ ] Botoes desabilitados durante submissao
- [ ] Transicoes suaves e feedback visual

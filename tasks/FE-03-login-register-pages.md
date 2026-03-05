# FE-03: Pages Login/Register + ProtectedRoute + Header

**Agente:** `frontend-dev`
**Depende de:** FE-02
**Bloqueia:** FE-04

---

## Objetivo

Implementar paginas de login e registro, componente ProtectedRoute para rotas autenticadas e Header com logout.

## Arquivos a Criar

```
frontend/src/
├── pages/
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── components/
│   ├── ProtectedRoute.tsx
│   └── Header.tsx
└── App.tsx (atualizar)
```

## Detalhamento

### 1. `LoginPage.tsx`

- Formulario com campos: email, password
- Botao "Entrar"
- Link "Nao tem conta? Cadastre-se" → /register
- Usar `useAuth().login(email, password)`
- Ao logar com sucesso, redirect para /
- Exibir erro se credenciais invalidas
- Estilo: centralizado na tela, card branco com sombra, max-w-md

### 2. `RegisterPage.tsx`

- Formulario com campos: nome, email, password
- Botao "Cadastrar"
- Link "Ja tem conta? Entrar" → /login
- Usar `useAuth().register(name, email, password)`
- Ao registrar com sucesso, redirect para /
- Exibir erro se email ja existe (409)
- Mesmo estilo do login

### 3. `ProtectedRoute.tsx`

```tsx
// Se isLoading, mostrar spinner/loading
// Se user == null, redirect para /login
// Se autenticado, renderizar children (Outlet)
```

### 4. `Header.tsx`

- Barra no topo, bg-white shadow
- Logo/titulo "Kanban" a esquerda
- Nome do usuario + botao "Sair" a direita
- Botao sair chama `useAuth().logout()`

### 5. Atualizar `App.tsx`

```tsx
<AuthProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Header />}>
          <Route path="/" element={<BoardPage />} />
          <Route path="/boards/:id" element={<BoardPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
</AuthProvider>
```

## Estilos (Tailwind)

- Login/Register: `min-h-screen flex items-center justify-center bg-gray-50`
- Form card: `bg-white p-8 rounded-lg shadow-md w-full max-w-md`
- Inputs: `w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500`
- Botao: `w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700`
- Header: `bg-white shadow px-6 py-4 flex justify-between items-center`

## Criterios de Aceite

- [ ] Login page funcional com validacao
- [ ] Register page funcional com validacao
- [ ] ProtectedRoute bloqueia acesso sem auth
- [ ] Header exibe nome do usuario e botao logout
- [ ] Redirect apos login/register para /
- [ ] Mensagens de erro para credenciais invalidas e email duplicado
- [ ] Layout responsivo e centralizado

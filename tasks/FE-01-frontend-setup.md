# FE-01: Frontend Setup - Vite + React + Tailwind + Dependencias

**Agente:** `frontend-dev`
**Depende de:** nenhuma
**Bloqueia:** FE-02, FE-03, FE-04

---

## Objetivo

Criar o projeto frontend com Vite, React 18, TypeScript, Tailwind CSS v3 e instalar todas as dependencias.

## Estrutura a Criar

```
frontend/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css          # Tailwind directives
│   ├── api/
│   ├── contexts/
│   ├── pages/
│   ├── components/
│   └── types/
│       └── index.ts
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Detalhamento

### 1. Inicializar Projeto

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
```

### 2. Instalar Dependencias

```bash
npm install axios react-router-dom @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D tailwindcss@3 postcss autoprefixer prettier
npx tailwindcss init -p
```

### 3. Configurar Tailwind (`tailwind.config.js`)

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

### 4. `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. `src/types/index.ts`

Definir tipos TypeScript para todas as entidades:

```typescript
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Board {
  id: number;
  title: string;
  owner_id: number;
  created_at: string;
}

export interface Column {
  id: number;
  title: string;
  position: number;
  board_id: number;
  tasks: Task[];
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  position: number;
  column_id: number;
  created_at: string;
  updated_at: string;
}

export interface BoardDetail {
  id: number;
  title: string;
  owner_id: number;
  created_at: string;
  columns: Column[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  name: string;
  access_token: string;
  token_type: string;
}
```

### 6. `src/App.tsx` (esqueleto)

Setup basico do React Router com rotas placeholder:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/register" element={<div>Register</div>} />
        <Route path="/" element={<div>Board</div>} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 7. Prettier Config (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "tabWidth": 2
}
```

## Criterios de Aceite

- [ ] Projeto Vite + React + TypeScript criado
- [ ] Tailwind CSS v3 configurado e funcionando
- [ ] Todas as dependencias instaladas (axios, react-router-dom, @dnd-kit/*, prettier)
- [ ] Types TypeScript definidos para todas as entidades
- [ ] App.tsx com React Router basico
- [ ] `npm run dev` inicia sem erros em localhost:5173

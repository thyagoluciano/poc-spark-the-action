# BE-02: Auth Backend - JWT Utils e Auth Router

**Agente:** `backend-dev`
**Depende de:** BE-01
**Bloqueia:** BE-03, BE-04, BE-05

---

## Objetivo

Implementar autenticacao JWT: utils para criar/verificar tokens, hashing de senhas, dependency para extrair usuario atual, e endpoints de register/login/me.

## Arquivos a Criar

```
backend/app/
├── auth.py
└── routers/
    └── auth_router.py
```

## Detalhamento

### 1. `auth.py` - JWT Utils

- `pwd_context = CryptContext(schemes=["bcrypt"])` para hash de senhas
- `verify_password(plain, hashed) -> bool`
- `get_password_hash(password) -> str`
- `create_access_token(data: dict) -> str`
  - Payload: `{sub: str(user_id), exp: datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)}`
  - Encode com `settings.SECRET_KEY` e `settings.ALGORITHM`
- `get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User`
  - `oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")`
  - Decodificar JWT, extrair `sub`, buscar User no DB
  - Se invalido: raise `HTTPException(401, "Could not validate credentials")`

### 2. `auth_router.py` - Endpoints

**POST /auth/register**
- Body: `UserCreate(email, password, name)`
- Verificar se email ja existe → 409 Conflict
- Hash da senha, criar User no DB
- Gerar JWT token
- Retornar `{id, email, name, access_token, token_type: "bearer"}`

**POST /auth/login**
- Body: `UserLogin(email, password)`
- Buscar user por email → 401 se nao encontrar
- Verificar senha → 401 se incorreta
- Gerar JWT token
- Retornar `{access_token, token_type: "bearer"}`

**GET /auth/me**
- Dependency: `current_user = Depends(get_current_user)`
- Retornar `UserResponse(id, email, name)`

## Criterios de Aceite

- [ ] Hash e verificacao de senha com bcrypt
- [ ] Criacao de JWT com expiracao de 24h
- [ ] Decodificacao de JWT e dependency get_current_user
- [ ] POST /auth/register cria usuario e retorna token
- [ ] POST /auth/register retorna 409 se email duplicado
- [ ] POST /auth/login valida credenciais e retorna token
- [ ] POST /auth/login retorna 401 se credenciais invalidas
- [ ] GET /auth/me retorna dados do usuario autenticado

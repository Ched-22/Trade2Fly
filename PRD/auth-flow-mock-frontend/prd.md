**Document:** `auth-flow-mock-frontend/prd.md`  
**Created:** 2026-06-23  
**Status:** Ready  
**Source:** `frontend/src/pages/AuthPage.tsx`, `frontend/src/context/AuthContext.tsx`, [react-vite-tailwind-frontend/prd.md](../react-vite-tailwind-frontend/prd.md)

# Auth Flow (Mock Frontend)

## 1. Summary

Expand **`/entrar`** into a complete **authentication UX** (login, register, forgot password, reset password) with client-side validation and **mock** persistence. Accounts and session live in **`localStorage`**; no backend or real e-mail. After register, users land on **`/perfil`** (unless `returnTo` is set).

## 2. Context / background

### 2.1 Current state

1. **`frontend/src/pages/AuthPage.tsx`** — Tabs **Entrar** / **Criar conta**; only **e-mail** is wired. Submit calls `login(returnTo)` with no password.
2. **`AuthContext`** — Hardcoded `mockUser` (Ana); no persistence, no `register()`.
3. **`ProtectedRoute`** — `/entrar?returnTo=…` when logged out.

### 2.2 Problem

Users expect senha, confirmar senha, esqueci minha senha, termos, and validation — even before the API exists.

### 2.3 Goals

1. Full login / register / forgot / reset flows (mock).
2. Validation in pt-BR with actionable errors.
3. `localStorage` for accounts (`t2f_mock_accounts`) and session (`t2f_mock_session`).
4. Preserve **`returnTo`**; post-register default **`/perfil`**.

## 3. Implementation steps

### 3.1 Auth routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/entrar` | `LoginForm` | E-mail + senha |
| `/entrar/criar-conta` | `RegisterForm` | Cadastro completo |
| `/entrar/esqueci-senha` | `ForgotPasswordForm` | Reset mock |
| `/entrar/redefinir-senha` | `ResetPasswordForm` | Nova senha (`?token=`) |

Nested under `AuthPage` outlet or `routes/index.tsx`. Preserve `?returnTo=` on all internal links.

### 3.2 Login

1. Fields: e-mail, senha (min 8).
2. Links: **Esqueci minha senha** → `/entrar/esqueci-senha`; **Criar conta** → `/entrar/criar-conta`.
3. Seed: `ana.martins@email.com` / `senha123` → Ana profile.
4. Error: “E-mail ou senha incorretos. Tente novamente.”

### 3.3 Register

1. **Nome completo** — at least **two words** (space-separated), each word ≥ 2 characters after trim. Error: “Informe nome e sobrenome.” Derive `displayName` (first word or full name shortened) and `initials` from name.
2. E-mail (unique in store).
3. Senha + confirmar senha (min 8, must match).
4. Checkbox required: “Li e aceito os [Termos de Uso](/ajuda) e a [Política de Privacidade](/ajuda)” — both links to **`/ajuda`** until dedicated legal pages exist.
5. CTA **Criar conta** → save account → auto-login → navigate:
   - If `returnTo` valid → `returnTo`
   - Else → **`/perfil`**

### 3.4 Forgot / reset (mock)

1. **Esqueci senha:** generic success “Se existir uma conta com este e-mail, enviaremos instruções.” Show dev hint linking to `/entrar/redefinir-senha?token=mock-reset-token&email=…` (mock only).
2. **Redefinir senha:** accept `token=mock-reset-token`; optional `email` query; update password in store; redirect `/entrar` with success banner.

### 3.5 Mock store (`mockAuthStore.ts`)

**Keys:**

| Key | Content |
|-----|---------|
| `t2f_mock_accounts` | `MockAccount[]` — all registered users (persisted) |
| `t2f_mock_session` | `AuthUser` or email reference — active session |

**API:**

```ts
type MockAccount = {
  email: string;
  password: string;
  displayName: string;
  initials: string;
};
```

1. On init: load accounts from `localStorage`; if empty, seed Ana account.
2. `register(account)`, `validateLogin(email, password)`, `updatePassword(email, password)`, `emailExists(email)`.
3. `AuthContext.login(email, password, returnTo?)` — validate, set session, navigate.
4. `AuthContext.register(payload, returnTo?)` — register, login, navigate per 3.3.
5. `logout()` — clear `t2f_mock_session` only.

### 3.6 UI

1. `AuthLayout` — marketing column + form card (responsive).
2. `PasswordInput` — show/hide toggle (lucide `Eye` / `EyeOff`).
3. `AuthAlert` — banners (reset success, errors).
4. `authValidation.ts` — `validEmail`, `validPassword`, `passwordsMatch`, `validDisplayName` (two-word rule).

### 3.7 Files

| Action | Path |
|--------|------|
| Create | `components/auth/*` (Layout, forms, PasswordInput) |
| Create | `data/mockAuthStore.ts`, `lib/authValidation.ts` |
| Edit | `pages/AuthPage.tsx`, `routes/index.tsx`, `context/AuthContext.tsx` |
| Edit | `frontend/README.md` — seed credentials + localStorage keys |

### 3.8 Verification

1. Login seed user; `returnTo` from `/vender` works.
2. Register → lands on `/perfil` (no `returnTo`).
3. Register with `returnTo` → intended page.
4. Accounts survive page refresh (`t2f_mock_accounts`).
5. Session survives refresh (`t2f_mock_session`).
6. Terms links open `/ajuda`.
7. `npm run build` passes.

## 4. Dependencies

1. `frontend/` app.
2. `react-router-dom`, `lucide-react`, `Input`, `Button`.
3. Existing `/ajuda` page for terms links.

## 5. Resolved decisions

1. **Nome completo:** **Two words minimum** (nome + sobrenome), each ≥ 2 chars — aligns with marketplace seller/buyer identity and reduces junk signups.
2. **Persist accounts:** **`localStorage` key `t2f_mock_accounts`** — recommended so registered users survive refresh; seed Ana on first load if empty.
3. **Session:** **`localStorage` key `t2f_mock_session`** — hydrate in `AuthProvider` on mount.
4. **Terms links:** **`/ajuda`** for Termos de Uso and Política de Privacidade (operator confirmed); replace with dedicated routes when legal pages exist.
5. **Post-register redirect:** **`/perfil`** by default (operator confirmed) so user completes profile context; **`returnTo` takes precedence** when present.
6. **Routes:** Sub-routes under `/entrar/*`.
7. **Password:** Min 8 characters.
8. **Forgot password:** Generic message (no e-mail enumeration).
9. **No social login, no real API.**

## 6. Open items

None.

## 7. Out of scope

1. Real auth API, JWT, refresh tokens.
2. E-mail delivery.
3. OAuth / social login.
4. CAPTCHA, 2FA, rate limiting.
5. Dedicated `/termos` / `/privacidade` pages (use `/ajuda` for now).
6. E2E API tests.

## 8. Data flow / behavior

1. Guest → `/entrar?returnTo=/vender` → login → `/vender`.
2. New user → `/entrar/criar-conta` → accept terms (links to `/ajuda`) → account saved to `t2f_mock_accounts` → session in `t2f_mock_session` → **`/perfil`**.
3. New user with `returnTo` → after register → `returnTo` destination.
4. Forgot → mock success → dev link or manual `/entrar/redefinir-senha?token=mock-reset-token` → password updated in store.
5. Logout → session cleared; accounts remain in `t2f_mock_accounts`.

## 9. Agent implementation guide

### 9.1 Read first

`AuthPage.tsx`, `AuthContext.tsx`, `Input.tsx`, `HelpPage.tsx` (terms target).

### 9.2 Branch

`feat/auth-flow-mock-frontend`

### 9.3 Implement

`PRD/auth-flow-mock-frontend` via `.cursor/commands/implement-from-prd.md`

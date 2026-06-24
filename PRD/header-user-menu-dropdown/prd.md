**Document:** `header-user-menu-dropdown/prd.md`  
**Created:** 2026-06-23  
**Status:** Ready  
**Source:** `frontend/src/components/layout/Header.tsx`, screenshot do botão de usuário (avatar + nome), [react-vite-tailwind-frontend/prd.md](../react-vite-tailwind-frontend/prd.md)

# Header User Menu Dropdown

## 1. Summary

Add a **dropdown menu** to the logged-in **user pill button** in the app header (avatar initials + display name). Clicking the button toggles a panel with navigation to **Perfil**, **Configurações**, **Meus anúncios**, and other account actions. The menu header shows a **mock e-mail**; **Sair** calls `logout()`. New routes use placeholder pages until the backend exists.

## 2. Context / background

### 2.1 Current state

1. **`frontend/src/components/layout/Header.tsx`** — When `loggedIn`, the user button calls **`logout` directly on click**. There is no menu.
2. **`AuthContext`** exposes `user` (`displayName`, `initials`) and `logout()`; mock user is `{ displayName: 'Ana', initials: 'AM' }`.
3. Header icons: **Favoritos** (`/favoritos`), **Mensagens** (`/mensagens`), **Vender** (`/vender` — create listing flow).
4. No `/perfil`, `/configuracoes`, `/meus-anuncios`, or account sub-routes yet.

### 2.2 Problem

Users expect the profile pill to open an **account menu**, not log out immediately.

### 2.3 Goals

1. Toggle dropdown on pill click (open/close).
2. Menu items in pt-BR with lucide-react icons.
3. Route to new placeholder pages or existing protected routes.
4. a11y: `aria-expanded`, `aria-haspopup`, Escape, outside click, close on navigate.
5. Mock e-mail subtitle in menu header.

### 2.4 Constraints

1. **camelCase** in TypeScript.
2. Tailwind: dark header, light dropdown panel.
3. **React only** — local state in `UserMenu`; no new global store.
4. Copy in **pt-BR**.

## 3. Implementation steps

### 3.1 Extract `UserMenu` component

1. Create `frontend/src/components/layout/UserMenu.tsx`.
2. Props: `user` (`displayName`, `initials`, `email`), `onLogout`.
3. Trigger: existing pill UI (`button`, `aria-haspopup="menu"`, `aria-expanded`).
4. Panel: `absolute top-full right-0 mt-2 z-[60]`.

### 3.2 Menu structure

1. **Header block** (non-clickable):
   - `user.displayName` (bold)
   - `user.email` (mock, `text-cinza`, `text-sm`) — e.g. `ana.martins@email.com`

2. **Divider**

3. **Primary items** (icon + label → `navigate` + close):

   | # | Label | Route | Notes |
   |---|-------|-------|-------|
   | 1 | Meu perfil | `/perfil` | `ProfilePage` placeholder |
   | 2 | Meus anúncios | `/meus-anuncios` | `MyListingsPage` — list mock; separate from `/vender` |
   | 3 | Meus pedidos | `/pedidos` | `OrdersPage` placeholder |
   | 4 | Favoritos | `/favoritos` | Existing |
   | 5 | Mensagens | `/mensagens` | Existing |

4. **Divider**

5. **Secondary items**:

   | # | Label | Route |
   |---|-------|-------|
   | 6 | Configurações | `/configuracoes` |
   | 7 | Ajuda e suporte | `/ajuda` |

6. **Divider**

7. **Sair** — `onLogout()`; `LogOut` icon; destructive hover (`text-error`, `hover:bg-red-50`).

**Note:** Header **Vender** button stays on `/vender` (publish new listing). **Meus anúncios** is the seller dashboard/list — different intent.

### 3.3 Extend `AuthUser` and mock

1. In `frontend/src/context/AuthContext.tsx`:

   ```ts
   export type AuthUser = {
     displayName: string;
     initials: string;
     email: string;
   };

   const mockUser: AuthUser = {
     displayName: 'Ana',
     initials: 'AM',
     email: 'ana.martins@email.com',
   };
   ```

2. No env vars or API for email in this PRD.

### 3.4 New routes and placeholder pages

Add to `frontend/src/routes/index.tsx` (all **protected**):

| Route | Component | Purpose |
|-------|-------------|---------|
| `/perfil` | `ProfilePage` | Profile view/edit mock |
| `/meus-anuncios` | `MyListingsPage` | Seller listings grid mock + link “Publicar anúncio” → `/vender` |
| `/pedidos` | `OrdersPage` | Purchase history mock |
| `/configuracoes` | `SettingsPage` | Account settings mock |
| `/ajuda` | `HelpPage` | In-app FAQ/support links mock |

Placeholder pattern (match `FavoritesPage` layout):

- Title + short description
- “Em breve” or minimal mock content (e.g. `MyListingsPage` shows 1–2 mock drafts from `listings` filtered by seller name)
- `HelpPage`: cards linking to FAQ topics (non-functional anchors or `#` until content exists)

### 3.5 Integrate in `Header.tsx`

1. Replace `<button onClick={logout}>` with `<UserMenu user={user} onLogout={logout} />`.
2. Keep Favoritos and Mensagens icon buttons in header.

### 3.6 Interaction and a11y

1. Toggle on trigger click; `stopPropagation` on panel.
2. `mousedown` on `document` → close if outside `ref` container.
3. `location.pathname` change → close.
4. `Escape` → close.
5. Panel `role="menu"`; items `role="menuitem"`.

### 3.7 Visual design

1. Trigger: unchanged pill (`bg-white/10`, border `white/16`, avatar `bg-voo`).
2. Panel: `min-w-[240px]`, `bg-white`, `rounded-lg`, `border-nuvem`, `shadow-lg`.
3. Menu header padding `px-4 py-3`; items `px-4 py-2.5`; hover `bg-bruma`.

### 3.8 Verification

1. Login → pill opens menu with name + mock email.
2. All items navigate correctly; menu closes.
3. **Meus anúncios** → `/meus-anuncios` (not `/vender`).
4. **Ajuda** → `/ajuda` in-app.
5. **Sair** → `/`, logged out.
6. `npm run build` passes.

## 4. Dependencies

1. `frontend/` from [react-vite-tailwind-frontend](../react-vite-tailwind-frontend/prd.md).
2. `react-router-dom`, `lucide-react`.
3. `AuthContext` / `useAuth`.

## 5. Resolved decisions

1. **Meus anúncios:** **`/meus-anuncios`** — dedicated seller list/dashboard page. **`/vender`** remains the “Publicar anúncio” create flow (header CTA). Separating list vs create matches marketplace UX and avoids overloading `/vender`.
2. **E-mail no menu:** **Show mock** — add `email` to `AuthUser`; display in dropdown header (`ana.martins@email.com`). Swap for real auth field later.
3. **Ajuda:** **In-app `/ajuda`** — `HelpPage` placeholder with FAQ/support sections (same shell as other account pages). Prefer over external link: works offline in dev, consistent routing, easy to wire to CMS/backend later.
4. **Scope:** Frontend-only; mock pages until API exists.
5. **Component:** `UserMenu` in `components/layout/`.
6. **No Radix/Headless UI** — native React + Tailwind.
7. **Protected routes:** All new pages use `ProtectedRoute`.
8. **Locale:** pt-BR labels per section 3.2.

## 6. Open items

None.

## 7. Out of scope

1. Real profile/settings/listings API.
2. Avatar upload.
3. Notification preferences backend.
4. Removing header Favoritos/Mensagens icons.
5. Mobile full-screen account drawer.
6. E2E API tests.
7. External help desk integration (Zendesk, etc.) — follow-up when URLs exist.

## 8. Data flow / behavior

1. Logged in → click pill → dropdown shows **Ana** + **ana.martins@email.com**.
2. **Meus anúncios** → `/meus-anuncios` → mock grid of seller listings → CTA to `/vender`.
3. **Ajuda e suporte** → `/ajuda` → static FAQ cards.
4. **Sair** → `logout()` → `/`.
5. Outside click / Escape / navigation → menu closes.

## 9. Agent implementation guide

### 9.1 Read first

1. `frontend/src/components/layout/Header.tsx`
2. `frontend/src/context/AuthContext.tsx`
3. `frontend/src/routes/index.tsx`

### 9.2 Files to create / edit

| Action | File |
|--------|------|
| Create | `components/layout/UserMenu.tsx` |
| Create | `pages/ProfilePage.tsx` |
| Create | `pages/MyListingsPage.tsx` |
| Create | `pages/OrdersPage.tsx` |
| Create | `pages/SettingsPage.tsx` |
| Create | `pages/HelpPage.tsx` |
| Edit | `components/layout/Header.tsx` |
| Edit | `context/AuthContext.tsx` (`email` on `AuthUser`) |
| Edit | `routes/index.tsx` |

### 9.3 `MyListingsPage` mock

1. Filter `listings` where `seller === 'Ana Martins'` (mock logged-in user).
2. Show grid with `ListingCard` or compact rows.
3. Primary CTA: **Publicar anúncio** → `/vender`.

### 9.4 Verification

1. Manual dropdown + all routes + logout.
2. `cd frontend && npm run build`.

### 9.5 Branch

`feat/header-user-menu-dropdown`

### 9.6 Gate / implement

1. `PRD/header-user-menu-dropdown`
2. `.cursor/commands/implement-from-prd.md`

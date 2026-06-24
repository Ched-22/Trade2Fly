**Document:** `profile-settings-page/prd.md`  
**Created:** 2026-06-24  
**Status:** Ready  
**Source:** Inspiração visual (marketplace Avento — profile settings), `frontend/src/pages/ProfilePage.tsx`, [auth-flow-mock-frontend/prd.md](../auth-flow-mock-frontend/prd.md)

# Profile Settings Page (Configurações de perfil)

## 1. Summary

Redesign **`/perfil`** into a polished **profile settings** experience inspired by modern skydiving marketplaces (clean header row, avatar upload, structured name fields, display name, bio). Use **client-side mock persistence** first (`localStorage` + `AuthContext` refresh), with a clear path to **`PATCH /api/users/me`** when the backend schema grows. Separates **public profile identity** (`/perfil`) from **account preferences** (`/configuracoes`).

## 2. Context / background

### 2.1 Current state

1. **`ProfilePage.tsx`** — Minimal card: display name, read-only e-mail, static “Cidade” placeholder; no save, no avatar, no bio.
2. **`SettingsPage.tsx`** — E-mail + notification toggles at `/configuracoes`; also mock-only.
3. **`AuthUser`** — `{ id, displayName, initials, email }`; no `firstName`, `lastName`, `bio`, `avatarUrl`, `city`.
4. **Backend `User`** (Prisma) — `displayName`, `initials`, `email` only; `UpdateUserDto` accepts `fullName` and `password`.
5. **User menu** — Shows `displayName` and initials avatar circle in header.

### 2.2 Problem

After register, users land on `/perfil` but see a sparse form that does not match the product promise or competitor UX. Sellers need a trustworthy public identity (photo, bio, location) before listing gear.

### 2.3 Goals

1. Visual layout aligned with Trade2Fly tokens (white cards, `nuvem` borders, `font-display` headings) — **inspired by** reference screenshot, **not a copy** (pt-BR labels, Trade2Fly spacing).
2. Editable profile fields with validation and **Save** that persists in mock store.
3. Avatar picker (client preview; optional base64 in `localStorage` for mock).
4. Auto-suggest **display name** from first + last name (user can override).
5. Header action **“Ver perfil público”** (preview of how others see the seller — mock panel or modal).
6. `npm run build` passes; protected route unchanged.

## 3. Implementation steps

### 3.1 Data model (frontend mock)

Extend profile storage without breaking existing session:

| Field | Type | Notes |
|-------|------|-------|
| `firstName` | string | Required on save |
| `lastName` | string | Required on save |
| `displayName` | string | Default derived; editable |
| `bio` | string | Max 500 chars; optional |
| `city` | string | e.g. “São Paulo, SP” |
| `dropzone` | string | Optional user input; **included in v1** (e.g. “Boituva”) |
| `avatarUrl` | string \| null | Data URL or placeholder in mock |

**Storage key:** `t2f_mock_profile_<userId>` (separate from session; merged on read).

**Helpers:** `lib/profileStorage.ts` — `getProfile`, `saveProfile`, `deriveDisplayName(firstName, lastName)`.

`saveProfile` must be the **single write path** so a future backend call (`apiPatch('/api/users/me', …)`) can replace the mock implementation without touching UI components.

On save: update mock account + session (`displayName`, `initials` from names); call `AuthContext` refresh callback.

### 3.2 Page layout (`ProfilePage.tsx`)

Refactor to match reference **structure** (not pixel-copy):

```
┌─────────────────────────────────────────────────────────┐
│  Configurações de perfil          [ Ver perfil público ] │
├─────────────────────────────────────────────────────────┤
│  (Avatar upload zone — circular, dashed border)         │
│  Dica: use uma foto em que seu rosto seja reconhecível. │
│  .JPG, .PNG, .WebP (mock: max ~500 KB)                  │
├─────────────────────────────────────────────────────────┤
│  [ Nome ]          [ Sobrenome ]     (grid 2 cols sm+)  │
│  [ Nome de exibição ] + helper text                     │
│  [ Bio — textarea ]                                     │
│  [ Cidade ]          [ Dropzone ]    (grid 2 cols sm+; dropzone in v1) │
│  [ E-mail — read-only ]                                 │
├─────────────────────────────────────────────────────────┤
│  [ Salvar alterações ]              [ Cancelar ]        │
└─────────────────────────────────────────────────────────┘
```

- **Max width:** `max-w-2xl` or `max-w-3xl` centered (`t2f-page`).
- **No duplicate global header** — use existing `AppShell` header.
- Subtitle: “Gerencie como outros skydivers veem você na Trade2Fly.”

### 3.3 Components

| Component | Path | Purpose |
|-----------|------|---------|
| `ProfileAvatarUpload` | `components/profile/ProfileAvatarUpload.tsx` | Circle dropzone, file input, preview, remove |
| `ProfileForm` | `components/profile/ProfileForm.tsx` | Controlled form, validation, submit |
| `ProfilePublicPreview` | `components/profile/ProfilePublicPreview.tsx` | Modal: avatar, displayName, bio, city, dropzone |

Reuse `Input`, `Button`; add `Textarea` in `components/ui/Textarea.tsx` if missing (match `Input` styles).

### 3.4 Avatar upload (mock)

1. Accept `image/jpeg`, `image/png`, `image/webp`.
2. Max file size **500 KB** (client check); error in pt-BR.
3. `FileReader` → data URL stored in profile; show in header `UserMenu` when session refreshes.
4. **Remove photo** restores initials fallback.
5. No server upload in this PRD.

### 3.5 Display name behavior

1. On blur of first/last name (or checkbox “Usar sugestão”), set display name to `deriveDisplayName`:
   - Pattern: `{firstName} {lastName[0]}.` when last name present (e.g. Pedro + Chede → “Pedro C.”).
   - User can type custom display name anytime.
2. Helper text (pt-BR): “O nome de exibição pode ser gerado automaticamente a partir do nome e sobrenome.”

### 3.6 Validation (pt-BR)

| Field | Rule | Error |
|-------|------|-------|
| firstName | min 2 chars | “Informe seu nome.” |
| lastName | min 2 chars | “Informe seu sobrenome.” |
| displayName | min 2 chars | “Informe um nome de exibição.” |
| bio | max 500 | “A bio pode ter no máximo 500 caracteres.” |
| avatar | size/type | “Use JPG, PNG ou WebP de até 500 KB.” |

### 3.7 “Ver perfil público” (modal only — v1)

1. Button top-right (outline, `sm`) on `/perfil`.
2. Opens **`ProfilePublicPreview` modal** with current form values (unsaved changes OK for preview).
3. Shows: avatar/initials, displayName, bio, city, dropzone (if filled), “Membro Trade2Fly”.
4. CTA in preview: “Ver meus anúncios” → `/meus-anuncios` (protected).
5. **No dedicated public URL** in v1 (e.g. `/usuario/:id`). Seller cards/listings continue to show `displayName` only; full public profile page is a **follow-up PRD** when backend exposes seller profile by id.

### 3.8 AuthContext integration

1. Add `updateProfile(data: ProfileData): Promise<void>` to context — delegates to `profileStorage.saveProfile` (mock in v1).
2. On save success: inline banner “Perfil atualizado.”
3. `UserMenu` reads `user.avatarUrl` if set; else initials circle.
4. **Backend:** do not call `PATCH /api/users/me` in v1 — Prisma `User` lacks `bio`, `city`, `dropzone`, `avatarUrl`. When backend adds fields, swap implementation inside `profileStorage` only.

### 3.9 Routes and navigation

| Path | Page | Change |
|------|------|--------|
| `/perfil` | `ProfilePage` | Redesign (this PRD) |
| `/configuracoes` | `SettingsPage` | Unchanged scope (notifications, password later) |

User menu link “Meu perfil” → `/perfil` (existing).

### 3.10 Files

| Action | Path |
|--------|------|
| Create | `lib/profileStorage.ts`, `lib/profileValidation.ts` |
| Create | `components/profile/ProfileAvatarUpload.tsx`, `ProfileForm.tsx`, `ProfilePublicPreview.tsx` |
| Create | `components/ui/Textarea.tsx` (if absent) |
| Edit | `pages/ProfilePage.tsx` |
| Edit | `context/AuthContext.tsx`, `data/mockAuthStore.ts` (profile fields) |
| Edit | `components/layout/UserMenu.tsx` (avatar image) |
| Edit | `frontend/README.md` — profile fields + storage key |

### 3.11 Verification

1. `npm run build` in `frontend/`.
2. Log in → `/perfil` → edit fields → Save → refresh → values persist.
3. Avatar appears in header menu after save.
4. “Ver perfil público” shows preview.
5. Invalid file/empty name shows pt-BR errors.

## 4. Dependencies

1. [auth-flow-mock-frontend](../auth-flow-mock-frontend/prd.md) — mock accounts and session.
2. [header-user-menu-dropdown](../header-user-menu-dropdown/prd.md) — menu shows user identity.
3. Existing `Input`, `Button`, design tokens in `index.css`.
4. Future: backend `PATCH /api/users/me` + Prisma migration for `bio`, `city`, `avatarUrl` (out of scope here).

## 5. Resolved decisions

1. **Inspiration only** — Layout inspired by Avento-style profile settings; Trade2Fly branding and pt-BR copy.
2. **Mock-first** — Persist in `localStorage`; no new env vars.
3. **Split pages** — `/perfil` = public identity; `/configuracoes` = account/notifications.
4. **Avatar** — Client-side data URL in mock; no S3/upload API in this PRD.
5. **Display name default** — First name + last initial (e.g. “Pedro C.”).
6. **Public profile (v1)** — **Modal preview only** via “Ver perfil público”; no `/usuario/:id` route until a follow-up PRD with backend seller profile API.
7. **Dropzone field** — **Included in v1** as optional text input (shown in form and public preview when filled).
8. **Backend sync (v1)** — **Mock only** via `profileStorage.saveProfile`; single abstraction point for future `PATCH /api/users/me` when schema supports extended profile fields.

## 6. Open items

None.

## 7. Out of scope

1. Password change on `/perfil` (belongs in `/configuracoes`).
2. Real image upload to server/CDN.
3. Prisma schema migration and Nest DTO expansion.
4. E-mail change flow.
5. Profile visibility/privacy toggles.
6. Seller ratings/reviews on public profile.
7. Dedicated route **`/usuario/:id`** for viewing another user’s profile (follow-up PRD).

## 8. Agent implementation guide

### 8.1 Branch

`feat/profile-settings-page`

### 8.2 Order of work

1. Types + `profileStorage` + validation.
2. `Textarea` + profile components.
3. Refactor `ProfilePage`.
4. AuthContext + `UserMenu` avatar.
5. README + build.

### 8.3 Patterns

- camelCase fields in TS; pt-BR UI strings.
- Match `AuthPage` / `CreateListingPage` form spacing.
- Use controlled inputs; disable Save while submitting.

### 8.4 Docs

Update `frontend/README.md` with profile storage key and fields table.

### 8.5 Rollout

Frontend-only; no Helm/env changes.

### 8.6 Verification checklist

- [ ] Save persists after refresh
- [ ] Avatar in header
- [ ] Public preview works
- [ ] Validation messages pt-BR
- [ ] `npm run build` green

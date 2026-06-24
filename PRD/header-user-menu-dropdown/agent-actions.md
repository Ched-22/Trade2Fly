# Agent Actions & Operator Checklist: Header User Menu Dropdown

**PRD:** [prd.md](./prd.md)  
**Gate path:** `PRD/header-user-menu-dropdown`  
**E2E plan:** N/A (non-API PRD — no `e2e/` folder)

---

## 1. Before handing to the agent

### 1.1 PRD and scope

1. Read [prd.md](./prd.md) sections 1–7.
2. ~~Resolve **Open items**~~ — **Done** (section 6 = None).
3. Confirm dropdown replaces direct logout on profile pill.

### 1.2 E2E plan

N/A — manual UI + `npm run build`.

### 1.3 Environment and secrets

1. `npm run dev` in `frontend/`.
2. Log in via `/entrar` to test dropdown.
3. No new env vars.

### 1.4 Commands and rules

1. `.cursor/rules/camelcase.mdc`
2. `.cursor/rules/commit-messages.mdc`
3. Branch: `feat/header-user-menu-dropdown`

---

## 2. Cursor commands

### 2.1 Gate

**Last run: Ready** (see below).

### 2.2 Implement

```text
prd: PRD/header-user-menu-dropdown
branch: feat/header-user-menu-dropdown
```

---

## 3. After the agent delivers the PR

1. Pill shows dropdown with mock email `ana.martins@email.com`.
2. **Meus anúncios** → `/meus-anuncios` (not `/vender`).
3. **Ajuda** → `/ajuda` in-app.
4. **Sair** → logged out.
5. `npm run build` passes.

---

## 4. Quick reference

| Item | Value |
|------|--------|
| Meus anúncios | `/meus-anuncios` |
| Publicar (header) | `/vender` (unchanged) |
| Mock email | `ana.martins@email.com` on `AuthUser` |
| Ajuda | `/ajuda` (`HelpPage`) |
| Branch | `feat/header-user-menu-dropdown` |

---

## 5. Summary checklist

- [x] Open items resolved
- [x] Gate → **Ready**
- [ ] Implement on feature branch
- [ ] Dropdown verified
- [ ] `npm run build` passes
- [ ] PR opened

---

## Last review result

**Date:** 2026-06-23  
**Result:** Ready

| # | Check | Status | Confidence |
|---|-------|--------|------------|
| 0 | Structure: required header and sections | Pass | High |
| 0b | Structure (content): actionable steps; Open items = None | Pass | High |
| 1 | No blocking open questions | Pass | High |
| 2 | API paths/schema (non-API PRD) | N/A | High |
| 3 | Implementation steps and file references clear | Pass | High |
| 4 | Scope documented (`/meus-anuncios` vs `/vender`, mock email, `/ajuda`) | Pass | High |
| 5 | E2E plan for API | N/A | High |
| 6 | Agent-actions checklist satisfied | Pass | High |

**Summary:** PRD `PRD/header-user-menu-dropdown` validated. Open items resolved: `/meus-anuncios` for seller list, mock email on `AuthUser`, in-app `/ajuda`. Ready for implementation on `feat/header-user-menu-dropdown`.

# Agent Actions & Operator Checklist: Profile Settings Page

**PRD:** [prd.md](./prd.md)  
**Gate path:** `PRD/profile-settings-page`  
**E2E plan:** N/A (non-API PRD — no `e2e/` folder)

---

## 1. Before handing to the agent

### 1.1 PRD and scope

1. Read [prd.md](./prd.md) sections 1–8.
2. ~~Resolve **Open items**~~ — **Done** (section 6 = None).
3. Confirm `/perfil` redesign does not merge into `/configuracoes`.

### 1.2 E2E plan

N/A — manual UI + `npm run build`.

### 1.3 Environment and secrets

1. `npm run dev` in `frontend/`.
2. Log in with seed account (`ana.martins@email.com` / `senha123`) or register new user.
3. No new env vars.

### 1.4 Commands and rules

1. `.cursor/rules/camelcase.mdc`
2. `.cursor/rules/commit-messages.mdc`
3. Branch: `feat/profile-settings-page`

---

## 2. Cursor commands

### 2.1 Gate

**Last run: Ready** (see below).

### 2.2 Implement

```text
prd: PRD/profile-settings-page
branch: feat/profile-settings-page
```

---

## 3. After the agent delivers the PR

1. `/perfil` shows avatar upload, name fields, bio, city, dropzone, save.
2. Save persists in `localStorage` after refresh.
3. Header user menu shows uploaded avatar (or initials).
4. “Ver perfil público” opens modal preview (no `/usuario/:id` in v1).
5. `/configuracoes` unchanged in scope.
6. `npm run build` passes.

---

## 4. Quick reference

| Item | Value |
|------|--------|
| Route | `/perfil` |
| Storage | `t2f_mock_profile_<userId>` |
| Public profile v1 | Modal preview only |
| Dropzone | In v1 (optional field) |
| Backend | Mock via `profileStorage`; no PATCH in v1 |
| Components | `components/profile/*` |
| Branch | `feat/profile-settings-page` |

---

## 5. Summary checklist

- [x] Open items resolved
- [x] Gate → **Ready**
- [ ] Implement on feature branch
- [ ] Profile save + avatar verified
- [ ] `npm run build` passes
- [ ] PR opened

---

## Last review result

**Date:** 2026-06-24  
**Result:** Ready

| # | Check | Status | Confidence |
|---|-------|--------|------------|
| 0 | Structure: required header and sections | Pass | High |
| 0b | Structure (content): actionable steps; Open items = None | Pass | High |
| 1 | No blocking open questions | Pass | High |
| 2 | API paths/schema (non-API PRD) | N/A | High |
| 3 | Implementation steps and file references clear | Pass | High |
| 4 | Scope documented (modal preview, mock storage, dropzone v1) | Pass | High |
| 5 | E2E plan for API | N/A | High |
| 6 | Agent-actions checklist satisfied | Pass | High |

**Summary:** PRD `PRD/profile-settings-page` validated. Open items resolved per operator: (1) public profile = modal preview only in v1, `/usuario/:id` deferred; (2) dropzone field included in v1; (3) mock-only persistence via `profileStorage` with hook for future `PATCH /api/users/me`. Ready for implementation on `feat/profile-settings-page`.

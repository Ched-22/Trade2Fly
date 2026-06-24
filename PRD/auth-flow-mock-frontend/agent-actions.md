# Agent Actions & Operator Checklist: Auth Flow Mock Frontend

**PRD:** [prd.md](./prd.md)  
**Gate path:** `PRD/auth-flow-mock-frontend`  
**E2E plan:** N/A (non-API PRD — no `e2e/` folder)

---

## 1. Before handing to the agent

### 1.1 PRD and scope

1. Read [prd.md](./prd.md) sections 1–7.
2. ~~Resolve **Open items**~~ — **Done** (section 6 = None).
3. Confirm mock-only — `t2f_mock_accounts` + `t2f_mock_session` in `localStorage`.

### 1.2 E2E plan

N/A — manual flows + `npm run build`.

### 1.3 Environment and secrets

1. `npm run dev` in `frontend/`.
2. Seed: `ana.martins@email.com` / `senha123`.
3. No new env vars.

### 1.4 Commands and rules

1. `.cursor/rules/camelcase.mdc`
2. `.cursor/rules/commit-messages.mdc`
3. Branch: `feat/auth-flow-mock-frontend`

---

## 2. Cursor commands

### 2.1 Gate

**Last run: Ready** (see below).

### 2.2 Implement

```text
prd: PRD/auth-flow-mock-frontend
branch: feat/auth-flow-mock-frontend
```

---

## 3. After the agent delivers the PR

1. Login with seed credentials.
2. Register → redirect to `/perfil` (no `returnTo`).
3. Terms links → `/ajuda`.
4. Refresh → still logged in; registered users persist.
5. `npm run build` passes.

---

## 4. Quick reference

| Item | Value |
|------|--------|
| Account storage | `localStorage` → `t2f_mock_accounts` |
| Session storage | `localStorage` → `t2f_mock_session` |
| Name rule | Nome + sobrenome (2+ words, ≥2 chars each) |
| Post-register | `/perfil` (or `returnTo` if set) |
| Terms links | `/ajuda` |
| Branch | `feat/auth-flow-mock-frontend` |

---

## 5. Summary checklist

- [x] Open items resolved
- [x] Gate → **Ready**
- [x] Implement on feature branch
- [x] Auth flows verified (build)
- [x] `npm run build` passes
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
| 4 | Scope documented (localStorage, /perfil, /ajuda, name rule) | Pass | High |
| 5 | E2E plan for API | N/A | High |
| 6 | Agent-actions checklist satisfied | Pass | High |

**Summary:** PRD `PRD/auth-flow-mock-frontend` validated. Open items resolved: two-word name validation, `t2f_mock_accounts` + session in localStorage, terms → `/ajuda`, post-register → `/perfil` (returnTo overrides). Ready for implementation.

# Agent Actions & Operator Checklist: React Vite Tailwind Frontend

**PRD:** [prd.md](./prd.md)  
**Gate path:** `PRD/react-vite-tailwind-frontend`  
**E2E plan:** N/A (non-API PRD — no `e2e/` folder)

---

## 1. Before handing to the agent

### 1.1 PRD and scope

1. Read [prd.md](./prd.md) sections 1–7.
2. ~~Resolve **Open items** in section 6~~ — **Done** (section 6 = None).
3. Confirm **Out of scope** matches expectations (mock data only, no API, keep `Front/` until sign-off).

### 1.2 E2E plan

N/A — this PRD does not add or change HTTP endpoints. Verification is manual/visual + `npm run build` per section 9.4 of prd.md.

### 1.3 Environment and secrets

1. **Node.js** 20+ and **npm** installed locally.
2. Copy `frontend/.env.example` → `frontend/.env.local` when running dev (optional until backend exists).
3. Env vars (frontend only for this PRD): `VITE_DEV_API_URL`, `VITE_API_BASE_URL` — see prd.md section 3.8.

### 1.4 Commands and rules

1. `.cursor/rules/camelcase.mdc` — camelCase in TypeScript.
2. `.cursor/rules/commit-messages.mdc` — Conventional Commits.
3. `.cursor/commands/implement-from-prd.md` — branch `feat/react-vite-tailwind-frontend`, never commit to `main`.

---

## 2. Cursor commands

### 2.1 Gate (required)

Run **Review PRD before agent** with path `PRD/react-vite-tailwind-frontend`.  
**Last run: Ready** (see below).

### 2.2 Implement (after Ready)

```text
prd: PRD/react-vite-tailwind-frontend
branch: feat/react-vite-tailwind-frontend
```

---

## 3. After the agent delivers the PR

1. `cd frontend && npm install && npm run dev`.
2. Walk all routes in prd.md section 3.4; confirm protected routes redirect to `/entrar?returnTo=…`.
3. Compare with `Front/Trade2Fly.dc.html`.
4. `npm run build` — zero errors.
5. PR from `feat/react-vite-tailwind-frontend` → `main`.

---

## 4. Quick reference

| Item | Value |
|------|--------|
| App path | `frontend/` |
| Package manager | npm |
| Tailwind | v4 (`@tailwindcss/vite`) |
| State | React Context only |
| PRD folder | `PRD/react-vite-tailwind-frontend/` |
| Branch | `feat/react-vite-tailwind-frontend` |
| API / E2E | N/A (scaffold `lib/api.ts` + proxy only) |

---

## 5. Summary checklist

- [x] Open items resolved (section 6 = None)
- [x] Gate run → **Ready** recorded below
- [ ] Implement from PRD on feature branch (not `main`)
- [ ] `npm run dev` and `npm run build` pass
- [ ] Visual parity spot-check completed
- [ ] PR opened for review

---

## Last review result

**Date:** 2026-06-23  
**Result:** Ready

| # | Check | Status | Confidence |
|---|-------|--------|------------|
| 0 | Structure: required header and sections (Summary, Context, Implementation steps, Dependencies, Resolved decisions, Open items, Out of scope) | Pass | High |
| 0b | Structure (content): sections have actionable content; Open items = None | Pass | High |
| 1 | No open design questions blocking implementation | Pass | High |
| 2 | Paths, request/response schema, error codes (non-API PRD) | N/A | High |
| 3 | Implementation steps and file references clear for agent | Pass | High |
| 4 | Scope decisions documented (keep `Front/`, mock data, backend scaffold) | Pass | High |
| 5 | Branch-scoped E2E plan for API endpoints | N/A | High |
| 6 | Agent-actions pre-agent checklist satisfied | Pass | High |

**Summary:** PRD at `PRD/react-vite-tailwind-frontend` validated against `PRD/prd-template.md`. Open items resolved: app at `frontend/`, Tailwind v4, React Context only, npm, ProtectedRoute auth guards, backend-integrated deploy scaffold. No E2E folder required.

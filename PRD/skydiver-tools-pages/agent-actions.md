# Agent Actions & Operator Checklist: Skydiver Tools Pages

**PRD:** [prd.md](./prd.md)  
**Gate path:** `PRD/skydiver-tools-pages`  
**E2E plan:** N/A (non-API PRD — no `e2e/` folder)

---

## 1. Before handing to the agent

### 1.1 PRD and scope

1. Read [prd.md](./prd.md) sections 1–7.
2. ~~Resolve **Open items**~~ — **Done** (section 6 = None).
3. Confirm four tools + index under `/ferramentas`.

### 1.2 E2E plan

N/A — manual UI + `npm run build`.

### 1.3 Environment and secrets

1. `npm run dev` in `frontend/`.
2. No new env vars.

### 1.4 Commands and rules

1. `.cursor/rules/camelcase.mdc`
2. `.cursor/rules/commit-messages.mdc`
3. Branch: `feat/skydiver-tools-pages`

---

## 2. Cursor commands

### 2.1 Gate

**Last run: Ready** (see below).

### 2.2 Implement

```text
prd: PRD/skydiver-tools-pages
branch: feat/skydiver-tools-pages
```

---

## 3. After the agent delivers the PR

1. Home “Ferramentas” cards navigate to tool pages.
2. Wingloading calculator returns lb/ft² for sample inputs.
3. Footer resource links work where mapped.
4. `/ferramentas` index lists all tools.
5. Disclaimer visible on all tool pages.
6. `npm run build` passes.

---

## 4. Quick reference

| Tool | Path |
|------|------|
| Index | `/ferramentas` |
| Guia harness | `/ferramentas/guia-harness` |
| Wingloading | `/ferramentas/wingloading` |
| Guia container | `/ferramentas/guia-container` |
| Calculadora valor | `/ferramentas/calculadora-valor` |

| Item | Value |
|------|--------|
| Config | `data/skydiverTools.ts` |
| Logic | `lib/tools/*` |
| Value bases | `mockListings` category averages |
| Branch | `feat/skydiver-tools-pages` |

---

## 5. Summary checklist

- [x] Open items resolved
- [x] Gate → **Ready**
- [ ] Implement on feature branch
- [ ] Four tools + index verified
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
| 4 | Scope documented (routes, disclaimer, mock pricing) | Pass | High |
| 5 | E2E plan for API | N/A | High |
| 6 | Agent-actions checklist satisfied | Pass | High |

**Summary:** PRD `PRD/skydiver-tools-pages` validated. Open items resolved: standard disclaimer copy approved; gear value bases from `mockListings` category averages. Ready for implementation on `feat/skydiver-tools-pages`.

# Agent Actions & Operator Checklist: Home Listing Sections

**PRD:** [prd.md](./prd.md)  
**Gate path:** `PRD/home-listing-sections`  
**E2E plan:** N/A (non-API PRD — no `e2e/` folder)

---

## 1. Before handing to the agent

### 1.1 PRD and scope

1. Read [prd.md](./prd.md) sections 1–7.
2. ~~Resolve **Open items**~~ — **Done** (section 6 = None).
3. Confirm five listing rows total (Em alta + 4 new) using shared `HomeListingSection`.

### 1.2 E2E plan

N/A — manual UI + `npm run build`.

### 1.3 Environment and secrets

1. `npm run dev` in `frontend/`.
2. Test mobile viewport (carousel) and desktop (grid).
3. No new env vars.

### 1.4 Commands and rules

1. `.cursor/rules/camelcase.mdc`
2. `.cursor/rules/commit-messages.mdc`
3. Branch: `feat/home-listing-sections`

---

## 2. Cursor commands

### 2.1 Gate

**Last run: Ready** (see below).

### 2.2 Implement

```text
prd: PRD/home-listing-sections
branch: feat/home-listing-sections
```

---

## 3. After the agent delivers the PR

1. Home shows: Em alta, Recém publicados, Com custódia, Sistemas completos, Velames em destaque.
2. Mobile: each section is horizontal carousel with “Ver mais” at end.
3. Desktop: grid per section; no duplicate grid on mobile.
4. “Ver mais” links open `/busca` with correct query params (`sort=newest` = `id` desc).
5. `npm run build` passes.

---

## 4. Quick reference

| Section | Filter | See more |
|---------|--------|----------|
| Em alta | First 6 listings | `/busca` |
| Recém publicados | `id` desc, 6 | `/busca?sort=newest` |
| Com custódia | `escrow === true` | `/busca?escrow=true` |
| Sistemas completos | category | `/busca?category=…` |
| Velames em destaque | category Velames | `/busca?category=Velames` |

| Item | Value |
|------|--------|
| Shared component | `components/home/HomeListingSection.tsx` |
| Config | `data/homeListingSections.ts` |
| `sort=newest` | `id` descending (mock) |
| Branch | `feat/home-listing-sections` |

---

## 5. Summary checklist

- [x] Open items resolved
- [x] Gate → **Ready**
- [x] Implement on feature branch
- [x] Five sections verified (build)
- [x] `npm run build` passes
- [ ] Search “Ver mais” queries work (manual)
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
| 4 | Scope documented (5 sections, SearchPage queries, no geo v1) | Pass | High |
| 5 | E2E plan for API | N/A | High |
| 6 | Agent-actions checklist satisfied | Pass | High |

**Summary:** PRD `PRD/home-listing-sections` validated. Open items resolved: “Perto de você” out of scope v1 (operator ok); `sort=newest` = `id` desc (operator ok). Ready for implementation on `feat/home-listing-sections`.

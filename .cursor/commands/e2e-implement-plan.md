# E2E implement plan

Take an **E2E plan folder** (from the [E2E test audit and prioritization](e2e-test-audit-prioritize.md) command), implement every test in the checklist, run the e2e suite after changes, and repeat until all items are implemented, tested, and consistent. Do not stop until the checklist is fully checked and the full e2e suite passes.

---

## Input: plan folder

- **If the user provides a path**, use that folder. Examples:
  - **Legacy (project-wide audit):** `PRD/E2E-plans/2025-03-08` or `@PRD/E2E-plans/2025-03-08`
  - **PRD folder structure (branch-scoped):** `PRD/new-request-endpoint/e2e` or `PRD/<short-title>/e2e` — when the PRD lives in a folder with an `e2e/` subfolder (see `PRD/prd-template.md`).
- **Otherwise**, list `PRD/E2E-plans/` and pick the **latest** run folder (e.g. by date in the name, such as `2025-03-08`).

The plan folder must contain:

- `e2e-test-plan.md` — scope, environment, auth, webhooks/jobs strategy, conventions.
- `e2e-test-cases.md` — test case specs (ID, endpoint, steps, expected result, suggested file).
- `e2e-implementation-checklist.md` — checklist with `- [ ]` / `- [x]` items.

Read all three (and `e2e-conventions.md` if present) before implementing anything.

---

## Conventions to follow

- **Imports:** `request` from `supertest`; `APP_URL`, `MASTER_API_KEY` from `./utils/constants` (specs live under `test/`, so path is relative to `test/`).
- **Protected routes:** `.set('x-api-key', MASTER_API_KEY)`.
- **Naming:** `describe('ControllerName (e2e)', () => { ... })`; file names `*.e2e-spec.ts` as in the checklist.
- **API prefix:** If the test plan says `API_PREFIX` is used in the project, prepend it to paths (e.g. `/api/sow`). Otherwise use paths as in the test cases (e.g. `/sow`).
- **Webhooks/jobs:** For tests marked “(webhooks/jobs)” in the checklist, do not depend on job completion; assert only HTTP status and response body. The plan states the API should run with processors disabled for e2e.
- Use the existing `test/app.e2e-spec.ts` as the pattern for structure and assertions.

---

## Execution loop

Repeat until **every** checklist item is checked and the **full** e2e suite passes.

### 1. Next unchecked item

- Open `e2e-implementation-checklist.md` and find the **first** line that is still `- [ ]` (unchecked).
- If the item says “_already implemented_” (e.g. e2e-001), mark it `- [x]` and continue to the next unchecked item. Do not re-implement.
- Otherwise, note the **test case ID** (e.g. e2e-002) and the **suggested spec file** (e.g. `test/health-auth.e2e-spec.ts`).

### 2. Resolve spec from test cases

- In `e2e-test-cases.md`, find the section for that ID (e2e-002, e2e-003, …).
- Read: endpoint (method + path), public/protected/admin, preconditions, **steps**, **expected result**, and file.

### 3. Implement

- **If the spec file does not exist:** create it under `test/` with the suggested name. Add one `describe` block and one `it` per test case you are adding in this step.
- **If the spec file already exists:** add the new `it` (and extend `describe` if needed) for this test case. Reuse the same `app` and constants.
- **Group by file when possible:** if the next several unchecked items share the same spec file (e.g. e2e-002, e2e-003, e2e-004 → `health-auth.e2e-spec.ts`), implement **all** of them in that file in one go, then run tests once and mark all of them checked. This reduces back-and-forth.
- Write the test exactly as specified: same path, same assertions (status code, body shape). Use `request(app).get(path).set(...).expect(status)` and `expect(body).toMatchObject(...)` or equivalent as in the test case.

### 4. Run e2e tests

- Run the e2e suite: **`npm run test:e2e`** (requires the API to be running locally) or **`npm run test:e2e:relational:docker`** (starts API in Docker and runs tests). Prefer Docker if the user did not start the API, so the run is self-contained.
- If the command fails (e.g. “API not reachable”): either ask the user to start the API and re-run, or run `npm run test:e2e:relational:docker` if available.

### 5. Fix until green

- If any test fails: read the error (status code, body, timeout). Fix the implementation: path (including API prefix), headers, request body, or assertion. Re-run `npm run test:e2e` (or Docker) until **all** tests pass. Do not mark the checklist item as done until the new test passes.

### 6. Update checklist

- In the plan folder's `e2e-implementation-checklist.md`, change the line(s) for the item(s) you just implemented from `- [ ]` to `- [x]`.  
  Path is either `PRD/E2E-plans/<run-folder>/e2e-implementation-checklist.md` (legacy) or `PRD/<short-title>/e2e/e2e-implementation-checklist.md` (PRD folder structure).
- If you implemented multiple items in one file (e.g. e2e-002, e2e-003, e2e-004), mark **all** of them `- [x]`.

### 7. Continue

- Go back to **1. Next unchecked item**. If there are no more `- [ ]` in the main list, proceed to **Final** (below). Otherwise keep implementing in order (P0 → P1 → P2 → P3).

---

## Final (when all test-case items are checked)

1. **Run the full e2e suite once more** and ensure every test passes. If anything fails, fix and re-run until green.
2. **Final checklist items:** In the checklist, under “Final”, mark:
   - `- [x]` for “All new specs run with `npm run test:e2e` (and/or … Docker)”.
   - `- [x]` for “Docs updated … if scope changed” — and actually update docs if the plan or scope references docs (e.g. `docs/development/tests.md` linking to this plan folder). If nothing to update, mark it done anyway.
3. **Consistency check:** All spec files under `test/` that you created or edited should follow the same conventions (imports, naming, use of `APP_URL`/`MASTER_API_KEY`). No stray paths or duplicate tests.

---

## Stop condition

- **Done when:** (a) every line in the checklist is `- [x]`, and (b) `npm run test:e2e` (or the Docker e2e command) completes with all tests passing.
- **Do not stop** after only a subset of items; continue the loop until the checklist is fully implemented and the suite is green. If a test cannot be implemented (e.g. missing seed, external service), document it in the checklist as a note next to the item, mark it `- [x]` with “(skipped: reason)”, and continue; report skipped items at the end.

---

## Output at the end

Provide a **short summary**:

- Plan folder used (e.g. `PRD/E2E-plans/2025-03-08/` or `PRD/new-request-endpoint/e2e/`).
- Number of tests implemented (and any skipped with reason).
- Result of the final e2e run (pass/fail, and that all tests pass).
- Path to the updated checklist.

---

## Project-specific (brainstorm-api)

- **E2E config:** `test/jest-e2e.json`; specs under `test/*.e2e-spec.ts`.
- **Constants:** `test/utils/constants.ts` — `APP_URL`, `MASTER_API_KEY`.
- **Run:** `npm run test:e2e` (API must be running); `npm run test:e2e:relational:docker` for Docker.
- **API prefix:** Check `main.ts` and the test plan; if `API_PREFIX` is set in env, use it in paths (e.g. `/api/sow`). Default may be no prefix for e2e.
- Items marked **(webhooks/jobs)** in the checklist: assert HTTP only; no dependency on processors or ClickUp.

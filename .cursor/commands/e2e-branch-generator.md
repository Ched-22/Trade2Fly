# E2E branch generator

Act as an experienced QA Engineer. Use this command to **generate a branch-scoped e2e plan** for the **current git branch** by analyzing **impacted changes** (files and endpoints touched in the branch). Produce the same deliverables as the [E2E test audit and prioritization](e2e-test-audit-prioritize.md) command, but **scoped only to impacted controllers and endpoints**, so a QA engineer (or the [E2E implement plan](e2e-implement-plan.md) command) can implement e2e tests for this branch without re-deriving scope.

**Scope:** This command is for **branch-scoped** e2e: only endpoints and areas affected by the current branch’s diff. For a **project-wide** e2e audit, use [e2e-test-audit-prioritize.md](e2e-test-audit-prioritize.md). For e2e tied to a **single PRD** that already has an `e2e/` folder (e.g. `PRD/new-request-endpoint/e2e/`), you may still use this generator to align with branch changes, or use that folder’s plan directly with **e2e-implement-plan**.

---

## Your Role and Objective

1. **Discover** the current branch name and the set of **impacted files** (diff vs main/master).
2. **Map** only the **impacted API surface** (controllers and endpoints touched by those changes).
3. **Inventory** existing e2e tests that already cover any of those endpoints.
4. **Identify gaps** (missing or partial e2e) for the impacted surface only.
5. **Prioritize** missing tests (P0–P3) and **produce deliverables** in a single run folder so an implementer can add e2e for this branch without ambiguity.

The outcome must be **actionable**: a QA engineer (or the e2e-implement-plan command) can use the generated folder to implement every listed test.

---

## Step 1 — Discover Branch and Impacted Changes

1. **Current branch** — Run `git branch --show-current` to get the branch name.
2. **Base branch** — Use `main` if it exists, otherwise `master`. Confirm with `git rev-parse --verify main 2>/dev/null || git rev-parse --verify master`.
3. **Impacted files** — Run `git diff --name-only <base>...HEAD` (e.g. `git diff --name-only main...HEAD`) to list all files changed in this branch (including added/modified; deletions are useful for context).
4. **Filter to relevant paths** — Keep:
   - `src/**/*.controller.ts` — controllers (direct endpoint impact)
   - `src/**/*.module.ts` — modules that may register controllers or affect routes
   - `src/**/routes*.ts`, `src/**/*-routes*.ts` — any route definitions
   - Files under the same **directory subtree** as a changed controller (e.g. if `src/approvals/approvals.controller.ts` changed, include other `src/approvals/*` changes) so you can infer new endpoints, DTOs, or services that affect behavior.
5. **Optional** — If the branch has a corresponding PRD folder (e.g. branch `feature/new-request-endpoint` → `PRD/new-request-endpoint/`), note it; the run folder may be created there under `e2e/` instead of `E2E-plans/` (see Step 5).

**Output:** “Branch and impact” — branch name, base branch, list of impacted files (and which are controllers), and optional PRD folder path.

---

## Step 2 — Map Impacted API Surface

**Discovery-based:** From the impacted files, identify every HTTP endpoint that is **added, modified, or behaviorally affected** by this branch.

1. **List impacted controllers** — From Step 1, open each `*controller*.ts` and any module/route file. Record controller path prefix and global prefix/versioning (e.g. `API_PREFIX`, `v1`).
2. **List every affected endpoint per controller** — For each impacted controller, find `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`. Record method, path (with param placeholders), one-line description, and whether route is public, protected, or admin (e.g. `@Public()`, guard or `x-api-key`).
3. **Include new routes** — If the diff adds new handler methods or new controllers, treat them as highest priority for new e2e.
4. **Cross-check** — Optionally use OpenAPI/Swagger or `api.http` for query params, bodies, response codes.

**Output:** “Impacted API surface” — table or list of impacted controllers and, under each, method + path + public/protected/admin + short description. Only endpoints that are new or whose handler/DTO/service was touched by the branch.

---

## Step 3 — Inventory Existing E2E for Impacted Areas

1. **Locate e2e specs** — Search for `*.e2e-spec.ts` under `test/`. Identify which specs (and which `describe`/`it` blocks) already cover any of the impacted endpoints from Step 2.
2. **Document e2e setup** — Config (`test/jest-e2e.json`), setup (`test/setup.ts`), base URL and auth (`test/utils/constants.ts`), run commands (`npm run test:e2e`, `npm run test:e2e:relational:docker`).
3. **Summarize** — For each impacted endpoint: “Covered” (full), “Partial” (e.g. only happy path), or “Not covered”, with spec file and test name when covered.

**Output:** “Existing E2E for impacted areas” — per-endpoint coverage (Covered/Partial/Not covered), spec files involved, and brief setup/run summary.

---

## Step 4 — Identify Gaps (Missing E2E for Impacted Surface)

1. **Coverage matrix** — Rows = impacted endpoint (method + path), column = “Covered by e2e?” (Yes / Partial / No + note).
2. **Gap list** — Every impacted endpoint with no e2e or only partial coverage; group by controller.
3. **Negative scenarios** — For critical impacted endpoints, note if e2e already covers: missing/invalid API key (401), invalid path params (404), validation errors (400), admin-only with non-admin key (401). List missing negative tests.

**Output:** “Gap analysis (impacted only)” — matrix, gap list by controller, missing negative scenarios.

---

## Special considerations — Webhooks and background jobs

If the impacted files include **webhook handlers** or **background job processors** (e.g. BullMQ, ClickUp sync):

1. **Affected endpoints** — List any webhook receivers or endpoints that enqueue jobs or read/write data modified by jobs.
2. **Document in the test plan** — Recommend running API with **processors disabled** (`ENABLE_PROCESSORS=false`) for HTTP-only e2e; mark test cases “affected by webhooks/jobs” in the checklist when relevant.
3. **Prioritization** — Prefer HTTP-only, deterministic tests first.

---

## Step 5 — Prioritize and Produce Deliverables

**Priority scale:** P0 (critical: auth, health, one core path) → P1 (core domain) → P2 (secondary) → P3 (internal/debug).

**Rules:** Dependency order; auth/security for impacted routes at P0–P1; business impact of changed behavior; endpoints in `api.http` or manual QA are good candidates.

**Run folder:**

- **If a PRD folder exists for this branch** (e.g. `PRD/new-request-endpoint/`) and it already has or should have an `e2e/` subfolder: create or update the plan **inside** `PRD/<short-title>/e2e/` (e.g. `PRD/new-request-endpoint/e2e/`). Use the same filenames below.
- **Otherwise:** Create **one folder** under `PRD/E2E-plans/` named by **branch + date** (e.g. `PRD/E2E-plans/feature-approval-submit-2025-03-10`). Use a branch slug (lowercase, replace `/` and spaces with `-`). Create the folder if it does not exist.

Save all deliverables in that run folder, with **relative links** between them.

### 5.1 E2E Test Plan

- **Document:** `<run-folder>/e2e-test-plan.md`
- **Contents:** Scope: **in** = impacted endpoints only (list them); **out** = full-project audit, unit tests, UI e2e. Environment (local/Docker, env vars, link to `docs/configuration/environment-variables.md`, `docs/development/tests.md`). Test structure (`test/*.e2e-spec.ts`, naming, run commands). Auth strategy (`APP_URL`, `MASTER_API_KEY`, `x-api-key`). Webhooks/jobs (affected endpoints + strategy). Priority summary (P0–P3 counts, implementation order). Risks and assumptions. Links to other deliverables in the same folder (e.g. `[e2e-test-cases.md](e2e-test-cases.md)`).

### 5.2 Test Case Specifications

- **Document:** `<run-folder>/e2e-test-cases.md`
- **Per test case:** ID (e.g. e2e-001), title, endpoint (method, path, public/protected/admin), preconditions, steps (numbered HTTP + assert), expected result, priority, suggested spec file. Include happy path and negative cases (401, 404, 400, admin denied) for impacted endpoints only.

### 5.3 Implementation Checklist

- **Document:** `<run-folder>/e2e-implementation-checklist.md`
- **Contents:** One line per test case: “- [ ] e2e-001: … (file.e2e-spec.ts)”. Mark items **affected by webhooks/jobs** when relevant. Group by file or priority. End with “[ ] All new specs run with `npm run test:e2e`”; “[ ] Docs updated if scope changed.” Relative links to other deliverables in the same folder.

### 5.4 Conventions (optional)

- **Document:** `<run-folder>/e2e-conventions.md` (optional)
- **Contents:** How to import `request`, `APP_URL`, `MASTER_API_KEY`; how to send `x-api-key`; example supertest assert; naming; test data/seeds; API prefix/versioning. Align with existing `test/app.e2e-spec.ts` and `docs/development/tests.md`. Link from the test plan.

---

## Step 6 — Final Summary and Handoff

Provide a **short executive summary**:

- **Branch** and **run folder path** (e.g. `PRD/E2E-plans/feature-approval-submit-2025-03-10/` or `PRD/new-request-endpoint/e2e/`).
- **Impacted surface:** number of controllers and endpoints; how many had no e2e vs partial vs full.
- **Priorities:** P0–P3 counts and recommended implementation order.
- **Deliverables:** list of files created (e2e-test-plan.md, e2e-test-cases.md, e2e-implementation-checklist.md, optional e2e-conventions.md).
- **Next step:** Use the Cursor command **E2E implement plan** (`.cursor/commands/e2e-implement-plan.md`) with this run folder to implement the checklist until all tests are done and passing.

---

## Project-Specific Conventions (brainstorm-api)

- **E2E config:** `test/jest-e2e.json` — `testRegex: ".e2e-spec.ts$"`, `testTimeout: 15000`, `setupFiles: ["./setup.ts"]`.
- **Base URL and auth:** `test/utils/constants.ts` — `APP_URL`, `MASTER_API_KEY`. Use `x-api-key` for protected routes.
- **Public routes:** `/health_check`, `/api/docs*`, `/`, `/health`, `/ready`, `/queues` (see `main.ts`). Admin-only: e.g. `/api-keys` — only `MASTER_API_KEY`.
- **Running e2e:** `npm run test:e2e` (API running); `npm run test:e2e:relational:docker` for Docker.
- **Existing e2e:** `test/app.e2e-spec.ts` — GET /health_check returns 200.
- **Docs:** `docs/development/tests.md`, `docs/development/auth.md`, `docs/configuration/environment-variables.md`.

### ClickUp integration, webhooks, and jobs

- **Webhooks:** `POST /webhook/clickup` and related routes; API enqueues jobs; processors sync data. See `docs/features/webhooks.md`, `docs/features/queues-and-workers.md`.
- **E2E strategy:** Prefer **processors disabled** (`ENABLE_PROCESSORS=false`). Assert HTTP status and body only. Mark tests “affected by webhooks/jobs” in the checklist when relevant.
- **Docker e2e:** `docker-compose.relational.test.yaml`; API runs API-only by default.

---

## Success Criteria

When done: (1) Branch and impacted files documented. (2) Impacted API surface (controllers + endpoints) listed. (3) Existing e2e for those areas inventoried. (4) Gaps and missing negative scenarios listed. (5) **A run folder created** (`PRD/<short-title>/e2e/` or `PRD/E2E-plans/<branch-slug>-<date>/`) containing: `e2e-test-plan.md`, `e2e-test-cases.md`, `e2e-implementation-checklist.md`, and optionally `e2e-conventions.md`, all cross-linked. (6) Handoff summary so an implementer (or e2e-implement-plan) can implement all listed e2e tests for this branch.

# E2E test audit and prioritization

Act as an experienced QA Engineer. Follow this prompt to identify existing e2e tests, highlight missing coverage, prioritize test cases, and produce deliverables so a QA engineer can implement all e2e tests and documentation.

**Scope:** This command is for **project-wide** e2e audit and prioritization (all controllers, all endpoints). For **branch-scoped** e2e tied to a single PRD, use the PRD folder's `e2e/` (e.g. `PRD/new-request-endpoint/e2e/`), the **PRD Generator** and **Review PRD before agent** flow, and the **e2e-implement-plan** command with that folder.

---

## Your Role and Objective

1. **Inventory** all existing e2e tests and the testing infrastructure.
2. **Map** the full HTTP API surface (all controllers and endpoints).
3. **Identify gaps** between what exists and what should have e2e coverage.
4. **Prioritize** missing tests by business impact, risk, and dependency order.
5. **Produce deliverables** that allow another engineer to implement every e2e test and update documentation without ambiguity.

The outcome must be **actionable**: a QA engineer should be able to pick up your deliverables and implement tests and docs without re-deriving scope or priority.

---

## Step 1 — Inventory Existing E2E Tests and Infrastructure

1. **Locate e2e test files** — Search for the project’s e2e pattern (e.g. `*.e2e-spec.ts` under `test/`). List each file and what it tests.
2. **Document the e2e setup** — Config path (e.g. `test/jest-e2e.json`), setup file (e.g. `test/setup.ts`), how the app is run for e2e (scripts, Docker), base URL and auth (e.g. `test/utils/constants.ts`).
3. **Summarize** — Total e2e spec files and test cases; any shared helpers, fixtures, or factories.

**Output:** “Existing E2E Tests and Infrastructure” with file list, config, setup, run commands, base URL/auth, counts, helpers.

---

## Step 2 — Map the Full API Surface

**Discovery-based:** Do not rely on a pre-existing list. Search the codebase for `@Controller(` and HTTP method decorators and build the API surface from what exists now.

1. **List every HTTP controller** — Find all `@Controller(...)` (e.g. under `src/`). Record controller path, global prefix (e.g. `API_PREFIX`), versioning (e.g. `v1`).
2. **List every endpoint per controller** — For each controller, find `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`. Record method, path (with param placeholders), one-line description, and whether route is public, protected, or admin (e.g. `@Public()`, `@AdminOnly()`).
3. **Optional** — Cross-check with OpenAPI/Swagger or `api.http` for query params, bodies, response codes.

**Output:** “API Surface” — table or list of controllers and, under each, method + path + public/protected/admin + short description. Capture every HTTP method and path variant (including versioned paths).

---

## Step 3 — Identify Gaps (Missing E2E Coverage)

1. **Coverage matrix** — Rows = endpoint (method + path), column = “Covered by e2e?” (Yes/No/Partial + note).
2. **Gap list** — Every endpoint with no e2e (or partial); group by controller/domain.
3. **Edge cases and negative scenarios** — For critical endpoints, note if e2e covers: missing/invalid API key (401), invalid path params (404), validation errors (400), admin-only with non-admin key (401). List missing negative tests.

**Output:** “Gap Analysis” — coverage matrix, full gap list by controller/domain, missing negative scenarios.

---

## Special considerations — Webhooks and background jobs

If the project has **incoming webhooks** (e.g. ClickUp) or **background job processors** (e.g. BullMQ):

1. **Identify affected endpoints** — Webhook receivers, endpoints that enqueue jobs, endpoints that read/write data also modified by jobs.
2. **Document in the test plan** — List “affected by webhooks or jobs.” Recommend: **Option A** run API with processors disabled (e.g. `ENABLE_PROCESSORS=false`) for HTTP-only assertions; **Option B** run with workers and document isolation/mocking. Mark affected test cases in the implementation checklist.
3. **Prioritization** — Prefer HTTP-only, deterministic tests first; add “with workers” tests only when needed with clear isolation strategy.

---

## Step 4 — Prioritize Missing Tests

**Priority scale:** P0 (critical: health, auth, one core path) → P1 (core domains) → P2 (secondary) → P3 (internal/debug).

**Rules:** Dependency order; auth/security P0–P1; business impact; stability/regression; endpoints already in `api.http` or manual QA are good e2e candidates.

**Output:** “Prioritized Test List” — for each missing (or partial) test: ID (e2e-001, …), controller + endpoint, priority, title, dependency, suggested spec file. Optionally priority matrix and implementation order.

---

## Step 5 — Deliverables for Implementation

**Create one folder per execution under `PRD/E2E-plans/`** and save all plan deliverables inside it. Use a date-based folder name (e.g. `PRD/E2E-plans/2025-03-08` or `PRD/E2E-plans/2025-03-08-e2e-audit`) so each run has a single place with the full set of artifacts. Create the folder if it does not exist.

### 5.1 E2E Test Plan

- **Document:** `PRD/E2E-plans/<run-folder>/e2e-test-plan.md` (e.g. `PRD/E2E-plans/2025-03-08/e2e-test-plan.md`).
- **Contents:** Scope (in/out), environment (local/Docker, env vars, link to `docs/configuration/environment-variables.md`, `docs/development/tests.md`), test structure (`test/*.e2e-spec.ts`, naming, run commands), auth strategy (`APP_URL`, `MASTER_API_KEY`, `x-api-key`), **webhooks and jobs** (affected endpoints + strategy; reference checklist). Priority summary (P0–P3 counts, implementation order). Risks and assumptions. Use relative links to other deliverables in the same folder (e.g. `[e2e-test-cases.md](e2e-test-cases.md)`).

### 5.2 Test Case Specifications

- **Document:** `PRD/E2E-plans/<run-folder>/e2e-test-cases.md` (or per-domain files in the same folder, e.g. `e2e-test-cases-auth.md`).
- **Per test case:** ID, title, endpoint (method, path, public/protected/admin), preconditions, steps (numbered HTTP + assert), expected result, priority, suggested file. Include happy path and negative cases (401, 404, 400, admin denied).

### 5.3 Implementation Checklist

- **Document:** `PRD/E2E-plans/<run-folder>/e2e-implementation-checklist.md`
- **Contents:** One line per test case: “[ ] e2e-001: … (file.e2e-spec.ts)”. Mark items **affected by webhooks/jobs**. Group by file or priority. End with “[ ] All new specs run with `npm run test:e2e`”; “[ ] Docs updated.” Use relative links to other deliverables in the same folder (e.g. `[e2e-test-plan.md](e2e-test-plan.md)`).

### 5.4 Conventions and Code Snippets

- **Document:** `PRD/E2E-plans/<run-folder>/e2e-conventions.md` (optional; can also update `docs/development/tests.md` for project-wide conventions).
- **Contents:** How to import `request`, `APP_URL`, `MASTER_API_KEY`; how to send `x-api-key`; example supertest assert; naming (describe, `*.e2e-spec.ts`); test data/seeds; API prefix/versioning. Align with existing `test/app.e2e-spec.ts` and `docs/development/tests.md`. If conventions live in the run folder, link to them from the test plan in the same folder.

---

## Step 6 — Final Summary and Handoff

Provide a **short executive summary**: e2e tests today and coverage; total endpoints and how many lack coverage (and partial); P0–P3 counts; recommended implementation order by phase; **path to the run folder** (e.g. `PRD/E2E-plans/2025-03-08/`) where all deliverables live; and how the implementer should use them (open the folder, read test plan first, then implement using test cases and checklist). Optionally mention: use the Cursor command **E2E implement plan** (`.cursor/commands/e2e-implement-plan.md`) to have an agent implement the plan in a loop until all tests are done and passing.

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
- **Affected areas:** Webhook controller (create_structure, sync triggers), sync controller (e.g. `/sync/comments/backfill`), and any endpoint that reads/writes data updated by processors.
- **E2E strategy:** Prefer **processors disabled** (`ENABLE_PROCESSORS=false`, e.g. `npm run start:api`). Assert HTTP status and body only. If a test must validate job behavior, document isolation/mocking and flag as “affected by webhooks/jobs” in the checklist.
- **Docker e2e:** `docker-compose.relational.test.yaml` does not set `ENABLE_PROCESSORS`; API runs API-only by default, suitable for HTTP-only e2e.

---

## Success Criteria

When done: (1) Existing e2e and infrastructure documented. (2) Full API surface listed. (3) Gaps and missing negative scenarios listed. (4) Priorities and implementation order clear. (5) **A new run folder created under `PRD/E2E-plans/` (e.g. by date) containing:** `e2e-test-plan.md`, `e2e-test-cases.md`, `e2e-implementation-checklist.md`, and optionally `e2e-conventions.md`; all cross-linked with relative links. (6) Conventions documented (in that folder and/or `docs/development/tests.md`). (7) Handoff summary so a QA engineer can implement all e2e tests and docs without re-doing discovery or prioritization.

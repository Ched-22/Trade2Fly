# Update project docs

Sync `docs/` with code/config: only update docs that are affected by changes on the current branch. Minimal, targeted edits. Point to Swagger for API details; no full endpoint tables in docs.

**You must implement the doc updates** — edit the actual doc files (StrReplace/Write). Do not only list proposed changes in chat. The user will review the edits and may ask you to review the changes (e.g. for self-command-learn).

---

## 1. Changed files

- **Base:** Branch the current branch was created from. Infer from repo (e.g. `git remote show origin` for default branch); if unclear, ask the user. Then `BASE=$(git merge-base <base-branch> HEAD)`.
- **List:** `git diff $BASE --name-only` ∪ `git diff --cached --name-only`. Ignore `docs/` and `PRD/` for *triggers*; only `src/`, `config/`, `.env.example`, `.vscode/`, `helm/` drive updates.

---

## 2. What to update

| Changed area | Doc(s) | Action |
|--------------|--------|--------|
| `src/config/env.validation.ts`, config types | `docs/configuration/environment-variables.md` | Add/remove vars to match code; use existing sections. Boilerplate/unused → `PRD/prd-env-vars-checkup-later.md`. |
| `.env.example`, `helm/values*.yaml` | `docs/configuration/environment-variables.md` | Add new vars if used in code; note Helm where relevant. |
| Queues: `queue.config.ts`, `queue.module.ts`, `processors/*.ts` | `docs/features/queues-and-workers.md`, `docs/features/clickup-integration.md` | Update queues table (name, purpose, processor); ClickUp queues → clickup-integration scope. |
| Controllers: `src/modules/*/`, `src/comments/`, sync, webhook | `docs/features/webhooks.md`, `docs/features/clickup-integration.md` | One-line scope only; link to Swagger. New feature → one bullet + PRD link if exists. |
| `.vscode/launch.json` | `docs/getting-started/installing-and-running.md`, `docs/operations/troubleshooting.md` | One line for new debug configs if important. |
| New npm scripts (run/test/debug) | `docs/getting-started/installing-and-running.md`, `docs/development/tests.md` | Brief step for how to run/debug. |
| New/removed modules, big arch change | `docs/development/architecture.md`, `docs/readme.md` | High-level only; no code duplication. |
| New PRD / product doc | `PRD/`, `docs/readme.md` (Other) | Add file; link in readme Other/implementation plans. |

---

## 3. Docs structure

- **ToC:** `docs/readme.md` has the ordered list of pages. Keep order correct.
- **Bottom nav:** Pages use `Previous: [Title](path)` and `Next: [Title](path)` at the end. When you **add a page** between A and B: (1) Insert in ToC between A and B, (2) New page: Previous=A, Next=B, (3) A’s Next → new page, (4) B’s Previous → new page. When removing/reordering, fix ToC and all affected Previous/Next.
- **Other:** New docs under `docs/other/` or implementation plans → add link in readme “Other” section.

---

## 4. Implement edits

- **Edit the doc files** (use StrReplace or Write). Only fix what is wrong or missing in each doc.
- Env vars: only implemented/used; same names as code.
- Endpoints: scope in 1–2 sentences + Swagger. Queues: one row per queue, match `queue.config.ts` and processor names.
- camelCase in examples; relative links between docs; PRD links as `../../PRD/prd-....md` from `docs/`.

---

## 5. Done

- No relevant changes in `src/`, config, `.env.example`, `.vscode/`, `helm/` → say “No code/config changes that require doc updates” and stop.
- **After implementing edits:** Short list of which docs you updated and what you changed (for user review; they may later ask you to review the changes for self-command-learn).

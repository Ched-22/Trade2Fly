# PRD Generator

Create a **new PRD** using the project's **one-folder-per-PRD** structure and template. The command uses context from the user and the project to scaffold `prd.md`, `agent-actions.md`, optional `e2e/`, and `README.md` so the PRD is ready to fill and later pass **Review PRD before agent**.

---

## When to use

- You want to start a **new feature or change** and need a PRD that follows the canonical structure.
- You have a short description or topic (e.g. "account settings endpoint", "refactor task sync") and want a ready-to-edit PRD folder.

---

## Input

- **Short title** (required) — Kebab-case name for the PRD folder and doc (e.g. `account-settings-endpoint`, `task-sync-refactor`). If the user gives a phrase, convert it to kebab-case (e.g. "Account Settings Endpoint" → `account-settings-endpoint`).
- **Goal or context** (optional but recommended) — One or two sentences describing what the PRD is for (e.g. "New GET/POST endpoints for account-level settings under /account/:accountId/settings"). Use this to fill the Summary and Context sections and to infer whether this is an **API/endpoint PRD** (needs Endpoint spec, Response schema, and `e2e/`).
- **Source** (optional) — Link or reference to a parent doc (e.g. `../client-portal/stories.md`, epic, ticket). Insert into the PRD header and Context.
- **API vs non-API** (optional) — If not obvious from the goal, ask or infer: does this PRD introduce or change HTTP endpoints? If yes, add Endpoint specification, Response schema, and scaffold `e2e/`. If no, omit those sections and either omit `e2e/` or add a minimal placeholder.

---

## Project context to use

Before generating, read (or confirm you have):

1. **`PRD/prd-template.md`** — Required sections, header block, folder structure. Generate `prd.md` so it satisfies the template (all required sections present; use placeholders like `TBD`, `(describe …)` where the user has not provided detail).
2. **`PRD/README.md`** — Folder layout and pointer to template and review command.
3. **Existing example (optional):** `PRD/new-request-endpoint/` — Reference for tone, section numbering, and how to link to `prd.md`, `e2e/`, and the gate command in `agent-actions.md`.
4. **Existing PRD folders** — List `PRD/*/` (or glob) to avoid creating a duplicate folder name; suggest a variant if the name is taken.

---

## Steps

1. **Resolve input** — Get short title from the user or context. Derive kebab-case folder name. If goal/context is missing, ask: "One-sentence goal?" and "Does this involve new or changed HTTP endpoints (API PRD)?".
2. **Check for existing folder** — If `PRD/<short-title>/` already exists, do not overwrite; report and ask for a different title or to edit the existing PRD.
3. **Read template** — Open `PRD/prd-template.md`. Ensure generated `prd.md` includes:
   - Header block: Document (`<short-title>/prd.md`), Created (today's date YYYY-MM-DD), Status (Draft), Source (if provided).
   - Required sections: Summary, Context/background, Implementation steps, Dependencies, Resolved decisions, Open items, Out of scope.
   - If API PRD: Endpoint specification, Response schema.
   - Optional but recommended: Data flow/behavior, Agent implementation guide (Section 11 style with subsections 11.1–11.7 placeholder or minimal).
4. **Generate `prd.md`** — Fill Summary and Context from the user's goal/context; use placeholders (TBD, "…", "(describe …)") for Implementation steps, Dependencies, Resolved decisions, Open items (explicit "None" or "TBD"), Out of scope. For API PRDs add Endpoint spec and Response schema with placeholder tables. Use relative links for project docs (e.g. `../database-schema.md`, `../client-portal/stories.md`). Section numbering: 1. Summary, 2. Context…, 3. Endpoint spec (if API), etc.
5. **Generate `agent-actions.md`** — Use the same structure as `PRD/new-request-endpoint/agent-actions.md` but parameterized by `<short-title>`: title "Agent Actions & Operator Checklist: <Human Title>", link to `prd.md`, gate command path `PRD/<short-title>`, E2E plan folder `PRD/<short-title>/e2e/`. Include sections: 1. Before Handing to the Agent (1.1 PRD and Scope, 1.2 E2E Plan, 1.3 Environment and Secrets, 1.4 Commands and Rules), 2. Cursor Commands (Gate, Optional Implement), 3. After the Agent Delivers the PR, 4. Quick Reference, 5. Summary Checklist, and **Last review result** (placeholder: "This section is updated by the Review PRD before agent command…").
6. **Generate `README.md`** — Short pointer: title, link to `prd.md`, `agent-actions.md`, `e2e/` (if present). Line: "Run **Review PRD before agent** with path **`PRD/<short-title>`**."
7. **Generate `e2e/` (only if API/endpoint PRD)** — Create `e2e/e2e-test-plan.md`, `e2e/e2e-test-cases.md`, `e2e/e2e-implementation-checklist.md`. Scope: "Endpoints covered by this PRD (TBD or list from prd.md if known)." Reuse structure from `PRD/new-request-endpoint/e2e/`; links to `../prd.md` and `../agent-actions.md`; relative links to `../../../docs/` for project docs. If endpoints are known from the goal, list them in the e2e scope; otherwise use "TBD — update after Endpoint specification is filled in prd.md."
8. **Write files** — Create `PRD/<short-title>/prd.md`, `agent-actions.md`, `README.md`, and if API PRD the three files under `e2e/`.
9. **Output summary** — Tell the user: folder created at `PRD/<short-title>/`; list files; "Fill placeholders in prd.md (and e2e/ if present), then run **Review PRD before agent** with path `PRD/<short-title>`."

---

## Conventions to follow

- **camelCase** in generated examples (DTOs, fields) per `.cursor/rules/camelcase.mdc`.
- **Numbered lists** for requirements and steps in prd.md per `.cursor/rules/prd-and-plans.mdc`.
- **Relative links** from inside the PRD folder: `../database-schema.md`, `../client-portal/stories.md`; from e2e: `../prd.md`, `../agent-actions.md`, `../../../docs/...`.
- **Document** line in prd.md: `**Document:** `<short-title>/prd.md`` (folder-relative path).

---

## Output summary format

**Created:** `PRD/<short-title>/`

| File | Purpose |
|------|---------|
| prd.md | Main PRD (template-compliant; fill placeholders). |
| agent-actions.md | Operator checklist; gate path `PRD/<short-title>`. |
| README.md | Pointer to prd, agent-actions, e2e, and gate command. |
| e2e/*.md | (If API PRD) E2E plan, cases, checklist — scope TBD or from prd. |

**Next steps:**

1. Edit `prd.md` (and `e2e/` if present) to replace TBDs and placeholders.
2. Run **Review PRD before agent** (`.cursor/commands/review-prd-before-agent.md`) with path **`PRD/<short-title>`** to validate and record the result in `agent-actions.md`.
3. After the gate reports Ready, hand the PRD folder to the implementation agent.

---

## Reference

- **Template:** `PRD/prd-template.md` — canonical structure and validation checklist.
- **Review command:** `.cursor/commands/review-prd-before-agent.md` — run with the **folder** path after filling the PRD.
- **Example PRD folder:** `PRD/new-request-endpoint/` — full example of prd.md, agent-actions.md, e2e/.

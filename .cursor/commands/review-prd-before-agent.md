# Review PRD Before Agent (gate)

Run this command **before** handing a PRD to the implementation agent. It validates the **PRD structure** against the project template, runs a generic gate on **content** and optional agent-actions doc, then reports results in a table with status and confidence. When the PRD is a **folder** (or agent-actions path is resolved), the command **writes the run result** into **`agent-actions.md`** so that file is both input (checklist for checks 5–6) and **outcome** (last review result).

---

## When to use

- You are about to start an agent to implement **any** PRD.
- You want to verify the PRD **follows the canonical structure** and that content/operator checklist are ready so the agent can proceed without ambiguity.

---

## Input

- **PRD path** (required) — The PRD to review. Can be either:
  - A **file** (e.g. `PRD/prd-new-request-endpoint.md`), or
  - A **folder** (e.g. `PRD/new-request-endpoint` or `PRD/new-request-endpoint/`) — recommended: one folder per PRD containing all artifacts (see `PRD/prd-template.md` § PRD folder structure).
- **Template path** (optional) — Default: **`PRD/prd-template.md`**. Use this to validate PRD structure (required sections, required content per section). If not provided, use the default.
- **Agent-actions doc** (optional) — A **generic** operator checklist that applies to PRD-based implementations. Examples:
  - A companion file next to the PRD (e.g. `PRD/agent-actions-<short-name>.md` for that feature), or
  - A single project-wide doc (e.g. `PRD/agent-actions-checklist.md`) that describes pre-agent steps for all PRDs.
  The developer can add **extra instructions** in the agent-actions doc when needed (e.g. feature-specific E2E plan folder path). If no path is given, resolve as follows:
  - **If the PRD path is a folder:** use `agent-actions.md` inside that folder.
  - **If the PRD path is a file:** look for a companion `agent-actions-<short-name>.md` in the same directory or in `PRD/`, or for `agent-actions.md` inside a folder with the same short-name (e.g. `PRD/new-request-endpoint/agent-actions.md` when reviewing `PRD/prd-new-request-endpoint.md`).

**Resolving the PRD and E2E plan when path is a folder:**

- **Main PRD:** Read `prd.md` inside the folder. If missing, look for a single `prd-*.md` or `*.md` that looks like the main PRD in that folder.
- **Agent-actions:** `agent-actions.md` in the same folder.
- **E2E plan folder:** `e2e/` inside the PRD folder. Check for `e2e/e2e-test-plan.md`, `e2e/e2e-test-cases.md`, `e2e/e2e-implementation-checklist.md`. If the path was a file, E2E plan stays as before (e.g. `PRD/E2E-plans/<date>-<name>/` per agent-actions or naming convention).

---

## Structure validation (template)

Before running content checks, validate the PRD against the **template**:

1. **Read the template** — Open `PRD/prd-template.md` (or the template path provided). It defines:
   - Required header block (Document, Created, Status)
   - Required sections for all PRDs: Summary, Context/background, Implementation steps, Dependencies, Resolved decisions, Open items, Out of scope
   - For API/endpoint PRDs: Endpoint specification, Response schema
   - Optional: Data flow, Agent implementation guide
2. **Match the PRD** — Check that the given PRD contains each required section (by heading pattern or equivalent). Section numbers may differ; content matters.
3. **Check required content** — For each required section, verify it has the expected content (e.g. Endpoint spec has paths/methods/params; Open items is explicit "None" or a list; Implementation steps are actionable).

Report structure validation as one or more rows in the result table (see Checks below).

---

## Checks to run

Execute the following checks. For each, set **Status** (Pass / Fail / N/A) and **Confidence** (High / Medium / Low). N/A when the check does not apply to this PRD (e.g. no E2E section); Low = inferred or assumed; High = explicitly stated in the PRD or agent-actions doc.

| # | Check | Status | Confidence |
|---|-------|--------|------------|
| 0 | **Structure:** PRD follows the structure in `PRD/prd-template.md`: required header and required sections present (Summary, Context, Implementation steps, Dependencies, Resolved decisions, Open items, Out of scope). For API PRDs: Endpoint specification and Response schema present. | Pass / Fail / N/A | High / Medium / Low |
| 0b | **Structure (content):** Required sections contain the expected content (e.g. paths/methods/params in Endpoint spec; explicit Open items "None" or list; actionable Implementation steps). | Pass / Fail / N/A | High / Medium / Low |
| 1 | PRD has no open design questions or TBD items that block implementation (e.g. "Open Items" empty or resolved). | Pass / Fail / N/A | High / Medium / Low |
| 2 | Paths, request/response schema, and error codes are specified (or N/A for non-API PRDs). | Pass / Fail / N/A | High / Medium / Low |
| 3 | Implementation steps and file references (or equivalent) are clear enough for an agent to implement. | Pass / Fail / N/A | High / Medium / Low |
| 4 | Scope decisions that affect implementation are documented (e.g. remove/deprecate/keep for existing endpoints). | Pass / Fail / N/A | High / Medium / Low |
| 5 | If the PRD involves new/changed API endpoints: a **branch-scoped** E2E plan exists — either **`e2e/`** inside the PRD folder (when using folder structure) with `e2e-test-plan.md`, `e2e-test-cases.md`, `e2e-implementation-checklist.md`, or a folder under `PRD/E2E-plans/<date>-<name>/` with the same files (or N/A if no E2E required). | Pass / Fail / N/A | High / Medium / Low |
| 6 | Agent-actions doc (if used) pre-agent checklist is satisfied per that doc (e.g. Section 1.1–1.2); or N/A if no agent-actions doc. | Pass / Fail / N/A | High / Medium / Low |

Add rows if the agent-actions doc defines **extra checks** for this PRD; keep the same columns (Check, Status, Confidence).

---

## Steps

1. **Resolve input** — Get the PRD path from the user or context. If it is a **folder**, resolve main PRD as `prd.md` (or main `*.md`) inside it, agent-actions as `agent-actions.md`, E2E plan as `e2e/` inside the folder. If it is a **file**, resolve template path (default `PRD/prd-template.md`) and optionally the agent-actions doc (companion file or project-wide checklist); E2E plan per agent-actions or `PRD/E2E-plans/`.
2. **Validate structure** — Read the template and the PRD. Run structure checks 0 and 0b: required sections present, required content present. Add results to the result table.
3. **Read the PRD** — Run content checks 1–4. Set Status and Confidence per row.
4. **Read the agent-actions doc** (if provided or found) — Apply its pre-agent checklist; run checks 5–6 (and any extra checks the doc defines). Document any **extra instructions** the developer added (e.g. E2E plan folder path); include them in the result.
5. **E2E plan folder** — If the PRD requires e2e for new/changed endpoints, verify a branch-scoped E2E plan folder exists (check 5). Do not run full-project e2e audit; scope = endpoints impacted by the branch.
6. **Build result table** — Fill the table with all checks (structure first, then content), Status, and Confidence. Add any extra rows for agent-actions–specific or developer-added checks.
7. **Overall result**
   - If every applicable check (including structure 0 and 0b) is **Pass** and no critical check has **Low** confidence: output **Ready.** Summarize: PRD path, template used, any E2E plan folder path, and extra instructions from the agent-actions doc. Add: "You can hand this PRD to the implementation agent."
   - If any check is **Fail** (including structure) or critical checks are **N/A** or **Low** confidence with no explicit confirmation: output **Not ready.** List the failed or low-confidence checks and actionable next steps (e.g. "Add missing section: Out of scope", "Resolve Open items or set to None"). Ask the operator to fix or confirm and run the command again.
8. **Persist result into agent-actions.md (outcome)** — When the PRD path is a **folder** or the agent-actions path was resolved to a file in a PRD folder: (a) If `agent-actions.md` exists, update it by replacing or appending a **"## Last review result"** section with: date (YYYY-MM-DD), Result (Ready | Not ready), the check table, and a one-line Summary; keep only the latest run. (b) If `agent-actions.md` does not exist, create it with a short header (title, link to prd.md) and that section. Path: when PRD path is folder `PRD/<name>/`, write to `PRD/<name>/agent-actions.md`.

---

## Output format

**Result: Ready | Not ready**

| # | Check | Status | Confidence |
|---|-------|--------|------------|
| 0 | Structure: required sections present | Pass / Fail / N/A | High / Medium / Low |
| 0b | Structure: required content per section | Pass / Fail / N/A | High / Medium / Low |
| 1 | … | … | … |
| … | … | … | … |

**Summary:** (2–3 sentences: PRD path, template used, E2E folder if any, extra instructions if any.)

**Next steps:** If Ready — hand the PRD to the implementation agent (and E2E plan folder path if applicable). If Not ready — (list actions to take, e.g. align with `PRD/prd-template.md` or resolve open items).

**Persisted:** When the PRD is a folder (or agent-actions path is in a PRD folder), the result is also written to **`agent-actions.md`** in a "## Last review result" section (create file if missing). So **agent-actions.md** is an outcome of this command.

---

## Reference

- **Template:** Structure validation uses **`PRD/prd-template.md`** by default. New PRDs should be created from or aligned with that template. **Folder structure:** Prefer one folder per PRD (`PRD/<short-title>/`) with `prd.md`, `agent-actions.md`, and `e2e/` inside it (see template § PRD folder structure).
- **Agent-actions as outcome:** When you run this command with a PRD **folder** (or when agent-actions path resolves to a file in a PRD folder), the **result is persisted** into **`agent-actions.md`** in a "## Last review result" section. So agent-actions.md is both **input** (checklist for checks 5–6) and **outcome** (last gate run). If the file is missing, the command creates it with the review result so the gate produces a record.
- **Generic:** This command works for **any** PRD; the operator supplies the PRD path. Agent-actions docs are **generic** for all implementations; developers can add extra instructions per feature when needed.
- **Branch-scoped E2E:** Plan only the endpoints/areas **impacted by the branch**; do not run the full-project e2e audit command for this gate.
- **Confidence:** High = explicitly stated in PRD or agent-actions; Medium = inferred from structure; Low = assumed or missing—prefer to mark Not ready or ask operator to confirm.

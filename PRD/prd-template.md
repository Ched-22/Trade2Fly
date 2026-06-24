# PRD Template

Use this template for all new PRDs. Prefer the **one-folder-per-PRD** layout (see below).

---

## PRD folder structure

```
PRD/
  prd-template.md          ← this file
  README.md
  <short-title>/
    prd.md                 ← main PRD (required)
    agent-actions.md       ← operator checklist + last gate result
    README.md              ← pointer to artifacts
    e2e/                   ← optional; required for API/endpoint PRDs
      e2e-test-plan.md
      e2e-test-cases.md
      e2e-implementation-checklist.md
```

**Scaffold:** `.cursor/commands/prd-generator.md`  
**Validate:** `.cursor/commands/review-prd-before-agent.md`  
**Implement:** `.cursor/commands/implement-from-prd.md`

---

## Header block (required)

```markdown
**Document:** `<short-title>/prd.md`
**Created:** YYYY-MM-DD
**Status:** Draft | In review | Ready | Implemented
**Source:** (optional link or reference)
```

---

## Required sections (all PRDs)

### 1. Summary

One short paragraph: what this PRD delivers and why.

### 2. Context / background

Problem, current state, constraints, links to related docs.

### 3. Implementation steps

Numbered, actionable steps an agent can follow. Reference files/paths where possible.

### 4. Dependencies

Numbered list: other PRDs, services, libraries, env vars, or teams.

### 5. Resolved decisions

Numbered list of decisions already made (or "None" if empty).

### 6. Open items

Explicit list of unresolved questions, or **None**.

### 7. Out of scope

Numbered list of what this PRD explicitly does **not** include.

---

## Additional sections (API / endpoint PRDs)

### Endpoint specification

Table or subsections per route: method, path, auth, params, body, errors.

### Response schema

Tables or TypeScript-style shapes for success and error payloads (camelCase fields).

### Data flow / behavior (recommended)

How data moves through the system for the feature.

### Agent implementation guide (recommended)

Subsections 11.1–11.7: files to touch, patterns, tests, docs, rollout, verification.

---

## Validation checklist

Before running **Review PRD before agent**:

1. Header block present (Document, Created, Status).
2. All required sections present with real content (not empty headings).
3. Implementation steps are numbered and actionable.
4. Open items is **None** or a numbered list (no vague TBD blocking work).
5. For API PRDs: Endpoint specification and Response schema filled; `e2e/` scaffold present.
6. `agent-actions.md` exists in the PRD folder.

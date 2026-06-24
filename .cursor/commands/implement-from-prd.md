---
name: implement-from-prd
description: 'Start implementation from a PRD folder (or file). Ensures gate is Ready, then implements per PRD and agent-actions. Use instead of or in addition to Slack-triggered agent.'
args:
  - name: prd
    description: 'Path to PRD folder (e.g. PRD/new-request-endpoint) or PRD file (e.g. PRD/prd-account-requests-endpoint.md). If folder, read prd.md and agent-actions.md inside it. Required.'
    isRequired: true
  - name: branch
    description: 'Git branch to implement on (e.g. feature/new-request). If provided, checkout or create before implementing. Optional.'
    isRequired: false
  - name: skipReview
    description: 'Set to true to skip running the gate when Last review result in agent-actions.md is already Ready. Optional; default false.'
    isRequired: false
---

# Implement From PRD

Run the **implementation agent** from a PRD: resolve the PRD folder (or file), ensure the **Review PRD before agent** gate is **Ready**, then implement according to the PRD and `agent-actions.md`. This is the same workflow that can be triggered via Slack (PRD path + branch); use this command when you want to start implementation from Cursor without Slack.

**Implement PRD at path:** Use the resolved PRD path (e.g. `PRD/new-request-endpoint` or `PRD/prd-account-requests-endpoint.md`) and state it at the start: _Implement PRD at path: \<path\>_.

---

## When to use

- You want to **implement a feature** described in a PRD and have (or will run) the gate so the PRD is Ready.
- You are starting work **manually** in Cursor instead of via an external trigger (e.g. Slack).

---

## Input

- **PRD path** (required) — Folder (e.g. `PRD/new-request-endpoint`) or file (e.g. `PRD/prd-account-requests-endpoint.md`). If folder, the command uses `prd.md`, `agent-actions.md`, and `e2e/` inside it (see `PRD/prd-template.md`).
- **Branch** (optional) — Git branch to work on (e.g. `feature/new-request`). If provided, checkout the branch (create it if it does not exist) before implementing.
- **Skip review** (optional) — If the user confirms the PRD was already reviewed and **Last review result** in `agent-actions.md` is **Ready**, you may skip re-running the gate. Default: run the gate when result is missing or not Ready.

---

## Mandatory git workflow

- **Never commit or push to `main`.**
- If current branch is `main`, create and switch to **`feat/<branch_name>`** (e.g. from PRD folder `PRD/new-request-endpoint` use `feat/new-request-endpoint`).
- Make **all changes on that branch only**.
- **Commit** using Conventional Commits (see `.cursor/rules/commit-messages.mdc`). **Do not run `git commit` or `git push`.** Generate the commit message and **give the user the exact commands** to run (e.g. `git add -A`, `git commit -m "..."`, `git push -u origin HEAD`). The user runs them in their terminal.
- **Push** — Include the push command in the commands you give the user (see `.cursor/commands/git-push.md`).
- **PR** — Generate the PR description (e.g. via `.cursor/commands/pr.md`). **Do not create the PR via API/CLI.** Give the user the instruction to run the PR command (e.g. `/pr`) or create the PR manually in the GitHub UI, then have them provide the PR URL.
- **Return** at the end:
  1. Branch name
  2. Commit SHA (e.g. user runs `git rev-parse HEAD` after committing)
  3. PR URL (after user creates PR and provides it)

---

## Recovery rule (mandatory)

If any feature commit lands on `main` by mistake:

1. Create a feature branch at that commit: `git branch feat/<branch_name> <commit>` then `git checkout feat/<branch_name>` (or `git checkout -b feat/<branch_name>` from that commit).
2. Switch to `main`: `git checkout main`.
3. Revert the commit on `main`: `git revert HEAD --no-edit` (no force push).
4. Push both branches: `git push origin main` and `git push -u origin feat/<branch_name>`.
5. Proceed with PR from the feature branch (create PR: base `main`, compare `feat/<branch_name>`).

---

## Validation before finishing

Before considering the implementation run complete:

- **Confirm** `git branch --show-current` is **not** `main`.
- **Confirm** the PR exists and **provide the PR URL** in the final summary.

---

## Resolving the PRD

- **If path is a folder** (e.g. `PRD/new-request-endpoint`):
  - Main PRD: **`prd.md`** inside the folder.
  - Agent-actions: **`agent-actions.md`** in the same folder (includes "Last review result" from the gate).
  - E2E plan: **`e2e/`** inside the folder (`e2e-test-plan.md`, `e2e-test-cases.md`, `e2e-implementation-checklist.md`).
- **If path is a file** (e.g. `PRD/prd-account-requests-endpoint.md`):
  - Main PRD: that file.
  - Agent-actions: look for `agent-actions.md` in `PRD/<short-name>/` or a companion `agent-actions-<short-name>.md` next to the file.
  - E2E plan: per agent-actions or `PRD/E2E-plans/<date>-<name>/`.

---

## Steps

1. **Resolve PRD path** — Determine main PRD doc, `agent-actions.md`, and E2E plan folder (if any) as above. Read `prd.md` (or the given file) and `agent-actions.md`.

2. **Gate: Ready?** — In `agent-actions.md`, look for **"## Last review result"**. If the result is **Ready** and the user has not asked to re-run the gate, proceed. If the result is **Not ready** or missing (and `skipReview` is not set), run **Review PRD before agent** (`.cursor/commands/review-prd-before-agent.md`) with this PRD path first; then re-read `agent-actions.md`. Do not start implementation until the gate result is **Ready**.

3. **Branch** — **Never commit or push to `main`.** Check current branch: `git rev-parse --abbrev-ref HEAD`. If the current branch is `main`, create and switch to **`feat/<branch_name>`** before any code changes (derive `<branch_name>` from the PRD path, e.g. `PRD/new-request-endpoint` → `feat/new-request-endpoint`). If the user provided a **branch** name, use that (e.g. `feature/new-request`); run `git checkout <branch>` or `git checkout -b <branch>` if it does not exist. Confirm current branch before making code changes.

4. **Implement** — Follow the PRD in order:
   - **Implementation steps** in the PRD (and any **Agent implementation guide** section).
   - **Agent-actions checklist** in `agent-actions.md` (pre- and during-implementation items).
   - **List endpoints / scoped lists:** If the PRD adds or changes list endpoints, follow `.cursor/rules/list-endpoints.mdc` and use `.cursor/commands/add-scoped-list-endpoint.md` or `add-findall-v2` as appropriate; pass the PRD path (folder or file).
   - **E2E:** If the PRD has an `e2e/` (or referenced E2E plan folder), implement e2e tests per `.cursor/commands/e2e-implement-plan.md` and update `e2e-implementation-checklist.md` when items are done.

5. **Commit and push** — **Do not execute `git commit` or `git push`.** Build a Conventional Commits message from the changes, then **output the exact commands** for the user to run in their terminal, for example:

   ```bash
   git add -A
   git commit -m "feat(scope): description"
   git push -u origin <branch_name>
   ```

   Remind them to run these themselves. Never push `main`.

6. **Create PR** — Generate the PR description (e.g. run the analysis from `.cursor/commands/pr.md` and save to `PR_DESCRIPTION.md`). **Do not create the PR via tool/CLI.** Tell the user to run the PR command (e.g. `/pr`) to create the PR, or to create it manually in GitHub and paste the PR URL back. Capture the PR URL once the user provides it.

7. **Summary and return** — Summarize: PRD path, what was implemented, and what remains. Then **return**:
   - **Branch name** (e.g. `feat/new-request-endpoint`)
   - **Commit SHA** — Ask the user to run `git rev-parse HEAD` after they commit, or use the SHA they provide.
   - **PR URL** — From step 6 (user provides after creating the PR).

8. **Validation before finishing** — Before finishing, confirm:
   - The user has been given commands to verify `git branch --show-current` is **not** `main`.
   - PR URL is in the final message (once the user has created the PR and shared it).

---

## Reference

- **Gate:** `.cursor/commands/review-prd-before-agent.md` — run when Last review result is not Ready.
- **Template and structure:** `PRD/prd-template.md`, `PRD/README.md`.
- **List endpoints:** `.cursor/rules/list-endpoints.mdc`; scoped list: `.cursor/commands/add-scoped-list-endpoint.md`.
- **E2E plan implementation:** `.cursor/commands/e2e-implement-plan.md` (plan folder = `PRD/<short-title>/e2e/` or `PRD/E2E-plans/<date>-<name>/`).
- **Git workflow:** `.cursor/commands/git-push.md` (mandatory: never push main; recovery steps).
- **PR workflow:** `.cursor/commands/pr.md` — generate description and create PR.

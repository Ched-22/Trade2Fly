# Git Push (sync with origin)

## Overview

Push the current branch to origin and sync with remote. The project uses feature branches and PRs. Prefer rebase over merge for a linear history.

A **pre-push** Husky hook runs specs (`npm run test`) and e2e in Docker (`npm run test:e2e:relational:docker`) automatically. If either fails, the push is rejected.

## Git workflow (mandatory)

- **Never commit or push directly to `main`.**
- Before any commit or push, check current branch: `git rev-parse --abbrev-ref HEAD`.
- If current branch is `main`:
  - Create and switch to a new branch before any edits: `git checkout -b feat/<short-name>` (or `fix/`, `chore/` as appropriate).
- All commits must be on a feature branch, not on `main`.
- Push only the feature branch. Do not push `main`.
- Return the PR compare URL in the final message (e.g. `https://github.com/org/repo/compare/main...feat/short-name`).
- **If a commit was accidentally made on `main`:**
  1. Create a feature branch at that commit: `git branch feat/<short-name>` then `git checkout feat/<short-name>` (or `git checkout -b feat/<short-name>` from the commit).
  2. Switch back to main: `git checkout main`.
  3. Revert the commit on `main`: `git revert HEAD --no-edit` (no force push).
  4. Push both: `git push origin main` and `git push -u origin feat/<short-name>`.
  5. Tell the user what happened and give the PR compare URL for the feature branch.

## Steps

**Do not execute `git push` or any git commands that push.** Give the user the exact commands to run in their terminal.

1. **Confirm branch** — If current branch is `main`, do not give a push command. Tell the user to create a feature branch first (see **Git workflow (mandatory)** above).

2. **Output these commands for the user to run** (adapt `<current-branch>` to the actual branch name):

   ```bash
   git fetch origin
   git pull --rebase origin HEAD
   git push -u origin HEAD
   ```

   If upstream is set: `git pull --rebase` may be used instead of `git pull --rebase origin HEAD`.

3. **Tell the user:**
   - Run the commands above in their terminal. Pre-push hook will run specs and e2e; fix any failures and retry push.
   - If push is rejected due to remote updates: run `git pull --rebase && git push`.
   - Optionally return the PR compare URL (e.g. `https://github.com/org/repo/compare/main...feat/short-name`).

## Rules

- **Do not execute push.** Output the commands for the user to run.
- **Never push `main`.** See **Git workflow (mandatory)** above.
- **Lint:** Handled at commit time via `lint-staged` (staged files only).
- **Specs + E2E:** Run automatically on push via pre-push hook. If push fails, fix failures and retry.
- **Force push:** If a rebase rewrote history and push fails, **ask the user first** before running `git push --force-with-lease`. Never force push without explicit confirmation.

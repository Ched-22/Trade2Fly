# Git Commit and Push

## Overview

Create a conventional commit, then push the branch to origin. Combines the flows from `git-commit.md` and `git-push.md`. Lint runs at commit time (lint-staged); specs and e2e run at push time (pre-push hook).

## Git workflow (mandatory)

- **Never commit or push directly to `main`.**
- Before making any commit, check current branch: `git rev-parse --abbrev-ref HEAD`.
- If current branch is `main`, create and switch to a new branch before any edits: `git checkout -b feat/<short-name>` (or `fix/`, `chore/` as appropriate).
- All commits must be on that feature branch.
- Push only the feature branch. Do not push `main`.
- Return the PR compare URL in the final message (e.g. `https://github.com/org/repo/compare/main...feat/short-name`).
- If a commit was accidentally made on `main`, follow the recovery steps in `git-push.md` (create feature branch at that commit, revert on main, push both).

## Steps

**Do not execute `git commit` or `git push`.** Give the user the exact commands to run in their terminal.

### Part 1: Commit (see git-commit.md)

1. **Review changes** — Check the diff; understand what changed.
2. **Ask for issue key (optional)** — If not in context, optionally ask if they want to include one in the body.
3. **Stage** — Tell the user to run: `git add -A`
4. **Run deslop** — Execute the deslop command (see `deslop.md`). If deslop made changes, tell the user to run `git add -A` again.
5. **Create commit message** — Base it on the actual changes; use conventional format.
6. **Check branch** — If current branch is `main`, tell the user to run `git checkout -b feat/<short-name>` first, then the commit command.
7. **Output commit command (do not execute)** — **Do not run `git commit`.** Give the user the exact command to run, e.g.:

   ```bash
   git commit -m "feat(scope): description"
   ```

   Tell them Husky will run lint-staged when they run it.

### Part 2: Push (see git-push.md)

8. **Output push commands (do not execute)** — **Do not run `git push`.** Give the user the exact commands to run, e.g.:

   ```bash
   git fetch origin
   git pull --rebase origin HEAD
   git push -u origin HEAD
   ```

   If current branch is `main`, do not give a push command; tell them to create and push a feature branch only.
9. **Tell the user** — Pre-push hook will run specs and e2e; fix failures and retry. Optionally provide the PR compare URL.

## Format (commit message)

```
<type>(<scope>): <description>
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`
- **scope**: optional, e.g. `auth`, `user`, `config`
- **description**: lowercase, imperative mood, no period at end

## Rules

- **Do not execute commit or push.** Output the commands for the user to run.
- **Never commit or push to `main`.** See **Git workflow (mandatory)** above.
- **Lint:** Handled at commit via lint-staged (staged files only).
- **Specs + E2E:** Run automatically on push via pre-push hook. Fix failures before retrying.
- **Force push:** If rebase rewrote history and push fails, **ask the user first** before `git push --force-with-lease`.
- **Length:** Subject line under ~72 characters.
- **Imperative mood:** Use "fix", "add", "update" (not "fixed", "added", "updated").

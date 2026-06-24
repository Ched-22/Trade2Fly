# Git Create Commit

## Overview

Create a conventional commit message and commit staged changes. The project uses commitlint (`@commitlint/config-conventional`) and Husky hooks (lint-staged on staged files before commit, commitlint on commit message). Specs and e2e run on pre-push.

**Never commit on `main`.** If current branch is `main`, create and switch to a feature branch first (`git checkout -b feat/<short-name>`). See `.cursor/commands/git-push.md` for full Git workflow and recovery if a commit was made on main by mistake.

## Steps

1. **Review changes**
    - Check the diff: `git diff --cached` (if changes are staged) or `git diff` (if unstaged)
    - Understand what changed and why
2. **Ask for issue key (optional)**
    - Check the branch name for an issue key (Linear, Jira, GitHub issue, etc.)
    - If an issue key (e.g. POW-123, PROJ-456, #123) is not already in context, optionally ask the user if they want to include one
    - Put the issue key in the **body**, not the subject, so commitlint passes
3. **Stage changes (if not already staged)**
    - `git add -A`
4. **Run deslop**
    - Execute the deslop command (see `.cursor/commands/deslop.md`): check diff against main and remove AI-generated slop (extra comments, defensive checks, `any` casts, inconsistent style)
    - If deslop made changes, re-stage: `git add -A`
5. **Create commit message**
    - Base the message on the actual changes in the diff
    - Use the format below; commitlint will validate it
6. **Check branch**
    - If current branch is `main`, do not commit. Tell the user to run `git checkout -b feat/<short-name>` (or appropriate branch), then run the commit command below.
7. **Output commit command (do not execute)**
    - **Do not run `git commit`.** Build the commit message from the diff and format below, then **give the user the exact command** to run in their terminal, e.g.:

      ```bash
      git commit -m "feat(scope): description"
      ```

      Or with body: `git commit -m "feat(scope): description" -m "Ref: PROJ-123"`. Tell them Husky will run lint-staged when they run it.

## Format

```
<type>(<scope>): <description>
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`
- **scope**: optional, e.g. `auth`, `user`, `config`
- **description**: lowercase, imperative mood, no period at end

## Examples

- `feat(auth): add email confirmation`
- `fix(config): validate nested env vars`
- `chore: update dependencies`
- `test(user): add e2e for password reset`

## Rules

- **Do not execute commit.** Output the command for the user to run.
- **Never commit on `main`.** See Overview and `.cursor/commands/git-push.md`.
- **Tests:** Specs and e2e run automatically on pre-push. Fix failures before pushing.
- **Length:** Keep the subject line under ~72 characters
- **Imperative mood:** Use "fix", "add", "update" (not "fixed", "added", "updated")
- **Lowercase:** Description starts with lowercase
- **No period:** Don't end the subject line with a period
- **Body:** For extra context or issue keys, add a blank line after the subject, then the body (e.g. `Ref: PROJ-123`)

## With issue key (body)

```bash
git commit -m "feat(auth): add email confirmation" -m "Ref: PROJ-123"
```

# Lint and fix staged files

## Overview

Run ESLint with auto-fix on **staged files only**, then fix any remaining linter issues in those files. Use this before committing to avoid pre-commit failures and keep staged code clean. The command can learn from user edits and improve future fixes (see Self-learning below).

## Steps

1. **Run lint fix on staged files**
   - Execute: `npm run lint:fix:staged`
   - If there are no staged `.ts` files, the command exits successfully with no work done. Stop here.

2. **Fix remaining errors from the ESLint output**
   - Read the reported file paths, line numbers, rule names, and messages.
   - **Apply fixes in this order:** first check **Learned patterns** (section below); if a rule or context matches, use that fix. Otherwise use the **Common rules** here. Learned patterns override or refine common rules when they apply.
   - For each error, apply the fix, then re-run `npm run lint:fix:staged` and repeat until it passes.

   **Common rules and how to fix them:**

   - **`no-restricted-syntax` (configService.get)**  
     Add `{ infer: true }` as the second argument and remove the generic if present.  
     - `configService.get('KEY')` → `configService.get('KEY', { infer: true })`  
     - `configService.get<string>('KEY')` → `configService.get('KEY', { infer: true })`  
     - `configService.get<boolean>('KEY')` → `configService.get('KEY', { infer: true })`  
     If TypeScript then reports **"No overload matches"** or the key type is **`never`**: the project uses a typed config. Add the env key to `src/config/config.type.ts` (`AllConfigType`), add it to `src/config/env.validation.ts` (Joi schema) if it’s a new env var, and in the service inject `ConfigService<AllConfigType>` (and import `AllConfigType` from the config type module); or (b) **for seed modules / standalone scripts** where extending AllConfigType is not desired: keep `configService.get<string>('KEY')` (or `get<number>()` for numeric keys), wrap the block that contains the `configService.get` calls in `/* eslint-disable no-restricted-syntax */` … `/* eslint-enable no-restricted-syntax */`, and add a short comment (e.g. "env keys not in AllConfigType; use get<T>() for now").

   - **`@typescript-eslint/require-await`**  
     Async method has no `await`. Either:  
     - Remove `async` and change return type from `Promise<T>` to `T` (if the function is synchronous), or  
     - Add the missing `await` on a promise inside the function.

   - **`@typescript-eslint/no-unused-vars`**  
     Variable/parameter is defined but never used.  
     - For **parameters** required by the signature but unused: use a single `_` (e.g. `_` or `_: Task`), or check the project’s `argsIgnorePattern` for allowed names.  
     - For **variables** (assigned but never used): prefer removing the assignment and not storing the result (e.g. `await foo()` instead of `const x = await foo();`) when the value is not used; otherwise prefix with underscore (e.g. `_task`).

   - **Floating promises (e.g. `@typescript-eslint/no-floating-promises`)**  
     A promise is not awaited or explicitly handled.  
     - Add `await` if the caller is async and you need the result, or  
     - Add `void` in front to explicitly ignore: `void someAsyncCall();`

   - **`prefer-const`**  
     Variable is never reassigned. Use `const` instead of `let`: `let x = ...` → `const x = ...`.

3. **Re-stage after fixes**
   - If ESLint or your edits modified files, stage the changes: `git add -A` (or stage only the files you want).

4. **Confirm clean run**
   - Run `npm run lint:fix:staged` once more; it should exit with code 0 and no errors.

5. **Self-learning: detect user edits and improve**
   - **When to run:** After the user (or you) has fixed lint errors, the user may edit the fixed code. When you see that the fixed files have been changed again (e.g. in a follow-up message, or the user says “learn from my edits” or “update the lint command”), run this step.
   - **What to do:** Compare the current code in the affected files to what the **Common rules** and **Learned patterns** would have produced. Identify any place where the user’s version differs from that.
   - **Infer a pattern:** For each such difference, infer a concise rule (e.g. “for no-unused-vars on parameters, user prefers `_paramName` over `_`” or “for configService.get with env keys, user keeps the generic”).
   - **Update this command file:** Add or adjust an entry in the **Learned patterns** section below so that future runs use the user’s style. Keep each entry one short line (rule/context → preferred fix). If the user’s change was a one-off (e.g. refactor), do not add it as a pattern.
   - **Result:** On the next run of this command, apply **Learned patterns** first so fixes match the user’s preferences.

## Notes

- Staged files are those included in `git diff --cached` (added, copied, modified).
- Only `.ts` files under the repo are linted; the project’s ESLint config and `lint` script scope apply.
- For fixing all project files (not just staged), use `npm run lint:fix` instead.

---

## Learned patterns (agent-maintained)

*Update this section when user edits to fixes suggest a different pattern. One short line per pattern: rule or context → preferred fix. These override Common rules when they apply.*

- **configService.get + TS "No overload matches" / key `never`** → Add key to `AllConfigType` in `src/config/config.type.ts`, add to `src/config/env.validation.ts` if new env var, and inject `ConfigService<AllConfigType>` in the service.
- **configService.get in seed module or standalone script (keys not in AllConfigType)** → Keep `configService.get<string>('KEY')` / `configService.get<number>('KEY')`; wrap the block containing the get() calls in `/* eslint-disable no-restricted-syntax */` … `/* eslint-enable no-restricted-syntax */` with comment e.g. "env keys not in AllConfigType; use get<T>() for now".
- **no-unused-vars (variable assigned but never used)** → Prefer removing the variable and not storing the result (e.g. `await fn()` instead of `const x = await fn();`); underscore prefix may still trigger the rule.


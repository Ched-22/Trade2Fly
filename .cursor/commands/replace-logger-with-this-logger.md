---
name: replace-logger-with-this-logger
description: 'Replace static Logger calls with this.logger in a given file; add instance, imports, and fix until working'
args:
  - name: file
    description: 'Path to the file to refactor (e.g. src/modules/foo/foo.service.ts), or "current" for the file the user has open'
    isRequired: true
---

# Replace Logger with this.logger

Refactor a NestJS file so it uses an instance logger (`this.logger`) instead of the static `Logger` from `@nestjs/common`. Add the logger property, fix imports, replace all static calls, then verify with lint and fix any issues until the file is correct.

## Scope

- **Target**: Injectable classes (services, controllers, etc.) that use `Logger.log`, `Logger.error`, `Logger.warn`, or `Logger.debug` statically.
- **Skip**: `main.ts` (bootstrap), standalone utilities with only static methods and no `this` (e.g. static-only classes). For static-only classes, either skip or note that they need a different approach (injectable wrapper or keep static Logger).
- **Resolve `file`**: If the user passes `current` or "this file", use the file they have open or the one they’re referring to in chat.

## Steps

1. **Open and parse the target file\*\*\*\***
   - Resolve `file` to an absolute path under the repo.
   - Read the full file. Identify: class name, whether it has `@Injectable()` or `@Controller()`, existing `Logger` import and static usages, and whether it already has `private readonly logger = new Logger(...)`.

2. **Decide if refactor applies**
   - If the file has no static `Logger.*` calls, respond that there’s nothing to replace and stop.
   - If the file is `main.ts` or a static-only utility class with no injectable/controller, respond that this command targets injectable classes and skip (or suggest converting to an injectable if the user wants).
   - Otherwise proceed.

3. **Add or keep the instance logger**
   - If the class does **not** have a `private readonly logger = new Logger(ClassName.name);` (or equivalent):
     - Add `Logger` to the `@nestjs/common` import if missing.
     - Add the property right after the opening of the class body (before other members):  
       `private readonly logger = new Logger(ClassName.name);`  
       Use the actual class name (e.g. `SalesforceService`, `QueueController`).
   - If it already has `this.logger`, leave it as is.

4. **Replace static Logger calls**
   - Replace every static call in the file:
     - `Logger.log(` → `this.logger.log(`
     - `Logger.error(` → `this.logger.error(`
     - `Logger.warn(` → `this.logger.warn(`
     - `Logger.debug(` → `this.logger.debug(`
   - Do not change `new Logger(...)` or other non-static uses of `Logger`.
   - If after replacements `Logger` is only used in `new Logger(ClassName.name)`, keep the import. If no usage of `Logger` remains, remove `Logger` from the `@nestjs/common` import (and remove the line that uses `new Logger(...)` only if we’re not adding the property—but we always add the property, so we always keep the import and the `new Logger(ClassName.name)`).

5. **Lint and fix**
   - Run the project linter on the refactored file (e.g. `npm run lint -- --max-warnings 0 -- <file>` or project’s lint command).
   - If there are errors or warnings in that file (e.g. unused import, missing Logger in import): fix them (add/remove `Logger` from import as needed, ensure no duplicate logger property).
   - Re-run lint until the file is clean.

6. **Confirm and iterate**
   - If the user asked to “interact until it’s working fine”: after lint is clean, run any relevant tests for that module or the app (e.g. `npm run test -- --testPathPattern=<module-or-file>` or `npm run test`), and fix any failures caused by this refactor (e.g. tests that mock `Logger` or expect static calls). Repeat until tests pass.
   - Summarize what was done: file path, added `this.logger`, replacements made, and that lint (and tests, if run) pass.

## Notes

- Use the project’s **camelCase** rule: identifiers in code stay camelCase; no snake_case in new code.
- Preserve existing formatting and style (e.g. single vs double quotes, semicolons).
- If the class has multiple classes in the same file, only refactor the one that contains the static `Logger` calls; use that class’s name for `new Logger(ClassName.name)`.

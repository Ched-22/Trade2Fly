# Write unit specs

Write unit specs for the selected file following the project's spec-writing standards.

**Target file**: The file currently open or provided in context.

---

## Step 1: Decide – Create, Skip, or Review

**If a spec file already exists**: **Review** first. Read the existing specs and the source. For each test, decide:
- **Keep** – still valid, covers behavior correctly
- **Remove** – redundant, trivial, or wrong
- **Update** – needs adjustment (e.g. wrong assertion, missing edge case)

Then add any missing coverage. Do not blindly create new specs when a spec file exists.

**If no spec exists**:

**Skip** and respond: *"It doesn't make sense to create specs for this file"* when it is:

- Re-exports only (`index.ts`, barrel files)
- Type definitions only (interfaces, types, no runtime logic)
- Nest modules (only `@Module` wiring)
- Plain DTOs (fields + `@ApiProperty`, no logic)
- Pure pass-through (single `return x` or `return this.repo.method()` with no branching)
- Class-transformer `@Transform` on entity fields (test via integration instead)

**Create** when the file has logic, branching, error handling, transformations, or non-trivial injectable behavior — including config or modules that export pure helpers (e.g. approval-moments); test those with direct instantiation / no TestingModule.

---

## Step 2: If Creating – Follow Standards

- Follow `.cursor/rules/spec-writing-standards.mdc`
- Co-locate spec next to source (e.g. `foo.service.spec.ts`)
- Use `Test.createTestingModule` for services, guards, interceptors
- Use direct instantiation for utils and pure helpers
- Mock all external dependencies

---

## Step 3: Cover Happy Path AND Edge Cases

Specs are **not done** until both are covered:

1. **Happy path** – nominal inputs, expected outputs
2. **Edge cases** – null, undefined, empty, whitespace-only, invalid types, boundary values, error paths

**Never** ship specs with only happy-path tests. Edge cases are mandatory.

For **transformers**: null, undefined, empty string, whitespace-only, combined behaviors (e.g. trim + lowercase together).

For **utils/helpers**: boundary values, empty inputs, null/undefined, invalid inputs, options override defaults (when applicable).

For **services**: not found, validation errors, unauthorized, duplicate/conflict.

For **config/options** (e.g. validation options with `exceptionFactory`): test the factory directly with mock errors.

For **interceptors** that transform async data (e.g. `ResolvePromisesInterceptor`): mock `next.handle()` with `of(Promise.resolve(...))` and similar shapes.

**Do not** ask "are these specs solid?" – use the criteria above. Stop when both happy path and edge cases are covered. Do not add tests "just in case."

---

## Step 4: Run Linter Fix

After creating or changing specs, run `npm run lint:fix` to apply automatic lint corrections.

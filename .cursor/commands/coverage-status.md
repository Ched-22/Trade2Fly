# Coverage Status (Logic Files)

## Overview

Show test coverage for **logic files only** – services, guards, interceptors, repositories, utils, and helpers. Excludes DTOs, entities, modules, and other non-testable code from the denominator.

## Steps

1. **Run logic-only coverage**
    - `npm run test:cov:logic`
2. **Report the "All files" row** from the output
3. **Optionally summarize** which modules have high vs low coverage

## What's included

- `**/*.service.ts`
- `**/guards/*.ts`
- `**/*.interceptor.ts`
- `**/*.repository.ts`
- `**/*.helper.ts`, `**/*.transformer.ts`
- `**/utils/**`, `**/common/**`, `**/pagination/**`
- `validation-options.ts`, `deep-resolver.ts`, `infinity-pagination.ts`
- `*-document-filter*.ts`

## What's excluded

- `*.module.ts`, `*.entity.ts`, `*.schema.ts`
- DTOs, mappers, entities
- `main.ts`, `app.module.ts`
- Barrel files (`index.ts`)

## Output

Present the coverage table and a brief note comparing to full `test:cov` if relevant (logic coverage is typically higher since the denominator is smaller).

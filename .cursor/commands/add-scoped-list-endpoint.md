---
name: add-scoped-list-endpoint
description: 'Add a scoped list endpoint (e.g. GET /task/account/:accountId/requests) with pagination, filters, and sorting. PRD-driven.'
args:
  - name: prd
    description: 'Path to PRD folder (e.g. PRD/new-request-endpoint) or PRD file (e.g. PRD/prd-account-requests-endpoint.md). If folder, read prd.md inside it. Required.'
    isRequired: true
---

# Add Scoped List Endpoint

Add a scoped list endpoint following the patterns in `.cursor/rules/list-endpoints.mdc`. **Read the PRD first** – it defines path, path params, query params, base query, and response schema.

## Prerequisites

1. **PRD exists** at the path provided. If you were given a **folder** (e.g. `PRD/new-request-endpoint`), read **`prd.md`** inside it. If given a **file** (e.g. `PRD/prd-account-requests-endpoint.md`), read that file.
2. PRD must specify:
   - Path (e.g. `/task/account/:accountId/requests`)
   - Path param(s) and type
   - Query params: pagination (page, limit), filters, sortBy, sortOrder
   - Base query filters (entity, relations, where conditions)
   - Response DTO fields with sources

## Steps

### 1. Parse PRD

Extract from the PRD:

- **Path**: e.g. `account/:accountId/requests` (controller path prefix + this = full path)
- **Path param**: e.g. `accountId` (number)
- **Controller**: e.g. `TaskController`
- **Entity**: e.g. `Task`
- **Base filters**: e.g. `board.projectFolder.account.id = accountId`, `board.type = REQUEST`, `board.active = true`, `archived = false`
- **Optional filters**: name, id, taskCode, itemType[], status[], statusGroup[]
- **Sort**: sortBy, sortOrder; default sort field
- **Response DTO**: field list with sources (direct, derived, relation)

### 2. Create Find DTO

File: `src/modules/<entity>/dto/find-<context>.dto.ts`  
Class: `Find<Context>Dto`

- Extend `PaginationDto`.
- Add all filter fields from PRD with **full validation** per `.cursor/rules/list-endpoints.mdc` §2:
  - `@ApiPropertyOptional`, `@IsOptional`
  - `@Transform` for number and array
  - `@IsIn` for enum and sortBy/sortOrder
- Array filters: use `toArray` transform, `@IsArray`, `@IsString({ each: true })`, `@IsIn(..., { each: true })` when constrained.
- Apply limit cap via `config.api.maxPageSize`.

### 3. Create Response DTOs

File: `src/modules/<entity>/mappers/<entity>-<context>.mapper.ts` or extend existing mappers.

- `EntityListItemDto` (or context-specific name) with `@ApiProperty` for each field.
- Nested DTOs (e.g. `TaskRequestPriorityDto`, `TaskRequestLinkedSowDto`) for objects.
- Property order = response order (maintainability).

### 4. Create Mapper

- Static `toListItem(entity): EntityListItemDto`.
- Map all fields per PRD:
  - Direct: `entity.field ?? null`
  - Relation: `entity.relation ? { id, name } : null`
  - Derived: status group, age (date-fns), priority label
- Keep return object property order aligned with DTO.

### 5. Repository Method

- `findXByScope(scopeId: number, dto: FindXDto): Promise<Entity[]>`.
- Use `createQueryBuilder` (complex joins, array filters, dynamic sort).
- Joins: all relations needed by mapper.
- Where: base filters from PRD + optional filters from dto.
- Array filters: `IN (:...values)`.
- Status group filter: reverse lookup (e.g. `getStatusStringsForGroup`) → `LOWER(TRIM(field)) IN (...)`.
- Order: from sortBy/sortOrder; default from PRD.
- Skip/take: `(page - 1) * limit`, `limit`.

### 6. Service Method

- `findXByScope(scopeId: number, dto: FindXDto): Promise<Entity[]>`.
- `return this.repository.findXByScope(scopeId, dto)`.

### 7. Controller

- **Route order**: Add the new route **before** any `:id` or parametric route.
- Path: from PRD (e.g. `account/:accountId/requests`).
- `@Param('accountId', ParseIntPipe) accountId: number`.
- `@Query() dto: FindAccountRequestsDto`.
- Call service, map with `Mapper.toListItem`, return `infinityPagination(result, { page, limit })`.
- Swagger: `@ApiOperation`, `@ApiExtraModels`, `@ApiResponse` with schema.

### 8. Validation

- Path param: `ParseIntPipe` (and custom pipe for positive if needed).
- DTO: class-validator handles the rest when decorators are correct.

## Checklist

- [ ] PRD read and parsed
- [ ] Find DTO with all validation decorators
- [ ] Response DTOs with @ApiProperty
- [ ] Mapper with aligned property order
- [ ] Repository with QueryBuilder, joins, filters, sort
- [ ] Service thin wrapper
- [ ] Controller route before :id, full Swagger docs
- [ ] infinityPagination used
- [ ] Empty list returns `{ data: [], hasNextPage: false }`

## Reference

- **Standards**: `.cursor/rules/list-endpoints.mdc`
- **Flat list command**: `add-findall-v2`
- **Example PRD**: `PRD/new-request-endpoint` (folder; read `prd.md`) or `PRD/prd-account-requests-endpoint.md` (file). Run **review-prd-before-agent** with the PRD path before implementing.

---
name: add-v2-get
description: 'Add a v2 GET-by-id endpoint returning the entity as minimal DTO via mapper'
args:
  - name: entity
    description: 'Entity/module name (e.g. account, user, sow, task)'
    isRequired: true
  - name: extraFields
    description: 'Optional comma-separated field names to add to the minimal DTO (e.g. salesforceId,uuid,progress). Agent infers type/mapping from entity'
    isRequired: false
---

# Add v2 GET-by-id endpoint with mapper-to-minimal

Add a `GET /v2/<entity>/:id` endpoint that returns a single entity as `EntityMinimalDto` using `EntityMapper.toMinimal()`. Optionally add extra fields to the response via the `extraFields` argument.

## Resolve arguments

- **entity**: Module name (e.g. `account`, `user`, `sow`). Resolve to `src/modules/<entity>/`.
- **extraFields**: Optional. Comma-separated field names. Inspect the entity (and relations/payload) to determine:
  - Type for `@ApiProperty` (string, number, boolean, Date→string, etc.)
  - Mapping in `toMinimal`: direct (`entity.field`), payload (`entity.payload?.field`), relation (`entity.relation?.field`), alias (e.g. `externalEstimate` → `hours`).

## Steps

### 1. Service

Add or use a method to find one entity by ID with relations needed by the mapper:

```ts
const ENTITY_MINIMAL_RELATIONS = ['account', 'originTask', 'accountManager', 'projectManager'] as const

async getByIdForMinimal(id: number): Promise<Entity> {
  return this.getRelationsById(id, [...ENTITY_MINIMAL_RELATIONS], true) // true = throw when not found
}
```

- Use `getRelationsById(id, relations, true)` so the service throws on 404; no controller null check needed.
- Reuse or extend relation constants (e.g. `ENTITY_DETAIL_RELATIONS` for nested data) when the response has more than minimal fields.
- If the entity has UUID instead of numeric ID, check the controller for how IDs are resolved (e.g. `@Param('id')` can be id or uuid depending on the entity).

### 2. Mapper with Minimal DTO (`src/modules/<entity>/mappers/<entity>.mappers.ts`)

Create or update. Define `EntityMinimalDto` with `@ApiProperty` for each field.

**Base fields** (always include): `id`, `name` (or primary display field).

**Extra fields** (from `extraFields` arg): For each field:
- Inspect entity: column, payload path, relation, or computed
- Add to DTO with appropriate `@ApiProperty({ nullable: true, description, example })`
- Map in `toMinimal`:
  - Direct: `entity.field ?? null`
  - Payload: `entity.payload?.field ?? entity.payload?.otherField ?? null`
  - Relation: `entity.relation ? { id, name, ... } : null`
  - Date: `entity.date ? entity.date.toISOString().split('T')[0] : null`
  - Alias: e.g. `hours: entity.externalEstimate ?? null`

Keep return object property order aligned with DTO for maintainability.

### 3. Controller

Add v2 GET-by-id endpoint:

```ts
@Get(':id')
@Version('2')
@HttpCode(200)
@ApiOperation({
  summary: 'Get <entity> by ID (v2)',
  description: 'Retrieve a single <entity> by ID, returning minimal representation.',
})
@ApiExtraModels(EntityMinimalDto)
@ApiResponse({
  status: 200,
  description: '<Entity> retrieved successfully',
  schema: { $ref: getSchemaPath(EntityMinimalDto) },
})
@ApiResponse({ status: 404, description: '<Entity> not found' })
async findOneV2(
  @Param('id', ParseIntPipe) id: number,
): Promise<EntityMinimalDto> {
  const entity = await this.<entity>Service.getByIdForMinimal(id) // throws when not found
  return EntityMapper.toMinimal(entity)
}
```

- Import `Param`, `ParseIntPipe` from `@nestjs/common`. Use a service method that throws when not found (e.g. `getRelationsById(id, relations, true)`) so no explicit null check is needed.
- If the entity uses UUID for lookups, use `@Param('id') id: string` and a service method that finds by uuid.

### 4. ID vs UUID

- **Numeric ID**: Use `@Param('id', ParseIntPipe) id: number` and `where: { id }`.
- **UUID**: Use `@Param('id') id: string` and `findOne({ where: { uuid: id } })` or equivalent.

## Learnings (from SOW and Task implementation)

- **Dedicated service methods**: When the get-by-id response has nested/complex data (e.g. milestones with epics), create a separate method (e.g. `getByIdForDetail`) with extended relations instead of reusing `getByIdOrFail` which doesn't load relations.
- **Relation constants**: Define `ENTITY_MINIMAL_RELATIONS` and `ENTITY_DETAIL_RELATIONS` so relations are explicit and reusable (e.g. `SOW_DETAIL_RELATIONS` adds `projectBoard`, `projectBoard.tasks`, `projectBoard.tasks.childrenTasks`).
- **Detail vs minimal DTO**: If get-by-id returns more than the list item (e.g. milestones array), create `EntityDetailDto` extending `EntityMinimalDto` with the extra fields. Add `toDetail()` that composes `toMinimal` + nested data builder.
- **Swagger for nested DTOs**: Add all nested DTO classes to `@ApiExtraModels` (e.g. `SowDetailDto`, `SowMilestoneDto`, `SowMilestoneEpicDto`) so Swagger can resolve schema refs.
- **Fail if not found**: Use `getRelationsById(id, relations, true)` so the service throws on 404 – no need for an explicit null check in the controller.
- **Nested items**: Include `id` and `clickupUuid` (from `task.uuid`) in nested items (milestones, epics) for API consumers.
- **Mapper responsibilities**: Do not duplicate validation in mappers. The service decides when to load nested data (e.g. epics); the mapper maps whatever it receives (e.g. `task.childrenTasks ?? []` directly, no `shouldIncludeEpics`).
- **Detail loading optimization**: Load base relations first, then nested arrays separately only when needed (e.g. `getByIdForDetail` loads task with base relations, then `findEpicsForMilestone(parentTaskId)` only when SOW_TASKS milestone parent). Use `findMilestonesAndEpicsForSowDetail(projectBoardId)` instead of loading all board tasks for SOW. Define relation constants (e.g. `taskDetailV2BaseRelations`) and avoid loading heavy relations when not needed.
- **Client-portal scoping**: For consumer-specific APIs, use path prefix (`client-portal/task`) not version. Use dedicated controllers (e.g. `TaskClientPortalController` in `controller/` or `controller/client-portal/`). Add `@ApiTags('client-portal')` for docs filtering.
- **API key protection**: Add `@UseGuards(ApiKeyGuard)` explicitly. Import `AuthModule` in the module so `ApiKeyGuard` can resolve `ApiKeyService`.

## Adding more fields later

To add fields to an existing v2 minimal response:

1. Add property to `EntityMinimalDto` with `@ApiProperty`
2. Add mapping in `EntityMapper.toMinimal()`
3. If the field comes from a relation, ensure the service loads that relation when fetching the entity

## Reference

See `src/modules/sow/` and `src/modules/task/` for complete examples:
- SOW: `SowMinimalDto`, `SowDetailDto`, `SowMilestoneDto`, `SowMilestoneChildrenDto` in `sow.mappers.ts`; `getByIdForDetail`, `findMilestonesAndEpicsForSowDetail` in `sow.service.ts`; `sow-client-portal.controller.ts` — `GET /v1/client-portal/sow/:id`
- Task: `TaskDetailDto`, `TaskDetailEpicDto` in `task.mappers.ts`; `getByIdForDetail`, `findEpicsForMilestone` in `task.service.ts`; `task-client-portal.controller.ts` — `GET /v1/client-portal/task/:id`

## Output

After applying edits, list:

- **Service**: method to fetch entity by ID with relations (or existing method used)
- **Mapper**: `EntityMinimalDto` and `toMinimal` created/updated (with extra fields if provided)
- **Controller**: v2 endpoint at `GET /v2/<entity>/:id`

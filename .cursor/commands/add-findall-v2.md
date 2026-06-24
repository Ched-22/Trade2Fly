---
name: add-findall-v2
description: 'Add a v2 findAll endpoint with pagination to a controller, following the user pattern (mapper + minimal DTO)'
args:
  - name: entity
    description: 'Entity/module name (e.g. account, user, task)'
    isRequired: true
  - name: filters
    description: 'Optional comma-separated filter fields: name:type (e.g. id:number,name:string,status:string). Default: id only'
    isRequired: false
---

# Add v2 findAll with pagination

Add a `GET /v2/<entity>` endpoint with infinity pagination, following the pattern in `src/modules/sow/`: mapper with `EntityMinimalDto` (co-located API docs).

**Standards**: See `.cursor/rules/list-endpoints.mdc` for validation decorators, DTO patterns, and controller conventions. For **scoped** list endpoints (e.g. `GET /task/account/:accountId/requests`), use the `add-scoped-list-endpoint` command instead.

## Resolve arguments

- **entity**: Module name (e.g. `account`, `user`, `sow`). Resolve to `src/modules/<entity>/`.
- **filters**: Optional. Parse as `name:type` pairs. Valid types: `string`, `number`, `boolean`. For constrained strings use `enum` (e.g. `status:enum:active,closed`). If omitted, add only `id` (number) as optional filter.

## Steps

### 1. Create FindAll DTO (`src/modules/<entity>/dto/find-all-<entity>.dto.ts`)

- Extend `PaginationDto` from `src/utils/dto/pagination.dto`
- Add optional filter fields, each with:
  - `@ApiPropertyOptional({ description: '...', enum: [...] })` when constrained
  - `@IsOptional()`
  - For `number`: `@Transform(({ value }) => (value != null && value !== '' ? Number(value) : undefined))` and `@IsNumber()`
  - For `string`: `@IsString()`
  - For enum-like string: `@IsIn(['active', 'closed'])` (or the allowed values)
  - For `boolean`: `@IsBoolean()` and `@Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)`
- Always include `id?: number` as optional filter (for single-record lookup)
- Relation filters (e.g. `accountId`, `salesforceAccountId`) may require QueryBuilder in the repository
- Import from: `class-validator`, `class-transformer`, `@nestjs/swagger`

### 2. Repository (`src/modules/<entity>/`)

Find the existing repository. Add `findAllWithPagination(dto)`.

**Simple case** (direct column filters only): Use `find()` with `where`, `skip`, `take`, `relations`:

```ts
return this.repository.find({
  where: { id, ...rest }, // number → where.field = value, string → use ILike
  skip: (page - 1) * limit,
  take: limit,
  relations: { account: true, originTask: true }, // Load relations needed by mapper
})
```

**Complex case** (jsonb, relations, derived filters): Use `createQueryBuilder`:

```ts
const qb = this.repository
  .createQueryBuilder('entity')
  .leftJoinAndSelect('entity.account', 'account')
  .leftJoinAndSelect('entity.originTask', 'originTask')

if (id != null) qb.andWhere('entity.id = :id', { id })
if (name) qb.andWhere('entity.name ILIKE :name', { name: `%${name}%` })
// jsonb: qb.andWhere("entity.payload->>'salesforceId' = :salesforceId", { salesforceId })
// relation: qb.andWhere('account.id = :accountId', { accountId })
// derived status: qb.andWhere('originTask.statusType = :closed', { closed: TaskStatusTypeEnum.CLOSED })

return qb.orderBy('entity.id', 'DESC').skip((page - 1) * limit).take(limit).getMany()
```

- For string filters use `ILIKE :name` with `%${value}%` for partial match.
- Load all relations required by the mapper via `leftJoinAndSelect`.
- If no repository exists, create one extending `CrudRepository<Entity>` and register it in the module.

### 3. Service (`src/modules/<entity>/<entity>.service.ts`)

Add method:

```ts
async findAllWithPagination(dto: FindAll<Entity>Dto): Promise<Entity[]> {
  return this.repository.findAllWithPagination(dto)
}
```

### 4. Mapper with Minimal DTO (`src/modules/<entity>/mappers/<entity>.mappers.ts`)

Create or update the mapper. Define `EntityMinimalDto` with `@ApiProperty` for each field to expose in the response (single source of truth for API docs):

```ts
import { ApiProperty } from '@nestjs/swagger'
import { Entity } from '../entities/<entity>.entity'

export class EntityMinimalDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: '...' })
  name: string

  // Optional: nested objects, payload fields, aliases. Use @ApiProperty({ nullable: true }) for optional.
}

export class EntityMapper {
  static toMinimal(entity: Entity): EntityMinimalDto {
    return {
      id: entity.id,
      name: entity.name,
      // ... map from entity. Keep property order aligned with DTO.
    }
  }
}
```

**Mapping patterns:**
- **Direct**: `entity.field ?? null`
- **Payload/jsonb**: `entity.payload?.salesforceId ?? entity.payload?.opportunityId ?? null`
- **Relation**: `entity.account ? { id: entity.account.id, name: entity.account.name } : null`
- **Derived**: compute in mapper (e.g. status from `entity.originTask?.statusType`)
- **Alias**: `hours: entity.externalEstimate ?? null`, `clickupUuid: entity.uuid ?? null`
- **Date**: `entity.plannedDueDate ? entity.plannedDueDate.toISOString().split('T')[0] : null`

- Include only non-sensitive, display-friendly fields. Exclude payload, tokens unless needed.
- Keep the return object property order aligned with the DTO for maintainability.
- If a mapper already exists: add `EntityMinimalDto` and update `toMinimal` return type.

### 5. Controller (`src/modules/<entity>/<entity>.controller.ts`)

Add imports: `Version`, `Query`, `HttpCode`, `ApiExtraModels`, `getSchemaPath`, `FindAll<Entity>Dto`, `EntityMapper`, `EntityMinimalDto`, `InfinityPaginationResponseDto`, `infinityPagination`.

Add endpoint:

```ts
@Get()
@Version('2')
@HttpCode(200)
@ApiOperation({
  summary: 'Get all <entities> (v2)',
  description: `
Retrieve a paginated list of <entities> with optional filters.

You may optionally filter the results by:
- **id**: returns the <entity> with that ID
- **[filters from DTO]**: document each filter

If no filters are provided, this endpoint returns the full list.
  `,
})
@ApiExtraModels(EntityMinimalDto)
@ApiResponse({
  status: 200,
  description: 'List of <entities> retrieved successfully',
  schema: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { $ref: getSchemaPath(EntityMinimalDto) },
      },
      hasNextPage: { type: 'boolean', example: true },
    },
  },
})
async findAllV2(
  @Query() dto: FindAll<Entity>Dto,
): Promise<InfinityPaginationResponseDto<EntityMinimalDto>> {
  const items = await this.<entity>Service.findAllWithPagination(dto)
  return infinityPagination<EntityMinimalDto>(
    items.map(EntityMapper.toMinimal),
    { page: dto.page, limit: dto.limit },
  )
}
```

- Always use the mapper and `EntityMinimalDto`. Do not return raw entities.

## Learnings (from SOW and Task implementation)

- **Detail vs list**: When a module has both v2 findAll (list) and v2 get-by-id (detail), the detail endpoint may return `EntityDetailDto` with extra nested data (e.g. milestones with epics). Use a separate `toDetail()` and relation set (`getByIdForDetail`) for that.
- **Nested DTOs in responses**: Nested DTOs (e.g. `SowMilestoneDto`, `SowMilestoneEpicDto`) require `@ApiExtraModels` so Swagger can resolve schema refs.
- **Relations for nested data**: Loading nested arrays (e.g. `projectBoard.tasks.childrenTasks`) requires extending the relation list; define constants (`SOW_DETAIL_RELATIONS`) for clarity.
- **Nested items fields**: Include `id` and `clickupUuid` (from `task.uuid`) in nested items for API consumers.
- **Mapper responsibilities**: Do not duplicate validation in mappers. The service decides when to load nested data; the mapper maps whatever it receives (e.g. `task.childrenTasks ?? []` directly, no `shouldIncludeEpics`).
- **Client-portal scoping**: For consumer-specific APIs (e.g. client-portal), use path prefix (`client-portal/sow`) not version. Version = API evolution; prefix = consumer identity. Use dedicated controllers (e.g. `SowClientPortalController` in `controller/client-portal/`). Add `@ApiTags('client-portal')` for docs filtering.
- **API key protection**: Add `@UseGuards(ApiKeyGuard)` explicitly. Import `AuthModule` in the module so `ApiKeyGuard` can resolve `ApiKeyService`.

## Adding more fields later

To add fields to an existing v2 minimal list:

1. Add property to `EntityMinimalDto` with `@ApiProperty`
2. Add mapping in `EntityMapper.toMinimal()` (keep return order aligned with DTO)
3. If the field comes from a relation, ensure `findAllWithPagination` loads that relation

## File naming

- FindAll DTO: `find-all-<entity>.dto.ts`, class `FindAll<Entity>Dto`
- Mapper: `mappers/<entity>.mappers.ts`, classes `EntityMinimalDto` and `EntityMapper`

## Reference

See `src/modules/sow/` for a complete example:
- `FindAllSowsDto`, `sow.repository.ts`, `sow.service.ts`
- `SowMinimalDto`, `SowDetailDto`, `SowMapper.toMinimal`, `SowMapper.toDetail`
- Client-portal: `sow-client-portal.controller.ts` in `controller/client-portal/` — `GET /v1/client-portal/sow` and `GET /v1/client-portal/sow/:id`

## Output

After applying edits, list:

- **FindAll DTO**: path created/updated
- **Repository**: method added
- **Service**: method added
- **Mapper**: `EntityMinimalDto` and `toMinimal` created/updated
- **Controller**: v2 endpoint added at `GET /v2/<entity>`

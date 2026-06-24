---
name: add-fields
description: 'Add new fields to an entity, DTOs (as optional), and mapper if controller does not use CrudController'
args:
  - name: entity
    description: 'Entity/module name (e.g. account, webhook, taskCustomField)'
    isRequired: true
  - name: fields
    description: 'Comma-separated list of fields in format name:type (e.g. phone:string,defaultRate:decimal)'
    isRequired: true
---

# Add fields to entity

Add new fields to an entity, DTOs (optional), and return them in the controller when it does not use the default CrudController.

## Resolve arguments

- **entity**: Module/entity name (e.g. `account`, `webhook`). Resolve to `src/modules/<entity>/`.
- **fields**: Parse as `name:type` pairs. Valid types: `string`, `number`, `decimal`, `boolean`, `date`, `jsonb`.

## Steps

### 1. Entity (`src/modules/<entity>/entities/*.entity.ts`)

For each field, add the appropriate column before the class closing brace:

| Type   | Decorator                                      | TypeScript type          |
|--------|------------------------------------------------|--------------------------|
| string | `@Column({ nullable: true })`                   | `string`                 |
| number | `@Column({ nullable: true })`                   | `number`                 |
| decimal| `@DecimalColumn({ nullable: true })`            | `number`                 |
| boolean| `@Column({ nullable: true })`                   | `boolean`                |
| date   | `@TimestampColumn({ nullable: true })`         | `Date`                   |
| jsonb  | `@Column('jsonb', { nullable: true })`         | `Record<string, any>`   |

- Import `DecimalColumn` from `src/decorators/decimal-column.decorator` if needed.
- Import `TimestampColumn` from `src/decorators/timestamp-column-decorator` if needed.

### 2. DTOs (`src/modules/<entity>/dto/`)

Add each field as **optional** in create and update DTOs. Target files: `create-<entity>*.dto.ts`, `update-<entity>*.dto.ts`.

For each field add:

- `@IsOptional()`
- Type-specific validator: `@IsString()`, `@IsNumber()`, `@IsBoolean()`, `@IsDateString()`, `@IsObject()` (for jsonb)
- Property: `fieldName?: type` (use `string` for date, not `Date`, since DTOs receive ISO strings)

Example:
```ts
@IsOptional()
@IsString()
phone?: string
```

Ensure `class-validator` imports include any new decorators.

### 3. Controller / mapper (only if NOT using CrudController)

- Find the controller: `src/modules/<entity>/<entity>.controller.ts` (or similar).
- If it **extends CrudController**: do nothing. Entity is returned directly with all columns.
- If it does **not** extend CrudController: update mapper(s) in `src/modules/<entity>/mappers/` to include the new fields in the return object, e.g. `fieldName: entity.fieldName ?? null`.

**Learnings:**
- When the entity has a mapper (MinimalDto, DetailDto), add the new field to both the DTO class and the mapper `toMinimal`/`toDetail` return object.
- **Alias mapping**: Entity field can map to a different DTO name (e.g. `externalEstimate` → `hours`, `uuid` → `clickupUuid`).
- Keep DTO property order aligned with the mapper return object for maintainability.
- If the field comes from a relation, ensure the service method that fetches the entity loads that relation (e.g. add it to `ENTITY_MINIMAL_RELATIONS`).

### 4. Migration

After all entity/DTO/mapper edits are complete:

1. Run:

```bash
npm run migration:generate
```

This creates a migration file like `src/database/migrations/<timestamp>-AutoMigration.ts`.

2. **Rename the migration** to use a descriptive name (see `src/database/migrations/1772154470938-AddClickupTokenColumns.ts`):

   - **File**: Rename `<timestamp>-AutoMigration.ts` → `<timestamp>-Add<Name>Columns.ts`
   - **Class**: Change `AutoMigration<timestamp>` → `Add<Name>Columns<timestamp>`
   - **name property**: Update to `'Add<Name>Columns<timestamp>'`

   **Naming for `<Name>`**:
   - Single field: use field name in PascalCase with "Column" (e.g. `phone` → `AddPhoneColumn`)
   - Multiple fields with common prefix: use the prefix (e.g. `clickupToken`, `clickupTokenExpiresAt` → `AddClickupTokenColumns`)
   - Multiple unrelated fields: use entity in PascalCase (e.g. `account` + `phone`, `taxId` → `AddAccountColumns`)

## Output

After applying edits and running the migration command, list:

- **Entity**: path and fields added
- **DTOs**: paths and fields added
- **Mapper** (if applicable): path and fields added
- **Migration**: final path (e.g. `src/database/migrations/<timestamp>-AddClickupTokenColumns.ts`)

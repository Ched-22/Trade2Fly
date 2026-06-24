---
name: analyze-remove-property
description: 'Run impact analysis for removing a property from a module and output an MD report for review'
args:
  - name: module
    description: 'Module/entity name (e.g. Comment, Task)'
    isRequired: true
  - name: property
    description: 'Property name to remove (e.g. taskId, isClientVisible, senderUser)'
    isRequired: true
---

# Remove Property Impact Analysis

Run an impact analysis for removing a property from a module. **Do not implement changes.** Output a markdown report in `.cursor/command-notes/` (not synced with GitHub) for the user to review and decide.

## Triage: missing or invalid params

If the user does not provide valid `module` and/or `property`, **do not run the analysis yet**. Interact until you have both:

1. **Missing module** – Ask which module/entity (e.g. Comment, Task). Optionally list modules from `src/**/entities/*.entity.ts` or `src/**/infrastructure/persistence/relational/entities/*.entity.ts` to help the user choose.
2. **Missing property** – Ask which property to remove. Optionally list the entity’s fields from the domain or entity file.
3. **Invalid module** – If the module is not found, suggest similar names or list available modules.
4. **Invalid property** – If the property is not found on the entity/domain, suggest possible typos (e.g. `task_id` → `taskId`) or list available fields.

Only proceed to the analysis steps once both `module` and `property` are confirmed.

## Resolve arguments

- **module**: Entity/module name (e.g. `Comment`, `Task`). Resolve to:
  - Hexagonal: `src/<pluralized-dasherize>/` (e.g. Comment → `src/comments/`)
  - Legacy: `src/modules/<lowercase>/` (e.g. Task → `src/modules/task/`)
- **property**: Property name in camelCase (e.g. `taskId`, `isClientVisible`). May appear as:
  - Domain/DTO: `taskId`
  - Entity column: `task_id` or relation `task`
  - Mapper: `raw.task?.id`, `domainEntity.taskId`

## Analysis steps (do automatically)

### 1. Locate module and entity

- Find entity file: `**/entities/*.entity.ts` or `**/infrastructure/persistence/relational/entities/*.entity.ts`
- Read entity to determine property type: column (`@Column`), relation (`@ManyToOne`, `@OneToMany`, `@OneToOne`, `@ManyToMany`), or `@DeleteDateColumn`
- Map entity names to domain names: `senderUser` → `senderUserId`, `is_client_visible` → `isClientVisible`

### 2. Search for usages

Grep for property references across `src/`:

- Domain field name: `taskId`, `senderUserId`
- Entity column/relation: `task_id`, `task`, `senderUser`
- DTO fields, mapper mappings, service create/update payloads
- Any other files importing or referencing the module that use this property

### 3. Reciprocal relations

If property is a relation (`ManyToOne`, `OneToOne`):

- Find the referenced entity (e.g. Task, User)
- Check if it has a back-reference: `OneToMany` or `OneToOne` pointing to this module
- Note in report: removing the relation may require updating the other entity

### 4. Reserved/base fields

If property is `id`, `createdAt`, `updatedAt`, or `deletedAt`:

- Warn: these are base/system fields; removal may break the module
- `deletedAt` may exist only on entity (soft delete); domain might not expose it

## Output

Create `.cursor/command-notes/remove-<module>-<property>.md` with this structure:

```markdown
# Remove Property Analysis: {Module}.{property}

## Summary

| Field | Value |
|-------|-------|
| Module | {module} |
| Property | {property} |
| Type | Column \| Relation (ManyToOne → X) \| DeleteDateColumn |
| Reciprocal | Yes/No - {details if relation} |

## Impact Analysis

### Files Affected

| File | Change |
|------|--------|
| {path} | {description} |
| ... | ... |

### Other References

List any files outside the module that reference this property (with line/context if useful).

### Reciprocal Relation (if applicable)

- Entity: {OtherEntity}
- Property: {propertyName}
- Action: Consider removing if {Module}.{property} is removed

## Recommended Approach

1. Entity: Remove column/relation and decorators
2. Domain: Remove field
3. DTOs: Remove from create and update (update inherits from create)
4. Mapper: Remove from toDomain and toPersistence
5. Service: Remove from create/update payloads
6. Migration: `ALTER TABLE {table} DROP COLUMN {column}` (if column)

## Changes Checklist

- [ ] Entity
- [ ] Domain
- [ ] Create DTO
- [ ] Mapper (toDomain)
- [ ] Mapper (toPersistence)
- [ ] Service create payload
- [ ] Service update payload
- [ ] Migration
- [ ] Reciprocal entity (if applicable)
```

## Next steps

After the report is created, ask the user what they want to do:

1. **Implement the plan** – Apply the changes from the report. When done:
   - Run the linter
   - Run the build
   - Fix any issues and re-run until both pass
2. **Delete the plan** – Remove the report file from `.cursor/command-notes/`
3. **Change the plan** – Update the report based on user feedback (e.g. different approach, scope, or assumptions)

## Rules

- **Analysis phase:** Do not edit any source files. Only create the analysis report.
- **Implementation phase (if user chooses option 1):** Apply changes, run linter and build, fix issues until both pass.
- Create `.cursor/command-notes/` if it does not exist (this folder is gitignored and will not sync with GitHub).
- If property is not found during analysis (after triage), report clearly and suggest possible typos or wrong module.
- Use camelCase for identifiers in the report (per project rules).

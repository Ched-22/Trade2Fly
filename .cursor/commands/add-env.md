---
name: add-env
description: 'Add a new environment variable: Joi validation, Helm values (prod + staging), and .env files'
args:
  - name: name
    description: 'Environment variable name (e.g. ALLOWED_TO_SAVE_SOW_UUIDS)'
    isRequired: true
  - name: type
    description: 'Joi type: string, number, boolean, or array (array = comma-separated string in env)'
    isRequired: true
  - name: required
    description: 'Whether the variable is required (true|false). Default false.'
    isRequired: false
    default: 'false'
  - name: default
    description: 'Default value for optional vars (e.g. "100", "false", "[]"). Omit for required.'
    isRequired: false
  - name: helm_default
    description: 'Value to use in helm/values.yaml and values-staging.yaml (e.g. "changeme", "[]"). Defaults to default or "changeme" for strings.'
    isRequired: false
---

# Add environment variable

Add a new environment variable across the repo: Joi validation, Helm secrets (production + staging), and all .env files.

## Steps

1. **Resolve arguments**

   - `name`: required, UPPER_SNAKE_CASE (e.g. `ALLOWED_TO_SAVE_SOW_UUIDS`).
   - `type`: one of `string`, `number`, `boolean`, `array`. For `array`, env holds a comma-separated string; Joi validates the string, app code may split.
   - `required`: `true` or `false` (default `false`).
   - `default`: default value when optional (e.g. `"100"`, `"false"`, `"''"`, `"[]"`). Omit if required.
   - `helm_default`: value in Helm (default: use `default` if set, else `"changeme"` for string, `"0"` for number, `"false"` for boolean, `"[]"` for array).

2. **Joi validation** — edit `src/config/env.validation.ts`

   - Add one new key to the `envValidationSchema` object.
   - Map `type` to Joi as follows:
     - **string**: `Joi.string()`. If optional: `.optional().default('<default>')`; if no default use `.optional()`.
     - **number**: `Joi.number()`. Use `.optional().default(<number>)` or `.optional()` as needed.
     - **boolean**: `Joi.boolean()`. Use `.optional().default(true|false)` or `.optional()`.
     - **array**: `Joi.string().optional().default('')` (comma-separated; app parses to array). For required array use `Joi.string().required()` (no default).
   - Insert the new line in **alphabetical order** by key name within the existing schema.

3. **Helm values**

   - **helm/values.yaml**: under `secrets.secrets[].data`, add a new line: `NAME: '<helm_default>'`. Use the same key as in Joi. Keep existing keys in a consistent order (e.g. alphabetical); insert the new key in the right place.
   - **helm/values-staging.yaml**: same as above — add `NAME: '<helm_default>'` under `secrets.secrets[].data` in the same position/order as in values.yaml.

4. **.env files**

   - Append a single line to each of these files **if the file exists** (skip if not found):
     - `.env.example`
     - `.env`
     - `.env.test.local`
     - `.env.production.local`
     - `.env.staging.local`
   - Line format: `NAME=<value>` where `<value>` is:
     - For `.env.example`: use a safe placeholder (e.g. `changeme`, `100`, `false`, `[]`).
     - For `.env` and `.env.*.local`: use the same placeholder as in `.env.example` (user will replace with real values).
   - If a file does not exist, do not create it; only update existing files. At minimum, update `.env.example`.

5. **Output** — After applying all edits, always produce the following in your response:

   **Resolved arguments**

   - `name`: (value used)
   - `type`: (value used)
   - `required`: (value used)
   - `default`: (value used, or “none”)
   - `helm_default`: (value used in Helm)

   **Changed files**

   - List each file that was modified (one per line). For each, note: path and what was done (e.g. “Added Joi entry”, “Added secret”, “Appended env line”).
   - If a target file was skipped (e.g. .env file not found), list it under “Skipped (not found): …”.

## Joi examples (for reference)

```ts
// Optional string with default
MY_STRING: Joi.string().optional().default(''),

// Required string
API_KEY: Joi.string().required(),

// Optional number
MAX_PAGE_SIZE: Joi.number().optional().default(100),

// Optional boolean
FEATURE_X: Joi.boolean().optional().default(false),

// Optional array (comma-separated in env)
ALLOWED_TO_SAVE_SOW_UUIDS: Joi.string().optional().default(''),
```

## Helm / .env value formatting

- Strings: use single quotes in YAML, e.g. `'changeme'` or `''`.
- Numbers: no quotes, e.g. `100`.
- Booleans: use strings in Helm/env, e.g. `'false'`, `'true'`.
- Array (comma-separated): use string in Helm/env, e.g. `'[]'` or `''`.

Execute the steps above, apply the edits, then produce the **Resolved arguments** and **Changed files** output as specified in step 5.

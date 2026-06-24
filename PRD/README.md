# PRDs (Product Requirements Documents)

One folder per feature or change. Each folder contains the main PRD, operator checklist, and optional E2E plan.

## Layout

| Path | Purpose |
|------|---------|
| [prd-template.md](./prd-template.md) | Canonical structure and validation checklist |
| `<short-title>/prd.md` | Main PRD |
| `<short-title>/agent-actions.md` | Pre-agent checklist + last gate result |
| `<short-title>/e2e/` | Branch-scoped E2E plan (API PRDs) |

## Commands

1. **Create** — `.cursor/commands/prd-generator.md`
2. **Review (gate)** — `.cursor/commands/review-prd-before-agent.md` with path `PRD/<short-title>`
3. **Implement** — `.cursor/commands/implement-from-prd.md` after gate is **Ready**

## PRD folders

| Folder | Description |
|--------|-------------|
| [react-vite-tailwind-frontend](./react-vite-tailwind-frontend/) | Migrate DC prototypes to React + Vite + Tailwind (`frontend/`) |
| [header-user-menu-dropdown](./header-user-menu-dropdown/) | Dropdown no botão de usuário do header |
| [auth-flow-mock-frontend](./auth-flow-mock-frontend/) | Fluxo completo de login/cadastro/recuperação de senha (mock) |
| [profile-settings-page](./profile-settings-page/) | Redesign `/perfil` — avatar, nome, bio, mock persistence |

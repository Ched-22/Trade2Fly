**Document:** `skydiver-tools-pages/prd.md`  
**Created:** 2026-06-24  
**Status:** Ready  
**Source:** `frontend/src/data/mockCategories.ts` (`resources`), `frontend/src/pages/HomePage.tsx` (§ Ferramentas para skydivers)

# Skydiver Tools Pages (Ferramentas para skydivers)

## 1. Summary

Turn the home **“Ferramentas para skydivers”** cards into **four public tool pages** with interactive UI and **client-side mock logic** (no backend). Wire navigation from the home section and footer; add an optional tools index. Helps buyers/sellers make sizing and pricing decisions before browsing listings.

## 2. Context / background

### 2.1 Current state

1. **`resources`** in `mockCategories.ts` defines four tools (icon, title, subtitle only).
2. **`HomePage.tsx`** renders static cards with `cursor-pointer` but **no navigation**.
3. **Footer** lists “Wingloading”, “Valor do equipamento”, “Guia de harness” as plain text (not linked).
4. No routes under `/ferramentas`.

### 2.2 Problem

Tools are promised on the home page but do not exist as pages. Users expect calculators and guides typical of skydiving marketplaces (e.g. Avento-style resources).

### 2.3 Goals

1. Four dedicated routes with usable interactive content.
2. Consistent layout (tool shell, breadcrumb, CTA to `/busca`).
3. Home cards and footer links navigate to the correct tool.
4. Mock formulas documented in code; replaceable when backend exists.

## 3. Implementation steps

### 3.1 Routes (public)

| Path | Page | Tool |
|------|------|------|
| `/ferramentas` | `ToolsIndexPage` | Grid of all tools (optional hub) |
| `/ferramentas/guia-harness` | `HarnessSizingGuidePage` | Guia de tamanho de harness |
| `/ferramentas/wingloading` | `WingLoadingCalculatorPage` | Calculadora de wingloading |
| `/ferramentas/guia-container` | `ContainerSizingGuidePage` | Guia de tamanho de container |
| `/ferramentas/calculadora-valor` | `GearValueCalculatorPage` | Calculadora de valor |

All routes **public** (no `ProtectedRoute`).

### 3.2 Shared layout

Create **`components/tools/ToolPageLayout.tsx`**:

1. Breadcrumb: Home → Ferramentas → (tool title).
2. Title + short intro (from config).
3. White card / form area (`max-w-2xl` or `max-w-3xl`).
4. Footer CTA: “Ver anúncios” → `/busca` (optional query by category when relevant).

Create **`data/skydiverTools.ts`** — single source for `id`, `slug`, `path`, `icon`, `title`, `description`, `category` (for CTA).

Refactor **`resources`** in `mockCategories.ts` to import from `skydiverTools` or re-export to avoid duplication.

### 3.3 Tool: Guia de tamanho de harness

**Inputs:** altura (cm), peso (kg), experiência (iniciante / intermediário / avançado), preferência de ajuste (justo / confortável).

**Output (mock):** faixa de tamanho sugerida (XS–XL), texto explicativo, link “Buscar containers” → `/busca?category=Containers`.

**Logic:** `lib/tools/harnessSizing.ts` — simple rule table (no medical claims; disclaimer in UI).

### 3.4 Tool: Calculadora de wingloading

**Inputs:** peso total sob carga (kg), tamanho do velame (sqft).

**Output:** wing loading em **lb/ft²** e **kg/m²**, faixa indicativa (conservador / moderado / agressivo) com cores neutras.

**Formula:** `wlLbFt2 = (weightKg * 2.20462) / canopySqft`; `wlKgM2 = weightKg / (canopySqft * 0.092903)`.

**CTA:** `/busca?category=Velames`.

### 3.5 Tool: Guia de tamanho de container

**Inputs:** tamanho main (sqft), tamanho reserva (sqft), AAD (sim/não).

**Output:** compatibilidade mock (tamanho container sugerido: pequeno / médio / grande), notas sobre pack volume.

**Logic:** `lib/tools/containerSizing.ts` — threshold rules on sqft sums.

**CTA:** `/busca?category=Containers`.

### 3.6 Tool: Calculadora de valor

**Inputs:** categoria (select from `categories`), marca (select from `brands`), ano, condição (novo/usado), saltos (opcional).

**Output:** faixa de preço estimada em BRL (min–max), disclaimer “estimativa mock”.

**Logic:** `lib/tools/gearValueEstimate.ts` — base table per category × condition; depreciate ~8% per year from base; optional jump penalty for used gear. **Base prices (BRL mid):** derive from averages in `mockListings` per category (e.g. Velames ~6.500, Containers ~9.000, Reservas ~5.000, Sistemas Completos ~18.000, Capacetes ~1.800, Altímetros ~1.400); round to nearest 100; output min–max ±15%.

**CTA:** `/busca` with category + brand query when set.

### 3.7 Home & footer wiring

1. **`HomePage`:** wrap tool cards in `Link` to `tool.path`; use `skydiverTools` config.
2. **`Footer`:** link Recursos items to matching tool paths where applicable (Wingloading, Valor, Guia de harness).
3. **`ToolsIndexPage`:** reuse same card grid as home section.

### 3.8 UI components

| Component | Purpose |
|-----------|---------|
| `ToolPageLayout` | Shell, breadcrumb, CTA |
| `ToolResultCard` | Highlighted result panel |
| `ToolDisclaimer` | Texto fixo abaixo (todas as páginas de guia/calculadora) |

**Disclaimer (pt-BR, usar em `ToolDisclaimer`):**

> Ferramenta educativa da Trade2Fly. Os resultados são estimativas e não substituem a avaliação de um rigger certificado ou instrutor. Sempre consulte um profissional antes de comprar ou saltar com equipamento novo.

Reuse `Input`, `Button`, `Select` (native `<select>` or styled inputs matching existing pages).

### 3.9 Files

| Action | Path |
|--------|------|
| Create | `data/skydiverTools.ts` |
| Create | `lib/tools/harnessSizing.ts`, `wingLoading.ts`, `containerSizing.ts`, `gearValueEstimate.ts` |
| Create | `components/tools/ToolPageLayout.tsx`, `ToolResultCard.tsx`, `ToolDisclaimer.tsx` |
| Create | `pages/tools/ToolsIndexPage.tsx`, `HarnessSizingGuidePage.tsx`, `WingLoadingCalculatorPage.tsx`, `ContainerSizingGuidePage.tsx`, `GearValueCalculatorPage.tsx` |
| Edit | `routes/index.tsx`, `pages/HomePage.tsx`, `components/layout/Footer.tsx` |
| Edit | `data/mockCategories.ts` (dedupe `resources`) |
| Edit | `frontend/README.md` — tool routes |

### 3.10 Verification

1. All four home cards open the correct tool page.
2. Each tool computes and shows a result from valid inputs.
3. Invalid/empty inputs show validation messages (pt-BR).
4. Breadcrumb and “Ver anúncios” work.
5. Mobile layout readable; forms stack vertically.
6. `npm run build` passes.

## 4. Dependencies

1. `frontend/` app, existing design tokens, `Input` / `Button`.
2. `categories`, `brands` from `mockCategories.ts`.
3. No backend API; no new env vars.

## 5. Resolved decisions

1. **Base path:** `/ferramentas/*` (Portuguese, matches home section name).
2. **Public access** — no login required.
3. **Mock logic** in `lib/tools/*`; disclaimers on every calculator/guide.
4. **Four tools** match existing `resources` array (no fifth tool in v1).
5. **Index page** `/ferramentas` — include as hub (cards grid).
6. **Units:** wingloading shows lb/ft² primary (marketplace norm) + kg/m² secondary.
7. **Disclaimer copy:** Operator approved standard text in §3.8 — show on every tool page via `ToolDisclaimer`.
8. **Gear value bases:** Operator approved — use category mid prices derived from `mockListings` averages (see §3.6); agent implements table in `gearValueEstimate.ts`.

## 6. Open items

None.

## 7. Out of scope

1. Backend APIs, saving user inputs, or PDF export.
2. Blog, FAQ content pages (footer “Blog” stays unlinked or → `/ajuda`).
3. Localization beyond pt-BR.
4. Integration with live listing prices for valuation API.
5. E2E API tests.

## 8. Data flow / behavior

1. User taps tool card on home → navigates to `/ferramentas/...`.
2. User fills form → client-side function returns result → `ToolResultCard` displays.
3. User taps CTA → `/busca` with optional filters.

## 9. Agent implementation guide

### 9.1 Read first

`HomePage.tsx`, `mockCategories.ts`, `HelpPage.tsx` (tone), `SearchPage.tsx` (query params).

### 9.2 Branch

`feat/skydiver-tools-pages`

### 9.3 Implement

`PRD/skydiver-tools-pages` via `.cursor/commands/implement-from-prd.md`

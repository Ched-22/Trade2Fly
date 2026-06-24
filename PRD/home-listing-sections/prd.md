**Document:** `home-listing-sections/prd.md`  
**Created:** 2026-06-24  
**Status:** Ready  
**Source:** `frontend/src/pages/HomePage.tsx`, [react-vite-tailwind-frontend/prd.md](../react-vite-tailwind-frontend/prd.md)

# Home Listing Sections (beyond “Em alta”)

## 1. Summary

Add **four curated listing sections** on the home page, each reusing the same UX as **“Em alta”** (horizontal carousel on mobile, grid on desktop, “Ver mais” at carousel end). Sections surface different slices of mock listings to improve discovery—new gear, trust (escrow), and high-intent categories—without backend changes.

## 2. Context / background

### 2.1 Current state

1. **`HomePage.tsx`** has one listing row: **“Em alta 🔥”** (`listings.slice(0, 6)`).
2. **`ListingCarousel`** — mobile horizontal scroll, 6 items, compact “Ver mais” (circle + label).
3. Desktop uses **`t2f-grid`** inside `hidden md:block` wrapper (avoids `t2f-grid` overriding `hidden`).
4. Other home blocks: hero, seals, categorias populares, ferramentas, proteção, marcas, reviews, newsletter.

### 2.2 Problem

A single “Em alta” row does not mirror marketplace home patterns (e.g. Avento: multiple rows like high demand, new listings, category highlights). Users need more entry points without leaving home.

### 2.3 Goals

1. Four additional sections with distinct **mock filters** and copy.
2. Shared **`HomeListingSection`** component — DRY header + carousel + grid.
3. Preserve mobile carousel behavior (padding, snap, no double grid).
4. Each section’s **“Ver mais”** links to a meaningful **`/busca`** query.

## 3. Implementation steps

### 3.1 Section catalog (four new rows)

| # | Section ID | Title | Subtitle | Mock filter | `seeMore` URL |
|---|------------|-------|----------|-------------|---------------|
| 1 | `trending` | Em alta 🔥 | Os anúncios mais procurados desta semana. | First 6 by listing `id` ascending (existing) | `/busca` |
| 2 | `newArrivals` | Recém publicados | Anúncios adicionados nos últimos dias. | Last 6 by `id` descending | `/busca?sort=newest` |
| 3 | `escrow` | Com custódia | Pagamento protegido até você confirmar o recebimento. | `escrow === true`, max 6 | `/busca?escrow=true` |
| 4 | `completeSystems` | Sistemas completos | Rigs prontos para saltar — container, main e reserva. | `category === 'Sistemas Completos'`, max 6 | `/busca?category=Sistemas%20Completos` |
| 5 | `canopies` | Velames em destaque | Mains e wings das marcas mais buscadas. | `category === 'Velames'`, max 6 | `/busca?category=Velames` |

**Note:** Section 1 refactors existing “Em alta” into the shared pattern; sections 2–5 are **new** (four new rows beyond the current one = **four new sections** plus refactor of existing).

**Home order (top → bottom, within main content column):**

1. Categorias populares (unchanged)  
2. Em alta 🔥  
3. Recém publicados  
4. Com custódia  
5. Sistemas completos  
6. Velames em destaque  
7. Ferramentas para skydivers (unchanged)  
8. … (rest unchanged)

### 3.2 Data helpers

Create **`frontend/src/data/homeListingSections.ts`**:

```ts
export type HomeListingSectionConfig = {
  id: string;
  title: string;
  subtitle: string;
  seeMorePath: string;
  selectListings: (listings: Listing[]) => Listing[];
};
```

Implement `selectListings` per section (pure functions on `mockListings`). If a filter yields **&lt; 6** items, show all available (no padding with duplicates).

### 3.3 UI component

Create **`frontend/src/components/home/HomeListingSection.tsx`**:

1. Props: `config`, `listings` (with `fav`), `onToggleFavorite`, `onSeeMore` (default: navigate to `config.seeMorePath`).
2. Render section header (title, subtitle, desktop “Ver todos” button → `seeMorePath`).
3. Mobile: **`ListingCarousel`** (reuse as-is).
4. Desktop: `hidden md:block` wrapper + inner **`t2f-grid`** (never `hidden t2f-grid` on same node).
5. Match spacing from current “Em alta” (`py-6 sm:py-12`, header `mb-4`).

### 3.4 HomePage refactor

1. Import `homeListingSections` config array and map to `<HomeListingSection />`.
2. Remove inline “Em alta” block and `trending` slice from `HomePage`.
3. Merge favorites: `listings.map(l => ({ ...l, fav: !!favorites[l.id] }))` once, pass to selectors.

### 3.5 SearchPage (required)

1. Read `sort`, `escrow`, and `category` from URL query params (extend existing `SearchPage` filter state).
2. **`sort=newest`:** sort mock listings by **`id` descending** (proxy for recency; no `createdAt` in v1).
3. **`escrow=true`:** filter to `listing.escrow === true`.
4. **`category`:** existing category filter behavior.
5. Sync URL → filters on mount so “Ver mais” links from home sections show coherent results.

### 3.6 Files

| Action | Path |
|--------|------|
| Create | `data/homeListingSections.ts` |
| Create | `components/home/HomeListingSection.tsx` |
| Edit | `pages/HomePage.tsx` |
| Edit | `pages/SearchPage.tsx` (query: `sort=newest`, `escrow=true`) |
| Optional | `frontend/README.md` — document home sections |

### 3.7 Verification

1. Mobile: five listing rows, each horizontal carousel, first card aligned with page padding, “Ver mais” at end (circle + text only).
2. Desktop: grid per section, header button visible.
3. “Ver mais” / “Ver todos” navigate with correct query strings.
4. Sections with few matches still render without layout break.
5. `npm run build` passes.

## 4. Dependencies

1. `frontend/` app, `mockListings`, `ListingCarousel`, `ListingTile`.
2. [react-vite-tailwind-frontend](../react-vite-tailwind-frontend/prd.md) — layout baseline.
3. No backend API; mock data only.

## 5. Resolved decisions

1. **Four new sections:** Recém publicados, Com custódia, Sistemas completos, Velames em destaque.
2. **Reuse `ListingCarousel`** for all sections on mobile.
3. **Extract `HomeListingSection`** to avoid copy-paste.
4. **Mock-only filters** in `homeListingSections.ts`; SearchPage honors query params for “Ver mais”.
5. **Section count on carousel:** up to 6 items each (same as Em alta).
6. **Avento-style layout:** white page, compact headers; no new API.
7. **“Perto de você”:** **Out of scope for v1** (operator confirmed). No geolocation section on home; use category/escrow rows instead.
8. **`sort=newest`:** Use **`id` descending** on mock listings (operator confirmed). Do not add `createdAt` in this PRD.

## 6. Open items

None.

## 7. Out of scope

1. Personalization, ML ranking, or real analytics for “Em alta”.
2. Backend list endpoints or pagination.
3. Infinite scroll on home.
4. Changing hero, categorias populares, ferramentas, reviews blocks.
5. E2E API tests.
6. **“Perto de você”** / location-based home section (future PRD).

## 8. Data flow / behavior

1. `HomePage` loads `listings` from mock → each section config runs `selectListings` → max 6 cards.
2. User swipes carousel → navigates to listing detail or taps “Ver mais” → `SearchPage` with section query.
3. Favorites toggle via existing `MarketplaceContext`.

## 9. Agent implementation guide

### 9.1 Read first

`HomePage.tsx`, `ListingCarousel.tsx`, `SearchPage.tsx`, `mockListings.ts`.

### 9.2 Branch

`feat/home-listing-sections`

### 9.3 Implement

`PRD/home-listing-sections` via `.cursor/commands/implement-from-prd.md`

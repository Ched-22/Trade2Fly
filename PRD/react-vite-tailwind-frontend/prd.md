**Document:** `react-vite-tailwind-frontend/prd.md`  
**Created:** 2026-06-23  
**Status:** Ready  
**Source:** `Front/Trade2Fly.dc.html`, `Front/ListingTile.dc.html`, `Front/_ds/trade2fly-design-system-2da75fd1-7c67-468a-a18b-bd90f5d5097f/`

# React + Vite + Tailwind Frontend

## 1. Summary

Replace the current **DC (document-compiler) HTML prototypes** in `Front/` with a production-ready **React** application under **`frontend/`**, scaffolded with **Vite**, styled with **Tailwind CSS v4**, and wired for **future backend integration** (API proxy in dev, same-origin static + API in production). The app preserves the Trade2Fly marketplace UI (screens, layout, copy in pt-BR, design system tokens) with **React Router**, **React Context** for state, and **npm** as the package manager.

## 2. Context / background

### 2.1 Current state

1. **`Front/Trade2Fly.dc.html`** — Monolithic prototype (~790 lines) using the DC runtime (`Front/support.js`). Client navigation is simulated via a `screen` state (`home`, search, listing, checkout, create, auth, messages, favorites`). Inline styles dominate; conditional blocks use `sc-if` / `sc-for` directives.
2. **`Front/ListingTile.dc.html`** — Standalone listing tile prototype.
3. **`Front/_ds/trade2fly-design-system-…/`** — Design system bundle: CSS tokens (`tokens/colors.css`, `typography.css`, `spacing.css`), `styles.css`, and core JSX references (`Button`, `Badge`, `Input`, `ListingCard`). Brand guidelines document voice, colors, typography (Archivo, Hanken Grotesk, Space Mono), and component patterns.
4. **No package manager or bundler** — The repo has no `package.json` for the frontend; there is no existing React/Vite project.

### 2.2 Screens to migrate (from `data-screen-label` in `Trade2Fly.dc.html`)

1. Header (global)
2. Home
3. Busca (search / listings grid with filters)
4. Anúncio (listing detail)
5. Checkout
6. Criar anúncio (create listing)
7. Autenticação (login / register)
8. Mensagens (chat)
9. Favoritos

### 2.3 Goals

1. Bootstrap a **Vite + React + TypeScript** app at **`frontend/`**.
2. Configure **Tailwind CSS v4** (`@tailwindcss/vite`) with theme tokens mapped from the design system.
3. Port layout and UI from DC prototypes into **React components** with **React Router** for the routes below.
4. Reuse design-system fonts, colors, spacing, and component semantics as Tailwind utilities and shared components.
5. Use **mock/local state** initially; structure code so API calls can replace mocks when the backend exists.
6. Prepare **dev proxy** and **env-based API base URL** for backend integration without changing routing or build layout later.

### 2.4 Constraints

1. **camelCase** for TypeScript identifiers and props (see `.cursor/rules/camelcase.mdc`).
2. Interface copy remains **pt-BR** per design system guidelines.
3. Preserve brand tokens: e.g. `altitude` `#0D2B45`, `pull` `#FF512E`, `voo` `#2D7DD2`, `bruma` `#F5F8FC`, etc.
4. Do not remove `Front/` until the new app reaches visual parity and the operator confirms deprecation (see Out of scope).
5. **npm** only (no pnpm/bun lockfiles in this PRD).

## 3. Implementation steps

### 3.1 Project scaffold (`frontend/`)

1. From repo root, create the app:

   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend && npm install
   ```

2. Install runtime and tooling:

   ```bash
   npm install react-router-dom lucide-react clsx tailwind-merge
   npm install -D tailwindcss @tailwindcss/vite
   ```

3. Configure **Tailwind v4** in `frontend/vite.config.ts`:

   ```ts
   import tailwindcss from '@tailwindcss/vite';
   // plugins: [react(), tailwindcss()]
   ```

4. Add `frontend/src/index.css` with `@import "tailwindcss";` and `@theme` block for design tokens (section 3.2).
5. Add **React Router** in `frontend/src/main.tsx` with `BrowserRouter`.
6. Ensure `package.json` scripts: `dev`, `build`, `preview`, `lint`.
7. Add `frontend/README.md` with: `npm install`, `npm run dev`, build output path (`dist/`), and pointer to `Front/` prototypes for visual reference.

### 3.2 Tailwind theme from design system

1. Copy font files from `Front/_ds/trade2fly-design-system-2da75fd1-7c67-468a-a18b-bd90f5d5097f/assets/fonts/` to `frontend/public/fonts/` (or `src/assets/fonts/`).
2. In `frontend/src/index.css`, define `@font-face` for Archivo, Hanken Grotesk, and Space Mono (mirror `tokens/typography.css`).
3. Map tokens in `@theme` (Tailwind v4 CSS-first config):

   | Token | Value | Tailwind key (example) |
   |-------|-------|------------------------|
   | altitude | `#0D2B45` | `--color-altitude` |
   | voo | `#2D7DD2` | `--color-voo` |
   | pull | `#FF512E` | `--color-pull` |
   | liberado | `#1FB98A` | `--color-liberado` |
   | bruma | `#F5F8FC` | `--color-bruma` |
   | solo | `#0A1B2A` | `--color-solo` |
   | nuvem | `#E3ECF7` | `--color-nuvem` |
   | cinza | `#6B7A8D` | `--color-cinza` |

4. Add font families: `font-display` (Archivo), `font-sans` (Hanken Grotesk), `font-mono` (Space Mono).
5. Add utilities: `.t2f-scroll` (scrollbar), `animate-fade-up` with `@media (prefers-reduced-motion: reduce)` override.
6. Add `frontend/src/lib/cn.ts` using `clsx` + `tailwind-merge`.

### 3.3 Application structure

```
frontend/
  index.html
  vite.config.ts
  .env.example
  src/
    main.tsx
    App.tsx
    index.css
    routes/
      index.tsx              ← route table + ProtectedRoute wrappers
      ProtectedRoute.tsx
    pages/
      HomePage.tsx
      SearchPage.tsx
      ListingPage.tsx
      CheckoutPage.tsx
      CreateListingPage.tsx
      AuthPage.tsx
      MessagesPage.tsx
      FavoritesPage.tsx
    components/
      layout/
        AppShell.tsx
        Header.tsx
        Footer.tsx
        NavCategories.tsx
      ui/
        Button.tsx
        Badge.tsx
        Input.tsx
        ListingCard.tsx
        ListingTile.tsx
    context/
      AuthContext.tsx
      MarketplaceContext.tsx   ← query, filters, favorites, chatMsgs
    hooks/
      useAuth.ts
      useMarketplace.ts
    data/
      mockListings.ts
      mockSellers.ts
      mockCategories.ts
      mockChat.ts
    types/
      listing.ts
      seller.ts
      chat.ts
    lib/
      cn.ts
      api.ts                   ← fetch wrapper; mock today, real baseUrl later
```

### 3.4 Routes

| Route | Page | Access | DC screen |
|-------|------|--------|-----------|
| `/` | `HomePage` | Public | Home |
| `/busca` | `SearchPage` | Public | Busca |
| `/anuncio/:listingId` | `ListingPage` | Public | Anúncio |
| `/checkout` | `CheckoutPage` | Protected | Checkout |
| `/vender` | `CreateListingPage` | Protected | Criar anúncio |
| `/entrar` | `AuthPage` | Public (guest) | Autenticação |
| `/mensagens` | `MessagesPage` | Protected | Mensagens |
| `/favoritos` | `FavoritesPage` | Protected | Favoritos |

**Protected routes** (`/checkout`, `/vender`, `/mensagens`, `/favoritos`): unauthenticated users redirect to `/entrar?returnTo=<encodedPath>`. After mock login, navigate to `returnTo` or `/` if missing/invalid.

### 3.5 Core UI components

1. **`Button`** — variants: primary (pull), secondary (voo), outline, ghost, danger; hover per design system readme.
2. **`Badge`** — escrow, success, category, error.
3. **`Input`** — label, error message, optional prefix/suffix.
4. **`ListingCard`** — gradient/image placeholder, price (`font-mono`), specs, location, escrow badge.
5. **`ListingTile`** — port from `Front/ListingTile.dc.html` if layout differs from card.

### 3.6 Page migration

1. **HomePage** — hero sky gradient, escrow badge, category grid, featured listings, trust sections.
2. **SearchPage** — filters (category, condition, price), query from URL `?q=` and header search, responsive grid.
3. **ListingPage** — gallery, seller block, specs, escrow callout, CTA → `/checkout` (protected).
4. **CheckoutPage** — order summary, Pix/escrow copy, confirmation state (mock).
5. **CreateListingPage** — form aligned with DC prototype (mock submit).
6. **AuthPage** — login/register toggle, email validation (`validEmail`), honors `returnTo` query param.
7. **MessagesPage** — thread list + chat panel, local append-only messages.
8. **FavoritesPage** — grid from `favorites` in context.

### 3.7 State (React Context only)

1. **`AuthContext`** — `loggedIn`, `user` (mock: `{ displayName: 'Ana', initials: 'AM' }`), `login()`, `logout()`. No Zustand, Redux, or other global store libraries.
2. **`MarketplaceContext`** — `query`, `filters`, `favorites`, `chatMsgs`, `chatIdx`, setters and helpers (`toggleFavorite`, `appendMessage`, etc.).
3. Router replaces DC `screen` state; navigation via `useNavigate()` and `<Link>`.
4. Seed mock data from the DC `<script data-dc-script>` block in `Trade2Fly.dc.html`.
5. Header wiring: logo → `/`, search submit → `/busca?q=…`, **Vender** → `/vender` (ProtectedRoute handles redirect), **Entrar** → `/entrar`.

### 3.8 Backend integration (future-ready)

1. **`frontend/vite.config.ts`**:
   - `base: '/'` (app served at site root when backend hosts static `dist/`).
   - `server.proxy`: `/api` → `process.env.VITE_DEV_API_URL` or `http://localhost:3000` (placeholder port; adjust when backend exists).

2. **`frontend/src/lib/api.ts`**:
   - `baseUrl` = `import.meta.env.VITE_API_BASE_URL ?? ''` (empty = same origin in production).
   - Export `apiGet`, `apiPost` wrappers using `fetch` + JSON; mock implementations return local data until backend is wired.

3. **`frontend/.env.example`**:

   ```env
   # Dev: Vite proxy target for /api (optional until backend runs)
   VITE_DEV_API_URL=http://localhost:3000

   # Production: full API origin, or leave empty for same-origin /api
   VITE_API_BASE_URL=
   ```

4. **Production layout (target):** backend serves `frontend/dist` as static files and mounts REST under `/api`; SPA fallback returns `index.html` for non-API routes. Document this in `frontend/README.md`; CI/CD for combined deploy is out of scope.

### 3.9 Icons and assets

1. **lucide-react** for UI icons.
2. Logo from `Front/_ds/.../assets/logo.svg` → `frontend/public/logo.svg` or inline component.

### 3.10 Quality and DX

1. `npm run build` passes with zero TypeScript errors.
2. Optional: Vitest smoke test for `ListingCard` — not blocking.

### 3.11 Handoff

1. Document in `frontend/README.md`: dev URL (default `http://localhost:5173`), `dist/` output, env vars, route map, DC → component mapping.
2. List intentional UI deltas from the DC prototype for operator review.

## 4. Dependencies

1. **Node.js** 20+ and **npm**.
2. Design system assets: `Front/_ds/trade2fly-design-system-2da75fd1-7c67-468a-a18b-bd90f5d5097f/`.
3. DC prototypes: `Front/Trade2Fly.dc.html`, `Front/ListingTile.dc.html`.
4. No running backend required for this PRD; proxy and `api.ts` are scaffolded for later connection.

## 5. Resolved decisions

1. **Stack:** React + Vite + Tailwind CSS v4 + TypeScript.
2. **App root path:** **`frontend/`** — keeps `Front/` DC prototypes as migration reference; avoids overwriting legacy files; standard monorepo layout for a future backend at repo root.
3. **Tailwind:** **v4** with `@tailwindcss/vite` — official Vite integration, CSS-first `@theme`, best fit for a greenfield Vite app.
4. **Global state:** **React Context only** (`AuthContext`, `MarketplaceContext`) — no Zustand/Redux.
5. **Package manager:** **npm** (`package-lock.json` only).
6. **Auth guard:** **`ProtectedRoute`** on `/checkout`, `/vender`, `/mensagens`, `/favoritos`; redirect to `/entrar?returnTo=…`; post-login return to intended page. Public browsing (home, search, listing detail) without login — matches marketplace UX and improves on the DC prototype toggle-only behavior.
7. **Deployment / backend:** **Integrated with future backend** — `base: '/'`, Vite dev proxy `/api`, `VITE_API_BASE_URL` for production, `dist/` served by backend with SPA fallback; same-origin API preferred in production.
8. **Routing:** React Router; paths per section 3.4.
9. **Styling:** Tailwind utility-first + shared UI components.
10. **Data (this PRD):** Mock/local via context and `data/` modules; `lib/api.ts` stub for swap-in later.
11. **Locale:** pt-BR UI copy from prototypes.

## 6. Open items

None.

## 7. Out of scope

1. Real backend API integration, JWT/session persistence, or database (scaffold only).
2. Payment / escrow production flows (Pix, custódia).
3. Deleting or archiving `Front/` DC prototypes (after parity sign-off).
4. E2E test suite against HTTP APIs.
5. SSR, Next.js, or React Native.
6. Internationalization beyond pt-BR.
7. CI/CD and production deploy pipelines for combined frontend + backend.
8. Helm/Kubernetes env wiring (add when backend service exists per `.cursor/rules/env-and-helm.mdc`).

## 8. Data flow / behavior

1. User lands on `/` → browses categories or search → `/anuncio/:listingId` → optional `/checkout` (login required).
2. Header search sets `query` and navigates to `/busca?q=…`; filters applied client-side on mock listings.
3. Logged-out user hits protected route → `/entrar?returnTo=…` → mock login → original destination.
4. **Vender** navigates to `/vender`; ProtectedRoute enforces auth (same as DC `goSell` intent).
5. **Favoritos** toggled per listing id in `MarketplaceContext`; badge count in header.
6. **Mensagens** — local threads and append-only messages (prototype parity).
7. Future: `lib/api.ts` calls `GET /api/listings` etc.; context providers load from API instead of `data/mock*.ts`.

## 9. Agent implementation guide

### 9.1 Read first

1. `Front/Trade2Fly.dc.html` — UI + mock state in `<script data-dc-script>`.
2. `Front/_ds/trade2fly-design-system-…/readme.md` — brand and components.
3. `Front/_ds/.../components/core/*.jsx` — Button, Badge, Input, ListingCard reference.

### 9.2 Files to create (minimum)

1. Full `frontend/` tree per section 3.3.
2. `frontend/.env.example` per section 3.8.
3. `frontend/README.md` with run instructions and backend integration notes.

### 9.3 Patterns

1. Composition over copying inline DC styles.
2. Semantic HTML (`header`, `main`, `nav`, `section`).
3. `cn()` for conditional classes.
4. Explicit types: `Listing`, `Seller`, `Category`, `ChatMessage`, `Filters`.

### 9.4 Verification

1. `cd frontend && npm run dev` — all routes render; protected routes redirect when logged out.
2. `npm run build` — succeeds.
3. Visual spot-check: Home hero, search filters, listing detail, auth redirect + returnTo, header logged-in/out.

### 9.5 Do not

1. Commit secrets or real credentials in `.env`.
2. Remove `Front/` without operator approval.
3. Add Zustand, Redux, or other global store libraries.
4. Use snake_case in TypeScript source.

### 9.6 Branch

`feat/react-vite-tailwind-frontend`

### 9.7 Related commands

1. Gate: `.cursor/commands/review-prd-before-agent.md` — `PRD/react-vite-tailwind-frontend`.
2. Implement: `.cursor/commands/implement-from-prd.md`.

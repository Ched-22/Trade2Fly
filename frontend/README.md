# Trade2Fly Frontend

React + Vite + Tailwind CSS v4 application for the Trade2Fly marketplace.

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Dev server: [http://localhost:5173](http://localhost:5173)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Environment

Copy `.env.example` to `.env.local` (optional until backend exists):

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `VITE_DEV_API_URL` | Proxy target for `/api` in dev (default `http://localhost:3000`) |
| `VITE_API_BASE_URL` | Production API origin; empty = same-origin `/api` |

## Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Home | Public |
| `/busca` | Search | Public |
| `/anuncio/:listingId` | Listing detail | Public |
| `/checkout` | Checkout | Protected |
| `/vender` | Create listing | Protected |
| `/entrar` | Login | Public |
| `/entrar/criar-conta` | Register | Public |
| `/entrar/esqueci-senha` | Forgot password (mock) | Public |
| `/entrar/redefinir-senha` | Reset password (mock) | Public |
| `/mensagens` | Messages | Protected |
| `/favoritos` | Favorites | Protected |
| `/perfil` | Profile settings (account) | Protected |
| `/perfil/contato` | Contact details | Protected |
| `/perfil/senha` | Password | Protected |
| `/perfil/recebimento` | Payout details | Protected |
| `/perfil/pagamento` | Payment methods | Protected |
| `/meus-anuncios` | My listings | Protected |
| `/pedidos` | Orders | Protected |
| `/configuracoes` | Settings | Protected |
| `/faq` | FAQ (perguntas frequentes) | Public |
| `/ajuda` | Redirect → `/faq` | Public |
| `/ferramentas` | Tools index | Public |
| `/ferramentas/guia-harness` | Harness sizing guide | Public |
| `/ferramentas/wingloading` | Wing loading calculator | Public |
| `/ferramentas/guia-container` | Container sizing guide | Public |
| `/ferramentas/calculadora-valor` | Gear value calculator | Public |

## Backend integration (future)

- **Dev:** Vite proxies `/api` → `VITE_DEV_API_URL`
- **Prod:** Backend serves `frontend/dist` as static files and mounts REST under `/api`; SPA fallback returns `index.html`
- **API client:** `src/lib/api.ts` (`apiGet`, `apiPost`) — swap mocks for real calls when backend is ready

## Screen mapping (migrated from DC prototypes)

| Screen | Component |
|--------|-----------|
| Home | `pages/HomePage.tsx` |
| Busca | `pages/SearchPage.tsx` |
| Anúncio | `pages/ListingPage.tsx` |
| Checkout | `pages/CheckoutPage.tsx` |
| Criar anúncio | `pages/CreateListingPage.tsx` |
| Autenticação | `pages/AuthPage.tsx` |
| Mensagens | `pages/MessagesPage.tsx` |
| Favoritos | `pages/FavoritesPage.tsx` |
| Listing tile | `components/ui/ListingTile.tsx` |
| Design tokens | `src/index.css` (`@theme`) |

## Home listing sections

Curated rows on `/` (config: `src/data/homeListingSections.ts`, UI: `src/components/home/HomeListingSection.tsx`):

| Section | See more query |
|---------|----------------|
| Em alta | `/busca` |
| Recém publicados | `/busca?sort=newest` |
| Com custódia | `/busca?escrow=true` |
| Sistemas completos | `/busca?category=Sistemas%20Completos` |
| Velames em destaque | `/busca?category=Velames` |

Mobile: horizontal carousel per section. Desktop: grid. `sort=newest` sorts by listing `id` descending.

## Skydiver tools

Public calculators and guides under `/ferramentas` (config: `src/data/skydiverTools.ts`, logic: `src/lib/tools/*`):

| Tool | Path |
|------|------|
| Index | `/ferramentas` |
| Guia de tamanho de harness | `/ferramentas/guia-harness` |
| Calculadora de wingloading | `/ferramentas/wingloading` |
| Guia de tamanho de container | `/ferramentas/guia-container` |
| Calculadora de valor | `/ferramentas/calculadora-valor` |

Home “Ferramentas para skydivers” cards and footer Recursos links navigate to these routes. All tool pages show an educational disclaimer (`ToolDisclaimer`).

## Sell listing (`/vender`)

Full create-listing form (`pages/CreateListingPage.tsx`, components in `components/sell/`):

| Section | Fields |
|---------|--------|
| Fotos | 1–8 images (client preview; not sent to API in v1) |
| Básico | `title`, `brand` (+ “Outra”) |
| Categoria | All categories from `mockCategories.ts` |
| Detalhes | Category-specific specs (`data/listingFieldConfig.ts`) |
| Estado e preço | `condition` (Novo / Bom / Usado), `priceNum` |
| Localização | `location` (custódia sempre ativa — regra do site) |
| Descrição | min 50 chars |

Draft auto-save: `trade2fly:listingDraft:v1` via `lib/listingDraftStorage.ts`. Publish calls `POST /api/listings` and refetches marketplace listings.

## Listing visibility

- **Home / busca:** `GET /api/listings` via `MarketplaceContext` — no `mockListings` fallback on home.
- **Meus anúncios:** `GET /api/listings/me/listings`.
- **Detalhe:** `GET /api/listings/:id` (with context cache).
- **Publish errors:** `listingsError` banner on home when API fails.

## Profile settings (`/perfil`)

Mock-extended profile fields (storage: `t2f_mock_profile_<userId>` via `src/lib/profileStorage.ts`). Sidebar nav at `/perfil` with sections:

| Section | Path |
|---------|------|
| Configurações da conta | `/perfil` |
| Dados de contato | `/perfil/contato` |
| Senha | `/perfil/senha` |
| Dados de recebimento | `/perfil/recebimento` |
| Métodos de pagamento | `/perfil/pagamento` |

| Field | Notes |
|-------|--------|
| `firstName`, `lastName` | Required on save |
| `displayName` | Auto-suggest from name (e.g. Pedro C.) |
| `bio` | Max 500 chars |
| `phone` | Optional |
| `city`, `dropzone` | Optional location (contact section) |
| `avatarUrl` | Client data URL (JPG/PNG/WebP, max 500 KB) |

`saveProfile` is the single write path — swap for `PATCH /api/users/me` when the backend schema supports extended fields. Public preview is a modal only (no `/usuario/:id` in v1).

## Mock authentication

Auth is **client-side only** until the backend exists. Data is stored in `localStorage`:

| Key | Purpose |
|-----|---------|
| `t2f_mock_accounts` | Registered users (email, password, display name, initials) |
| `t2f_mock_session` | Active session (`AuthUser`) |

**Seed account** (created on first visit if no accounts exist):

| E-mail | Senha |
|--------|-------|
| `ana.martins@email.com` | `senha123` |

**Flows:** login, register (→ `/perfil` or `returnTo`), forgot password (generic message + dev reset link), reset password (`token=mock-reset-token`).

Clear `localStorage` keys to reset mock data.

## Notes

1. **Fonts:** Google Fonts CDN (Archivo, Hanken Grotesk, Space Mono).
2. **Auth:** `ProtectedRoute` with `returnTo` redirect; session persists across refresh.
3. **Routing:** URL-based navigation via React Router.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root unless noted.

```bash
# Development
npm run dev          # all apps via Turbo
npm run dev:web      # only apps/web (faster)

# Build & lint
npm run build
npm run lint

# Database (run from root, targets apps/web prisma)
npm run db:generate  # regenerate Prisma client after schema change
npm run db:push      # push schema changes to Supabase (no migration files)

# Install (fixes workspace symlinks if the project folder is moved)
npm install
```

No test suite exists. The Prisma client is generated to `apps/web/src/generated/prisma` (non-standard path).

## Architecture

### Monorepo structure

```
land-tour-client/
├── apps/web/          — Next.js 15 app (public site + B2B portal)
├── packages/shared/   — @land-tour/shared: TypeScript types, calcularSubtotal(), resumenPasajeros()
└── packages/ui/       — @land-tour/ui: <Button> component
```

Both packages are consumed as raw TypeScript source (`"main": "./src/index.ts"`), not compiled. `transpilePackages` in `next.config.ts` handles this.

### Two-app, one-database system

This repo is **land-tour-client** (the B2B agency portal). A separate app, **lt-core-admin**, manages the master data (Agencias, Users, Paquetes, Destinos). Both apps point to the same Supabase PostgreSQL database.

**Critical rule:** Never run `prisma migrate` on the read-only reference models (`Agencia`, `UsuarioAgencia`, `DestinoRef`, `PaqueteRef` — all marked `@readonly` in the schema). These are managed by lt-core-admin. Use only `prisma db push` for schema changes here.

The DB user `b2b_user` is **read-only on the `Agencia` table**, so `PATCH /api/agency/config` does not write to the DB — it returns the body back for the client to persist in `localStorage`.

### Prisma client

```ts
// apps/web/src/lib/prisma.ts
// Uses @prisma/adapter-pg (driver adapter) — not the default Prisma connection
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
```

### Authentication (NextAuth v5)

Split into two files to satisfy Next.js Edge/Node.js runtime boundaries:

- `auth.config.ts` — Edge-compatible config (JWT callbacks, route definitions). Used by middleware.
- `auth.ts` — Full Node.js config with Prisma + bcrypt `authorize()`. Used by API routes.

Session extends the default NextAuth types with `role: UserRole`, `agenciaId`, and `agenciaNombre`. All API routes use `session.user.agenciaId` to scope data access to the authenticated agency.

Dev mock users (no DB needed): `admin@agenciademo.com / Admin123*`, `colaborador@agenciademo.com / Colab123*`.

### Route protection

`src/middleware.ts` protects `/dashboard/:path*` and `/panel/:path*` — everything else is public.

### Public landing (app router pages)

- `/` — landing page (`page.tsx` + components in `src/components/`)
- `/paquetes` — public package listing
- `/login` — login page with `ForgotPasswordModal` and `RequestAccessModal`

### Protected B2B dashboard

`/dashboard/page.tsx` is a single large client component (~1500 lines) containing the entire agency portal: sidebar navigation, 5 tabs (Dashboard, Paquetes, Nueva Cotización, Cotizaciones, Marca Blanca), and a 4-step quoter (stepper).

**Important pattern:** `packages` state starts empty while loading. All derived state that depends on `selectedPkg` is guarded — the cotizador tab shows an inline error state if `isLoadingPackages || !selectedPkg` instead of crashing.

### API layer

`src/services/api.ts` — thin client wrapper for all fetch calls. Uses `safeFetch<T>()` which normalizes `503 → "DB_FAIL"` and empty arrays → `"EMPTY"`. Components receive `{ data, error }` and render inline states accordingly.

API routes return `{ error: "DB_FAIL", status: 503 }` on any Prisma failure. Never throw unhandled errors to the client.

### Email (mailer)

`src/lib/mailer.ts` centralizes all email logic:
- `sendForgotPasswordEmail(userEmail)` — notifies admin of password reset request
- `sendRequestAccessEmail(data)` — notifies admin of new B2B access request

Both functions send HTML templates to `ADMIN_EMAIL`. The logo URL is built from `AUTH_URL` env var, so in production `AUTH_URL` must be set to the public domain.

### Environment variables

Located at `apps/web/.env` (not `.env.local`). Required vars:

```
DATABASE_URL          # Supabase PostgreSQL connection string
DIRECT_URL            # same (used by Prisma for migrations)
AUTH_SECRET           # NextAuth secret
AUTH_URL              # App base URL (used to build logo URL in emails)
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM
ADMIN_EMAIL           # Recipient for forgot-password and request-access notifications
```

### Styling

Tailwind CSS v4 (`@import "tailwindcss"` with `@theme` block in `globals.css`). Custom colors defined as CSS variables — no `tailwind.config.js` file:

- `primary: #0b4339` (dark green)
- `secondary: #28bfa9` (turquoise)
- `light: #f5faf9`, `lighter: #edf7f5`, `gold: #c9a96e`

Fonts: Montserrat (public site), Inter (dashboard).

### Key shared types (`@land-tour/shared`)

- `Package` — the canonical package type used everywhere; `prices.{sgl,dbl,tpl,quad,chd}` may be undefined
- `Cotizacion` — snapshot-based (prices frozen at creation time so future package changes don't affect past quotes)
- `CotizacionStatus`: `BORRADOR → ENVIADA → APROBADA | RECHAZADA`
- `calcularSubtotal(rooms, prices)` — use this function for all subtotal math (not inline arithmetic)
- `agenciaId` scopes every model — never query across agencies

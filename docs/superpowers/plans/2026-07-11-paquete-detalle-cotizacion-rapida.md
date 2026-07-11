# Vista de Detalle de Paquete + Cotización Rápida Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a package detail page reachable from the "Paquetes" tab of the B2B cotizador (galería, itinerario, servicios incluidos, variantes con precio real calculado), plus a "Cotización rápida" action that creates a real `BORRADOR` cotización instantly, without going through the 4-step wizard.

**Architecture:** A new standalone Next.js route `/dashboard/paquetes/[id]` (same pattern as the existing `/dashboard/cotizaciones/[id]` document page — no sidebar, own data fetch) renders a new `PaqueteDetailView` component that reuses the existing pure pricing engine (`cotizar-price.ts`) client-side for variant price previews, and calls a new `POST /api/cotizaciones/quick` endpoint (which reuses the same pricing engine server-side) to create the quick quote.

**Tech Stack:** Next.js 15 App Router, Prisma 7 (`@/generated/prisma`), NextAuth v5 (`@/auth`), Tailwind CSS v4, TypeScript strict mode.

## Global Constraints

- No test framework exists in this repo. Verification is `npx tsc --noEmit` (run from `apps/web/`) after every task, plus `npx next build` at the end of the plan. Do not add a test runner.
- Never touch `@readonly` Prisma models (`PaqueteRef`, `HotelRef`, etc.) or run `prisma migrate`/`db:push` against them — this feature only reads them.
- The cotizador (B2B) never applies the landing's `LANDING_MARKUP` (+9%). All prices in this feature come straight from `TarifaHotel`/`TarifaActividad`/`TarifaTraslado` via `cotizar-price.ts`, exactly like the existing wizard.
- Money math always goes through `cotizar-price.ts`'s existing pure functions (`calcHotelBreakdown`, `cartesian`, `combineComboLegs`). Do not re-derive pricing formulas inline.
- Do not modify `apps/web/src/app/api/cotizaciones/route.ts` (the existing `POST /api/cotizaciones` used by the wizard) — it is production code with no test coverage; the new quick-quote endpoint is fully self-contained to avoid any regression risk there.
- Tailwind classes follow existing dashboard conventions: `bg-secondary`/`text-primary` for CTAs, `rounded-3xl`/`rounded-2xl` cards, `text-[10px] font-black uppercase tracking-wider` for labels/buttons.

---

## Task 1: Shared cotizador types + `numPaxToTipoPax` in `cotizar-price.ts`

**Files:**
- Create: `apps/web/src/app/dashboard/cotizar-types.ts`
- Modify: `apps/web/src/app/dashboard/cotizar-price.ts`
- Modify: `apps/web/src/app/dashboard/page.tsx:1-64,66-111,177-183`

**Interfaces:**
- Produces: `CotPaquete`, `CotPaqueteHotel`, `CotPaqueteDestino`, `CotPaqueteActividad`, `CotPaqueteTraslado`, `CotPaqueteVersion`, `CotPoliticaNinos`, `CotHotel`, `CotHotelTarifa`, `CotActividad`, `CotActividadTarifa`, `CotTraslado`, `CotTrasladoTarifa`, `CotDestino`, `CotizarData` (all exported from `cotizar-types.ts`); `numPaxToTipoPax(n: number): "SGL" | "DBL" | "TPL" | "QUAD" | null` (exported from `cotizar-price.ts`).
- Consumes: nothing (foundational task).

This task is a pure relocation — no behavior changes. `page.tsx` currently declares these 13 interfaces and the `numPaxToTipoPax` function as private module-scope code (lines 66-111 and 177-183). Both the new detail page (Task 6/7) and the new quick-quote endpoint (Task 4) need this exact same `CotPaquete` shape and the same `numPaxToTipoPax` logic, so they must live in framework-agnostic files that both a client component and a server route can import.

- [ ] **Step 1: Create `cotizar-types.ts` with the relocated interfaces plus `imagenes`/`itinerario`**

```ts
// apps/web/src/app/dashboard/cotizar-types.ts
// Shared type definitions for the catalog cotizador (wizard, package detail page,
// and the quick-quote API route). No React imports — safe to import from server code.

export interface CotHotelTarifa { tipoHabitacion: string; precioBase: number }
export interface CotPoliticaNinos { edadMin: number; edadMax: number; precio: number | null }
export interface CotHotel { id: number; nombre: string; estrellas: number; tarifas: CotHotelTarifa[]; politicaNinos: CotPoliticaNinos[] }
export interface CotActividadTarifa { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }
export interface CotActividad { id: number; nombre: string; descripcion: string | null; tarifas: CotActividadTarifa[] }
export interface CotTrasladoTarifa { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }
export interface CotTraslado { id: number; tipo: string; tarifas: CotTrasladoTarifa[] }
export interface CotDestino { id: number; ciudad: string; pais: string; hoteles: CotHotel[]; actividades: CotActividad[]; traslados: CotTraslado[] }
export interface CotPaqueteVersion { tipoPax: string; numPax: number; precioPorPersona: number | null }
export interface CotPaqueteActividad {
  id: number; nombre: string; descripcion: string | null;
  destinoId: number; destinoCiudad: string;
  tarifas: { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }[];
}
export interface CotPaqueteTraslado {
  id: number; tipo: string; destinoId: number; destinoCiudad: string;
  tarifas: { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }[];
}
export interface CotPaqueteDestino { id: number; ciudad: string; pais: string }
export interface CotPaqueteHotel {
  id: number; nombre: string; estrellas: number;
  destinoId: number; destinoCiudad: string; noches: number;
  tarifas: { tipoHabitacion: string; precioBase: number }[];
  politicaNinos: CotPoliticaNinos[];
}
/** One day of `ItinerarioDiaRef`, mapped for display (no `location` field — table has none). */
export interface CotPaqueteItinerarioDia { day: number; title: string; description: string }
export interface CotPaquete {
  id: number; nombre: string; numPax: number; numNinos: number; diasEstancia: number; nochesBase: number;
  incluyeBoleto: boolean; precioBoleto: number | null; descripcionBoleto: string | null;
  precioBoletoNino: number | null; descripcionBoletoNino: string | null;
  visibleBoleto: boolean;
  permitirModificarBoleto: boolean; permitirModificarNoches: boolean;
  destinoCiudad: string; destinoPais: string;
  destinos: CotPaqueteDestino[];
  hoteles: CotPaqueteHotel[];
  hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[];
  actividades: CotPaqueteActividad[];
  traslados: CotPaqueteTraslado[];
  versiones: CotPaqueteVersion[];
  imagenes: string[];
  itinerario: CotPaqueteItinerarioDia[];
}
export interface CotizarData { destinos: CotDestino[]; paquetes: CotPaquete[] }
```

- [ ] **Step 2: Add `numPaxToTipoPax` to `cotizar-price.ts`**

Append at the end of `apps/web/src/app/dashboard/cotizar-price.ts` (after the `hotelPerDestinoPrice` function, i.e. after the current last line):

```ts

// ── Occupancy → room-type mapping ─────────────────────────────────────────────
// Modo catálogo assumes every adult shares rooms of ONE occupancy type, derived
// solely from the total adult headcount (no mixed room-type support in this model).

export function numPaxToTipoPax(n: number): "SGL" | "DBL" | "TPL" | "QUAD" | null {
  if (n === 1) return "SGL";
  if (n === 2) return "DBL";
  if (n === 3) return "TPL";
  if (n === 4) return "QUAD";
  return null;
}
```

- [ ] **Step 3: Update `page.tsx` to import the relocated types instead of declaring them**

Replace this exact block (currently `page.tsx:66-111`):

```ts
// ─── Cotizar-datos API types ──────────────────────────────────────────────────
interface CotHotelTarifa { tipoHabitacion: string; precioBase: number }
interface CotHotel { id: number; nombre: string; estrellas: number; tarifas: CotHotelTarifa[]; politicaNinos: CotPoliticaNinos[] }
interface CotActividadTarifa { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }
interface CotActividad { id: number; nombre: string; descripcion: string | null; tarifas: CotActividadTarifa[] }
interface CotTrasladoTarifa { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }
interface CotTraslado { id: number; tipo: string; tarifas: CotTrasladoTarifa[] }
interface CotDestino { id: number; ciudad: string; pais: string; hoteles: CotHotel[]; actividades: CotActividad[]; traslados: CotTraslado[] }
interface CotPaqueteVersion { tipoPax: string; numPax: number; precioPorPersona: number | null }
interface CotPoliticaNinos { edadMin: number; edadMax: number; precio: number | null }
interface CotPaqueteActividad {
  id: number; nombre: string; descripcion: string | null;
  destinoId: number; destinoCiudad: string;
  tarifas: { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }[];
}
interface CotPaqueteTraslado {
  id: number; tipo: string; destinoId: number; destinoCiudad: string;
  tarifas: { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }[];
}
interface CotPaqueteDestino   { id: number; ciudad: string; pais: string }
interface CotPaqueteHotel {
  id: number; nombre: string; estrellas: number;
  destinoId: number; destinoCiudad: string; noches: number;
  tarifas: { tipoHabitacion: string; precioBase: number }[];
  politicaNinos: CotPoliticaNinos[];
}
interface CotPaquete {
  id: number; nombre: string; numPax: number; numNinos: number; diasEstancia: number; nochesBase: number;
  incluyeBoleto: boolean; precioBoleto: number | null; descripcionBoleto: string | null;
  // Child air fare — falls back to the adult fare when no child fare is declared
  // (see cotFlightPriceChild default in the effect below).
  precioBoletoNino: number | null; descripcionBoletoNino: string | null;
  // Master visibility switch — applies to BOTH adult and child boleto. When false, the
  // whole boleto section is hidden everywhere (cotizador + cotización final); the price
  // is still added to the total automatically. Takes precedence over permitirModificarBoleto.
  visibleBoleto: boolean;
  permitirModificarBoleto: boolean; permitirModificarNoches: boolean;
  destinoCiudad: string; destinoPais: string;
  destinos: CotPaqueteDestino[];
  hoteles: CotPaqueteHotel[];
  hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[];
  actividades: CotPaqueteActividad[];
  traslados: CotPaqueteTraslado[];
  versiones: CotPaqueteVersion[];
}
interface CotizarData { destinos: CotDestino[]; paquetes: CotPaquete[] }
```

with:

```ts
// ─── Cotizar-datos API types (shared with the package detail page + quick-quote API) ──
import type {
  CotHotel, CotActividad, CotTraslado, CotDestino, CotPaqueteVersion, CotPoliticaNinos,
  CotPaqueteActividad, CotPaqueteTraslado, CotPaqueteDestino, CotPaqueteHotel, CotPaquete,
  CotizarData,
} from "./cotizar-types";
```

(`CotHotelTarifa`, `CotActividadTarifa`, `CotTrasladoTarifa` are not referenced by name elsewhere in `page.tsx` — do not import them.)

Then update the existing import block from `./cotizar-price` (`page.tsx:55-64`) to also pull in `numPaxToTipoPax`:

```ts
import {
  calcHotelBreakdown,
  getUncoveredChildAges,
  cartesian,
  combineComboLegs,
  hotelPerDestinoPrice,
  numPaxToTipoPax,
  type HotelBreakdown,
  type ComboLeg,
  type ComboTotals,
} from "./cotizar-price";
```

Finally, delete the local function definition (currently `page.tsx:177-183`):

```ts
function numPaxToTipoPax(n: number): "SGL" | "DBL" | "TPL" | "QUAD" | null {
  if (n === 1) return "SGL";
  if (n === 2) return "DBL";
  if (n === 3) return "TPL";
  if (n === 4) return "QUAD";
  return null;
}
```

- [ ] **Step 4: Verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors. (If `CotHotel`/`CotDestino`/etc. show as unused-import warnings, tsc with default settings won't fail the build on that alone, but double-check the earlier `Grep` usages — `CotHotel`, `CotDestino`, `CotPaqueteHotel`, `CotPaquete`, `CotizarData`, `CotPoliticaNinos` ARE used later in `page.tsx` as explicit type annotations, so they must stay imported.)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/dashboard/cotizar-types.ts apps/web/src/app/dashboard/cotizar-price.ts apps/web/src/app/dashboard/page.tsx
git commit -m "refactor(cotizador): extract shared package types + numPaxToTipoPax"
```

---

## Task 2: Shared paquete query/mapper + extend `/api/cotizar-datos` with galería e itinerario

**Files:**
- Create: `apps/web/src/lib/cotizar-paquete-mapper.ts`
- Modify: `apps/web/src/app/api/cotizar-datos/route.ts`

**Interfaces:**
- Consumes: `CotPaquete`, `CotPaqueteHotel` from `../../app/dashboard/cotizar-types` (Task 1).
- Produces: `paqueteInclude` (Prisma include object), `mapPaqueteRow(p: PaqueteRow): CotPaquete` — both exported from `cotizar-paquete-mapper.ts`, consumed by Task 4's quick-quote route and by `/api/cotizar-datos`.

The package detail page (Task 6/7) and the quick-quote endpoint (Task 4) both need one full `CotPaquete` (hoteles/tarifas/actividades/traslados/versiones/imagenes/itinerario) by id. Rather than duplicate the ~60-line Prisma include + mapping already in `/api/cotizar-datos/route.ts`, extract it into a shared, pure (no Prisma calls of its own — takes a already-fetched row) mapper function that both the list endpoint and the new single-package fetch (inside Task 4's route) can reuse.

- [ ] **Step 1: Create the shared mapper**

```ts
// apps/web/src/lib/cotizar-paquete-mapper.ts
// Shared Prisma include + row→CotPaquete mapping for the catalog cotizador.
// Used by GET /api/cotizar-datos (list) and POST /api/cotizaciones/quick (single lookup)
// so both stay in sync with one source of truth for this complex query shape.
import type { Prisma } from "@/generated/prisma";
import type { CotPaquete, CotPaqueteHotel } from "@/app/dashboard/cotizar-types";

export const paqueteInclude = {
  versiones: { orderBy: { tipoPax: "asc" } },
  hoteles: {
    include: {
      hotel: { include: { destino: true, tarifas: true, politicaNinos: true } },
    },
  },
  actividades: {
    include: { actividad: { include: { destino: true, tarifas: true } } },
  },
  traslados: {
    include: { traslado: { include: { destino: true, tarifas: true } } },
  },
  imagenes: { orderBy: { orden: "asc" } },
  itinerario: { orderBy: { orden: "asc" } },
} satisfies Prisma.PaqueteRefInclude;

export type PaqueteRow = Prisma.PaqueteRefGetPayload<{ include: typeof paqueteInclude }>;

export function mapPaqueteRow(p: PaqueteRow): CotPaquete {
  // Unique destinations from hotels (preserves order of first occurrence)
  const destinosMap = new Map<number, { id: number; ciudad: string; pais: string }>();
  p.hoteles.forEach((ph) => {
    const d = ph.hotel?.destino;
    if (d && !destinosMap.has(d.id)) {
      destinosMap.set(d.id, { id: d.id, ciudad: d.ciudad, pais: d.pais });
    }
  });
  const destinosList = [...destinosMap.values()];
  const primerDestino = destinosList[0];

  // Deduplicate hotels by id (PaqueteHotelRef has one row per hotelId+tipoHabitacion)
  const hotelesMap = new Map<number, CotPaqueteHotel>();
  p.hoteles.forEach((ph) => {
    if (ph.hotel && !hotelesMap.has(ph.hotel.id)) {
      hotelesMap.set(ph.hotel.id, {
        id: ph.hotel.id,
        nombre: ph.hotel.nombre,
        estrellas: ph.hotel.estrellas,
        destinoId: ph.hotel.destino?.id ?? 0,
        destinoCiudad: ph.hotel.destino?.ciudad ?? "",
        noches: ph.noches ?? 1,
        tarifas: ph.hotel.tarifas.map((t) => ({
          tipoHabitacion: t.tipoHabitacion,
          precioBase: Number(t.precioBase),
        })),
        politicaNinos: ph.hotel.politicaNinos.map((pol) => ({
          edadMin: pol.edadMin,
          edadMax: pol.edadMax,
          precio: pol.precio ?? null,
        })),
      });
    }
  });

  const hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[] = [];
  p.hoteles.forEach((ph) => {
    if (ph.hotel?.tarifas) {
      ph.hotel.tarifas.forEach((t) => {
        hotelTarifas.push({
          hotelId: ph.hotel!.id,
          tipoHabitacion: t.tipoHabitacion,
          precioBase: Number(t.precioBase),
        });
      });
    }
  });

  return {
    id: p.id,
    nombre: p.nombre,
    numPax: p.numPax,
    numNinos: p.numNinos,
    diasEstancia: p.diasEstancia,
    nochesBase: p.nochesBase,
    incluyeBoleto: p.incluyeBoleto,
    precioBoleto: p.precioBoleto ?? null,
    precioBoletoNino: p.precioBoletoNino ?? null,
    descripcionBoletoNino: p.descripcionBoletoNino ?? null,
    visibleBoleto: p.visibleBoleto,
    descripcionBoleto: p.descripcionBoleto ?? null,
    permitirModificarBoleto: p.permitirModificarBoleto,
    permitirModificarNoches: p.permitirModificarNoches,
    destinoCiudad: primerDestino?.ciudad ?? "",
    destinoPais: primerDestino?.pais ?? "",
    destinos: destinosList,
    hoteles: [...hotelesMap.values()],
    hotelTarifas,
    versiones: p.versiones
      .filter((v) => v.precioPorPersona !== null)
      .map((v) => ({
        tipoPax: v.tipoPax,
        numPax: v.numPax,
        precioPorPersona: v.precioPorPersona,
      })),
    actividades: p.actividades.map((pa) => ({
      id: pa.actividad.id,
      nombre: pa.actividad.nombre,
      descripcion: pa.actividad.descripcion ?? null,
      destinoId: pa.actividad.destinoId,
      destinoCiudad: pa.actividad.destino?.ciudad ?? "",
      tarifas: pa.actividad.tarifas.map((t) => ({
        precio: Number(t.precio),
        tipoPasajero: t.tipoPasajero,
        paxMin: t.paxMin,
        paxMax: t.paxMax,
      })),
    })),
    traslados: p.traslados.map((pt) => ({
      id: pt.traslado.id,
      tipo: pt.traslado.tipo,
      destinoId: pt.traslado.destinoId,
      destinoCiudad: pt.traslado.destino?.ciudad ?? "",
      tarifas: pt.traslado.tarifas.map((t) => ({
        precio: Number(t.precio),
        tipoPasajero: t.tipoPasajero,
        paxMin: t.paxMin,
        paxMax: t.paxMax,
      })),
    })),
    imagenes: p.imagenes.map((i) => i.url),
    itinerario: p.itinerario.map((i) => ({
      day: i.dia,
      title: i.titulo,
      description: i.descripcion ?? "",
    })),
  };
}
```

- [ ] **Step 2: Refactor `/api/cotizar-datos/route.ts` to use the shared mapper**

Replace the `paquetes` query (currently `route.ts:29-48`):

```ts
    const paquetes = await prisma.paqueteRef.findMany({
      where: { visibleEnFront: true },
      include: {
        versiones: { orderBy: { tipoPax: "asc" } },
        hoteles: {
          include: {
            hotel: {
              include: { destino: true, tarifas: true, politicaNinos: true },
            },
          },
        },
        actividades: {
          include: { actividad: { include: { destino: true, tarifas: true } } },
        },
        traslados: {
          include: { traslado: { include: { destino: true, tarifas: true } } },
        },
      },
      orderBy: { nombre: "asc" },
    });
```

with:

```ts
    const paquetes = await prisma.paqueteRef.findMany({
      where: { visibleEnFront: true },
      include: paqueteInclude,
      orderBy: { nombre: "asc" },
    });
```

Replace the entire mapping block (currently `route.ts:50-161`, the `const paquetesMapeados = paquetes.map((p) => { ... });` function) with:

```ts
    const paquetesMapeados = paquetes.map(mapPaqueteRow);
```

Add the import at the top of the file (after the existing `logError` import):

```ts
import { paqueteInclude, mapPaqueteRow } from "@/lib/cotizar-paquete-mapper";
```

- [ ] **Step 3: Verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual smoke check**

Run: `cd apps/web && npm run dev` (or from repo root `npm run dev:web`), log in as `asesor@agenciapruebas.com` / `Admin123*`, open the Paquetes tab, and confirm the catalog still loads (network tab: `GET /api/cotizar-datos` returns `200` with a non-empty `paquetes` array — this proves the refactored query/mapping still works end-to-end, since the wizard's Step 2/3/4 depend on this exact response shape).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/cotizar-paquete-mapper.ts apps/web/src/app/api/cotizar-datos/route.ts
git commit -m "refactor(cotizar-datos): extract shared paquete query/mapper, add imagenes+itinerario"
```

---

## Task 3: `sinTarifaNino` snapshot field + badge in `CotizacionDetailView`

**Files:**
- Modify: `apps/web/src/app/dashboard/DashboardContext.tsx:6-36`
- Modify: `apps/web/src/app/dashboard/components/CotizacionDetailView.tsx`

**Interfaces:**
- Produces: `HotelCompSnapshot.sinTarifaNino?: boolean` — consumed by Task 4 (quick-quote route sets it) and rendered here.
- Consumes: nothing new.

Per the approved spec, the quick-quote endpoint (Task 4) includes every hotel of every destino, even ones with no CHD tariff — for those, child accommodation is $0 and the UI must say so explicitly (never silently look like "kids stay free"). This task adds the field and its rendering; Task 4 will populate it.

- [ ] **Step 1: Add the field to `HotelCompSnapshot`**

In `apps/web/src/app/dashboard/DashboardContext.tsx`, add one line right after `boletoPrecioOculto?: boolean;` (currently line 29, inside the `HotelCompSnapshot` type):

```ts
  boletoPrecioOculto?: boolean;
  // Set by the quick-quote endpoint when this hotel has no CHD tarifa: the child's
  // accommodation at this hotel is $0 (not "free" — just unpriced). Never set by the
  // normal wizard flow (its hotelAptoNinos filter excludes such hotels beforehand).
  sinTarifaNino?: boolean;
```

- [ ] **Step 2: Render the badge in the grouped-by-destino branch**

In `apps/web/src/app/dashboard/components/CotizacionDetailView.tsx`, inside the `printGrouped` table body (the `destGroups.map((g) => ...)` branch, currently lines 389-422), find this line:

```tsx
                              <span className="text-[11px] font-bold text-primary">{h.nombre}</span>{" "}
                              <span className="text-gold text-[9px]">{stars(h.estrellas)}</span>
                              {canAct && isSel && <span className="print:hidden ml-2 text-[8px] font-black text-secondary uppercase tracking-wide">✓ Elegido</span>}
```

and change it to:

```tsx
                              <span className="text-[11px] font-bold text-primary">{h.nombre}</span>{" "}
                              <span className="text-gold text-[9px]">{stars(h.estrellas)}</span>
                              {showChild && h.sinTarifaNino && (
                                <span className="ml-2 text-[8px] font-black text-amber-600 uppercase tracking-wide">Sin tarifa niño</span>
                              )}
                              {canAct && isSel && <span className="print:hidden ml-2 text-[8px] font-black text-secondary uppercase tracking-wide">✓ Elegido</span>}
```

- [ ] **Step 3: Render the badge in the combinations branch**

In the same file, inside the `combosToShow.map((combo) => ...)` branch (currently lines 426-462), find:

```tsx
                            {combo.legs.map((h, i) => (
                              <React.Fragment key={h.hotelId}>
                                {i > 0 && <span className="text-secondary font-black mx-1">+</span>}
                                {isMultiDest && h.destinoCiudad ? `${h.destinoCiudad} — ` : ""}{h.nombre}{" "}
                                <span className="text-gold text-[9px]">{stars(h.estrellas)}</span>
                              </React.Fragment>
                            ))}
```

and change it to:

```tsx
                            {combo.legs.map((h, i) => (
                              <React.Fragment key={h.hotelId}>
                                {i > 0 && <span className="text-secondary font-black mx-1">+</span>}
                                {isMultiDest && h.destinoCiudad ? `${h.destinoCiudad} — ` : ""}{h.nombre}{" "}
                                <span className="text-gold text-[9px]">{stars(h.estrellas)}</span>
                                {showChild && h.sinTarifaNino && (
                                  <span className="ml-1 text-[8px] font-black text-amber-600 uppercase tracking-wide">Sin tarifa niño</span>
                                )}
                              </React.Fragment>
                            ))}
```

- [ ] **Step 4: Verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/dashboard/DashboardContext.tsx apps/web/src/app/dashboard/components/CotizacionDetailView.tsx
git commit -m "feat(cotizacion-detail): flag hotels with no CHD tarifa in the comparison view"
```

---

## Task 4: `POST /api/cotizaciones/quick`

**Files:**
- Create: `apps/web/src/app/api/cotizaciones/quick/route.ts`

**Interfaces:**
- Consumes: `paqueteInclude`, `mapPaqueteRow` from `@/lib/cotizar-paquete-mapper` (Task 2); `calcHotelBreakdown`, `cartesian`, `combineComboLegs`, `numPaxToTipoPax`, `PAX_BY_TYPE`, `type ComboLeg` from `@/app/dashboard/cotizar-price` (Task 1 for `numPaxToTipoPax`, pre-existing for the rest); `type HotelCompSnapshot` from `@/app/dashboard/DashboardContext` (Task 3 for `sinTarifaNino`).
- Produces: `POST /api/cotizaciones/quick` — request `{ paqueteId: number; numPax: number; numNinos: number }`, response `{ id: string }` (201) or `{ error: string }` (400/401/404/500). Consumed by Task 6/7 (the detail page's "Cotización rápida" buttons).

- [ ] **Step 1: Write the endpoint**

```ts
// apps/web/src/app/api/cotizaciones/quick/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { logError } from "@/lib/logger";
import { paqueteInclude, mapPaqueteRow } from "@/lib/cotizar-paquete-mapper";
import {
  calcHotelBreakdown,
  cartesian,
  combineComboLegs,
  numPaxToTipoPax,
  PAX_BY_TYPE,
  type ComboLeg,
} from "@/app/dashboard/cotizar-price";
import type { HotelCompSnapshot } from "@/app/dashboard/DashboardContext";

const r2 = (n: number) => Math.round(n * 100) / 100;
const GENERIC_CLIENT_EMAIL = "cliente.potencial@landtourtravel.com";
const GENERIC_CLIENT_NAME = "Cliente Potencial";

function generateCodigo(agenciaId: string, userId: string, count: number): string {
  const agCod  = agenciaId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  const usrCod = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  const seq    = String(count + 1).padStart(4, "0");
  return `${agCod}-${usrCod}-${seq}`;
}

// POST /api/cotizaciones/quick — genera una Cotización BORRADOR al instante,
// sin pasar por el wizard, con cliente genérico y TODOS los hoteles del paquete
// (con o sin tarifa CHD — nunca bloquea; ver spec 2026-07-11 sección 4.3).
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const paqueteId = Number(body?.paqueteId);
  const numPax = Number(body?.numPax);
  const numNinos = Number(body?.numNinos);

  if (!Number.isInteger(paqueteId) || paqueteId <= 0) {
    return NextResponse.json({ error: "paqueteId inválido" }, { status: 400 });
  }
  if (!Number.isInteger(numNinos) || numNinos < 0 || numNinos > 10) {
    return NextResponse.json({ error: "Número de niños inválido" }, { status: 400 });
  }
  const tipoPax = numPaxToTipoPax(numPax);
  if (!tipoPax) {
    return NextResponse.json({ error: "Cantidad de adultos no soportada (máximo 4)" }, { status: 400 });
  }

  const agenciaId   = session.user.agenciaId;
  const creadoPorId = (session.user as any).id as string;

  try {
    const paqueteRow = await prisma.paqueteRef.findUnique({ where: { id: paqueteId }, include: paqueteInclude });
    if (!paqueteRow || !paqueteRow.visibleEnFront) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });
    }
    const paquete = mapPaqueteRow(paqueteRow);
    if (paquete.hoteles.length === 0) {
      return NextResponse.json({ error: "El paquete no tiene hoteles configurados" }, { status: 400 });
    }

    // ── Cliente genérico fijo — se reutiliza entre cotizaciones rápidas de la agencia ──
    let cliente = await prisma.cliente.findUnique({
      where: { agenciaId_email: { agenciaId, email: GENERIC_CLIENT_EMAIL } },
    });
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: { agenciaId, nombre: GENERIC_CLIENT_NAME, email: GENERIC_CLIENT_EMAIL },
      });
    }

    // ── Precio: mismo motor que el wizard (calcHotelBreakdown + cartesian + combineComboLegs),
    // SIN filtrar hoteles por elegibilidad de niños — un paquete puede cotizarse solo para
    // adultos; los hoteles sin tarifa CHD se incluyen con costo de niño = $0 (ver sinTarifaNino).
    const ninosEdades = Array(numNinos).fill(5);
    const flightActive = paquete.incluyeBoleto;
    const boletoAdultoPerPax = flightActive ? (paquete.precioBoleto ?? 0) : 0;
    const boletoNinoPerPax   = flightActive ? (paquete.precioBoletoNino ?? paquete.precioBoleto ?? 0) : 0;

    const breakdowns = paquete.hoteles.map((hotel) => ({
      hotel,
      hasChd: hotel.tarifas.some((t) => t.tipoHabitacion === "CHD"),
      bd: calcHotelBreakdown(
        hotel, tipoPax, ninosEdades, numPax,
        paquete.actividades.filter((a) => a.destinoId === hotel.destinoId),
        paquete.traslados.filter((t) => t.destinoId === hotel.destinoId),
        flightActive, boletoAdultoPerPax, 0, hotel.noches, boletoNinoPerPax,
      ),
    }));

    const byDestino = new Map<number, typeof breakdowns>();
    breakdowns.forEach((row) => {
      const arr = byDestino.get(row.hotel.destinoId) ?? [];
      arr.push(row);
      byDestino.set(row.hotel.destinoId, arr);
    });

    const groups = [...byDestino.values()];
    const combos = cartesian(groups).map((legs) => {
      const comboLegs: ComboLeg[] = legs.map(({ bd }) => ({
        adultAccomTotal: bd.adultAccomTotal, adultServicesTotal: bd.adultServicesTotal,
        childAccomTotal: bd.childAccomTotal, childServicesTotal: bd.childServicesTotal,
      }));
      return { legs, totals: combineComboLegs(comboLegs, numPax, numNinos, boletoAdultoPerPax, boletoNinoPerPax, 0) };
    });
    const repCombo = combos.reduce((min, c) => (c.totals.total < min.totals.total ? c : min));

    const subtotal    = r2(repCombo.totals.subtotal);
    const boletoTotal = r2(repCombo.totals.boletoAdultoTotal + repCombo.totals.boletoChildTotal);
    const total       = r2(repCombo.totals.total);
    const precioAdulto = numPax   > 0 ? (repCombo.totals.adultAccom + repCombo.totals.adultServices) / numPax   : 0;
    const precioChd    = numNinos > 0 ? (repCombo.totals.childAccom + repCombo.totals.childServices) / numNinos : 0;

    const hotelsComparison: HotelCompSnapshot[] = breakdowns.map(({ hotel, bd, hasChd }) => ({
      hotelId:            hotel.id,
      nombre:             hotel.nombre,
      estrellas:          hotel.estrellas,
      destinoId:          hotel.destinoId,
      destinoCiudad:      hotel.destinoCiudad,
      destinoPais:        paquete.destinos.find((d) => d.id === hotel.destinoId)?.pais ?? "",
      tipoPax,
      adultColPerPax:     r2(bd.adultColPerPax),
      boletoPerPax:       r2(bd.boletoPerPax),
      accomTotal:         r2(bd.stopTotal),
      sharedTotal:        r2(bd.sharedTotal),
      adultAccomTotal:    r2(bd.adultAccomTotal),
      adultServicesTotal: r2(bd.adultServicesTotal),
      childAccomTotal:    r2(bd.childAccomTotal),
      childServicesTotal: r2(bd.childServicesTotal),
      boletoChildPerPax:  r2(bd.boletoChildPerPax),
      boletoPrecioOculto: !paquete.visibleBoleto,
      pricePerPax:        r2(bd.pricePerPax),
      avgChildPerPax:     bd.childSupplementPerAdult > 0 ? r2(bd.childSupplementPerAdult) : null,
      total:              r2(bd.total),
      sinTarifaNino:      numNinos > 0 && !hasChd,
    }));

    // ── Fechas por defecto: hoy + 30 días, retorno = salida + diasEstancia ──
    const fechaSalida = new Date();
    fechaSalida.setDate(fechaSalida.getDate() + 30);
    const fechaRetorno = new Date(fechaSalida);
    fechaRetorno.setDate(fechaRetorno.getDate() + paquete.diasEstancia);

    const destinosLabel = paquete.destinos.length > 1
      ? paquete.destinos.map((d) => d.ciudad).join(" + ")
      : `${paquete.destinoCiudad}, ${paquete.destinoPais}`;
    const paqueteIncluye = [
      ...paquete.actividades.map((a) => a.nombre),
      ...paquete.traslados.map((t) => t.tipo),
    ];

    const habitaciones = [
      { tipoPax, cantidad: 1, precioPorPersona: r2(precioAdulto) },
      ...(numNinos > 0 ? [{ tipoPax: "CHD", cantidad: numNinos, precioPorPersona: r2(precioChd) }] : []),
    ].map((h) => {
      const px = PAX_BY_TYPE[h.tipoPax] ?? 1;
      const precioUnitario = r2(h.precioPorPersona * px);
      return {
        tipoPax: h.tipoPax, numPax: px, cantidad: h.cantidad,
        precioPorPersona: h.precioPorPersona, precioUnitario,
        subtotal: r2(precioUnitario * h.cantidad),
      };
    });

    const count  = await prisma.cotizacion.count({ where: { agenciaId, creadoPorId } });
    const codigo = generateCodigo(agenciaId, creadoPorId, count);

    const cotizacion = await prisma.cotizacion.create({
      data: {
        codigo, agenciaId, creadoPorId,
        clienteId: cliente.id,
        paqueteId: paquete.id,
        snapshotNombre:   paquete.nombre.slice(0, 200),
        snapshotDestino:  destinosLabel.slice(0, 200),
        snapshotDuracion: `${paquete.diasEstancia} Días / ${paquete.nochesBase} Noches`.slice(0, 100),
        snapshotIncluye:  paqueteIncluye,
        hotelsComparisonSnapshot: hotelsComparison as unknown as Prisma.InputJsonValue,
        incluyeBoleto: flightActive,
        precioBoleto:  flightActive ? (paquete.precioBoleto ?? null) : null,
        boletoTotal,
        subtotal, markup: 0, total,
        fechaViaje: fechaSalida,
        fechaRetorno,
        status: "BORRADOR",
        detalles: { create: habitaciones },
      },
    });

    return NextResponse.json({ id: cotizacion.id }, { status: 201 });
  } catch (err) {
    logError("POST /api/cotizaciones/quick", err);
    return NextResponse.json({ error: "Error al generar la cotización rápida" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual smoke check**

With the dev server running and logged in as `asesor@agenciapruebas.com`, use the browser devtools console (on any `/dashboard` page, so the session cookie is attached) to fire a request against a known visible package id (e.g. `10` — "Paraíso Caribeño Cancún", per `CLAUDE.md`'s DB notes):

```js
fetch("/api/cotizaciones/quick", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ paqueteId: 10, numPax: 2, numNinos: 0 }),
}).then(r => r.json()).then(console.log);
```

Expected: `{ id: "<cuid>" }` with status 201 (check the Network tab). Then open `/dashboard/cotizaciones/<that id>` — Task 6/7 hasn't built the "open it" UI yet, so it's fine that this shows a 404 route right now (the route itself, `dashboard/cotizaciones/[id]`, already exists); the goal of this check is only to confirm the `Cotizacion` row was created without a 500. If the `dashboard/cotizaciones/[id]` route already renders, verify the card shows a $ total > 0, "Cliente Potencial" as the client, and status "Borrador".

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/api/cotizaciones/quick/route.ts
git commit -m "feat(api): add POST /api/cotizaciones/quick for instant BORRADOR quotes"
```

---

## Task 5: `PaqueteDetailView` component

**Files:**
- Create: `apps/web/src/app/dashboard/components/PaqueteDetailView.tsx`

**Interfaces:**
- Consumes: `CotPaquete`, `CotPaqueteHotel` from `../cotizar-types` (Task 1); `calcHotelBreakdown`, `cartesian`, `combineComboLegs`, `numPaxToTipoPax`, `type ComboLeg` from `../cotizar-price` (pre-existing + Task 1).
- Produces: `<PaqueteDetailView paquete={CotPaquete} />` — default export, consumed by Task 6 (`/dashboard/paquetes/[id]/page.tsx`). Internally calls `POST /api/cotizaciones/quick` (Task 4) and reads a module constant `QUICK_QUOTE_PENDING_KEY` also used by Task 7.

- [ ] **Step 1: Write the component**

```tsx
// apps/web/src/app/dashboard/components/PaqueteDetailView.tsx
"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Clock, Plane, Star, ImageOff, Loader2 } from "lucide-react";
import type { CotPaquete, CotPaqueteHotel } from "../cotizar-types";
import { calcHotelBreakdown, cartesian, combineComboLegs, numPaxToTipoPax, type ComboLeg } from "../cotizar-price";

/** Read by page.tsx on mount (Task 7) to auto-trigger handleQuickQuote after navigating back. */
export const QUICK_QUOTE_PENDING_KEY = "dashboard-pending-quick-quote";

const TIPO_PAX_COLOR: Record<string, string> = {
  SGL: "border-t-sky-400", DBL: "border-t-secondary", TPL: "border-t-gold", QUAD: "border-t-violet-400",
};

type VariantCard = { tipoPax: string; numPax: number };

/** Cheapest per-adult price for a given occupancy, using the same engine as the wizard. */
function computeVariantPrice(paquete: CotPaquete, tipoPax: string, numPax: number): number | null {
  if (paquete.hoteles.length === 0) return null;
  const ninosEdades = Array(paquete.numNinos).fill(5);
  const boletoAdultoPerPax = paquete.incluyeBoleto ? (paquete.precioBoleto ?? 0) : 0;
  const boletoNinoPerPax   = paquete.incluyeBoleto ? (paquete.precioBoletoNino ?? paquete.precioBoleto ?? 0) : 0;

  const byDestino = new Map<number, { hotel: CotPaqueteHotel; bd: ReturnType<typeof calcHotelBreakdown> }[]>();
  paquete.hoteles.forEach((hotel) => {
    const bd = calcHotelBreakdown(
      hotel, tipoPax, ninosEdades, numPax,
      paquete.actividades.filter((a) => a.destinoId === hotel.destinoId),
      paquete.traslados.filter((t) => t.destinoId === hotel.destinoId),
      paquete.incluyeBoleto, boletoAdultoPerPax, 0, hotel.noches, boletoNinoPerPax,
    );
    const arr = byDestino.get(hotel.destinoId) ?? [];
    arr.push({ hotel, bd });
    byDestino.set(hotel.destinoId, arr);
  });

  const groups = [...byDestino.values()];
  if (groups.length === 0) return null;
  const combos = cartesian(groups).map((legs) => {
    const comboLegs: ComboLeg[] = legs.map(({ bd }) => ({
      adultAccomTotal: bd.adultAccomTotal, adultServicesTotal: bd.adultServicesTotal,
      childAccomTotal: bd.childAccomTotal, childServicesTotal: bd.childServicesTotal,
    }));
    return combineComboLegs(comboLegs, numPax, paquete.numNinos, boletoAdultoPerPax, boletoNinoPerPax, 0);
  });
  return combos.reduce((min, c) => (c.total < min.total ? c : min)).precioAdulto;
}

export default function PaqueteDetailView({ paquete }: { paquete: CotPaquete }) {
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [quickQuoteBusy, setQuickQuoteBusy] = useState<string | null>(null);
  const [quickQuoteError, setQuickQuoteError] = useState<string | null>(null);

  const variantCards: VariantCard[] = useMemo(() => {
    const base: VariantCard = { tipoPax: numPaxToTipoPax(paquete.numPax) ?? "SGL", numPax: paquete.numPax };
    const seen = new Set([`${base.tipoPax}-${base.numPax}`]);
    const cards = [base];
    paquete.versiones.forEach((v) => {
      const key = `${v.tipoPax}-${v.numPax}`;
      if (!seen.has(key)) { seen.add(key); cards.push({ tipoPax: v.tipoPax, numPax: v.numPax }); }
    });
    return cards;
  }, [paquete]);

  const destinosView = useMemo(() => paquete.destinos.map((d) => ({
    ...d,
    hoteles: paquete.hoteles.filter((h) => h.destinoId === d.id),
    actividades: paquete.actividades.filter((a) => a.destinoId === d.id),
    traslados: paquete.traslados.filter((t) => t.destinoId === d.id),
  })), [paquete]);

  const isMultiDestino = paquete.destinos.length > 1;

  const runQuickQuote = async (key: string, numPax: number, numNinos: number) => {
    setQuickQuoteBusy(key);
    setQuickQuoteError(null);
    try {
      const res = await fetch("/api/cotizaciones/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paqueteId: paquete.id, numPax, numNinos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo generar la cotización rápida.");
      window.open(`/dashboard/cotizaciones/${data.id}`, "_blank");
    } catch (err) {
      setQuickQuoteError(err instanceof Error ? err.message : "No se pudo generar la cotización rápida.");
    } finally {
      setQuickQuoteBusy(null);
    }
  };

  const handleCotizarCompleto = () => {
    localStorage.setItem(QUICK_QUOTE_PENDING_KEY, String(paquete.id));
    router.push("/dashboard");
  };

  return (
    <div className="animate-fade-scale pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-primary/50 hover:text-primary text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <ArrowLeft size={14} /> Volver a Paquetes
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {isMultiDestino && (
              <span className="px-2.5 py-1 bg-gold/15 text-gold text-[9px] font-black uppercase tracking-wider rounded-lg">
                Multi-destino
              </span>
            )}
            {paquete.visibleBoleto && paquete.incluyeBoleto && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-wider rounded-lg">
                <Plane size={10} /> Vuelo incluido
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-primary leading-tight mb-2">{paquete.nombre}</h1>
          <p className="flex items-center gap-1.5 text-xs font-bold text-primary/50 mb-4">
            <MapPin size={13} />
            {paquete.destinos.map((d) => d.ciudad).join(" · ") || `${paquete.destinoCiudad}, ${paquete.destinoPais}`}
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-primary/60">
            <span className="flex items-center gap-1.5"><Clock size={13} /> {paquete.diasEstancia} Días / {paquete.nochesBase} Noches</span>
            {paquete.visibleBoleto && paquete.descripcionBoleto && (
              <span>{paquete.descripcionBoleto}</span>
            )}
          </div>
        </div>

        {/* Galería */}
        {paquete.imagenes.length > 0 ? (
          <div className="mb-6">
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden bg-lighter">
              <Image src={paquete.imagenes[activeImg]} alt={paquete.nombre} fill className="object-cover" />
            </div>
            {paquete.imagenes.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {paquete.imagenes.map((url, i) => (
                  <button
                    key={url + i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${i === activeImg ? "border-secondary" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <Image src={url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full aspect-[21/9] rounded-3xl bg-lighter text-primary/30 mb-6">
            <ImageOff size={18} /><span className="text-xs font-bold">Sin imágenes disponibles</span>
          </div>
        )}

        {/* Itinerario */}
        {paquete.itinerario.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Itinerario</h3>
            <div className="space-y-4">
              {paquete.itinerario.map((day) => (
                <div key={day.day} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-secondary/10 text-secondary text-[11px] font-black flex items-center justify-center shrink-0">
                    {day.day}
                  </div>
                  <div>
                    <p className="text-xs font-black text-primary">{day.title}</p>
                    {day.description && <p className="text-[11px] font-semibold text-primary/50 mt-0.5">{day.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios incluidos por destino */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Servicios Incluidos</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {destinosView.map((d) => (
              <div key={d.id} className="bg-light rounded-2xl p-4">
                <p className="text-[11px] font-black text-primary uppercase mb-2 flex items-center gap-1.5">
                  <MapPin size={11} className="text-secondary" /> {d.ciudad}
                </p>
                {d.hoteles.length > 0 && (
                  <ul className="text-[11px] font-semibold text-primary/60 space-y-1 mb-2">
                    {d.hoteles.map((h) => (
                      <li key={h.id}>{h.nombre} <span className="text-gold text-[9px]">{"★".repeat(Math.max(0, Math.min(h.estrellas, 5)))}</span></li>
                    ))}
                  </ul>
                )}
                {(d.actividades.length > 0 || d.traslados.length > 0) && (
                  <ul className="text-[10px] font-medium text-primary/40 space-y-0.5">
                    {d.actividades.map((a) => <li key={`act-${a.id}`}>✓ {a.nombre}</li>)}
                    {d.traslados.map((t) => <li key={`trs-${t.id}`}>✓ {t.tipo}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variantes disponibles */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Variantes Disponibles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {variantCards.map((v) => {
              const price = computeVariantPrice(paquete, v.tipoPax, v.numPax);
              const key = `${v.tipoPax}-${v.numPax}`;
              return (
                <div key={key} className={`bg-light rounded-2xl p-4 border-t-4 ${TIPO_PAX_COLOR[v.tipoPax] ?? "border-t-secondary"}`}>
                  <p className="text-sm font-black text-primary">{v.tipoPax}</p>
                  <p className="text-[10px] font-bold text-primary/40 uppercase mb-2">{v.numPax} {v.numPax === 1 ? "Adulto" : "Adultos"}</p>
                  {price != null ? (
                    <>
                      <span className="text-[8px] font-black uppercase text-gray-400 block leading-none">Desde</span>
                      <span className="text-lg font-black text-primary">${Math.round(price)} <span className="text-[9px] font-bold text-primary/40">USD/pax</span></span>
                    </>
                  ) : (
                    <p className="text-[10px] font-bold text-primary/40">Sin hoteles disponibles</p>
                  )}
                  <button
                    onClick={() => runQuickQuote(key, v.numPax, paquete.numNinos)}
                    disabled={quickQuoteBusy !== null || price == null}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary disabled:opacity-40 disabled:cursor-not-allowed font-black text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    {quickQuoteBusy === key ? <Loader2 size={11} className="animate-spin" /> : <Star size={11} />}
                    Cotización rápida
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {quickQuoteError && (
          <p className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2.5 mb-4">
            {quickQuoteError}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCotizarCompleto}
            className="flex-1 px-5 py-3.5 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Cotizar este paquete
          </button>
          <button
            onClick={() => runQuickQuote("__base__", paquete.numPax, paquete.numNinos)}
            disabled={quickQuoteBusy !== null}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-secondary text-secondary hover:bg-secondary/5 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer"
          >
            {quickQuoteBusy === "__base__" ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} />}
            Cotización rápida
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/components/PaqueteDetailView.tsx
git commit -m "feat(cotizador): add PaqueteDetailView component"
```

---

## Task 6: Route `/dashboard/paquetes/[id]`

**Files:**
- Create: `apps/web/src/app/dashboard/paquetes/[id]/page.tsx`

**Interfaces:**
- Consumes: `PaqueteDetailView` (Task 5, default export, prop `paquete: CotPaquete`); `type CotizarData` from `../../cotizar-types` (Task 1).
- Produces: the route itself, consumed by Task 8 (PaquetesTab's "Ver detalles" button navigates here).

- [ ] **Step 1: Write the page**

```tsx
// apps/web/src/app/dashboard/paquetes/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PaqueteDetailView from "../../components/PaqueteDetailView";
import type { CotizarData, CotPaquete } from "../../cotizar-types";

/**
 * Standalone package detail page — opened from the "Ver detalles" button in the
 * Paquetes tab. Fetches its own data (no DashboardContext, which only lives inside
 * dashboard/page.tsx) so it works independently, same pattern as
 * dashboard/cotizaciones/[id]/page.tsx.
 */
export default function PaqueteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [paquete, setPaquete] = useState<CotPaquete | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch("/api/cotizar-datos")
      .then(async (r) => {
        if (!r.ok) throw new Error("No se pudo cargar el catálogo de paquetes.");
        return r.json() as Promise<CotizarData>;
      })
      .then((data) => {
        const found = data.paquetes.find((p) => p.id === Number(id));
        if (!found) throw new Error("Paquete no encontrado.");
        setPaquete(found);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light p-6">
        <div className="text-center">
          <p className="text-sm font-black text-primary/60 mb-3">{error}</p>
          <a href="/dashboard" className="text-secondary text-xs font-black uppercase tracking-wider underline underline-offset-4">
            Ir al panel
          </a>
        </div>
      </div>
    );
  }

  if (!paquete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="w-8 h-8 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8">
      <PaqueteDetailView paquete={paquete} />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual smoke check**

With the dev server running and logged in, navigate directly to `/dashboard/paquetes/10` (or another known visible package id). Confirm: header/gallery/servicios/variantes render, variant card prices are non-zero, "Volver a Paquetes" navigates back, "Cotizar este paquete" navigates to `/dashboard` (Task 7 will make it also jump into the wizard), and clicking a variant's "Cotización rápida" opens a new tab at `/dashboard/cotizaciones/<id>` showing a Borrador with "Cliente Potencial".

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/dashboard/paquetes/[id]/page.tsx
git commit -m "feat(cotizador): add /dashboard/paquetes/[id] detail route"
```

---

## Task 7: Wire `page.tsx` to consume the pending quick-quote handoff

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `QUICK_QUOTE_PENDING_KEY` from `./components/PaqueteDetailView` (Task 5); pre-existing `handleQuickQuote(pkgId: string)` (page.tsx:918-924).
- Produces: nothing new for other tasks — this closes the loop for "Cotizar este paquete".

The detail page's "Cotizar este paquete" button (Task 5) stashes the package id in `localStorage` and navigates to `/dashboard` (a plain page reload, since `/dashboard/paquetes/[id]` is a separate route with no shared React tree). `page.tsx` needs a mount-time effect that picks up that pending id and calls the existing `handleQuickQuote`.

- [ ] **Step 1: Import the key and add the effect**

Add the import next to the existing `PaquetesTab` import (`page.tsx:53`):

```ts
import PaquetesTab from "./components/PaquetesTab";
import { QUICK_QUOTE_PENDING_KEY } from "./components/PaqueteDetailView";
```

Add a new `useEffect` immediately after the existing packages-loading effect (right after the block ending at `page.tsx:225`, i.e. after:

```ts
  useEffect(() => {
    setLoadingPkg(true);
    api.getPackagesDetailed()
      .then(({ data, error }) => { setPackages(data); setPkgError(error); })
      .catch(() => setPkgError("DB_FAIL"))
      .finally(() => setLoadingPkg(false));
  }, []);
```

insert:

```ts

  // Picks up a pending quick-quote request stashed by /dashboard/paquetes/[id]'s
  // "Cotizar este paquete" button (that route has no access to this component's state).
  useEffect(() => {
    const pending = localStorage.getItem(QUICK_QUOTE_PENDING_KEY);
    if (pending) {
      localStorage.removeItem(QUICK_QUOTE_PENDING_KEY);
      handleQuickQuote(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

`handleQuickQuote` is defined further down in the same component (`page.tsx:918`) as a `const` inside the function body — since this is one big function component (not a class), the effect closure can reference it as long as the effect runs after render, which `useEffect` guarantees; no need to move `handleQuickQuote` earlier in the file.

- [ ] **Step 2: Verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual smoke check**

From `/dashboard/paquetes/10`, click "Cotizar este paquete". Confirm you land on `/dashboard`, the "Nueva Cotización" tab is active, and Step 2 shows the package already selected (locked card, per `cotFromQuickQuote` behavior).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "feat(cotizador): wire package detail page's 'Cotizar' handoff into the wizard"
```

---

## Task 8: "Ver detalles" button in `PaquetesTab`

**Files:**
- Modify: `apps/web/src/app/dashboard/components/PaquetesTab.tsx`

**Interfaces:**
- Consumes: the `/dashboard/paquetes/[id]` route (Task 6).
- Produces: nothing new — this is the feature's entry point, wired last since everything it links to already exists.

- [ ] **Step 1: Add `useRouter` and the button**

Add the import at the top of the file, after `import Image from "next/image";` (`PaquetesTab.tsx:3`):

```tsx
import Image from "next/image";
import { useRouter } from "next/navigation";
```

Add the router inside the component, right after the existing `useState` declarations (`PaquetesTab.tsx:30-31`):

```tsx
  const [searchPkgTerm, setSearchPkgTerm] = useState("");
  const [activeDestino, setActiveDestino] = useState<string | null>(null);
  const router = useRouter();
```

Replace the "Precio + Botón" block (currently `PaquetesTab.tsx:176-188`):

```tsx
                          {/* Precio + Botón */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-[8px] font-black uppercase text-gray-400 block leading-none">Desde</span>
                              <span className="text-sm font-black text-primary">${pkg.price} <span className="text-[9px] font-bold text-primary/40">USD</span></span>
                            </div>
                            <button
                              onClick={() => onQuickQuote(String(pkg.id))}
                              className="px-3.5 py-2 bg-secondary hover:bg-secondary-light text-primary font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <Plus size={10} className="stroke-[2.5]" /> Cotizar
                            </button>
                          </div>
```

with:

```tsx
                          {/* Precio + Botones */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-[8px] font-black uppercase text-gray-400 block leading-none">Desde</span>
                              <span className="text-sm font-black text-primary">${pkg.price} <span className="text-[9px] font-bold text-primary/40">USD</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => router.push(`/dashboard/paquetes/${pkg.id}`)}
                                className="px-3 py-2 bg-light hover:bg-lighter text-primary/70 font-black text-[9px] uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                              >
                                Ver detalles
                              </button>
                              <button
                                onClick={() => onQuickQuote(String(pkg.id))}
                                className="px-3.5 py-2 bg-secondary hover:bg-secondary-light text-primary font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              >
                                <Plus size={10} className="stroke-[2.5]" /> Cotizar
                              </button>
                            </div>
                          </div>
```

- [ ] **Step 2: Verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/components/PaquetesTab.tsx
git commit -m "feat(cotizador): add 'Ver detalles' button to the Paquetes tab"
```

---

## Task 9: End-to-end manual verification + production build

**Files:** none (verification only).

- [ ] **Step 1: Full build**

Run: `cd apps/web && npx next build`
Expected: build succeeds, all routes listed including `/dashboard/paquetes/[id]` and `/api/cotizaciones/quick`.

- [ ] **Step 2: Manual walkthrough**

With `npm run dev` running, logged in as `asesor@agenciapruebas.com` / `Admin123*`:

1. Dashboard → Paquetes tab → expand a destino → confirm both "Ver detalles" and "Cotizar" buttons show on each row.
2. Click "Ver detalles" on a single-destino package (e.g. id 8 "Magias de Francia") → confirm gallery/itinerario/servicios/variantes render; variant prices are plausible (compare against the wizard's own Step 4 price for the same package/occupancy).
3. Click "Ver detalles" on a multi-destino package with ≥2 hotels in ≥2 destinos (e.g. id 12) → confirm all hoteles show under their correct destino.
4. On a package base version with `numNinos = 0`, add a hotel with no CHD tarifa to the mix (if one exists in the seeded data) by triggering "Cotización rápida" on a package/variant with children declared at the base (`paquete.numNinos > 0`) where at least one hotel lacks CHD — open the resulting `/dashboard/cotizaciones/[id]` and confirm the "Sin tarifa niño" badge appears next to that hotel, and the total is not silently zero for the child.
5. Click "Cotizar este paquete" → confirm it lands on `/dashboard`, Nueva Cotización tab, Step 2, with the package pre-selected.
6. Click a variant's "Cotización rápida" → confirm a new tab opens on `/dashboard/cotizaciones/[id]` showing status "Borrador", client "Cliente Potencial", a sensible total, and that "Imprimir / PDF" works.
7. Confirm the newly created quick-quote cotización also shows up in the "Cotizaciones" tab list (same asesor).

- [ ] **Step 3: Fix any issues found, then stop** — no further commit needed if steps 1-2 above already committed cleanly per-task; only commit again if this verification pass required fixes.

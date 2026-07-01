// Pure price-calculation helpers for the catalog cotizador wizard (Steps 3 & 4).
// No React imports. No side effects.

export type CotHelperHotelTarifa = { tipoHabitacion: string; precioBase: number };
export type CotHelperPoliticaNinos = { edadMin: number; edadMax: number; precio: number | null };
export type CotHelperHotel = {
  id: number;
  nombre: string;
  estrellas: number;
  tarifas: CotHelperHotelTarifa[];
  politicaNinos: CotHelperPoliticaNinos[];
};

export type CotHelperActTarifa = { precio: number; tipoPasajero: string; paxMin: number; paxMax: number };
export type CotHelperActividad = { id: number; nombre: string; descripcion: string | null; tarifas: CotHelperActTarifa[] };

export type CotHelperTrsTarifa = { precio: number; tipoCobro: string; paxMin: number; paxMax: number };
export type CotHelperTraslado = { id: number; tipo: string; tarifas: CotHelperTrsTarifa[] };

// ── Individual helpers ────────────────────────────────────────────────────────

/** Per-person accommodation rate for adults in the given room type. */
export function getAdultAccomPrice(hotel: CotHelperHotel, tipoPax: string): number {
  return hotel.tarifas.find((t) => t.tipoHabitacion === tipoPax)?.precioBase ?? 0;
}

export type ChildPriceResult = { precio: number; aplica: boolean };

/**
 * Per-child per-night price based on PoliticaNinos age match.
 * Falls back: politica.precio → TarifaHotelRef.CHD.precioBase → adultPrice.
 * If no matching politica → child is charged at adult rate (aplica = false).
 */
export function getChildPriceForAge(
  hotel: CotHelperHotel,
  childAge: number,
  adultPrice: number
): ChildPriceResult {
  const politica = hotel.politicaNinos.find(
    (p) => childAge >= p.edadMin && childAge <= p.edadMax
  );
  if (!politica) return { precio: adultPrice, aplica: false };
  const precioChd =
    politica.precio ??
    hotel.tarifas.find((t) => t.tipoHabitacion === "CHD")?.precioBase ??
    adultPrice;
  return { precio: precioChd, aplica: true };
}

/**
 * Total activity cost for the group.
 * Finds the ADULTO tariff for numAdultos range and NINO tariff for numNinos range.
 * Returns 0 if no matching tariff found.
 */
export function getActividadGroupPrice(
  tarifas: CotHelperActTarifa[],
  numAdultos: number,
  numNinos: number
): number {
  const tAdulto = tarifas.find(
    (t) => t.tipoPasajero === "ADULTO" && numAdultos >= t.paxMin && numAdultos <= t.paxMax
  );
  const tNino =
    numNinos > 0
      ? tarifas.find(
          (t) => t.tipoPasajero === "NINO" && numNinos >= t.paxMin && numNinos <= t.paxMax
        )
      : undefined;
  return (tAdulto?.precio ?? 0) * numAdultos + (tNino?.precio ?? 0) * numNinos;
}

/**
 * Total transfer cost for the group.
 * POR_PERSONA: precio × totalPax.
 * POR_VEHICULO: precio flat (one vehicle covers the group).
 */
export function getTrasladoGroupPrice(tarifas: CotHelperTrsTarifa[], totalPax: number): number {
  const tarifa = tarifas.find((t) => totalPax >= t.paxMin && totalPax <= t.paxMax);
  if (!tarifa) return 0;
  return tarifa.tipoCobro === "POR_VEHICULO" ? tarifa.precio : tarifa.precio * totalPax;
}

// ── Per-person service helpers (DB stores activity/transfer prices per person) ──
// These do NOT divide group totals. The matching ADULTO/NINO tariff price is already
// per-person, so it's added directly to the per-person room rate. Only POR_VEHICULO
// transfers (a group cost by nature) are divided by total pax to express per person.

/** Per-adult activity price (matching the adult pax bracket). */
export function getActividadAdultPerPax(tarifas: CotHelperActTarifa[], numAdultos: number): number {
  return (
    tarifas.find(
      (t) => t.tipoPasajero === "ADULTO" && numAdultos >= t.paxMin && numAdultos <= t.paxMax
    )?.precio ?? 0
  );
}

/** Per-child activity price (matching the child pax bracket). */
export function getActividadChildPerPax(tarifas: CotHelperActTarifa[], numNinos: number): number {
  if (numNinos <= 0) return 0;
  return (
    tarifas.find(
      (t) => t.tipoPasajero === "NINO" && numNinos >= t.paxMin && numNinos <= t.paxMax
    )?.precio ?? 0
  );
}

/**
 * Per-person transfer price.
 * POR_PERSONA → precio (already per person, added directly).
 * POR_VEHICULO → precio / totalPax (group cost split across passengers).
 */
export function getTrasladoPerPax(tarifas: CotHelperTrsTarifa[], totalPax: number): number {
  const tarifa = tarifas.find((t) => totalPax >= t.paxMin && totalPax <= t.paxMax);
  if (!tarifa) return 0;
  if (tarifa.tipoCobro === "POR_VEHICULO") return totalPax > 0 ? tarifa.precio / totalPax : 0;
  return tarifa.precio;
}

// ── Composite breakdown ───────────────────────────────────────────────────────

/** Passengers per room unit — used to split a per-ROOM rate into a per-person cost. */
export const PAX_BY_TYPE: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

export type HotelBreakdown = {
  /** Total nights this hotel's stop covers (base parada nights + extra nights for its destino). */
  noches: number;
  /** Occupancy of the chosen room type (PAX_BY_TYPE[tipoPax]). */
  occupancy: number;

  // ── Per adult (reference column) ──────────────────────────────────────────
  /** Adult accommodation per adult = roomRate × noches ÷ numAdultos. */
  adultAccomPerAdult: number;
  /** Adult activities per person (one-time, NOT × nights). */
  actPerPax: number;
  /** Transfers per person (one-time). */
  trsPerPax: number;
  /** actPerPax + trsPerPax — package services per person (hotel-independent). */
  servicesPerPax: number;

  // ── Children ──────────────────────────────────────────────────────────────
  childResults: ChildPriceResult[];
  /** Σ (childRate × noches) over all children. */
  childAccomTotal: number;
  /** numNinos × (child activities per child + transfers per child). */
  childServicesTotal: number;
  /** (childAccomTotal + childServicesTotal) ÷ numAdultos — prorated supplement per adult. */
  childSupplementPerAdult: number;

  // ── Accommodation totals (this hotel's destino contribution) ──────────────
  /** roomRate × noches (the room for the adults, one unit). */
  adultAccomTotal: number;
  /** adultAccomTotal + childAccomTotal — combine across destinos for multi-stop. */
  accomTotal: number;

  // ── Shared components (identical for every hotel of the package) ──────────
  boletoPerPax: number;
  markupPerPax: number;
  boletoTotal: number;          // boletoPerPax × totalPax
  servicesTotal: number;        // servicesPerPax × numAdultos + childServicesTotal
  /** servicesTotal + boletoTotal + agencyMarkup — counted ONCE for the whole package. */
  sharedTotal: number;

  // ── Composed figures ─────────────────────────────────────────────────────
  /** Per-adult accommodation + services (the "Alojamiento" column). */
  adultColPerPax: number;
  /** accomTotal + servicesTotal — package neto without boleto/markup, this hotel. */
  subtotal: number;
  /** subtotal + boletoTotal + agencyMarkup = accomTotal + sharedTotal. Single-stop package total. */
  total: number;
  /** All-in per adult (incl. child supplement, boleto and markup share) — display only. */
  pricePerPax: number;
  /** = childSupplementPerAdult — shown as the per-adult minors supplement. */
  avgChildPerPax: number;
};

/**
 * Calculates the full price breakdown for one hotel option, mirroring the admin
 * wizard: accommodation = per-ROOM rate × nights ÷ occupants; children are prorated
 * into a per-adult supplement (accommodation + their own activities/transfers).
 *
 * `total` assumes this hotel covers ITS stop plus the full package services — correct
 * as-is for a single-destino package. For multi-destino, combine `accomTotal` across the
 * chosen hotel of each destino and add `sharedTotal` ONCE (see callers).
 */
export function calcHotelBreakdown(
  hotel: CotHelperHotel,
  tipoPax: string,
  cotNinosEdades: number[],
  numAdultos: number,
  actividades: CotHelperActividad[],
  traslados: CotHelperTraslado[],
  flightActive: boolean,
  flightPrice: number,
  agencyMarkup: number,
  noches: number
): HotelBreakdown {
  const numNinos = cotNinosEdades.length;
  const totalPax = numAdultos + numNinos;
  const occupancy = PAX_BY_TYPE[tipoPax] ?? Math.max(1, numAdultos);
  const nights = Math.max(1, noches);

  // ── Accommodation (admin parity: roomRate × nights, split across adults) ──
  const roomRate = getAdultAccomPrice(hotel, tipoPax);
  const adultAccomTotal = roomRate * nights;
  const adultAccomPerAdult = numAdultos > 0 ? adultAccomTotal / numAdultos : adultAccomTotal / occupancy;

  const childResults = cotNinosEdades.map((age) =>
    getChildPriceForAge(hotel, age, roomRate)
  );
  const childAccomTotal = childResults.reduce((s, r) => s + r.precio * nights, 0);

  // ── Services per person (one-time, not per night) ─────────────────────────
  const actPerPax = actividades.reduce(
    (s, a) => s + getActividadAdultPerPax(a.tarifas, numAdultos),
    0
  );
  const trsPerPax = traslados.reduce(
    (s, t) => s + getTrasladoPerPax(t.tarifas, totalPax),
    0
  );
  const servicesPerPax = actPerPax + trsPerPax;

  // Children's own services: child activity tariff per child + same transfer per person.
  const childActPerChild = actividades.reduce(
    (s, a) => s + getActividadChildPerPax(a.tarifas, numNinos),
    0
  );
  const childServicesTotal = numNinos > 0 ? numNinos * (childActPerChild + trsPerPax) : 0;

  const childSupplementPerAdult =
    numAdultos > 0 ? (childAccomTotal + childServicesTotal) / numAdultos : 0;

  // ── Shared (hotel-independent) totals ─────────────────────────────────────
  const boletoPerPax = flightActive ? flightPrice : 0;
  const markupPerPax = totalPax > 0 ? agencyMarkup / totalPax : 0;
  const boletoTotal = boletoPerPax * totalPax;
  const servicesTotal = servicesPerPax * numAdultos + childServicesTotal;
  const sharedTotal = servicesTotal + boletoTotal + agencyMarkup;

  // ── Composed ──────────────────────────────────────────────────────────────
  const adultColPerPax = adultAccomPerAdult + servicesPerPax;
  const accomTotal = adultAccomTotal + childAccomTotal;
  const subtotal = accomTotal + servicesTotal;
  const total = accomTotal + sharedTotal;
  const pricePerPax = adultColPerPax + childSupplementPerAdult + boletoPerPax + markupPerPax;

  return {
    noches: nights,
    occupancy,
    adultAccomPerAdult,
    actPerPax,
    trsPerPax,
    servicesPerPax,
    childResults,
    childAccomTotal,
    childServicesTotal,
    childSupplementPerAdult,
    adultAccomTotal,
    accomTotal,
    boletoPerPax,
    markupPerPax,
    boletoTotal,
    servicesTotal,
    sharedTotal,
    adultColPerPax,
    subtotal,
    total,
    pricePerPax,
    avgChildPerPax: childSupplementPerAdult,
  };
}

// Pure price-calculation helpers for the catalog cotizador wizard (Steps 3 & 4).
// No React imports. No side effects.

import type { IncluyeDestinoGroup } from "@land-tour/shared";

export type CotHelperHotelTarifa = { id: number; tipoHabitacion: string; precioBase: number };
/**
 * `tarifaChdId` — FK a la fila TarifaHotel (tipoHabitacion="CHD") específica de este rango
 * de edad. Un hotel puede declarar VARIAS filas "CHD" (una por rango de PoliticaNinos), así
 * que nunca hay que asumir que existe una sola tarifa CHD por hotel — ver `getChildPriceForAge`.
 */
export type CotHelperPoliticaNinos = { rangoNombre: string; edadMin: number; edadMax: number; precio: number | null; tarifaChdId: number | null };
export type CotHelperHotel = {
  id: number;
  nombre: string;
  estrellas: number;
  tarifas: CotHelperHotelTarifa[];
  politicaNinos: CotHelperPoliticaNinos[];
};

export type CotHelperActTarifa = { precio: number; tipoPasajero: string; paxMin: number; paxMax: number };
export type CotHelperActividad = { id: number; nombre: string; descripcion: string | null; tarifas: CotHelperActTarifa[] };

// TarifaTraslado migró de `tipoCobro` (POR_PERSONA/POR_VEHICULO) a `tipoPasajero`
// (ADULTO/NINO) — igual que TarifaActividad. El traslado es siempre por persona con
// bracket por cantidad de pax; ya no existe el costo por vehículo.
export type CotHelperTrsTarifa = { precio: number; tipoPasajero: string; paxMin: number; paxMax: number };
export type CotHelperTraslado = { id: number; tipo: string; tarifas: CotHelperTrsTarifa[] };

// ── Individual helpers ────────────────────────────────────────────────────────

/** Per-person accommodation rate for adults in the given room type. */
export function getAdultAccomPrice(hotel: CotHelperHotel, tipoPax: string): number {
  return hotel.tarifas.find((t) => t.tipoHabitacion === tipoPax)?.precioBase ?? 0;
}

/**
 * Per-person accommodation total (precioBase × noches) for EACH occupied room type
 * (SGL/DBL/TPL/QUAD — CHD excluded) at one hotel/leg. A cotización can quote several
 * room types at once (e.g. 1 SGL + 1 DBL) — this preserves the per-type breakdown so
 * the printed document can show one price per type instead of a single blended average
 * across the whole group. `roomEntries` are `[tipoPax, cantidad]` pairs with cantidad > 0
 * (CHD already excluded by the caller).
 */
export function buildRoomRates(
  tarifas: CotHelperHotelTarifa[],
  roomEntries: [string, number][],
  noches: number
): Record<string, number> {
  const nights = Math.max(1, noches);
  const rates: Record<string, number> = {};
  for (const [tipo] of roomEntries) {
    rates[tipo] = (tarifas.find((t) => t.tipoHabitacion === tipo)?.precioBase ?? 0) * nights;
  }
  return rates;
}

export type ChildPriceResult = { precio: number; aplica: boolean };

/**
 * Per-child per-night price based on PoliticaNinos age match.
 * Falls back: politica.precio → TarifaHotelRef row pointed to by politica.tarifaChdId
 * → any "CHD" tarifa on the hotel (legacy data without tarifaChdId set) → adultPrice.
 * If no matching politica → child is charged at adult rate (aplica = false).
 *
 * IMPORTANT: a hotel can declare SEVERAL "CHD" tarifa rows — one per PoliticaNinos age
 * range (e.g. "Niño" 0-3 and "Menor" 4-12 each have their own TarifaHotel row). Do NOT
 * grab the first tipoHabitacion==="CHD" row blindly — that picks whichever age band
 * happens to be first in the array, regardless of which one actually matched the child's
 * age. Always resolve via `politica.tarifaChdId` (the FK to the correct row).
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
    hotel.tarifas.find((t) => t.id === politica.tarifaChdId)?.precioBase ??
    hotel.tarifas.find((t) => t.tipoHabitacion === "CHD")?.precioBase ??
    adultPrice;
  return { precio: precioChd, aplica: true };
}

export type ChildRateTier = { label: string; edadMin: number; edadMax: number; accomTotal: number };

/**
 * ALL of a hotel's configured child accommodation price tiers (one per PoliticaNinos age
 * range), each resolved to its per-child TOTAL for the stay (precio × noches) — same shape
 * as `buildRoomRates`. Used when the child's real age is unknown (cotización rápida never
 * asks for it — see `POST /api/cotizaciones/quick`) and the hotel has more than one price
 * tier: instead of guessing an age (e.g. defaulting to 5) to pick a single price — which can
 * silently land on the wrong tier — every tier is exposed labeled by the age range it
 * applies to, and the caller decides whether to show the breakdown (only when the tiers'
 * prices actually differ; a single flat CHD rate needs no breakdown).
 */
export function getChildRateTiers(hotel: CotHelperHotel, noches: number): ChildRateTier[] {
  const nights = Math.max(1, noches);
  return hotel.politicaNinos.map((p) => {
    const precio =
      p.precio ??
      hotel.tarifas.find((t) => t.id === p.tarifaChdId)?.precioBase ??
      hotel.tarifas.find((t) => t.tipoHabitacion === "CHD")?.precioBase ??
      0;
    return { label: p.rangoNombre, edadMin: p.edadMin, edadMax: p.edadMax, accomTotal: precio * nights };
  });
}

/**
 * Ages of the children whose age is NOT covered by any of the hotel's PoliticaNinos
 * ranges. Uses the SAME match rule as `getChildPriceForAge` (single source of truth):
 * an uncovered child is charged the adult rate (`aplica: false`). Returns [] when the
 * hotel covers every child (or there are no children). Does NOT hide the hotel — the
 * UI shows an advisory warning and keeps the card selectable.
 */
export function getUncoveredChildAges(
  hotel: Pick<CotHelperHotel, "politicaNinos">,
  childAges: number[]
): number[] {
  return childAges.filter(
    (age) => !hotel.politicaNinos.some((p) => age >= p.edadMin && age <= p.edadMax)
  );
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
 * Total adult transfer cost for the group = per-adult rate × numAdultos.
 * (Kept for compatibility; the per-person helper below is what the breakdown uses.)
 */
export function getTrasladoGroupPrice(tarifas: CotHelperTrsTarifa[], numAdultos: number): number {
  return getTrasladoPerPax(tarifas, numAdultos) * numAdultos;
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
 * Per-person ADULT transfer price for a given passenger count (`paxCount` selects the
 * volume bracket). Callers pass the count of the pax type being charged (e.g. numAdultos).
 * Mirrors `getActividadAdultPerPax`: picks the ADULTO tariff whose [paxMin,paxMax] covers
 * `paxCount` and returns its per-person price. Children are charged this same adult rate
 * ONLY when the traslado has no NINO tariff of its own — see `getTrasladoChildPerPax`.
 */
export function getTrasladoPerPax(tarifas: CotHelperTrsTarifa[], paxCount: number): number {
  return (
    tarifas.find(
      (t) => t.tipoPasajero === "ADULTO" && paxCount >= t.paxMin && paxCount <= t.paxMax
    )?.precio ?? 0
  );
}

/**
 * Per-child NINO transfer price matching the child pax bracket, or `null` if the traslado
 * has no NINO tariff configured (some traslados now declare a dedicated child rate, mirroring
 * `TarifaActividad`). Callers should fall back to `getTrasladoPerPax(tarifas, numAdultos)`
 * (the adult rate) when this returns `null`.
 */
export function getTrasladoChildPerPax(tarifas: CotHelperTrsTarifa[], numNinos: number): number | null {
  if (numNinos <= 0) return null;
  const t = tarifas.find(
    (t) => t.tipoPasajero === "NINO" && numNinos >= t.paxMin && numNinos <= t.paxMax
  );
  return t ? t.precio : null;
}

// ── Composite breakdown ───────────────────────────────────────────────────────

/** Passengers per room unit — used to split a per-ROOM rate into a per-person cost. */
export const PAX_BY_TYPE: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

export type HotelBreakdown = {
  /** Total nights this hotel's stop covers (base parada nights + extra nights for its destino). */
  noches: number;
  /** Occupancy of the chosen room type (PAX_BY_TYPE[tipoPax]) — informational only. */
  occupancy: number;

  // ── Per adult (this destino / hotel) ──────────────────────────────────────
  /**
   * Adult accommodation per adult = precioBase(tipoPax) × noches.
   * `precioBase` is per PERSON per night (owner's model: precio/noche = precio/persona/noche),
   * so it is NOT divided by room occupancy.
   */
  adultAccomPerAdult: number;
  /** Adult activities per person of THIS destino (one-time, NOT × nights). */
  actPerPax: number;
  /** Transfers per person of THIS destino (one-time). */
  trsPerPax: number;
  /** actPerPax + trsPerPax — local services of THIS destino, per person. */
  servicesPerPax: number;

  // ── Children ──────────────────────────────────────────────────────────────
  childResults: ChildPriceResult[];
  /** Σ (childRate × noches) over all children — this hotel's destino. */
  childAccomTotal: number;
  /**
   * numNinos × (child NINO activities per child + adult transfer per pax).
   * Per owner's rule (2026-07-05) the child now pays the SAME transfer fare as an
   * adult (`trsPerPax`), reversing the earlier exclusion.
   */
  childServicesTotal: number;
  /** (childAccomTotal + childServicesTotal) ÷ numAdultos — prorated supplement per adult. */
  childSupplementPerAdult: number;

  // ── Accommodation + local-services totals (this hotel's destino contribution) ──
  /** adultAccomPerAdult × numAdultos. */
  adultAccomTotal: number;
  /** servicesPerPax × numAdultos — adult local services of THIS destino. */
  adultServicesTotal: number;
  /** adultAccomTotal + childAccomTotal (accommodation only). */
  accomTotal: number;
  /** servicesPerPax × numAdultos + childServicesTotal — local services of THIS destino. */
  servicesLocalTotal: number;
  /** accomTotal + servicesLocalTotal — the combinable per-destino total (NO boleto/markup). */
  stopTotal: number;

  // ── Global components (identical for every hotel; counted ONCE per package) ─
  /** Adult air fare per pax (0 when flight inactive). */
  boletoPerPax: number;
  /** Child air fare per pax (0 when flight inactive or no child fare declared). */
  boletoChildPerPax: number;
  markupPerPax: number;
  /** boletoPerPax × numAdultos. */
  boletoAdultoTotal: number;
  /** boletoChildPerPax × numNinos. */
  boletoChildTotal: number;
  boletoTotal: number;          // boletoAdultoTotal + boletoChildTotal
  /** boletoTotal + agencyMarkup — the ONLY truly global cost, counted once. */
  sharedTotal: number;

  // ── Composed figures ─────────────────────────────────────────────────────
  /** Per-adult accommodation + local services (the "Alojamiento" column). */
  adultColPerPax: number;
  /** = stopTotal — package neto (accom + local services) without boleto/markup, this hotel. */
  subtotal: number;
  /** stopTotal + sharedTotal. Full single-stop package total for this hotel. */
  total: number;
  /** All-in per adult (incl. child supplement, boleto and markup share) — display only. */
  pricePerPax: number;
  /** = childSupplementPerAdult — shown as the per-adult minors supplement. */
  avgChildPerPax: number;
};

/**
 * Calculates the price breakdown for one hotel option at ITS destino.
 *
 * Owner's pricing model (differs from the admin wizard, which divides by pax):
 *  - `precioBase` per night is PER PERSON, so adult accommodation per person =
 *    precioBase(tipoPax) × noches (NO division by occupancy).
 *  - `actividades`/`traslados` MUST be pre-filtered to this hotel's destino by the
 *    caller — they are the LOCAL services of this stop only.
 *  - Boleto and agency markup are GLOBAL (identical for every hotel); they live in
 *    `sharedTotal` and must be added ONCE for the whole package (see callers /
 *    combineHotels), never per destino.
 *
 * For a single-destino package `total` is the full package total for this hotel. For
 * multi-destino, combine `stopTotal` (= `accomTotal` in the snapshot) across the chosen
 * hotel of each destino and add `sharedTotal` ONCE.
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
  noches: number,
  /** Child air fare per pax. Defaults to `flightPrice` (adult fare) when omitted. */
  flightPriceChild: number = flightPrice
): HotelBreakdown {
  const numNinos = cotNinosEdades.length;
  const totalPax = numAdultos + numNinos;
  const occupancy = PAX_BY_TYPE[tipoPax] ?? Math.max(1, numAdultos);
  const nights = Math.max(1, noches);

  // ── Accommodation (owner's model: precioBase is per person/night → × nights) ──
  const roomRate = getAdultAccomPrice(hotel, tipoPax);
  const adultAccomPerAdult = roomRate * nights;
  const adultAccomTotal = adultAccomPerAdult * numAdultos;

  const childResults = cotNinosEdades.map((age) =>
    getChildPriceForAge(hotel, age, roomRate)
  );
  const childAccomTotal = childResults.reduce((s, r) => s + r.precio * nights, 0);

  // ── Local services (this destino only, one-time, not per night) ───────────
  const actPerPax = actividades.reduce(
    (s, a) => s + getActividadAdultPerPax(a.tarifas, numAdultos),
    0
  );
  // Adult transfer bracket is chosen by numAdultos (NOT totalPax), mirroring
  // getActividadAdultPerPax.
  const trsPerPax = traslados.reduce(
    (s, t) => s + getTrasladoPerPax(t.tarifas, numAdultos),
    0
  );
  const servicesPerPax = actPerPax + trsPerPax;

  // Children's own local services: child (NINO) activity tariff, plus per-traslado either
  // its own NINO tariff (when one exists and its bracket covers numNinos) or, falling back,
  // the same ADULTO per-pax fare charged to adults (owner's rule 2026-07-05, extended
  // 2026-07-12 now that TarifaTraslado can declare a dedicated child rate).
  const childActPerChild = actividades.reduce(
    (s, a) => s + getActividadChildPerPax(a.tarifas, numNinos),
    0
  );
  const childTrsPerChild = traslados.reduce((s, t) => {
    const adultPerPax = getTrasladoPerPax(t.tarifas, numAdultos);
    const childPerPax = getTrasladoChildPerPax(t.tarifas, numNinos) ?? adultPerPax;
    return s + childPerPax;
  }, 0);
  const childServicesTotal = numNinos > 0 ? numNinos * (childActPerChild + childTrsPerChild) : 0;

  const childSupplementPerAdult =
    numAdultos > 0 ? (childAccomTotal + childServicesTotal) / numAdultos : 0;

  // ── Per-destino totals ────────────────────────────────────────────────────
  const accomTotal = adultAccomTotal + childAccomTotal;
  const adultServicesTotal = servicesPerPax * numAdultos;
  const servicesLocalTotal = adultServicesTotal + childServicesTotal;
  const stopTotal = accomTotal + servicesLocalTotal;

  // ── Global (hotel-independent) totals — counted ONCE per package ───────────
  // Boleto is now split by passenger type: adults pay `flightPrice`, children pay
  // `flightPriceChild` (defaults to the adult fare when no child fare is declared).
  const boletoPerPax = flightActive ? flightPrice : 0;
  const boletoChildPerPax = flightActive ? flightPriceChild : 0;
  // `agencyMarkup` es POR PERSONA (ver combineComboLegs) — no se divide entre pax.
  const markupPerPax = agencyMarkup;
  const boletoAdultoTotal = boletoPerPax * numAdultos;
  const boletoChildTotal = boletoChildPerPax * numNinos;
  const boletoTotal = boletoAdultoTotal + boletoChildTotal;
  const sharedTotal = boletoTotal + agencyMarkup * totalPax;

  // ── Composed ──────────────────────────────────────────────────────────────
  const adultColPerPax = adultAccomPerAdult + servicesPerPax;
  const subtotal = stopTotal;
  const total = stopTotal + sharedTotal;
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
    adultServicesTotal,
    accomTotal,
    servicesLocalTotal,
    stopTotal,
    boletoPerPax,
    boletoChildPerPax,
    markupPerPax,
    boletoAdultoTotal,
    boletoChildTotal,
    boletoTotal,
    sharedTotal,
    adultColPerPax,
    subtotal,
    total,
    pricePerPax,
    avgChildPerPax: childSupplementPerAdult,
  };
}

// ── Ocupación base mixta (varios tipos de habitación a la vez) ─────────────────
// `numPaxToTipoPax` asume que TODO el grupo cabe en un solo tipo de habitación (máx. 4
// adultos). Un paquete puede declarar su ocupación BASE combinando varias habitaciones
// (ej. 1 SGL + 1 DBL + 1 TPL = 6 adultos) vía `PaqueteHotel.tipoHabitacion`+`cantidad`
// (ver `CotPaqueteHotel.habitaciones`) — no hay una sola "etiqueta" para ese paquete.

export type RoomMixEntry = { tipoHabitacion: string; cantidad: number };
export type RoomMixDetalle = {
  tipoHabitacion: string; cantidad: number;
  precioPorPersona: number; precioUnitario: number; subtotal: number;
};
export type HotelBreakdownMix = HotelBreakdown & {
  /** Adultos que caben en la mezcla de habitaciones configurada (filas CHD excluidas). */
  numAdultosRooms: number;
  /** Desglose por tipo de habitación — una fila por tipo, cantidad ya agregada. */
  roomDetalle: RoomMixDetalle[];
};

/**
 * Mismo resultado que `calcHotelBreakdown`, pero para paquetes cuya ocupación BASE es una
 * MEZCLA de tipos de habitación en vez de un solo tipoPax para todo el grupo — las filas
 * `PaqueteHotel` (tipoHabitacion+cantidad) de este hotel son la fuente de verdad de cuántas
 * habitaciones de cada tipo ofrece.
 *
 * `numAdultos` (bracket de servicios/boleto/markup) se recibe explícito — debe ser
 * `Paquete.numPax` (autoritativo), NO derivarse de la mezcla, para que una inconsistencia
 * en `PaqueteHotel.cantidad` de un hotel puntual no cambie cuántos boletos/markups se cobran.
 * La mezcla solo fija el monto de ALOJAMIENTO (money-safe: el total en dólares de cada tipo
 * de habitación no depende de `numAdultos`, solo de su propia cantidad/ocupación).
 *
 * El cálculo de servicios/niños es una copia exacta del de `calcHotelBreakdown` — mantener
 * ambos sincronizados si esa fórmula cambia.
 */
export function calcHotelBreakdownFromRoomMix(
  hotel: CotHelperHotel,
  habitaciones: RoomMixEntry[],
  cotNinosEdades: number[],
  numAdultos: number,
  actividades: CotHelperActividad[],
  traslados: CotHelperTraslado[],
  flightActive: boolean,
  flightPrice: number,
  agencyMarkup: number,
  noches: number,
  flightPriceChild: number = flightPrice
): HotelBreakdownMix {
  const numNinos = cotNinosEdades.length;
  const totalPax = numAdultos + numNinos;
  const nights = Math.max(1, noches);

  // ── Alojamiento a partir de la mezcla real (filas CHD excluidas — los niños se
  // cuentan/tarifan vía `cotNinosEdades`, no vía una fila "CHD" de PaqueteHotel). ──
  const rooms = habitaciones.filter((h) => h.tipoHabitacion !== "CHD" && h.cantidad > 0);
  let numAdultosRooms = 0;
  let adultAccomTotal = 0;
  const roomDetalle: RoomMixDetalle[] = rooms.map((r) => {
    const occupancy = PAX_BY_TYPE[r.tipoHabitacion] ?? 1;
    const precioPorPersona = getAdultAccomPrice(hotel, r.tipoHabitacion) * nights;
    const precioUnitario = precioPorPersona * occupancy;
    const subtotal = precioUnitario * r.cantidad;
    numAdultosRooms += occupancy * r.cantidad;
    adultAccomTotal += subtotal;
    return { tipoHabitacion: r.tipoHabitacion, cantidad: r.cantidad, precioPorPersona, precioUnitario, subtotal };
  });
  const adultAccomPerAdult = numAdultos > 0 ? adultAccomTotal / numAdultos : 0;
  // Fallback para niños cuya edad no cae en ninguna PoliticaNinos (último recurso de
  // `getChildPriceForAge`) — se usa la tarifa del primer tipo de habitación configurado.
  const fallbackAdultRate = rooms.length > 0 ? getAdultAccomPrice(hotel, rooms[0].tipoHabitacion) : 0;

  const childResults = cotNinosEdades.map((age) => getChildPriceForAge(hotel, age, fallbackAdultRate));
  const childAccomTotal = childResults.reduce((s, r) => s + r.precio * nights, 0);

  const actPerPax = actividades.reduce((s, a) => s + getActividadAdultPerPax(a.tarifas, numAdultos), 0);
  const trsPerPax = traslados.reduce((s, t) => s + getTrasladoPerPax(t.tarifas, numAdultos), 0);
  const servicesPerPax = actPerPax + trsPerPax;

  const childActPerChild = actividades.reduce((s, a) => s + getActividadChildPerPax(a.tarifas, numNinos), 0);
  const childTrsPerChild = traslados.reduce((s, t) => {
    const adultPerPax = getTrasladoPerPax(t.tarifas, numAdultos);
    const childPerPax = getTrasladoChildPerPax(t.tarifas, numNinos) ?? adultPerPax;
    return s + childPerPax;
  }, 0);
  const childServicesTotal = numNinos > 0 ? numNinos * (childActPerChild + childTrsPerChild) : 0;
  const childSupplementPerAdult = numAdultos > 0 ? (childAccomTotal + childServicesTotal) / numAdultos : 0;

  const accomTotal = adultAccomTotal + childAccomTotal;
  const adultServicesTotal = servicesPerPax * numAdultos;
  const servicesLocalTotal = adultServicesTotal + childServicesTotal;
  const stopTotal = accomTotal + servicesLocalTotal;

  const boletoPerPax = flightActive ? flightPrice : 0;
  const boletoChildPerPax = flightActive ? flightPriceChild : 0;
  const markupPerPax = agencyMarkup;
  const boletoAdultoTotal = boletoPerPax * numAdultos;
  const boletoChildTotal = boletoChildPerPax * numNinos;
  const boletoTotal = boletoAdultoTotal + boletoChildTotal;
  const sharedTotal = boletoTotal + agencyMarkup * totalPax;

  const adultColPerPax = adultAccomPerAdult + servicesPerPax;
  const subtotal = stopTotal;
  const total = stopTotal + sharedTotal;
  const pricePerPax = adultColPerPax + childSupplementPerAdult + boletoPerPax + markupPerPax;

  return {
    noches: nights,
    occupancy: numAdultosRooms,
    adultAccomPerAdult, actPerPax, trsPerPax, servicesPerPax,
    childResults, childAccomTotal, childServicesTotal, childSupplementPerAdult,
    adultAccomTotal, adultServicesTotal, accomTotal, servicesLocalTotal, stopTotal,
    boletoPerPax, boletoChildPerPax, markupPerPax, boletoAdultoTotal, boletoChildTotal, boletoTotal, sharedTotal,
    adultColPerPax, subtotal, total, pricePerPax, avgChildPerPax: childSupplementPerAdult,
    numAdultosRooms, roomDetalle,
  };
}

/**
 * Combina el desglose por tipo de habitación de varias "legs" (una por destino, en un
 * paquete multi-destino) en una sola lista — una fila por tipo, cantidades y subtotales
 * sumados. Evita mostrar/guardar el mismo tipo dos veces cuando 2+ destinos usan, por
 * ejemplo, ambos una DBL: se guarda UNA fila "DBL" con `cantidad` combinada y el precio
 * (`precioUnitario`/`precioPorPersona`) recalculado desde el subtotal agregado, así que
 * `subtotal === precioUnitario × cantidad` se mantiene exacto tras la fusión.
 */
export function mergeRoomDetalle(perLeg: RoomMixDetalle[][]): RoomMixDetalle[] {
  const merged = new Map<string, { tipoHabitacion: string; cantidad: number; subtotal: number }>();
  perLeg.flat().forEach((r) => {
    const existing = merged.get(r.tipoHabitacion);
    if (existing) {
      existing.cantidad += r.cantidad;
      existing.subtotal += r.subtotal;
    } else {
      merged.set(r.tipoHabitacion, { tipoHabitacion: r.tipoHabitacion, cantidad: r.cantidad, subtotal: r.subtotal });
    }
  });
  return [...merged.values()].map((r) => {
    const occupancy = PAX_BY_TYPE[r.tipoHabitacion] ?? 1;
    const precioUnitario = r.cantidad > 0 ? r.subtotal / r.cantidad : 0;
    const precioPorPersona = occupancy > 0 ? precioUnitario / occupancy : 0;
    return { tipoHabitacion: r.tipoHabitacion, cantidad: r.cantidad, precioPorPersona, precioUnitario, subtotal: r.subtotal };
  });
}

// ── Multi-destino combinations ────────────────────────────────────────────────
// A "combination" is one chosen hotel per destino (e.g. París H1 + Cancún H2). The
// helpers below build every combination (cartesian product) and price it with the
// per-person adult/child split. Boleto and markup are GLOBAL — counted once per combo.

/** Cartesian product of N groups → every way to pick one item from each group. */
export function cartesian<T>(groups: T[][]): T[][] {
  if (groups.length === 0) return [];
  return groups.reduce<T[][]>(
    (acc, group) => acc.flatMap((combo) => group.map((item) => [...combo, item])),
    [[]]
  );
}

/**
 * Toggles `hotelId` in the selection, enforcing: at most ONE destino may have more than
 * one hotel selected at a time (avoids the cartesian combo count exploding). Whichever
 * destino is first to reach 2+ selections "claims" multi-select; every other destino is
 * capped to a single hotel — picking a new one there replaces the previous pick instead
 * of adding to it. Deselecting always just removes (never blocked).
 */
export function toggleHotelWithSingleDestinoCap(
  prev: number[],
  hotelId: number,
  destinoId: number,
  destinoIdByHotelId: Map<number, number>
): number[] {
  if (prev.includes(hotelId)) return prev.filter((id) => id !== hotelId);

  const countByDestino = new Map<number, number>();
  for (const id of prev) {
    const dId = destinoIdByHotelId.get(id);
    if (dId === undefined) continue;
    countByDestino.set(dId, (countByDestino.get(dId) ?? 0) + 1);
  }
  const otherDestinoIsMulti = [...countByDestino.entries()].some(
    ([dId, count]) => dId !== destinoId && count >= 2
  );

  if (otherDestinoIsMulti) {
    // This destino is capped to one — replace any prior selection within it.
    return [...prev.filter((id) => destinoIdByHotelId.get(id) !== destinoId), hotelId];
  }
  return [...prev, hotelId];
}

/** One stop's accommodation + local-services split (adult vs child), from a breakdown or snapshot. */
export type ComboLeg = {
  adultAccomTotal: number;
  adultServicesTotal: number;
  childAccomTotal: number;
  childServicesTotal: number;
};

export type ComboTotals = {
  adultAccom: number;
  adultServices: number;
  childAccom: number;
  childServices: number;
  boletoAdultoTotal: number;
  boletoChildTotal: number;
  markup: number;
  /** All-in per adult (accom + services + adult boleto + adult markup share). */
  precioAdulto: number;
  /** All-in per child (accom + services + child boleto + child markup share). */
  precioNino: number;
  /** accom + services across all legs (NO boleto/markup). */
  subtotal: number;
  /** Full combination total (adults + children, boleto + markup once). */
  total: number;
};

/**
 * Aggregates one combination (one leg per destino) into per-person adult/child prices.
 * Boleto (adult + child fares) is added ONCE for the whole combo, split by passenger type.
 * `agencyMarkup` is a PER-PERSON amount — added to each traveler's price, NOT a pool divided
 * across the group — so it is added once per adult AND once per child (not split
 * proportionally): `precioAdulto × numAdultos + precioNino × numNinos === total`. Callers
 * (page.tsx `cotEffectiveMarkup`, quick/route.ts `markup`) fold TWO sources into this single
 * value: `Paquete.gananciaAgencia` (agency's guaranteed minimum profit, always >= 0, editable
 * upward by the agent) PLUS `Paquete.ajustePrecio` (the admin's automatic price adjustment,
 * can be negative for a discount) — the net can go negative if the discount outweighs the
 * commission. This function itself is agnostic to that split; it just adds whatever value it
 * receives once per adult and once per child.
 */
export function combineComboLegs(
  legs: ComboLeg[],
  numAdultos: number,
  numNinos: number,
  boletoAdultoPerPax: number,
  boletoNinoPerPax: number,
  agencyMarkup: number
): ComboTotals {
  const adultAccom = legs.reduce((s, l) => s + l.adultAccomTotal, 0);
  const adultServices = legs.reduce((s, l) => s + l.adultServicesTotal, 0);
  const childAccom = legs.reduce((s, l) => s + l.childAccomTotal, 0);
  const childServices = legs.reduce((s, l) => s + l.childServicesTotal, 0);
  const boletoAdultoTotal = boletoAdultoPerPax * numAdultos;
  const boletoChildTotal = boletoNinoPerPax * numNinos;
  const markupAdulto = agencyMarkup * numAdultos;
  const markupNino = agencyMarkup * numNinos;
  const adultAll = adultAccom + adultServices + boletoAdultoTotal + markupAdulto;
  const childAll = childAccom + childServices + boletoChildTotal + markupNino;
  return {
    adultAccom,
    adultServices,
    childAccom,
    childServices,
    boletoAdultoTotal,
    boletoChildTotal,
    markup: agencyMarkup,
    precioAdulto: numAdultos > 0 ? adultAll / numAdultos : 0,
    precioNino: numNinos > 0 ? childAll / numNinos : 0,
    subtotal: adultAccom + adultServices + childAccom + childServices,
    total: adultAll + childAll,
  };
}

// ── Grouped-by-destino pricing (varios hoteles en ≥2 destinos) ──────────────────
// When two or more destinos each have several hotels selected, the cartesian product
// of combinations explodes, so the UI lists hotels grouped by destino instead. Each
// hotel then shows a self-contained "total por persona" that already carries its
// 1/numDestinos share of the GLOBAL costs (boleto + markup). Summing one hotel per
// destino therefore reconstructs EXACTLY the combineComboLegs total for that pick —
// boleto and markup are counted once, never duplicated per destino.

export type HotelDestinoPrice = {
  /** All-in per adult: accom + local services + (boleto+markup share) / numDestinos. */
  precioAdulto: number;
  /** All-in per child (0 when no children). */
  precioNino: number;
  totalAdultos: number;
  totalNinos: number;
  total: number;
};

export function hotelPerDestinoPrice(args: {
  /** Per adult: accommodation (precioBase×noches) + local services of THIS destino. */
  adultColPerPax: number;
  /** Σ child accommodation for this destino (all children). */
  childAccomTotal: number;
  /** Σ child local services for this destino (all children). */
  childServicesTotal: number;
  /** Adult air fare per pax (global; 0 when inactive). */
  boletoAdultoPerPax: number;
  /** Child air fare per pax (global; 0 when inactive). */
  boletoNinoPerPax: number;
  agencyMarkup: number;
  numAdultos: number;
  numNinos: number;
  numDestinos: number;
}): HotelDestinoPrice {
  const div = Math.max(1, args.numDestinos);
  // `agencyMarkup` is PER-PERSON (not divided across pax — see combineComboLegs), so the
  // per-pax markup contribution is the raw value; it's still divided by `numDestinos` here
  // so summing one hotel per destino reconstructs it exactly once (not once per destino).
  const markupPerPax = args.agencyMarkup;
  // Global per-pax costs (boleto + markup) split across destinos → counted once when
  // one hotel per destino is summed.
  const precioAdulto = args.adultColPerPax + (args.boletoAdultoPerPax + markupPerPax) / div;
  const childAccomServicesPerChild =
    args.numNinos > 0 ? (args.childAccomTotal + args.childServicesTotal) / args.numNinos : 0;
  const precioNino =
    args.numNinos > 0
      ? childAccomServicesPerChild + (args.boletoNinoPerPax + markupPerPax) / div
      : 0;
  return {
    precioAdulto,
    precioNino,
    totalAdultos: precioAdulto * args.numAdultos,
    totalNinos: precioNino * args.numNinos,
    total: precioAdulto * args.numAdultos + precioNino * args.numNinos,
  };
}

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

// ── Servicios incluidos, agrupados por destino ────────────────────────────────
// Usado tanto por el wizard (catálogo y libre) como por la cotización rápida para
// construir el snapshot que el documento de cotización renderiza separado por
// destino/tipo (actividades vs. traslados) en vez de una lista plana.
export type IncluyeItem = { destinoId: number; destinoCiudad: string; label: string; detalle?: string | null };

export function groupIncluyeByDestino(actividades: IncluyeItem[], traslados: IncluyeItem[]): IncluyeDestinoGroup[] {
  const map = new Map<number, IncluyeDestinoGroup>();
  const group = (destinoId: number, destinoCiudad: string) => {
    let g = map.get(destinoId);
    if (!g) { g = { destinoId, destinoCiudad, actividades: [], traslados: [] }; map.set(destinoId, g); }
    return g;
  };
  actividades.forEach((a) => group(a.destinoId, a.destinoCiudad).actividades.push({ nombre: a.label, detalle: a.detalle ?? undefined }));
  traslados.forEach((t) => group(t.destinoId, t.destinoCiudad).traslados.push({ nombre: t.label, detalle: t.detalle ?? undefined }));
  return [...map.values()];
}

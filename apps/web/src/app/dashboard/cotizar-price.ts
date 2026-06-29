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

// ── Composite breakdown ───────────────────────────────────────────────────────

export type HotelBreakdown = {
  alojamiento: number;
  childResults: ChildPriceResult[];
  avgChd: number;
  actTotal: number;
  actPerPax: number;
  trsTotal: number;
  trsPerPax: number;
  boletoPerPax: number;
  markupPerPax: number;
  /** Reference total per ADULT passenger (excl. nights multiplication). CHD not included. */
  totalPerPax: number;
};

/**
 * Calculates the full price breakdown for one hotel option.
 * `totalPerPax` is the adult reference price including markup (but excluding CHD).
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
  agencyMarkup: number
): HotelBreakdown {
  const numNinos = cotNinosEdades.length;
  const totalPax = numAdultos + numNinos;

  const alojamiento = getAdultAccomPrice(hotel, tipoPax);
  const childResults = cotNinosEdades.map((age) =>
    getChildPriceForAge(hotel, age, alojamiento)
  );
  const avgChd =
    numNinos > 0
      ? childResults.reduce((s, r) => s + r.precio, 0) / numNinos
      : 0;

  const actTotal = actividades.reduce(
    (s, a) => s + getActividadGroupPrice(a.tarifas, numAdultos, numNinos),
    0
  );
  const actPerPax = totalPax > 0 ? actTotal / totalPax : 0;

  const trsTotal = traslados.reduce(
    (s, t) => s + getTrasladoGroupPrice(t.tarifas, totalPax),
    0
  );
  const trsPerPax = totalPax > 0 ? trsTotal / totalPax : 0;

  const boletoPerPax = flightActive ? flightPrice : 0;
  const markupPerPax = totalPax > 0 ? agencyMarkup / totalPax : 0;

  const totalPerPax = alojamiento + actPerPax + trsPerPax + boletoPerPax + markupPerPax;

  return {
    alojamiento,
    childResults,
    avgChd,
    actTotal,
    actPerPax,
    trsTotal,
    trsPerPax,
    boletoPerPax,
    markupPerPax,
    totalPerPax,
  };
}

"use client";
import React, { useState, useMemo } from "react";
import { CheckCircle2, Pencil, Printer, X, XCircle } from "lucide-react";
import { COTIZACION_STATUS_LABEL } from "@land-tour/shared";
import type { CotizacionStatus } from "@land-tour/shared";
import type { CotizacionExtended, HotelCompSnapshot } from "../DashboardContext";
import { cartesian, combineComboLegs, hotelPerDestinoPrice, type ComboLeg } from "../cotizar-price";
import { GENERIC_CLIENT_EMAIL } from "@/lib/constants";

// Handoff key: this standalone route has no access to the dashboard SPA's React state,
// so "Editar" stashes the cotización id in localStorage and navigates to /dashboard,
// where a mount effect picks it up and calls handleEditCot(id). Same pattern as
// PaqueteDetailView's QUICK_QUOTE_PENDING_KEY.
export const EDIT_COT_PENDING_KEY = "ltt-edit-cot-pending";

const PAX_BY_TYPE: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

const STATUS_BADGE: Record<CotizacionStatus, string> = {
  BORRADOR:  "bg-sky-50 text-sky-600",
  ENVIADA:   "bg-amber-50 text-amber-600",
  APROBADA:  "bg-emerald-50 text-emerald-600",
  RECHAZADA: "bg-rose-50 text-rose-600",
  LIQUIDADA: "bg-violet-50 text-violet-600",
};
const STATUS_DOT: Record<CotizacionStatus, string> = {
  BORRADOR:  "bg-sky-500",
  ENVIADA:   "bg-amber-500",
  APROBADA:  "bg-emerald-500",
  RECHAZADA: "bg-rose-500",
  LIQUIDADA: "bg-violet-500",
};
const TERMINOS = `Los precios indicados son por persona en la categoría de habitación seleccionada y están sujetos a disponibilidad hotelera al momento de la reserva. Land Tour Travel actúa como operador mayorista; la agencia minorista es responsable de la relación comercial con el cliente final. El pago del depósito de reserva (40% del total) es obligatorio para confirmar los servicios. Cancelaciones con menos de 15 días de anticipación están sujetas a penalidades del 50%. Los vuelos, cuando son incluidos, están sujetos a las políticas de la aerolínea operadora. El pasajero es responsable de contar con documentación vigente (pasaporte, visa si aplica).`;

/** Converts "YYYY-MM-DD" → "DD/MM/YYYY". Returns the original string for other formats. */
const fmtDate = (s: string | null | undefined): string => {
  if (!s) return "";
  const parts = s.split("-");
  if (parts.length !== 3 || parts[0].length !== 4) return s;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/** Normalizes a servicio incluido item — cotizaciones guardadas antes del campo `detalle` traen strings planos. */
const toServicioItem = (item: string | { nombre: string; detalle?: string }): { nombre: string; detalle?: string } =>
  typeof item === "string" ? { nombre: item } : item;

const stars = (n: number) => "★".repeat(Math.max(0, Math.min(n, 5)));
const money = (n: number) => (n % 1 === 0 ? n.toLocaleString("es-EC") : n.toFixed(2));

type ComboView = {
  legs: HotelCompSnapshot[];
  hotelIds: number[];
  adultP: number;
  childP: number;
  /** Full combo total — persisted to the DB on approval, never shown to the user. */
  total: number;
};

interface Props {
  cot: CotizacionExtended;
  agencyName: string;
  agencyEmail: string;
  agencyPhone: string;
  agencyDescripcion: string;
  agencyLogo: string | null;
}

export default function CotizacionDetailView({
  cot: initialCot, agencyName, agencyEmail, agencyPhone, agencyDescripcion, agencyLogo,
}: Props) {
  const [cot, setCot] = useState<CotizacionExtended>(initialCot);

  const allHotels = cot.hotelsComparison ?? [];
  const hasV4     = allHotels.length > 0 && allHotels[0].adultAccomTotal != null;
  const boletoOculto = allHotels.some((h) => h.boletoPrecioOculto);

  // Passenger counts (from stored room distribution).
  const numNinos   = (cot.pasajeros as any)?.cantCHD ?? 0;
  const numAdultos = (["SGL", "DBL", "TPL", "QUAD"] as const).reduce(
    (s, t) => s + (((cot.pasajeros as any)?.[`cant${t}`] ?? 0) as number) * PAX_BY_TYPE[t], 0);

  const boletoAdultoPerPax = allHotels[0]?.boletoPerPax ?? 0;
  const boletoNinoPerPax   = allHotels[0]?.boletoChildPerPax ?? 0;
  const markup             = cot.markup ?? 0;

  // Habitaciones realmente cotizadas (composición fija de la cotización, independiente del
  // hotel elegido — un paquete puede reservarse con varios tipos a la vez, ej. 1 SGL + 1 DBL).
  // Se listan sin repetir tipo: una fila/columna por tipo con cantidad > 0. `roomRates` (por
  // hotel/leg) solo existe en snapshots guardados después de este campo — sin él no hay forma
  // de reconstruir el precio por tipo, así que se cae al precio "Adulto" promediado (legado).
  const roomTypeEntries = (["SGL", "DBL", "TPL", "QUAD"] as const)
    .map((t) => ({ tipo: t, qty: ((cot.pasajeros as any)?.[`cant${t}`] ?? 0) as number }))
    .filter((r) => r.qty > 0);
  const hasRoomRates = allHotels.length > 0 && allHotels.every((h) => h.roomRates != null);
  const showRoomTypes = hasRoomRates && roomTypeEntries.length > 0;

  // Group hotels by destino; cheapest hotel first within each group (per-adult accom+services
  // price — boleto/markup are constant across hotels of the same destino, so this ordering
  // matches the full per-destino price too).
  const destGroups = useMemo(() => {
    const m = new Map<number, { destinoId: number; ciudad: string; pais: string; hotels: HotelCompSnapshot[] }>();
    allHotels.forEach((h) => {
      const dId = h.destinoId ?? 0;
      if (!m.has(dId)) m.set(dId, { destinoId: dId, ciudad: h.destinoCiudad ?? "", pais: h.destinoPais ?? "", hotels: [] });
      m.get(dId)!.hotels.push(h);
    });
    return [...m.values()].map((g) => ({
      ...g,
      hotels: [...g.hotels].sort((a, b) => (a.adultColPerPax ?? 0) - (b.adultColPerPax ?? 0)),
    }));
  }, [allHotels]);
  // Nombre de ciudad por destinoId — el snapshot solo lo guarda una vez por destino (no
  // repetido en cada hotel de ese destino), así que cualquier lectura por-hotel debe resolver
  // aquí en vez de leer `h.destinoCiudad` directo (puede venir vacío en el 2do+ hotel del
  // mismo destino).
  const destinoLabelById = useMemo(() => {
    const m = new Map<number, string>();
    destGroups.forEach((g) => m.set(g.destinoId, g.ciudad));
    return m;
  }, [destGroups]);
  const hotelDestinoCiudad = (h: HotelCompSnapshot) =>
    (h.destinoId != null ? destinoLabelById.get(h.destinoId) : undefined) ?? h.destinoCiudad ?? "";

  const isMultiDest = destGroups.length > 1;
  // ≥2 destinos con varios hoteles → la vista agrupada por destino reemplaza el listado
  // cartesiano de combinaciones. El asesor elige un hotel por destino (no una combinación).
  const multiHotelDestCount = destGroups.filter((g) => g.hotels.length >= 2).length;
  const useGrouped = hasV4 && destGroups.length > 1 && multiHotelDestCount >= 2;

  // Every combination (one hotel per destino) with per-person adult/child prices — same
  // model as Step 4 (combineComboLegs). Boleto + markup counted once per combo. Sorted
  // cheapest-first so the printed table always lists combinations most to least economic.
  const combos = useMemo<ComboView[]>(() => {
    if (allHotels.length === 0) return [];
    const groups = destGroups.map((g) => g.hotels);
    return cartesian(groups).map((legs) => {
      const comboLegs: ComboLeg[] = legs.map((h) => ({
        adultAccomTotal:    h.adultAccomTotal ?? 0,
        adultServicesTotal: h.adultServicesTotal ?? 0,
        childAccomTotal:    h.childAccomTotal ?? 0,
        childServicesTotal: h.childServicesTotal ?? 0,
      }));
      const t = combineComboLegs(comboLegs, numAdultos, numNinos, boletoAdultoPerPax, boletoNinoPerPax, markup);
      // Legacy (v1/v2) snapshots lack the adult/child split → fall back to pricePerPax.
      const adultP = hasV4 ? t.precioAdulto : legs.reduce((s, h) => s + (h.pricePerPax ?? 0), 0);
      const childP = hasV4 ? t.precioNino   : legs.reduce((s, h) => s + (h.avgChildPerPax ?? 0), 0);
      const total  = hasV4 ? t.total : cot.total;
      return { legs, hotelIds: legs.map((h) => h.hotelId), adultP, childP, total };
    }).sort((a, b) => a.adultP - b.adultP);
  }, [allHotels, destGroups, numAdultos, numNinos, boletoAdultoPerPax, boletoNinoPerPax, markup, hasV4, cot.total]);

  // Selección unificada: un hotel por destino (destinoId → hotelId). Sirve tanto para la
  // vista de combinaciones (clic en una combinación fija los hoteles de todos sus destinos)
  // como para la vista agrupada (clic en un hotel fija solo su destino).
  const finalizedPick = useMemo<Record<number, number>>(() => {
    const m: Record<number, number> = {};
    allHotels.filter((h) => h.selected).forEach((h) => { m[h.destinoId ?? 0] = h.hotelId; });
    return m;
  }, [allHotels]);

  const [pickedByDest, setPickedByDest] = useState<Record<number, number>>({});
  const [isBusy, setIsBusy] = useState(false);

  const isApproved = cot.status === "APROBADA";
  const isLiquidada = cot.status === "LIQUIDADA";
  // Estados finales (aprobada o liquidada): la selección queda fijada al combo confirmado.
  const isFinalized = isApproved || isLiquidada;
  const canAct     = cot.status === "BORRADOR" || cot.status === "ENVIADA";
  const hasCombos  = combos.length > 0;
  // Cotización rápida sin editar (cliente placeholder de `POST /api/cotizaciones/quick`):
  // no tiene sentido comercial aprobarla/rechazarla todavía. La señal se autocorrige sola
  // — en cuanto el asesor edita la cotización con el cliente real, deja de ser genérica.
  const isGenericClient = cot.cliente?.email === GENERIC_CLIENT_EMAIL;
  const canApprove = canAct && !isGenericClient;

  // When finalized, the selection is locked to the approved/settled combo.
  const effectivePick = isFinalized ? finalizedPick : pickedByDest;
  const selectionComplete = destGroups.length > 0 && destGroups.every((g) => effectivePick[g.destinoId] != null);
  // Unique combo in the cartesian set matching the current one-hotel-per-destino pick.
  const selectedCombo = selectionComplete
    ? (combos.find((c) => c.legs.every((leg) => effectivePick[leg.destinoId ?? 0] === leg.hotelId)) ?? null)
    : null;
  const selectedComboIdx = selectedCombo ? combos.indexOf(selectedCombo) : null;

  // Selección helpers.
  const pickCombo = (combo: ComboView) => {
    const m: Record<number, number> = {};
    combo.legs.forEach((leg) => { m[leg.destinoId ?? 0] = leg.hotelId; });
    setPickedByDest(m);
  };
  const pickHotel = (destinoId: number, hotelId: number) =>
    setPickedByDest((prev) => ({ ...prev, [destinoId]: hotelId }));

  // Screen: finalized → only the chosen combo; otherwise all combos.
  const combosToShow = isFinalized && selectedCombo ? [selectedCombo] : combos;

  const pasajerosLabel = `${numAdultos} Adulto${numAdultos !== 1 ? "s" : ""}` +
    (numNinos > 0 ? ` + ${numNinos} Niño${numNinos !== 1 ? "s" : ""}` : "") +
    ` (${numAdultos + numNinos} pax)`;

  // ─── Status change (approve / reject) ─────────────────────────────
  const patchStatus = async (
    status: CotizacionStatus,
    extra: { hotelIds?: number[]; total?: number; nota?: string } = {}
  ) => {
    if (isBusy) return;
    setIsBusy(true);

    setCot((prev) => {
      const updatedComparison = extra.hotelIds
        ? prev.hotelsComparison?.map((h) => ({ ...h, selected: extra.hotelIds!.includes(h.hotelId) }))
        : prev.hotelsComparison;
      return {
        ...prev,
        status,
        ...(extra.total != null ? { total: extra.total } : {}),
        ...(extra.hotelIds && extra.hotelIds.length > 0 ? { selectedHotelId: extra.hotelIds[0] } : {}),
        ...(updatedComparison ? { hotelsComparison: updatedComparison } : {}),
      };
    });

    try {
      await fetch(`/api/cotizaciones/${cot.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(extra.hotelIds && extra.hotelIds.length > 0
            ? { selectedHotelId: extra.hotelIds[0], selectedHotelIds: extra.hotelIds }
            : {}),
          ...(extra.total != null ? { total: Math.round(extra.total * 100) / 100 } : {}),
          ...(extra.nota ? { nota: extra.nota } : {}),
        }),
      });
    } catch {}

    setIsBusy(false);
  };

  const handleApprove = () => {
    if (!canApprove || !selectedCombo) return;
    const nota = `Combinación aprobada: ${selectedCombo.legs.map((h) => h.nombre).join(", ")}`;
    patchStatus("APROBADA", { hotelIds: selectedCombo.hotelIds, total: selectedCombo.total, nota });
  };

  const handleReject = () => {
    if (!canApprove) return;
    patchStatus("RECHAZADA");
  };

  // ─── Render ───────────────────────────────────────────────────────
  const clientRows: [string, string][] = [
    ["Nombre",    cot.cliente?.nombre    || ""],
    ["Email",     cot.cliente?.email     || ""],
    ["Teléfono",  cot.cliente?.telefono  || ""],
    ["Documento", cot.cliente?.documento || ""],
    ["Dirección", cot.cliente?.direccion || ""],
  ];
  const tripRows: [string, string][] = [
    ["Programa",  cot.paqueteNombre   || ""],
    ["Destino",   cot.paqueteDestino  || ""],
    ["Duración",  cot.paqueteDuracion || ""],
    ["Salida",    fmtDate(cot.fechaViaje)],
    ["Retorno",   fmtDate(cot.fechaRetorno)],
    ...(isGenericClient ? [] : [["Pasajeros", pasajerosLabel] as [string, string]]),
  ];

  const adultTipoLabel =
    ({ 1: "SGL", 2: "DBL", 3: "TPL", 4: "QUAD" } as Record<number, string>)[numAdultos] ?? "Adulto";
  const showChild = numNinos > 0;
  const printGrouped = useGrouped && !isFinalized;

  // Columnas de adulto a mostrar: una por tipo de habitación realmente cotizado (sin repetir
  // tipo), o una sola columna genérica "Adulto"/tipo único si el snapshot no trae `roomRates`
  // (cotizaciones guardadas antes de este campo).
  const adultColumns = showRoomTypes ? roomTypeEntries : [{ tipo: adultTipoLabel, qty: numAdultos }];

  /** Precio por tipo de habitación para UNA combinación (cartesiano) — actividades, boleto y
   *  comisión se mantienen como un único monto por adulto (no varían por tipo de habitación);
   *  solo el alojamiento se separa por tipo. */
  const comboRoomPrices = (combo: ComboView): { tipo: string; price: number }[] => {
    if (!showRoomTypes) return [{ tipo: adultTipoLabel, price: combo.adultP }];
    const adultServices = combo.legs.reduce((s, h) => s + (h.adultServicesTotal ?? 0), 0);
    const servicesPerAdult = numAdultos > 0 ? adultServices / numAdultos : 0;
    return roomTypeEntries.map(({ tipo }) => {
      const accom = combo.legs.reduce((s, h) => s + (h.roomRates?.[tipo] ?? 0), 0);
      return { tipo, price: accom + servicesPerAdult + boletoAdultoPerPax + markup };
    });
  };

  /** Mismo criterio que `comboRoomPrices`, para UN hotel en la vista agrupada por destino —
   *  boleto/comisión se dividen entre destinos igual que `hotelPerDestinoPrice`. */
  const hotelRoomPrices = (h: HotelCompSnapshot): { tipo: string; price: number }[] => {
    const div = Math.max(1, destGroups.length);
    if (!showRoomTypes) {
      const p = hotelPerDestinoPrice({
        adultColPerPax: h.adultColPerPax ?? 0,
        childAccomTotal: h.childAccomTotal ?? 0,
        childServicesTotal: h.childServicesTotal ?? 0,
        boletoAdultoPerPax, boletoNinoPerPax,
        agencyMarkup: markup, numAdultos, numNinos,
        numDestinos: div,
      });
      return [{ tipo: adultTipoLabel, price: p.precioAdulto }];
    }
    const servicesPerAdult = numAdultos > 0 ? (h.adultServicesTotal ?? 0) / numAdultos : 0;
    return roomTypeEntries.map(({ tipo }) => {
      const accom = h.roomRates?.[tipo] ?? 0;
      return { tipo, price: accom + servicesPerAdult + (boletoAdultoPerPax + markup) / div };
    });
  };

  /**
   * Precio de niño por rango de edad, SOLO cuando la edad real es desconocida (cotización
   * rápida — `childAgeUnknown`) y el hotel tiene más de un precio de niño configurado (varias
   * PoliticaNinos con precios distintos): no hay una única respuesta correcta, así que se
   * listan todas las tarifas en vez de un solo número adivinado. Con una sola tarifa (o edad
   * conocida, cotización normal del wizard) devuelve `null` y el llamador usa el precio único
   * de siempre. Solo se resuelve para combinaciones de UN hotel (single-destino) — en
   * multi-destino el precio de niño combinado se deja como antes.
   */
  const comboChildTiers = (combo: ComboView): { label: string; price: number }[] | null => {
    if (combo.legs.length !== 1) return null;
    const leg = combo.legs[0];
    if (!leg.childAgeUnknown || !leg.childRateTiers) return null;
    const distinct = new Set(leg.childRateTiers.map((t) => t.accomTotal));
    if (distinct.size < 2) return null;
    const servicesPerChild = numNinos > 0 ? (leg.childServicesTotal ?? 0) / numNinos : 0;
    return leg.childRateTiers.map((t) => ({
      label: `${t.edadMin}-${t.edadMax} años`,
      price: t.accomTotal + servicesPerChild + boletoNinoPerPax + markup,
    }));
  };

  /** Mismo criterio que `comboChildTiers`, para UN hotel en la vista agrupada por destino. */
  const hotelChildTiers = (h: HotelCompSnapshot): { label: string; price: number }[] | null => {
    if (!h.childAgeUnknown || !h.childRateTiers) return null;
    const distinct = new Set(h.childRateTiers.map((t) => t.accomTotal));
    if (distinct.size < 2) return null;
    const div = Math.max(1, destGroups.length);
    const servicesPerChild = numNinos > 0 ? (h.childServicesTotal ?? 0) / numNinos : 0;
    return h.childRateTiers.map((t) => ({
      label: `${t.edadMin}-${t.edadMax} años`,
      price: t.accomTotal + servicesPerChild + (boletoNinoPerPax + markup) / div,
    }));
  };

  return (
    <div className="animate-fade-scale pb-10">

      {/* Print layout: A4, no browser header/footer chrome beyond what the browser adds. */}
      <style>{`@media print { @page { size: A4; margin: 14mm 18mm; } body { background: #fff !important; } }`}</style>

      {/* Action toolbar — not part of the document sheet, hidden when printing */}
      <div className="print:hidden flex items-center gap-2 flex-wrap mb-6">
        <button
          onClick={() => { window.close(); }}
          className="flex items-center gap-1.5 text-primary/50 hover:text-primary text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <X size={13} /> Cerrar pestaña
        </button>
        <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 ${STATUS_BADGE[cot.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
          {COTIZACION_STATUS_LABEL[cot.status]}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {cot.status === "BORRADOR" && (
            <button
              onClick={() => {
                try { localStorage.setItem(EDIT_COT_PENDING_KEY, cot.id); } catch {}
                window.location.href = "/dashboard";
              }}
              className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 font-black text-[11px] uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Pencil size={13} /> {isGenericClient ? "Cotizar" : "Editar"}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 font-black text-[11px] uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer size={13} /> Imprimir / PDF
          </button>
          {canApprove && (
            <>
              <button
                onClick={handleReject}
                disabled={isBusy}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-[11px] uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <XCircle size={13} /> Rechazar
              </button>
              <button
                onClick={handleApprove}
                disabled={isBusy || !selectedCombo}
                className="px-5 py-2.5 bg-secondary hover:bg-secondary-light text-primary disabled:opacity-40 disabled:cursor-not-allowed font-black text-[11px] uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isBusy
                  ? <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  : <CheckCircle2 size={13} />}
                Aprobar
              </button>
            </>
          )}
        </div>
      </div>

      {canAct && isGenericClient && (
        <p className="print:hidden max-w-[820px] mx-auto mb-4 text-[11px] font-bold text-amber-700 bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-200 text-center leading-relaxed">
          Esta es una cotización rápida con cliente genérico — edítala con los datos reales del cliente para poder aprobarla o rechazarla.
        </p>
      )}

      {canApprove && hasCombos && !selectedCombo && (
        <p className="print:hidden max-w-[820px] mx-auto mb-4 text-[11px] font-bold text-amber-700 bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-200 text-center leading-relaxed">
          {useGrouped
            ? "Selecciona un hotel en cada destino para poder aprobar. También puedes imprimir sin aprobar."
            : "Selecciona una combinación para poder aprobar. También puedes imprimir sin aprobar."}
        </p>
      )}

      {/* ── The document sheet — mirrors the printed PDF layout ── */}
      <div className="max-w-[820px] mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 print:shadow-none print:border-0 print:rounded-none print:p-0 print:max-w-none text-primary">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 mb-7 border-b-[3px] border-secondary print:break-inside-avoid">
          <div className="flex items-center gap-3 min-w-0">
            {agencyLogo
              ? <img src={agencyLogo} alt={agencyName} className="w-20 h-8 object-contain shrink-0" />
              : <div className="w-[72px] h-[30px] bg-primary rounded-md flex items-center justify-center shrink-0"><span className="text-secondary text-[10px] font-black">LTT</span></div>}
            <div className="min-w-0">
              <p className="text-sm font-black text-primary truncate">{agencyName}</p>
              <p className="text-[9px] font-bold text-primary/50 mt-0.5 truncate">
                {[agencyEmail, agencyPhone].filter(Boolean).join(" · ")}
              </p>
              {agencyDescripcion && (
                <p className="text-[8px] font-medium text-primary/40 mt-0.5 truncate max-w-[280px]">{agencyDescripcion}</p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-black text-secondary tracking-[3px]">COTIZACIÓN</p>
            <p className="text-[11px] font-bold text-secondary/70 mt-0.5">{cot.codigo}</p>
            <p className="text-[9px] font-bold text-primary/40 mt-0.5">{cot.fechaCreacion}</p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-1.5 text-[8px] font-black uppercase rounded-md tracking-wider ${STATUS_BADGE[cot.status]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
              {COTIZACION_STATUS_LABEL[cot.status]}
            </span>
          </div>
        </div>

        {/* Servicios Incluidos (izq.) + Datos Cliente/Detalles Viaje apilados (der.) — grid de 2 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-6">

          {/* Servicios incluidos — el boleto va primero (es un servicio general del paquete,
              no atado a un destino específico), luego actividades/traslados agrupados por
              destino, todo en una sola lista vertical (sin columnas Actividades/Traslados). */}
          {(() => {
            const incluyeGrupos = (cot.paqueteIncluyeDestinos ?? []).filter((g) => g.actividades.length > 0 || g.traslados.length > 0);
            const showFlatIncluye = incluyeGrupos.length === 0 && (cot.paqueteIncluye?.length ?? 0) > 0;
            if (!cot.incluyeBoleto && incluyeGrupos.length === 0 && !showFlatIncluye) return <div />;
            return (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-secondary border-b border-gray-100 pb-1 mb-2.5">Servicios Incluidos</p>
                {cot.incluyeBoleto && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-wide rounded-md">
                      ✓ Boleto Aéreo Incluido
                    </span>
                  </div>
                )}
                {incluyeGrupos.length > 0 && (
                  <div className="space-y-3">
                    {incluyeGrupos.map((g) => {
                      // Orden pedido: boleto(s) primero (badge aparte, arriba) → traslados → actividades (con detalle).
                      const items = [...g.traslados.map(toServicioItem), ...g.actividades.map(toServicioItem)];
                      return (
                        <div key={g.destinoId}>
                          <p className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide text-primary bg-light px-2 py-1 rounded-md mb-1.5">
                            <span className="w-1 h-1 rounded-full bg-secondary" />
                            {g.destinoCiudad}
                          </p>
                          <ul className="space-y-2.5">
                            {items.map((item, i) => (
                              <li key={i} className="text-[10px]">
                                <p className="font-bold text-primary flex items-start gap-1.5">
                                  <span className="text-secondary shrink-0">✓</span>
                                  <span>{item.nombre}</span>
                                </p>
                                {item.detalle && (
                                  <p className="mt-1 ml-[18px] pl-2.5 border-l-2 border-secondary/20 text-[9.5px] font-medium text-primary/70 leading-relaxed whitespace-pre-line">
                                    {item.detalle}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
                {showFlatIncluye && (
                  <ul className="space-y-1.5">
                    {(cot.paqueteIncluye ?? []).map((item: string, i: number) => (
                      <li key={i} className="text-[10px] font-semibold text-primary">✓ {item}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}

          {/* Datos Cliente + Detalles Viaje — mini-tabla por sección, apiladas en la misma columna */}
          <div className="space-y-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-secondary border-b border-gray-100 pb-1 mb-2.5">Datos Cliente</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {clientRows.filter(([, v]) => !!v).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[8px] font-black uppercase tracking-wide text-primary/40">{label}</p>
                    <p className="text-[11px] font-bold text-primary break-words mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-secondary border-b border-gray-100 pb-1 mb-2.5">Detalles Viaje</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {tripRows.filter(([, v]) => !!v).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[8px] font-black uppercase tracking-wide text-primary/40">{label}</p>
                    <p className="text-[11px] font-bold text-primary break-words mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Combinaciones / Hoteles por destino — table rows, like the printed document */}
        {hasCombos && (
          <div className="mb-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-secondary border-b border-gray-100 pb-1 mb-2.5">
              {isFinalized
                ? "Combinación Confirmada"
                : printGrouped
                  ? "Hoteles por Destino"
                  : (combos.length > 1 ? "Combinaciones de Hoteles" : "Alojamiento")}
              {!isFinalized && !printGrouped && combos.length > 1 && (
                <span className="ml-1 text-primary/25 normal-case tracking-normal">({combos.length})</span>
              )}
            </p>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-light/50">
                    <th className="py-2 px-3 border-b-[1.5px] border-r border-gray-100 text-[8px] font-black uppercase tracking-wide text-secondary">
                      {printGrouped ? "Hotel" : "Combinación"}
                    </th>
                    {adultColumns.map((c, i) => (
                      <th
                        key={c.tipo}
                        className={`py-2 px-3 border-b-[1.5px] border-gray-100 text-[8px] font-black uppercase tracking-wide text-secondary text-right w-20 whitespace-nowrap ${(i < adultColumns.length - 1 || showChild) ? "border-r" : ""}`}
                      >
                        {c.tipo}
                        {showRoomTypes && <span className="block text-[7px] normal-case font-semibold text-primary/40">{c.qty} hab.</span>}
                      </th>
                    ))}
                    {showChild && (
                      <th className="py-2 px-3 border-b-[1.5px] border-gray-100 text-[8px] font-black uppercase tracking-wide text-secondary text-right w-20 whitespace-nowrap">
                        Niño
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {printGrouped ? (
                    destGroups.map((g) => (
                      <React.Fragment key={g.destinoId}>
                        <tr>
                          <td colSpan={1 + adultColumns.length + (showChild ? 1 : 0)} className="pt-3 pb-1 px-3 text-[8px] font-black uppercase tracking-wide text-secondary bg-light/30 border-b border-gray-100">
                            {g.ciudad}
                          </td>
                        </tr>
                        {g.hotels.map((h) => {
                          const isSel = effectivePick[g.destinoId] === h.hotelId;
                          const adultPrices = hotelRoomPrices(h);
                          const childP = hotelPerDestinoPrice({
                            adultColPerPax:     h.adultColPerPax ?? 0,
                            childAccomTotal:    h.childAccomTotal ?? 0,
                            childServicesTotal: h.childServicesTotal ?? 0,
                            boletoAdultoPerPax: boletoAdultoPerPax,
                            boletoNinoPerPax:   boletoNinoPerPax,
                            agencyMarkup:       markup,
                            numAdultos, numNinos,
                            numDestinos: destGroups.length,
                          }).precioNino;
                          return (
                            <tr
                              key={h.hotelId}
                              onClick={() => canAct && pickHotel(g.destinoId, h.hotelId)}
                              className={`border-b border-gray-50 last:border-0 transition-colors ${canAct ? "cursor-pointer hover:bg-light/60" : ""} ${isSel ? "bg-secondary/5" : ""}`}
                            >
                              <td className="py-2.5 px-3 border-r border-gray-100 min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="truncate text-[11px] font-bold text-primary" title={h.nombre}>{h.nombre}</span>
                                  <span className="shrink-0 text-gold text-[9px]">{stars(h.estrellas)}</span>
                                  {showChild && h.sinTarifaNino && (
                                    <span className="shrink-0 text-[8px] font-black text-amber-600 uppercase tracking-wide">Sin tarifa niño</span>
                                  )}
                                  {canAct && isSel && <span className="print:hidden shrink-0 text-[8px] font-black text-secondary uppercase tracking-wide">✓ Elegido</span>}
                                </div>
                              </td>
                              {adultPrices.map((r, i) => (
                                <td key={r.tipo} className={`py-2.5 px-3 text-right text-sm font-black text-primary whitespace-nowrap ${(i < adultPrices.length - 1 || showChild) ? "border-r border-gray-100" : ""}`}>
                                  ${money(r.price)}
                                </td>
                              ))}
                              {showChild && (() => {
                                const tiers = hotelChildTiers(h);
                                return (
                                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                    {tiers ? (
                                      <div className="space-y-0.5">
                                        {tiers.map((t) => (
                                          <div key={t.label} className="text-[10px] font-black text-primary leading-tight">
                                            ${money(t.price)} <span className="text-[8px] font-bold text-primary/40">({t.label})</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-sm font-black text-primary">${money(childP)}</span>
                                    )}
                                  </td>
                                );
                              })()}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))
                  ) : (
                    combosToShow.map((combo) => {
                      const idx = combos.indexOf(combo);
                      const isSel = idx === selectedComboIdx;
                      const selectable = canAct;
                      const title = combos.length > 1 ? `Combinación ${idx + 1}` : (isMultiDest ? "Combinación" : "Alojamiento");
                      const fullName = combo.legs.map((h) => (isMultiDest && hotelDestinoCiudad(h) ? `${hotelDestinoCiudad(h)} — ${h.nombre}` : h.nombre)).join(" + ");
                      const adultPrices = comboRoomPrices(combo);
                      return (
                        <tr
                          key={idx}
                          onClick={() => selectable && pickCombo(combo)}
                          className={`border-b border-gray-50 last:border-0 transition-colors ${selectable ? "cursor-pointer hover:bg-light/60" : ""} ${isSel ? "bg-secondary/5" : ""}`}
                        >
                          <td className="py-2.5 px-3 border-r border-gray-100 min-w-0">
                            {combos.length > 1 && (
                              <span className="block text-[8px] font-black uppercase tracking-wide text-primary/40">{title}</span>
                            )}
                            <div className="mt-0.5 space-y-0.5" title={fullName}>
                              {combo.legs.map((h, i) => (
                                <div key={h.hotelId} className="flex items-center gap-1.5 min-w-0">
                                  <span className="truncate text-[11px] font-bold text-primary">
                                    {isMultiDest && hotelDestinoCiudad(h) ? `${hotelDestinoCiudad(h)} — ` : ""}{h.nombre}
                                  </span>
                                  <span className="shrink-0 text-gold text-[9px]">{stars(h.estrellas)}</span>
                                  {i < combo.legs.length - 1 && <span className="shrink-0 text-secondary font-black text-[10px]">+</span>}
                                  {showChild && h.sinTarifaNino && (
                                    <span className="shrink-0 text-[8px] font-black text-amber-600 uppercase tracking-wide">Sin tarifa niño</span>
                                  )}
                                </div>
                              ))}
                              {selectable && isSel && <span className="print:hidden inline-block text-[8px] font-black text-secondary uppercase tracking-wide">✓ Elegido</span>}
                            </div>
                          </td>
                          {adultPrices.map((r, i) => (
                            <td key={r.tipo} className={`py-2.5 px-3 text-right text-sm font-black text-primary whitespace-nowrap ${(i < adultPrices.length - 1 || showChild) ? "border-r border-gray-100" : ""}`}>
                              ${money(r.price)}
                            </td>
                          ))}
                          {showChild && (() => {
                            const tiers = comboChildTiers(combo);
                            return (
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                {tiers ? (
                                  <div className="space-y-0.5">
                                    {tiers.map((t) => (
                                      <div key={t.label} className="text-[10px] font-black text-primary leading-tight">
                                        ${money(t.price)} <span className="text-[8px] font-bold text-primary/40">({t.label})</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm font-black text-primary">${money(combo.childP)}</span>
                                )}
                              </td>
                            );
                          })()}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-[9px] text-primary/40 font-medium mt-3 leading-relaxed">
              {boletoOculto ? "El boleto aéreo va incluido en el precio." : ""}
              {showChild && allHotels.some((h) => h.childAgeUnknown && (h.childRateTiers?.length ?? 0) > 1)
                ? " El precio de niño varía según su edad — se muestran todas las tarifas configuradas por rango de edad."
                : ""}
              {printGrouped ? <span className="print:hidden"> Elige un hotel en cada destino para aprobar.</span> : ""}
            </p>
          </div>
        )}

        {/* Notas */}
        {cot.notas && (
          <div className="mb-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-secondary border-b border-gray-100 pb-1 mb-2">Notas</p>
            <p className="text-[10px] font-semibold text-primary/70 leading-relaxed whitespace-pre-wrap">{cot.notas}</p>
          </div>
        )}

        {/* Términos */}
        <div className="mb-6">
          <p className="text-[9px] font-black uppercase tracking-widest text-secondary border-b border-gray-100 pb-1 mb-2">Términos y Condiciones</p>
          <p className="text-[8px] text-primary/50 leading-relaxed">{TERMINOS}</p>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between gap-4 pt-3 border-t border-gray-100">
          <div className="text-[9px] font-bold text-primary/60 leading-[1.8]">
            Preparado por: <strong>{agencyName}</strong><br />
            {agencyPhone} · {cot.fechaCreacion}
          </div>
          {agencyLogo ? (
            <img src={agencyLogo} alt={agencyName} className="w-[52px] h-[52px] rounded-full object-cover shrink-0 border border-gray-100" />
          ) : (
            <div className="w-[52px] h-[52px] rounded-full bg-primary text-secondary flex items-center justify-center text-[8px] font-black text-center leading-tight shrink-0">
              COTIZACIÓN
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

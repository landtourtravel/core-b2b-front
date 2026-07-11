"use client";
import React, { useState, useMemo } from "react";
import { CheckCircle2, Printer, X, XCircle } from "lucide-react";
import { COTIZACION_STATUS_LABEL } from "@land-tour/shared";
import type { CotizacionStatus } from "@land-tour/shared";
import type { CotizacionExtended, HotelCompSnapshot } from "../DashboardContext";
import { cartesian, combineComboLegs, hotelPerDestinoPrice, type ComboLeg } from "../cotizar-price";

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
  agencyPhone: string;
  agencyAddress: string;
  agencyLogo: string | null;
}

export default function CotizacionDetailView({
  cot: initialCot, agencyName, agencyPhone, agencyAddress, agencyLogo,
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

  // Group hotels by destino (preserve insertion order).
  const destGroups = useMemo(() => {
    const m = new Map<number, { destinoId: number; ciudad: string; pais: string; hotels: HotelCompSnapshot[] }>();
    allHotels.forEach((h) => {
      const dId = h.destinoId ?? 0;
      if (!m.has(dId)) m.set(dId, { destinoId: dId, ciudad: h.destinoCiudad ?? "", pais: h.destinoPais ?? "", hotels: [] });
      m.get(dId)!.hotels.push(h);
    });
    return [...m.values()];
  }, [allHotels]);
  const isMultiDest = destGroups.length > 1;
  // ≥2 destinos con varios hoteles → la vista agrupada por destino reemplaza el listado
  // cartesiano de combinaciones. El asesor elige un hotel por destino (no una combinación).
  const multiHotelDestCount = destGroups.filter((g) => g.hotels.length >= 2).length;
  const useGrouped = hasV4 && destGroups.length > 1 && multiHotelDestCount >= 2;

  // Every combination (one hotel per destino) with per-person adult/child prices — same
  // model as Step 4 (combineComboLegs). Boleto + markup counted once per combo.
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
    });
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
    if (!canAct || !selectedCombo) return;
    const nota = `Combinación aprobada: ${selectedCombo.legs.map((h) => h.nombre).join(", ")}`;
    patchStatus("APROBADA", { hotelIds: selectedCombo.hotelIds, total: selectedCombo.total, nota });
  };

  const handleReject = () => {
    if (!canAct) return;
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
    ["Pasajeros", pasajerosLabel],
    ["Boleto",    cot.incluyeBoleto ? "✓ Incluido" : ""],
  ];

  const adultTipoLabel =
    ({ 1: "SGL", 2: "DBL", 3: "TPL", 4: "QUAD" } as Record<number, string>)[numAdultos] ?? "Adulto";
  const showChild = numNinos > 0;
  const printGrouped = useGrouped && !isFinalized;

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
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 font-black text-[11px] uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer size={13} /> Imprimir / PDF
          </button>
          {canAct && (
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

      {canAct && hasCombos && !selectedCombo && (
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
              <p className="text-[9px] font-bold text-primary/50 mt-0.5 truncate">{agencyPhone}{agencyAddress ? ` · ${agencyAddress}` : ""}</p>
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

        {/* Client + Trip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-secondary border-b border-gray-100 pb-1 mb-2.5">Datos del Cliente</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {clientRows.filter(([, v]) => !!v).map(([label, value]) => (
                <div key={label} className={label === "Dirección" ? "col-span-2" : undefined}>
                  <span className="block text-[8px] font-black uppercase tracking-wide text-primary/40">{label}</span>
                  <span className="block text-[11px] font-bold text-primary mt-0.5 break-words">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-secondary border-b border-gray-100 pb-1 mb-2.5">Detalles del Viaje</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {tripRows.filter(([, v]) => !!v).map(([label, value]) => (
                <div key={label}>
                  <span className="block text-[8px] font-black uppercase tracking-wide text-primary/40">{label}</span>
                  <span className={`block text-[11px] font-bold mt-0.5 break-words ${label === "Boleto" ? "text-secondary" : "text-primary"}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Servicios incluidos */}
        {(cot.paqueteIncluye?.length ?? 0) > 0 && (
          <div className="mb-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-secondary border-b border-gray-100 pb-1 mb-2.5">Servicios Incluidos</p>
            <div className="flex flex-wrap gap-1.5">
              {(cot.paqueteIncluye ?? []).map((item: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-light text-primary text-[9px] font-bold rounded-md border border-secondary/40">
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>
        )}

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

            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="pb-1.5 border-b-[1.5px] border-gray-100 text-[8px] font-black uppercase tracking-wide text-secondary">
                    {printGrouped ? "Hotel" : "Combinación"}
                  </th>
                  <th className="pb-1.5 border-b-[1.5px] border-gray-100 text-[8px] font-black uppercase tracking-wide text-secondary text-right w-24">
                    {adultTipoLabel}
                  </th>
                  {showChild && (
                    <th className="pb-1.5 border-b-[1.5px] border-gray-100 text-[8px] font-black uppercase tracking-wide text-secondary text-right w-20">
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
                        <td colSpan={showChild ? 3 : 2} className="pt-3 pb-1 text-[8px] font-black uppercase tracking-wide text-secondary border-b border-gray-100">
                          {g.ciudad}
                        </td>
                      </tr>
                      {g.hotels.map((h) => {
                        const isSel = effectivePick[g.destinoId] === h.hotelId;
                        const p = hotelPerDestinoPrice({
                          adultColPerPax:     h.adultColPerPax ?? 0,
                          childAccomTotal:    h.childAccomTotal ?? 0,
                          childServicesTotal: h.childServicesTotal ?? 0,
                          boletoAdultoPerPax: boletoAdultoPerPax,
                          boletoNinoPerPax:   boletoNinoPerPax,
                          agencyMarkup:       markup,
                          numAdultos, numNinos,
                          numDestinos: destGroups.length,
                        });
                        return (
                          <tr
                            key={h.hotelId}
                            onClick={() => canAct && pickHotel(g.destinoId, h.hotelId)}
                            className={`border-b border-gray-50 last:border-0 transition-colors ${canAct ? "cursor-pointer hover:bg-light/60" : ""} ${isSel ? "bg-secondary/5" : ""}`}
                          >
                            <td className="py-2.5 pr-3">
                              <span className="text-[11px] font-bold text-primary">{h.nombre}</span>{" "}
                              <span className="text-gold text-[9px]">{stars(h.estrellas)}</span>
                              {showChild && h.sinTarifaNino && (
                                <span className="ml-2 text-[8px] font-black text-amber-600 uppercase tracking-wide">Sin tarifa niño</span>
                              )}
                              {canAct && isSel && <span className="print:hidden ml-2 text-[8px] font-black text-secondary uppercase tracking-wide">✓ Elegido</span>}
                            </td>
                            <td className="py-2.5 text-right text-sm font-black text-primary whitespace-nowrap">
                              ${money(p.precioAdulto)}<span className="text-[8px] font-bold text-primary/40 ml-0.5">/pax</span>
                            </td>
                            {showChild && (
                              <td className="py-2.5 text-right text-sm font-black text-primary whitespace-nowrap">
                                ${money(p.precioNino)}<span className="text-[8px] font-bold text-primary/40 ml-0.5">/niño</span>
                              </td>
                            )}
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
                    return (
                      <tr
                        key={idx}
                        onClick={() => selectable && pickCombo(combo)}
                        className={`border-b border-gray-50 last:border-0 transition-colors ${selectable ? "cursor-pointer hover:bg-light/60" : ""} ${isSel ? "bg-secondary/5" : ""}`}
                      >
                        <td className="py-2.5 pr-3">
                          {combos.length > 1 && (
                            <span className="block text-[8px] font-black uppercase tracking-wide text-primary/40">{title}</span>
                          )}
                          <span className="block text-[11px] font-bold text-primary mt-0.5">
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
                            {selectable && isSel && <span className="print:hidden ml-2 text-[8px] font-black text-secondary uppercase tracking-wide">✓ Elegido</span>}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-sm font-black text-primary whitespace-nowrap">
                          ${money(combo.adultP)}<span className="text-[8px] font-bold text-primary/40 ml-0.5">/pax</span>
                        </td>
                        {showChild && (
                          <td className="py-2.5 text-right text-sm font-black text-primary whitespace-nowrap">
                            ${money(combo.childP)}<span className="text-[8px] font-bold text-primary/40 ml-0.5">/niño</span>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <p className="text-[9px] text-primary/40 font-medium mt-3 leading-relaxed">
              Precios por persona (incluyen alojamiento, actividades y traslados
              {cot.incluyeBoleto ? ", y boleto aéreo" : ""}).
              {numNinos > 0 ? " El niño se calcula por separado del adulto." : ""}
              {boletoOculto ? " El boleto aéreo va incluido en el precio." : ""}
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
            {agencyPhone} · {cot.fechaCreacion}<br />
            <span className="text-secondary">Land Tour Travel — Mayorista de Turismo</span>
          </div>
          <div className="w-[52px] h-[52px] rounded-full bg-primary text-secondary flex items-center justify-center text-[8px] font-black text-center leading-tight shrink-0">
            LTT<br />COTIZACIÓN
          </div>
        </div>

      </div>
    </div>
  );
}

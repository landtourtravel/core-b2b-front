// apps/web/src/app/dashboard/components/PaqueteDetailView.tsx
"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Clock, Plane, Star, ImageOff, Loader2 } from "lucide-react";
import type { CotPaquete, CotPaqueteHotel } from "../cotizar-types";
import {
  calcHotelBreakdown, calcHotelBreakdownFromRoomMix, cartesian, combineComboLegs, numPaxToTipoPax,
  type ComboLeg,
} from "../cotizar-price";

/** Read by page.tsx on mount (Task 7) to auto-trigger handleQuickQuote after navigating back. */
export const QUICK_QUOTE_PENDING_KEY = "dashboard-pending-quick-quote";

const TIPO_PAX_COLOR: Record<string, string> = {
  SGL: "border-t-sky-400", DBL: "border-t-secondary", TPL: "border-t-gold", QUAD: "border-t-violet-400",
};

type VariantCard = { tipoPax: string; numPax: number; isBase?: boolean; mixed?: boolean };

const TIPO_PAX_ORDER = ["SGL", "DBL", "TPL", "QUAD"];

/**
 * Precio de la ocupación BASE del paquete (`Paquete.numPax`/`numNinos`) cuando esa ocupación
 * es una MEZCLA de tipos de habitación (ej. 1 SGL + 1 DBL + 1 TPL = 6 adultos) y por eso
 * `numPaxToTipoPax` no devuelve un solo tipo válido — usa la composición real declarada en
 * `PaqueteHotel` (`hotel.habitaciones`) en vez de asumir un tipoPax único para todo el grupo.
 */
function computeBaseVariantCombo(paquete: CotPaquete, numNinosOverride?: number) {
  const hoteles = paquete.hoteles.filter((h) => h.habitaciones.some((r) => r.tipoHabitacion !== "CHD" && r.cantidad > 0));
  if (hoteles.length === 0) return null;
  const numPax = paquete.numPax;
  const numNinos = numNinosOverride ?? paquete.numNinos;
  const ninosEdades = Array(numNinos).fill(5);
  const boletoAdultoPerPax = paquete.incluyeBoleto ? (paquete.precioBoleto ?? 0) : 0;
  const boletoNinoPerPax   = paquete.incluyeBoleto ? (paquete.precioBoletoNino ?? paquete.precioBoleto ?? 0) : 0;

  const byDestino = new Map<number, { hotel: CotPaqueteHotel; bd: ReturnType<typeof calcHotelBreakdownFromRoomMix> }[]>();
  hoteles.forEach((hotel) => {
    const bd = calcHotelBreakdownFromRoomMix(
      hotel, hotel.habitaciones, ninosEdades, numPax,
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
    return combineComboLegs(comboLegs, numPax, numNinos, boletoAdultoPerPax, boletoNinoPerPax, 0);
  });
  return combos.reduce((min, c) => (c.total < min.total ? c : min));
}

/** Cheapest combo (across hotel selections) for a given occupancy, using the same engine as the wizard. */
function computeVariantCombo(paquete: CotPaquete, tipoPax: string, numPax: number, numNinos: number) {
  if (paquete.hoteles.length === 0) return null;
  const ninosEdades = Array(numNinos).fill(5);
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
    return combineComboLegs(comboLegs, numPax, numNinos, boletoAdultoPerPax, boletoNinoPerPax, 0);
  });
  return combos.reduce((min, c) => (c.total < min.total ? c : min));
}

/** Cheapest per-adult price for a given occupancy, using the same engine as the wizard. */
function computeVariantPrice(paquete: CotPaquete, tipoPax: string, numPax: number): number | null {
  return computeVariantCombo(paquete, tipoPax, numPax, paquete.numNinos)?.precioAdulto ?? null;
}

/** Cheapest per-child price across all adult occupancies, for the informational CHD card. */
function computeChildFromPrice(paquete: CotPaquete, variantCards: VariantCard[]): number | null {
  let min: number | null = null;
  for (const v of variantCards) {
    const combo = v.mixed
      ? computeBaseVariantCombo(paquete, 1)
      : computeVariantCombo(paquete, v.tipoPax, v.numPax, 1);
    if (combo && (min === null || combo.precioNino < min)) min = combo.precioNino;
  }
  return min;
}

export default function PaqueteDetailView({ paquete }: { paquete: CotPaquete }) {
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [quickQuoteBusy, setQuickQuoteBusy] = useState<string | null>(null);
  const [quickQuoteError, setQuickQuoteError] = useState<string | null>(null);

  const variantCards: VariantCard[] = useMemo(() => {
    const baseTipoPax = numPaxToTipoPax(paquete.numPax);
    // La ocupación BASE (Paquete.numPax/numNinos) es implícita — NO se guarda como fila propia
    // en VersionPaquete (esa tabla solo tiene las versiones adicionales que el admin crea después).
    // Por eso su tarjeta se agrega aquí explícitamente: con nomenclatura simple (SGL/DBL/TPL/QUAD)
    // si un solo tipo de habitación cubre el numPax base, o como "MIXTA" si es una combinación de
    // varios tipos de habitación (sin una sola etiqueta válida).
    const cards: VariantCard[] = [];
    const seen = new Set<string>();
    if (baseTipoPax) {
      cards.push({ tipoPax: baseTipoPax, numPax: paquete.numPax, isBase: true });
      seen.add(`${baseTipoPax}-${paquete.numPax}`);
    } else {
      const base: VariantCard = { tipoPax: "MIXTA", numPax: paquete.numPax, isBase: true, mixed: true };
      cards.push(base);
      seen.add(`${base.tipoPax}-${base.numPax}`);
    }
    paquete.versiones.forEach((v) => {
      const key = `${v.tipoPax}-${v.numPax}`;
      if (!seen.has(key)) { seen.add(key); cards.push({ tipoPax: v.tipoPax, numPax: v.numPax }); }
    });
    return cards.sort((a, b) => {
      const ia = TIPO_PAX_ORDER.indexOf(a.tipoPax);
      const ib = TIPO_PAX_ORDER.indexOf(b.tipoPax);
      return (ia === -1 ? TIPO_PAX_ORDER.length : ia) - (ib === -1 ? TIPO_PAX_ORDER.length : ib);
    });
  }, [paquete]);

  const destinosView = useMemo(() => paquete.destinos.map((d) => ({
    ...d,
    hoteles: paquete.hoteles.filter((h) => h.destinoId === d.id),
    actividades: paquete.actividades.filter((a) => a.destinoId === d.id),
    traslados: paquete.traslados.filter((t) => t.destinoId === d.id),
  })), [paquete]);

  const isMultiDestino = paquete.destinos.length > 1;

  const baseIsMixed = numPaxToTipoPax(paquete.numPax) === null;
  const baseVariantKey = `${numPaxToTipoPax(paquete.numPax) ?? "MIXTA"}-${paquete.numPax}`;

  // El paquete admite niños solo si el admin lo configuró así al crearlo
  // (`Paquete.numNinos > 0`) — no basta con que el hotel tenga tarifa CHD cargada.
  const pkgAllowsNinos = paquete.numNinos > 0;

  const runQuickQuote = async (key: string, numPax: number, numNinos: number, baseComposicion = false) => {
    setQuickQuoteBusy(key);
    setQuickQuoteError(null);
    try {
      const res = await fetch("/api/cotizaciones/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paqueteId: paquete.id, numPax, numNinos, ...(baseComposicion ? { baseComposicion: true } : {}) }),
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
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Info — prioridad visual */}
            <div className="flex-1 min-w-0 order-2 lg:order-1">
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
              <p className="flex items-center gap-1.5 text-xs font-bold text-primary/50">
                <MapPin size={13} />
                {paquete.destinos.map((d) => d.ciudad).join(" · ") || `${paquete.destinoCiudad}, ${paquete.destinoPais}`}
              </p>
            </div>

            {/* Galería — secundaria, compacta */}
            <div className="w-full lg:w-72 shrink-0 order-1 lg:order-2">
              {paquete.imagenes.length > 0 ? (
                <div className="flex gap-1.5 items-stretch">
                  <div className="relative flex-1 min-w-0 aspect-[4/3] rounded-2xl overflow-hidden bg-lighter">
                    <Image src={paquete.imagenes[activeImg]} alt={paquete.nombre} fill className="object-cover" sizes="224px" />
                  </div>
                  {paquete.imagenes.length > 1 && (
                    <div className="flex flex-col gap-1.5 overflow-y-auto shrink-0">
                      {paquete.imagenes.map((url, i) => (
                        <button
                          key={url + i}
                          onClick={() => setActiveImg(i)}
                          className={`relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === activeImg ? "border-secondary" : "border-transparent opacity-70 hover:opacity-100"}`}
                        >
                          <Image src={url} alt="" fill className="object-cover" sizes="44px" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 w-full aspect-[4/3] rounded-2xl bg-lighter text-primary/30">
                  <ImageOff size={14} /><span className="text-[10px] font-bold">Sin imágenes</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Servicios incluidos por destino */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Servicios Incluidos</h3>

          <div className="flex flex-col gap-2 mb-5 pb-5 border-b border-gray-100">
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary/60">
              <Clock size={13} className="text-secondary shrink-0" />
              <span className="text-primary/40">Duración:</span> {paquete.diasEstancia} Días / {paquete.nochesBase} Noches
            </span>
            {paquete.visibleBoleto && paquete.incluyeBoleto && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-secondary">
                <Plane size={13} className="shrink-0" /> Boleto Aéreo Incluido
                {paquete.descripcionBoleto && (
                  <span className="text-primary/40 font-semibold">— {paquete.descripcionBoleto}</span>
                )}
              </span>
            )}
          </div>

          <div
            className={`grid grid-cols-1 gap-4 ${
              destinosView.length === 1
                ? ""
                : destinosView.length === 2
                ? "lg:grid-cols-2"
                : "lg:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {destinosView.map((d) => (
              <div key={d.id} className="bg-light rounded-2xl p-4">
                <p className="text-[11px] font-black text-primary uppercase mb-3 flex items-center gap-1.5">
                  <MapPin size={11} className="text-secondary" /> {d.ciudad}
                </p>
                {d.actividades.length > 0 || d.traslados.length > 0 ? (
                  <ul className="text-[11px] font-semibold text-primary/60 space-y-1">
                    {d.actividades.map((a) => <li key={`act-${a.id}`}>✓ {a.nombre}</li>)}
                    {d.traslados.map((t) => <li key={`trs-${t.id}`}>✓ {t.tipo}</li>)}
                  </ul>
                ) : (
                  <p className="text-[10px] font-semibold text-primary/30">Sin servicios adicionales</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variantes disponibles */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Variantes Disponibles</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr gap-3">
            {variantCards.map((v) => {
              const price = v.mixed ? computeBaseVariantCombo(paquete)?.precioAdulto ?? null : computeVariantPrice(paquete, v.tipoPax, v.numPax);
              const key = `${v.tipoPax}-${v.numPax}`;
              return (
                <div key={key} className={`bg-light rounded-xl p-3 border-t-4 ${TIPO_PAX_COLOR[v.tipoPax] ?? "border-t-secondary"}`}>
                  <p className="text-xs font-black text-primary mb-1.5">{v.mixed ? "BASE" : v.tipoPax}</p>
                  {price != null ? (
                    <>
                      <span className="text-[7px] font-black uppercase text-gray-400 block leading-none">Desde</span>
                      <span className="text-sm font-black text-primary">${Math.round(price)} <span className="text-[8px] font-bold text-primary/40">USD/pax</span></span>
                    </>
                  ) : (
                    <p className="text-[9px] font-bold text-primary/40">Sin hoteles</p>
                  )}
                  <button
                    onClick={() => runQuickQuote(key, v.numPax, paquete.numNinos, v.mixed)}
                    disabled={quickQuoteBusy !== null || price == null}
                    className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary disabled:opacity-40 disabled:cursor-not-allowed font-black text-[8px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    {quickQuoteBusy === key ? <Loader2 size={10} className="animate-spin" /> : <Star size={10} />}
                    Cotización rápida
                  </button>
                </div>
              );
            })}
            {pkgAllowsNinos && (() => {
              const childPrice = computeChildFromPrice(paquete, variantCards);
              return (
                <div className="bg-light rounded-xl p-3 border-t-4 border-t-rose-300">
                  <p className="text-xs font-black text-primary mb-1.5">CHD</p>
                  {childPrice != null ? (
                    <>
                      <span className="text-[7px] font-black uppercase text-gray-400 block leading-none">Desde</span>
                      <span className="text-sm font-black text-primary">${Math.round(childPrice)} <span className="text-[8px] font-bold text-primary/40">USD/pax</span></span>
                    </>
                  ) : (
                    <p className="text-[9px] font-bold text-primary/40">Sin hoteles</p>
                  )}
                  <p className="mt-2 text-[8px] font-bold text-primary/40 text-center leading-tight">Informativo — sin variante propia</p>
                </div>
              );
            })()}
          </div>
        </div>

        {quickQuoteError && (
          <p className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2.5 mb-4">
            {quickQuoteError}
          </p>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCotizarCompleto}
            className="flex-1 px-5 py-3.5 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Cotizar este paquete
          </button>
          <button
            onClick={() => runQuickQuote(baseVariantKey, paquete.numPax, paquete.numNinos, baseIsMixed)}
            disabled={quickQuoteBusy !== null}
            className="group flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white hover:bg-secondary/5 disabled:opacity-40 disabled:cursor-not-allowed text-secondary font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-secondary/25 hover:border-secondary/40 transition-all active:scale-95 cursor-pointer"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors shrink-0">
              {quickQuoteBusy === baseVariantKey ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Star size={12} className="fill-secondary" />
              )}
            </span>
            <span>Cotización rápida</span>
          </button>
        </div>

        {/* Itinerario */}
        {paquete.itinerario.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mt-6">
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
      </div>
    </div>
  );
}

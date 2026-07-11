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

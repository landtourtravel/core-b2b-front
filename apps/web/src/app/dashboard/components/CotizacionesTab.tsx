"use client";
import React from "react";
import {
  Search,
  Eye,
  Star,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { COTIZACION_STATUS_LABEL, resumenPasajeros } from "@land-tour/shared";
import type { CotizacionStatus } from "@land-tour/shared";
import { useDashboard, type CotizacionExtended } from "../DashboardContext";

// Status style maps (must be at file scope for Tailwind scanning)
const STATUS_BADGE: Record<CotizacionStatus, string> = {
  BORRADOR:  "bg-sky-50 text-sky-600",
  ENVIADA:   "bg-amber-50 text-amber-600",
  APROBADA:  "bg-emerald-50 text-emerald-600",
  RECHAZADA: "bg-rose-50 text-rose-600",
};
const STATUS_DOT: Record<CotizacionStatus, string> = {
  BORRADOR:  "bg-sky-500",
  ENVIADA:   "bg-amber-500",
  APROBADA:  "bg-emerald-500",
  RECHAZADA: "bg-rose-500",
};

interface CotizacionesTabProps {
  onPreviewCot: (cot: CotizacionExtended) => void;
  onOpenFinalize: (id: string) => void;
  onOpenDelete: (id: string) => void;
}

export default function CotizacionesTab({
  onPreviewCot,
  onOpenFinalize,
  onOpenDelete,
}: CotizacionesTabProps) {
  const { cotizaciones, isLoadingCots, userName, patchCotizacionStatus } = useDashboard();

  const handleAprobar  = (id: string) => patchCotizacionStatus(id, "APROBADA");
  const handleRechazar = (id: string) => patchCotizacionStatus(id, "RECHAZADA");

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fade-scale">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-4">
        <h3 className="text-xs font-black text-primary uppercase tracking-widest">Listado de Cotizaciones Generadas</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary/40"><Search size={12} /></span>
            <input type="text" placeholder="Buscar por código, cliente..." className="pl-8 pr-4 py-2 bg-light border border-lighter rounded-xl text-xs font-bold placeholder-primary/30 outline-none w-full md:w-56" />
          </div>
          <select className="px-3 py-2 bg-light border border-lighter rounded-xl text-xs font-bold text-primary/60 outline-none cursor-pointer">
            <option>Todos los estados</option>
          </select>
        </div>
      </div>

      {/* ── Vista de tarjetas (solo móvil) ── */}
      <div className="sm:hidden space-y-3">
        {isLoadingCots ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
          </div>
        ) : cotizaciones.length === 0 ? (
          <div className="text-center py-10 text-primary/40 text-xs font-bold">Sin cotizaciones registradas.</div>
        ) : cotizaciones.map((cot) => {
          const ext = cot as CotizacionExtended;
          return (
            <div key={cot.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-secondary block">{cot.codigo}</span>
                  <span className="text-sm font-black text-primary block mt-0.5 truncate">{cot.cliente?.nombre || "—"}</span>
                  <span className="text-[11px] font-bold text-primary/50 block mt-0.5 truncate">
                    {cot.paqueteNombre}{cot.fechaViaje ? ` · ${cot.fechaViaje}` : ""}
                  </span>
                </div>
                <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg tracking-wider flex items-center gap-1.5 shrink-0 ${STATUS_BADGE[cot.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
                  {COTIZACION_STATUS_LABEL[cot.status]}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-lg font-black text-primary">${cot.total.toLocaleString()} <span className="text-[10px] font-bold text-primary/40">USD</span></span>
                <div className="flex gap-2">
                  <button onClick={() => onPreviewCot(cot as CotizacionExtended)} aria-label={`Ver cotización ${cot.codigo}`} className="p-2 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-xl border border-lighter transition-all cursor-pointer" title="Previsualizar"><Eye size={14} /></button>
                  {cot.status === "BORRADOR" && !!ext.hotelsComparison?.length && (
                    <button onClick={() => onOpenFinalize(cot.id)} aria-label={`Finalizar cotización ${cot.codigo}`} className="p-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary rounded-xl border border-secondary/20 transition-all cursor-pointer"><Star size={14} /></button>
                  )}
                  {(cot.status === "ENVIADA" || cot.status === "BORRADOR") && (
                    <>
                      <button onClick={() => handleAprobar(cot.id)} className="p-2 bg-light hover:bg-emerald-50 text-primary hover:text-emerald-600 rounded-xl border border-lighter transition-all cursor-pointer"><Check size={14} /></button>
                      <button onClick={() => handleRechazar(cot.id)} className="p-2 bg-light hover:bg-rose-50 text-primary hover:text-rose-600 rounded-xl border border-lighter transition-all cursor-pointer"><X size={14} /></button>
                    </>
                  )}
                  {(cot.status === "BORRADOR" || cot.status === "RECHAZADA") && (
                    <button onClick={() => onOpenDelete(cot.id)} aria-label={`Eliminar cotización ${cot.codigo}`} className="p-2 bg-light hover:bg-rose-50 text-primary/40 hover:text-rose-500 rounded-xl border border-lighter transition-all cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Vista de tabla (sm y arriba) ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-gray-100">
              {["Código","Cliente","Programa","Fechas","Pax","Total","Creación","Estado","Acciones"].map((h) => (
                <th key={h} className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/80">
            {cotizaciones.map((cot) => {
              const ext = cot as CotizacionExtended;
              const hasComparison = !!ext.hotelsComparison?.length;
              return (
                <tr key={cot.id} className="hover:bg-light/40 transition-colors">
                  <td className="py-4">
                    <span className="font-black text-secondary block">{cot.codigo}</span>
                    <span className="text-[9px] text-gray-400 font-bold block mt-0.5">
                      {hasComparison ? `${ext.hotelsComparison!.length} hotel(es)` : `Por ${userName}`}
                    </span>
                  </td>
                  <td className="py-4 font-black">{cot.cliente?.nombre || "—"}</td>
                  <td className="py-4 text-primary/60 max-w-[140px] truncate">{cot.paqueteNombre}</td>
                  <td className="py-4">{cot.fechaViaje || "—"}</td>
                  <td className="py-4">{resumenPasajeros(cot.pasajeros)}</td>
                  <td className="py-4 font-black">${cot.total.toLocaleString()}</td>
                  <td className="py-4 text-gray-400">{cot.fechaCreacion}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 w-fit ${STATUS_BADGE[cot.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
                      {COTIZACION_STATUS_LABEL[cot.status]}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => onPreviewCot(cot as CotizacionExtended)} aria-label={`Ver cotización ${cot.codigo}`} className="p-1.5 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-lg border border-lighter transition-all cursor-pointer" title="Previsualizar"><Eye size={12} /></button>

                      {/* Generar Cotización Final — BORRADOR with hotelsComparison */}
                      {cot.status === "BORRADOR" && hasComparison && (
                        <button
                          onClick={() => onOpenFinalize(cot.id)}
                          aria-label={`Finalizar cotización ${cot.codigo}`}
                          className="p-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary rounded-lg border border-secondary/20 transition-all cursor-pointer"
                          title="Generar Cotización Final"
                        >
                          <Star size={12} />
                        </button>
                      )}

                      {(cot.status === "ENVIADA" || cot.status === "BORRADOR") && (
                        <>
                          <button onClick={() => handleAprobar(cot.id)} className="p-1.5 bg-light hover:bg-emerald-50 text-primary hover:text-emerald-600 rounded-lg border border-lighter transition-all cursor-pointer" title="Aprobar"><Check size={12} /></button>
                          <button onClick={() => handleRechazar(cot.id)} className="p-1.5 bg-light hover:bg-rose-50 text-primary hover:text-rose-600 rounded-lg border border-lighter transition-all cursor-pointer" title="Rechazar"><X size={12} /></button>
                        </>
                      )}
                      {cot.status === "APROBADA" && (
                        <button className="p-1.5 bg-light text-primary/40 rounded-lg border border-lighter cursor-not-allowed" title="Aprobada"><Check size={12} className="text-emerald-500" /></button>
                      )}
                      {cot.status === "RECHAZADA" && (
                        <button className="p-1.5 bg-light text-primary/40 rounded-lg border border-lighter cursor-not-allowed" title="Rechazada"><X size={12} className="text-rose-400" /></button>
                      )}
                      {(cot.status === "BORRADOR" || cot.status === "RECHAZADA") && (
                        <button onClick={() => onOpenDelete(cot.id)} aria-label={`Eliminar cotización ${cot.codigo}`} className="p-1.5 bg-light hover:bg-rose-50 text-primary/40 hover:text-rose-500 rounded-lg border border-lighter transition-all cursor-pointer" title="Eliminar"><Trash2 size={12} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

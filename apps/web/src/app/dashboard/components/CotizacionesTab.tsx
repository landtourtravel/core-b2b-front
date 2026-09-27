"use client";
import React from "react";
import { Search, Eye, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { COTIZACION_STATUS_LABEL, resumenPasajeros } from "@land-tour/shared";
import type { CotizacionStatus } from "@land-tour/shared";
import { useDashboard, type CotizacionExtended } from "../DashboardContext";
import { Skeleton } from "@/components/Skeleton";
import { GENERIC_CLIENT_EMAIL, OPTIMISTIC_COT_ID_PREFIX } from "@/lib/constants";

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

/** cot.fechaViaje llega en formato ISO (YYYY-MM-DD) desde la API — se muestra día/mes/año. */
const fmtDate = (s: string | null | undefined): string => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return d && m && y ? `${d}/${m}/${y}` : s;
};

interface CotizacionesTabProps {
  onViewCot: (cot: CotizacionExtended) => void;
  onEditCot: (id: string) => void;
  onOpenDelete: (id: string) => void;
}

const PAGE_SIZE = 20;

export default function CotizacionesTab({ onViewCot, onEditCot, onOpenDelete }: CotizacionesTabProps) {
  const { cotizaciones, isLoadingCots, userName } = useDashboard();

  // Paginación — 20 por página, compartida por la vista de tarjetas (móvil) y la de tabla.
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(cotizaciones.length / PAGE_SIZE));
  // La lista puede acortarse (borrado, refetch) y dejar la página actual fuera de rango.
  const currentPage = Math.min(page, totalPages);
  React.useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [page, currentPage]);
  const firstIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = cotizaciones.slice(firstIdx, firstIdx + PAGE_SIZE);
  // Ventana de números alrededor de la página actual (evita listar 50 botones).
  const pageNumbers = (() => {
    const around = 1;
    const shown = new Set<number>([1, totalPages]);
    for (let p = currentPage - around; p <= currentPage + around; p++) {
      if (p >= 1 && p <= totalPages) shown.add(p);
    }
    const sorted = [...shown].sort((a, b) => a - b);
    const out: (number | "gap")[] = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
      out.push(p);
    });
    return out;
  })();

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
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2.5 w-40" />
                </div>
                <Skeleton className="h-5 w-20 rounded-lg shrink-0" />
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-xl" />
                  <Skeleton className="w-8 h-8 rounded-xl" />
                </div>
              </div>
            </div>
          ))
        ) : cotizaciones.length === 0 ? (
          <div className="text-center py-10 text-primary/40 text-xs font-bold">Sin cotizaciones registradas.</div>
        ) : pageItems.map((cot) => {
          // Fila recién creada, update optimista: el guardado real en el servidor sigue en
          // curso y este id temporal todavía no existe en la BD — navegar con él da "No
          // encontrada". Se deshabilitan las acciones hasta que el id real lo reemplace.
          const isSaving = cot.id.startsWith(OPTIMISTIC_COT_ID_PREFIX);
          return (
          <div key={cot.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-black text-secondary block">{cot.codigo}</span>
                <span className="text-sm font-black text-primary block mt-0.5 truncate">{cot.cliente?.nombre || "—"}</span>
                <span className="text-[11px] font-bold text-primary/50 block mt-0.5 truncate">
                  {cot.paqueteNombre}{cot.fechaViaje ? ` · ${fmtDate(cot.fechaViaje)}` : ""}
                </span>
              </div>
              <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg tracking-wider flex items-center gap-1.5 shrink-0 ${STATUS_BADGE[cot.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
                {COTIZACION_STATUS_LABEL[cot.status]}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
              <span className="text-lg font-black text-primary">${cot.total.toLocaleString()} <span className="text-[10px] font-bold text-primary/40">USD</span></span>
              {isSaving ? (
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-primary/40">
                  <div className="w-3 h-3 border-2 border-primary/20 border-t-primary/50 rounded-full animate-spin" /> Guardando...
                </span>
              ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onViewCot(cot as CotizacionExtended)}
                  aria-label={`Ver cotización ${cot.codigo}`}
                  className="p-2 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-xl border border-lighter transition-all cursor-pointer"
                  title="Ver detalles"
                >
                  <Eye size={14} />
                </button>
                {cot.status === "BORRADOR" && (
                  <button
                    onClick={() => onEditCot(cot.id)}
                    aria-label={`${cot.cliente?.email === GENERIC_CLIENT_EMAIL ? "Cotizar" : "Editar"} cotización ${cot.codigo}`}
                    className="p-2 bg-light hover:bg-sky-50 text-primary hover:text-sky-600 rounded-xl border border-lighter transition-all cursor-pointer"
                    title={cot.cliente?.email === GENERIC_CLIENT_EMAIL ? "Cotizar" : "Editar"}
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {(cot.status === "BORRADOR" || cot.status === "RECHAZADA") && (
                  <button
                    onClick={() => onOpenDelete(cot.id)}
                    aria-label={`Eliminar cotización ${cot.codigo}`}
                    className="p-2 bg-light hover:bg-rose-50 text-primary/40 hover:text-rose-500 rounded-xl border border-lighter transition-all cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* ── Vista de tabla (sm y arriba) ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100">
              {["Código","Cliente","Programa","Fechas","Pax","Total","Creación","Estado","Acciones"].map((h) => (
                <th key={h} className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/80">
            {isLoadingCots ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <td key={j} className="py-4"><Skeleton className="h-3.5 w-full max-w-[90px]" /></td>
                  ))}
                </tr>
              ))
            ) : cotizaciones.length === 0 ? (
              <tr><td colSpan={9} className="py-10 text-center text-primary/40 font-bold text-xs">Sin cotizaciones registradas.</td></tr>
            ) : pageItems.map((cot) => {
              // Fila recién creada, update optimista: el guardado real en el servidor sigue en
              // curso y este id temporal todavía no existe en la BD — navegar con él da "No
              // encontrada". Se deshabilitan las acciones hasta que el id real lo reemplace.
              const isSaving = cot.id.startsWith(OPTIMISTIC_COT_ID_PREFIX);
              return (
              <tr key={cot.id} className="hover:bg-light/40 transition-colors">
                <td className="py-4">
                  <span className="font-black text-secondary block">{cot.codigo}</span>
                  <span className="text-[9px] text-gray-400 font-bold block mt-0.5">Por {userName}</span>
                </td>
                <td className="py-4 font-black">{cot.cliente?.nombre || "—"}</td>
                <td className="py-4 text-primary/60 max-w-[140px] truncate">{cot.paqueteNombre}</td>
                <td className="py-4">{fmtDate(cot.fechaViaje) || "—"}</td>
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
                  {isSaving ? (
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-primary/40">
                      <div className="w-3 h-3 border-2 border-primary/20 border-t-primary/50 rounded-full animate-spin" /> Guardando...
                    </span>
                  ) : (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onViewCot(cot as CotizacionExtended)}
                      aria-label={`Ver cotización ${cot.codigo}`}
                      className="p-1.5 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-lg border border-lighter transition-all cursor-pointer"
                      title="Ver detalles"
                    >
                      <Eye size={12} />
                    </button>
                    {cot.status === "BORRADOR" && (
                      <button
                        onClick={() => onEditCot(cot.id)}
                        aria-label={`${cot.cliente?.email === GENERIC_CLIENT_EMAIL ? "Cotizar" : "Editar"} cotización ${cot.codigo}`}
                        className="p-1.5 bg-light hover:bg-sky-50 text-primary hover:text-sky-600 rounded-lg border border-lighter transition-all cursor-pointer"
                        title={cot.cliente?.email === GENERIC_CLIENT_EMAIL ? "Cotizar" : "Editar"}
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                    {(cot.status === "BORRADOR" || cot.status === "RECHAZADA") && (
                      <button
                        onClick={() => onOpenDelete(cot.id)}
                        aria-label={`Eliminar cotización ${cot.codigo}`}
                        className="p-1.5 bg-light hover:bg-rose-50 text-primary/40 hover:text-rose-500 rounded-lg border border-lighter transition-all cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Paginador (móvil y escritorio) ── */}
      {!isLoadingCots && cotizaciones.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 flex-wrap border-t border-gray-50 pt-4">
          <p className="text-[10px] font-bold text-primary/40">
            {firstIdx + 1}–{Math.min(firstIdx + PAGE_SIZE, cotizaciones.length)} de {cotizaciones.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
              className="p-2 bg-light text-primary rounded-xl border border-lighter transition-all hover:bg-secondary/15 hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Números solo en pantallas medianas hacia arriba */}
            <div className="hidden sm:flex items-center gap-1.5">
              {pageNumbers.map((p, i) =>
                p === "gap" ? (
                  <span key={`gap-${i}`} className="px-1 text-[10px] font-black text-primary/25">···</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-label={`Página ${p}`}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`min-w-8 h-8 px-2 text-[11px] font-black rounded-xl border transition-all cursor-pointer ${
                      p === currentPage
                        ? "bg-secondary text-white border-secondary"
                        : "bg-light text-primary/60 border-lighter hover:bg-secondary/15 hover:text-secondary"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            {/* En móvil, solo el indicador de página */}
            <span className="sm:hidden px-2 text-[10px] font-black text-primary/50">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Página siguiente"
              className="p-2 bg-light text-primary rounded-xl border border-lighter transition-all hover:bg-secondary/15 hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

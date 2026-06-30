"use client";
import React from "react";
import { FileText, CheckCircle2, X, Clock, Eye } from "lucide-react";
import { COTIZACION_STATUS_LABEL } from "@land-tour/shared";
import type { CotizacionStatus } from "@land-tour/shared";
import { useDashboard, type CotizacionExtended } from "../DashboardContext";

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

interface DashboardTabProps {
  onGoToCotizaciones: () => void;
  onViewCot: (cot: CotizacionExtended) => void;
}

export default function DashboardTab({ onGoToCotizaciones, onViewCot }: DashboardTabProps) {
  const { cotizaciones, kpiTotal, kpiAprobadas, kpiRechazadas, kpiPendientes } = useDashboard();

  return (
    <div className="space-y-8 animate-fade-scale">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { value: kpiTotal,      label: "Cotizaciones este mes",    change: "↑ 12%", trend: "up",   icon: <FileText size={16} /> },
          { value: kpiAprobadas,  label: "Cotizaciones aprobadas",   change: "↑ 8%",  trend: "up",   icon: <CheckCircle2 size={16} /> },
          { value: kpiRechazadas, label: "Cotizaciones canceladas",  change: "↓ 1%",  trend: "down", icon: <X size={16} /> },
          { value: kpiPendientes, label: "Pendientes de aprobación", change: "↓ 2%",  trend: "down", icon: <Clock size={16} /> },
        ].map((item, i) => (
          <div key={i} className="bg-white p-3 sm:p-6 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col justify-between gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.trend === "up" ? "bg-secondary/10 text-secondary" : "bg-red-50 text-red-500"}`}>
                {item.icon}
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-md tracking-wider ${item.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                {item.change}
              </span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">{item.value}</span>
              <span className="block text-[11px] font-bold text-primary/50 mt-1">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Últimas Cotizaciones
          </h3>
          <button
            onClick={onGoToCotizaciones}
            className="px-4 py-1.5 border border-gray-200 hover:border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
          >
            Ver todas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["Código","Cliente","Destino","Fecha","Total","Estado","Acción"].map((h) => (
                  <th key={h} className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/80">
              {cotizaciones.slice(0, 3).map((cot) => (
                <tr key={cot.id} className="hover:bg-light/40 transition-colors">
                  <td className="py-4"><span className="font-black text-secondary block">{cot.codigo}</span></td>
                  <td className="py-4 font-black">{cot.cliente?.nombre || "—"}</td>
                  <td className="py-4 text-primary/60 max-w-[140px] truncate">{cot.paqueteNombre}</td>
                  <td className="py-4">{cot.fechaViaje || "—"}</td>
                  <td className="py-4 font-black">${cot.total.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 w-fit ${STATUS_BADGE[cot.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
                      {COTIZACION_STATUS_LABEL[cot.status]}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => onViewCot(cot as CotizacionExtended)}
                      aria-label={`Ver cotización ${cot.codigo}`}
                      className="p-1.5 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-lg border border-lighter transition-all cursor-pointer"
                      title="Ver detalles"
                    >
                      <Eye size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  AlertCircle,
  Globe,
  MapPin,
  ChevronUp,
  ChevronDown,
  Clock,
  Plane,
  Plus,
} from "lucide-react";
import type { Package } from "@land-tour/shared";

interface PaquetesTabProps {
  packages: Package[];
  isLoadingPackages: boolean;
  packagesFetchError: "DB_FAIL" | "EMPTY" | null;
  onQuickQuote: (pkgId: string) => void;
}

export default function PaquetesTab({
  packages,
  isLoadingPackages,
  packagesFetchError,
  onQuickQuote,
}: PaquetesTabProps) {
  const [searchPkgTerm, setSearchPkgTerm] = useState("");
  const [activeDestino, setActiveDestino] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-scale">
      {/* ── Header con buscador ── */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Catálogo de Programas Turísticos
          </h3>
          <p className="text-[11px] text-primary/50 font-semibold mt-1">
            Selecciona un programa para cotizar al instante con tus comisiones.
          </p>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40"><Search size={14} /></span>
          <input
            type="text"
            placeholder="Buscar por destino o nombre..."
            value={searchPkgTerm}
            onChange={(e) => { setSearchPkgTerm(e.target.value); setActiveDestino(null); }}
            className="pl-9 pr-4 py-2.5 bg-light border border-lighter rounded-2xl text-xs font-bold placeholder-primary/30 outline-none w-full md:w-64 focus:border-secondary focus:bg-white transition-all"
          />
        </div>
      </div>
      {/* ── Estados: cargando / error / vacío ── */}
      {isLoadingPackages ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
          <p className="text-primary/50 font-bold text-xs">Cargando programas...</p>
        </div>
      ) : packagesFetchError === "DB_FAIL" ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle size={28} className="text-amber-400" />
          <p className="text-primary/60 font-bold text-xs">No pudimos cargar los paquetes en este momento. Por favor, recarga la página o inténtalo de nuevo más tarde.</p>
        </div>
      ) : packagesFetchError === "EMPTY" || packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Globe size={28} className="text-primary/20" />
          <p className="text-primary/50 font-bold text-xs">No hay paquetes disponibles en este momento.</p>
          <p className="text-primary/30 text-[10px]">Contacta al administrador para agregar paquetes al catálogo.</p>
        </div>
      ) : (() => {
        const pkgsFiltrados = packages.filter((pkg) => {
          if (!searchPkgTerm) return true;
          const matchTerm = searchPkgTerm.toLowerCase();
          const titleMatch = pkg.title.toLowerCase().includes(matchTerm);
          const locationMatch = `${pkg.location?.city || ""} ${pkg.location?.country || ""}`.toLowerCase().includes(matchTerm);
          const destinosMatch = pkg.destinos?.some(d =>
            d.ciudad.toLowerCase().includes(matchTerm) ||
            d.pais.toLowerCase().includes(matchTerm)
          );
          return titleMatch || locationMatch || destinosMatch;
        });
        const byDestino = pkgsFiltrados.reduce<Record<string, { pais: string; pkgs: typeof pkgsFiltrados }>>((acc, pkg) => {
          const processDestino = (ciudad: string, pais: string) => {
            if (!acc[ciudad]) acc[ciudad] = { pais, pkgs: [] };
            if (!acc[ciudad].pkgs.some(p => p.id === pkg.id)) {
              acc[ciudad].pkgs.push(pkg);
            }
          };
          if (pkg.destinos && pkg.destinos.length > 0) {
            pkg.destinos.forEach(d => processDestino(d.ciudad, d.pais));
          } else {
            processDestino(pkg.location?.city || "Sin destino", pkg.location?.country || "");
          }
          return acc;
        }, {});
        const destinos = Object.keys(byDestino).sort();
        if (destinos.length === 0) {
          return (
            <div className="py-16 text-center text-primary/40 font-bold text-xs">
              No se encontraron paquetes para &quot;{searchPkgTerm}&quot;
            </div>
          );
        }
        return (
          <div className="space-y-3">
            {destinos.map((ciudad) => {
              const { pais, pkgs } = byDestino[ciudad];
              const isOpen = activeDestino === ciudad;
              return (
                <div key={ciudad} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* ── Cabecera del destino (acordeón) ── */}
                  <button
                    onClick={() => setActiveDestino(isOpen ? null : ciudad)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-light/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-secondary" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-primary group-hover:text-secondary transition-colors">{ciudad}</span>
                        <span className="text-[10px] font-bold text-primary/40 ml-2">{pais}</span>
                      </div>
                      <span className="ml-2 px-2 py-0.5 bg-secondary/10 text-secondary text-[9px] font-black rounded-md">
                        {pkgs.length} {pkgs.length === 1 ? "programa" : "programas"}
                      </span>
                    </div>
                    {isOpen
                      ? <ChevronUp size={16} className="text-primary/40 shrink-0" />
                      : <ChevronDown size={16} className="text-primary/40 shrink-0" />
                    }
                  </button>
                  {/* ── Lista de paquetes desplegable ── */}
                  {isOpen && (
                    <div className="border-t border-gray-50 divide-y divide-gray-50">
                      {pkgs.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-light/40 transition-colors group/row"
                        >
                          {/* Miniatura */}
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                            <Image
                              src={pkg.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80"}
                              alt={pkg.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/row:scale-105"
                            />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-primary leading-tight line-clamp-1 group-hover/row:text-secondary transition-colors">
                              {pkg.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-primary/40">
                                <Clock size={9} /> {pkg.duration || `${pkg.diasEstancia}d / ${pkg.nochesBase}n`}
                              </span>
                              {pkg.flightIncluded && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-secondary">
                                  <Plane size={9} /> Vuelo incluido
                                </span>
                              )}
                            </div>
                            {pkg.includes && pkg.includes.length > 0 && (
                              <p className="text-[10px] font-medium text-primary/35 mt-1 line-clamp-1">
                                Incluye: {pkg.includes.slice(0, 3).join(" · ")}
                                {pkg.includes.length > 3 && ` y ${pkg.includes.length - 3} más`}
                              </p>
                            )}
                          </div>
                          {/* Precio + Botón */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-[8px] font-black uppercase text-gray-400 block leading-none">Desde</span>
                              <span className="text-sm font-black text-primary">${pkg.price} <span className="text-[9px] font-bold text-primary/40">USD</span></span>
                            </div>
                            <button
                              onClick={() => onQuickQuote(String(pkg.id))}
                              className="px-3.5 py-2 bg-secondary hover:bg-secondary-light text-primary font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <Plus size={10} className="stroke-[2.5]" /> Cotizar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

"use client";

import React from "react";
import {
  MapPin,
  Clock,
  Plane,
  Train,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

import { Package } from "@land-tour/shared";

export interface PackageCardProps extends Partial<Package> {
  onClick?: () => void;
  currency?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PackageCard: React.FC<PackageCardProps> = ({
  title = "Paquete Turístico",
  price = 0,
  duration = "Consultar",
  location,
  category,
  image,
  flightIncluded = true,
  incluyeBoleto,
  isMultiDestino = false,
  destinos,
  transport,
  currency = "USD",
  onClick,
}) => {
  const fallbackImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80`;

  // Format location string — en multi-destino concatena las ciudades.
  const locationLabel = isMultiDestino && destinos?.length
    ? destinos.map((d) => d.ciudad).join(" · ")
    : typeof location === 'string'
      ? location
      : location
        ? `${location.city}, ${location.country}`
        : "Destino variado";

  return (
    <article
      className="
        group relative bg-white rounded-[20px] overflow-hidden
        shadow-[0_4px_24px_rgba(0,0,0,0.08)]
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.14)]
        hover:-translate-y-1.5
        transition-all duration-300 ease-out
        border border-gray-100
        flex flex-col h-full
      "
    >
      {/* ── Image — height fija para uniformidad ── */}
      <div className="relative h-40 sm:h-52 shrink-0 overflow-hidden">
        <img
          src={image || fallbackImage}
          alt={`Paquete ${title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* ── Body ── */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1">

        {/* Location tag */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <MapPin size={13} className="text-secondary shrink-0" />
          <span className="text-secondary text-xs font-semibold tracking-wide">
            {locationLabel}
          </span>
          {isMultiDestino && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/15 text-gold border border-gold/30 text-[9px] font-black uppercase tracking-wider rounded-md">
              <MapPin size={8} />
              Multi-destino
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-primary font-bold text-sm sm:text-[17px] leading-snug mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-0">
          {title}
        </h3>

        {/* Quick details */}
        <div className="space-y-1.5 sm:space-y-2 mb-4">
          {/* Row 1: duration + flight */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 text-[13px] text-primary/70">
              <Clock size={13} className="text-primary/50 shrink-0" />
              {duration}
            </span>
            {/* Boleto: usa el campo real `incluyeBoleto`; cae a `flightIncluded`
                cuando no está definido. Si ambos son undefined no se muestra nada. */}
            {(incluyeBoleto ?? flightIncluded) === true && (
              <span className="flex items-center gap-1.5 text-[13px] text-primary/70">
                <Plane size={13} className="text-primary/50 shrink-0" />
                Vuelo incluido
              </span>
            )}
            {(incluyeBoleto ?? flightIncluded) === false && (
              <span className="flex items-center gap-1.5 text-[11px] text-amber-600/80">
                <Plane size={12} className="text-amber-500/70 shrink-0" />
                Sin boleto incluido
              </span>
            )}
          </div>

          {/* Row 2: extra transport */}
          {transport && (
            <span className="flex items-center gap-1.5 text-[13px] text-primary/70">
              <Train size={13} className="text-primary/50 shrink-0" />
              {transport}
            </span>
          )}
        </div>

        {/* Separator */}
        <hr className="border-gray-100 mb-4" />

        {/* Footer: price + CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 mt-auto">
          {/* Price block */}
          <div className="leading-none">
            <p className="text-[11px] text-primary/50 font-medium mb-0.5">Desde</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-primary">
                ${price.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-primary/50 font-medium mt-0.5">
              {currency}/persona
            </p>
          </div>

          {/* CTA button — pill dark */}
          <button
            onClick={onClick}
            className="
              flex items-center justify-center gap-2
              bg-primary-dark hover:bg-primary
              text-white text-sm font-semibold
              px-5 py-2.5 rounded-full
              transition-all duration-200 active:scale-95
              shadow-sm hover:shadow-md
              whitespace-nowrap group/btn shrink-0
              w-full sm:w-auto
            "
          >
            Ver más
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </article>
  );
};

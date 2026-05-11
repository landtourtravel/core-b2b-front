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

export interface PackageCardProps {
  title: string;
  price: number;
  duration: string;
  location: string;
  category: string;
  image?: string;
  flightIncluded?: boolean;
  transport?: string; // ej. "Tren incluido"
  currency?: string;  // default "USD"
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PackageCard: React.FC<PackageCardProps> = ({
  title,
  price,
  duration,
  location,
  category,
  image,
  flightIncluded = true,
  transport,
  currency = "USD",
}) => {
  const fallbackImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80`;

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
      <div className="relative h-52 flex-shrink-0 overflow-hidden">
        <img
          src={image ?? fallbackImage}
          alt={`Paquete ${title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Location tag */}
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={13} className="text-secondary flex-shrink-0" />
          <span className="text-secondary text-xs font-semibold tracking-wide">
            {location}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-primary font-bold text-base sm:text-[17px] leading-snug mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Quick details */}
        <div className="space-y-2 mb-4">
          {/* Row 1: duration + flight */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[13px] text-primary/70">
              <Clock size={13} className="text-primary/50 flex-shrink-0" />
              {duration}
            </span>
            {flightIncluded && (
              <span className="flex items-center gap-1.5 text-[13px] text-primary/70">
                <Plane size={13} className="text-primary/50 flex-shrink-0" />
                Vuelo incluido
              </span>
            )}
          </div>

          {/* Row 2: extra transport */}
          {transport && (
            <span className="flex items-center gap-1.5 text-[13px] text-primary/70">
              <Train size={13} className="text-primary/50 flex-shrink-0" />
              {transport}
            </span>
          )}
        </div>

        {/* Separator */}
        <hr className="border-gray-100 mb-4" />

        {/* Footer: price + CTA */}
        <div className="flex items-end justify-between gap-3 mt-auto">
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
            className="
              flex items-center gap-2
              bg-primary-dark hover:bg-primary
              text-white text-sm font-semibold
              px-5 py-2.5 rounded-full
              transition-all duration-200 active:scale-95
              shadow-sm hover:shadow-md
              whitespace-nowrap group/btn flex-shrink-0
            "
          >
            Cotizar
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

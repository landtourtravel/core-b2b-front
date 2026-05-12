"use client";

import React, { useState } from "react";
import { X, MapPin, ArrowRight, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Destination {
  id: number;
  name: string;
  country: string;
  tagline: string;
  description: string;
  image: string;
  highlights: string[];
  packageCount: number;
  color: string; // overlay gradient accent
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: "Cancún",
    country: "México",
    tagline: "Mar turquesa sin límites",
    description:
      "Sumérgete en las aguas cristalinas del Caribe mexicano. Cancún combina playas paradisíacas, ruinas mayas milenarias y una vida nocturna vibrante que lo convierte en uno de los destinos más codiciados de Latinoamérica.",
    image: "https://placehold.co/800x1200/0B4339/FFFFFF?text=Cancún",
    highlights: ["Zona Hotelera de clase mundial", "Ruinas de Chichén Itzá", "Snorkel en arrecifes de coral"],
    packageCount: 8,
    color: "from-cyan-900/80",
  },
  {
    id: 2,
    name: "París",
    country: "Francia",
    tagline: "La ciudad que siempre enamora",
    description:
      "La capital de la luz te espera con su inigualable Torre Eiffel, museos de talla mundial como el Louvre y una gastronomía que es puro arte. Cada rincón de París es una postal de ensueño que quedará grabada en tu memoria.",
    image: "https://placehold.co/800x1200/052924/FFFFFF?text=París",
    highlights: ["Torre Eiffel y Campos Elíseos", "Museo del Louvre", "Crucero por el río Sena"],
    packageCount: 5,
    color: "from-indigo-900/80",
  },
  {
    id: 3,
    name: "Machu Picchu",
    country: "Perú",
    tagline: "La ciudad perdida de los Incas",
    description:
      "Una de las siete maravillas del mundo moderno te espera entre las nubes andinas. Machu Picchu es una experiencia espiritual única: caminar por sus terrazas milenarias es conectar con la grandeza de una civilización extraordinaria.",
    image: "https://placehold.co/800x1200/156B5A/FFFFFF?text=Machu+Picchu",
    highlights: ["Ciudadela Inca en las nubes", "Camino Inca", "Valle Sagrado de los Incas"],
    packageCount: 6,
    color: "from-emerald-900/80",
  },
  {
    id: 4,
    name: "Santorini",
    country: "Grecia",
    tagline: "El azul más profundo del mundo",
    description:
      "Las icónicas cúpulas azules de Oia, los atardeceres que incendian el mar Egeo y los pueblos blancos colgados sobre los acantilados hacen de Santorini el escenario perfecto para una escapada romántica e inolvidable.",
    image: "https://placehold.co/800x1200/28BFA9/FFFFFF?text=Santorini",
    highlights: ["Atardeceres en Oia", "Playa de arena volcánica", "Cata de vinos locales"],
    packageCount: 4,
    color: "from-blue-900/80",
  },
  {
    id: 5,
    name: "Tokio",
    country: "Japón",
    tagline: "Tradición y futuro en perfecta armonía",
    description:
      "Una metrópolis que nunca duerme y que sorprende a cada paso: templos ancestrales junto a rascacielos luminosos, gastronomía de autor en cada esquina y una cultura de servicio sin igual. Tokio es un destino que cambia para siempre tu perspectiva del mundo.",
    image: "https://placehold.co/800x1200/C9A96E/FFFFFF?text=Tokio",
    highlights: ["Monte Fuji y templos Shinto", "Barrio de Shibuya y Akihabara", "Gastronomía japonesa auténtica"],
    packageCount: 3,
    color: "from-rose-900/80",
  },
];

// ─── Destination Modal ────────────────────────────────────────────────────────

interface ModalProps {
  destination: Destination | null;
  onClose: () => void;
}

const DestinationModal: React.FC<ModalProps> = ({ destination, onClose }) => {
  if (!destination) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${destination.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card — slide up on mobile, centered on desktop */}
      <div className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 animate-slide-up sm:animate-fade-scale">
        {/* Hero image */}
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>

          {/* Country badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
              <MapPin size={12} />
              {destination.country}
            </span>
          </div>

          {/* Destination name on image */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <h2 className="text-white text-2xl sm:text-3xl font-extrabold drop-shadow-lg">
              {destination.name}
            </h2>
            <p className="text-white/80 text-sm font-medium mt-0.5">{destination.tagline}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          <p className="text-primary/70 text-sm sm:text-base leading-relaxed mb-6">
            {destination.description}
          </p>

          {/* Highlights */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
              Lo que no puedes perderte
            </h3>
            <ul className="space-y-2">
              {destination.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-primary/80">
                  <span className="w-5 h-5 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0">
                    <ChevronRight size={11} className="text-secondary" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Packages count + CTA */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-between pt-4 border-t border-lighter">
            <p className="text-primary/50 text-sm">
              <span className="text-primary font-bold text-base">{destination.packageCount}</span>{" "}
              paquetes disponibles para este destino
            </p>

            <button
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light active:scale-95 text-white font-semibold text-sm px-6 py-3 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg group"
              onClick={onClose}
            >
              Ver paquetes disponibles
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Expandable Card (Desktop) ────────────────────────────────────────────────

interface CardProps {
  destination: Destination;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onOpen: () => void;
}

const DestinationCard: React.FC<CardProps> = ({
  destination,
  isHovered,
  onHover,
  onLeave,
  onOpen,
}) => {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={[
        "relative overflow-hidden rounded-3xl cursor-pointer",
        "transition-all duration-500 ease-in-out",
        // Flex basis — expanded vs collapsed
        isHovered ? "flex-[3]" : "flex-[1]",
        // Height fixed on desktop
        "h-[480px]",
      ].join(" ")}
    >
      {/* Background image */}
      <img
        src={destination.image}
        alt={destination.name}
        className={[
          "absolute inset-0 w-full h-full object-cover",
          "transition-transform duration-700 ease-in-out",
          isHovered ? "scale-110" : "scale-100",
        ].join(" ")}
      />

      {/* Gradient overlay */}
      <div
        className={[
          "absolute inset-0 transition-opacity duration-500",
          `bg-gradient-to-t ${destination.color} to-transparent`,
          isHovered ? "opacity-90" : "opacity-70",
        ].join(" ")}
      />

      {/* Collapsed state — vertical label */}
      <div
        className={[
          "absolute inset-0 flex items-end p-5 transition-opacity duration-300",
          isHovered ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
      >
        <div className="w-full">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
            {destination.country}
          </p>
          <h3 className="text-white font-extrabold text-xl leading-tight">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Expanded state — full info */}
      <div
        className={[
          "absolute inset-0 flex flex-col justify-end p-7 transition-all duration-400",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        ].join(" ")}
      >
        {/* Country pill */}
        <span className="flex items-center gap-1.5 w-fit bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30 mb-3">
          <MapPin size={11} />
          {destination.country}
        </span>

        <h3 className="text-white font-extrabold text-2xl leading-tight mb-1">
          {destination.name}
        </h3>
        <p className="text-white/80 text-sm font-medium mb-4">{destination.tagline}</p>

        {/* Package count */}
        <p className="text-white/60 text-xs mb-5">
          {destination.packageCount} paquetes disponibles
        </p>

        {/* CTA button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="w-full flex items-center justify-center gap-2 bg-white text-primary hover:bg-secondary hover:text-white font-bold text-sm py-3 px-5 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg group"
        >
          Ver más
          <ArrowRight
            size={15}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
};

// ─── Mobile Card ───────────────────────────────────────────────────────────────

interface MobileCardProps {
  destination: Destination;
  onOpen: () => void;
}

const MobileDestinationCard: React.FC<MobileCardProps> = ({ destination, onOpen }) => (
  <div className="relative overflow-hidden rounded-3xl h-52 w-full flex-shrink-0 snap-center">
    {/* Image */}
    <img
      src={destination.image}
      alt={destination.name}
      className="absolute inset-0 w-full h-full object-cover"
    />
    {/* Overlay */}
    <div
      className={`absolute inset-0 bg-gradient-to-t ${destination.color} to-transparent opacity-85`}
    />

    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-end p-5">
      <span className="flex items-center gap-1 w-fit text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-1">
        <MapPin size={9} />
        {destination.country}
      </span>
      <h3 className="text-white font-extrabold text-xl leading-tight mb-0.5">
        {destination.name}
      </h3>
      <p className="text-white/75 text-xs mb-4">{destination.tagline}</p>

      {/* Actions row */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpen}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white text-primary font-bold text-xs py-2.5 px-4 rounded-xl active:scale-95 transition-all shadow-md"
        >
          Ver más <ArrowRight size={12} />
        </button>
        <span className="text-white/60 text-[10px] whitespace-nowrap">
          {destination.packageCount} paquetes
        </span>
      </div>
    </div>
  </div>
);

// ─── Main Section ─────────────────────────────────────────────────────────────

export const DestinationsSection: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  return (
    <>
      <section
        id="destinos"
        className="py-20 sm:py-28 bg-light overflow-hidden"
        aria-labelledby="destinations-title"
      >
        <div className="container mx-auto px-4 sm:px-6">

          {/* ── Section header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-secondary/15 text-secondary text-xs font-bold rounded-lg mb-4 uppercase tracking-widest">
              Destinos Destacados
            </span>
            <h2
              id="destinations-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary leading-tight"
            >
              Lugares que{" "}
              <span className="relative">
                enamoran
                {/* Underline accent */}
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-secondary/40 rounded-full" />
              </span>
            </h2>
            <p className="mt-4 text-primary/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Explora los destinos más soñados del mundo. Pasa el cursor sobre cada tarjeta
              y déjate sorprender.
            </p>
          </motion.div>

          {/* ── Desktop: Expandable flex row ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex gap-3 h-[480px]"
          >
            {DESTINATIONS.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                isHovered={hoveredId === dest.id}
                onHover={() => setHoveredId(dest.id)}
                onLeave={() => setHoveredId(null)}
                onOpen={() => setSelectedDestination(dest)}
              />
            ))}
          </motion.div>

          {/* ── Mobile: Horizontal snap-scroll carousel ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:hidden -mx-4 px-4"
          >
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
              {DESTINATIONS.map((dest) => (
                <div key={dest.id} className="w-[80vw] flex-shrink-0 snap-center">
                  <MobileDestinationCard
                    destination={dest}
                    onOpen={() => setSelectedDestination(dest)}
                  />
                </div>
              ))}
            </div>
            {/* Scroll hint dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {DESTINATIONS.map((dest) => (
                <span key={dest.id} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Modal ── */}
      <DestinationModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
      />

      {/* ── Inline animation styles ── */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeScale {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .animate-slide-up  { animation: slideUp  0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-fade-scale { animation: fadeScale 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        /* Hide scrollbar while keeping scroll */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

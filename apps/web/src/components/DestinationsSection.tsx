"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, ArrowRight, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Destino } from "@land-tour/shared";
import { api } from "@/services/api";
import { AlertTriangle, MapPin as MapPinIcon } from "lucide-react";

// ─── Destination Modal ────────────────────────────────────────────────────────

interface ModalProps {
  destination: Destino | null;
  onClose: () => void;
}

const DestinationModal: React.FC<ModalProps> = ({ destination, onClose }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const modalContent = (
    <AnimatePresence>
      {destination && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle de ${destination.ciudad}`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto cursor-pointer"
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 pointer-events-auto"
          >
            {/* Hero image */}
            <div className="relative h-56 sm:h-72 overflow-hidden">
              <img
                src={destination.image}
                alt={destination.ciudad}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
                  <MapPin size={12} />
                  {destination.pais}
                </span>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <h2 className="text-white text-2xl sm:text-3xl font-extrabold drop-shadow-lg">
                  {destination.ciudad}
                </h2>
                {destination.tagline && <p className="text-white/80 text-sm font-medium mt-0.5">{destination.tagline}</p>}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-primary/70 text-sm sm:text-base leading-relaxed mb-6">
                {destination.description}
              </p>

              {destination.highlights && (
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
              )}

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-between pt-4 border-t border-lighter">
                <p className="text-primary/50 text-sm">
                  <span className="text-primary font-bold text-base">{destination.packageCount}</span>{" "}
                  paquetes disponibles para este destino
                </p>

                <button
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light active:scale-95 text-white font-semibold text-sm px-6 py-3 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg group"
                  onClick={() => {
                    onClose();
                    router.push(`/paquetes?destino=${encodeURIComponent(destination.ciudad)}`);
                  }}
                >
                  Ver paquetes disponibles
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// ─── Expandable Card (Desktop) ────────────────────────────────────────────────

interface CardProps {
  destination: Destino;
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
        "relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 ease-in-out",
        isHovered ? "flex-[3]" : "flex-[1]",
        "h-[480px]",
      ].join(" ")}
    >
      <img
        src={destination.image}
        alt={destination.ciudad}
        className={[
          "absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out",
          isHovered ? "scale-110" : "scale-100",
        ].join(" ")}
      />

      <div
        className={[
          "absolute inset-0 transition-opacity duration-500 bg-gradient-to-t",
          destination.color || "from-primary/80",
          "to-transparent",
          isHovered ? "opacity-90" : "opacity-70",
        ].join(" ")}
      />

      {/* Collapsed state */}
      <div
        className={[
          "absolute inset-0 flex items-end p-5 transition-opacity duration-300",
          isHovered ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
      >
        <div className="w-full">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
            {destination.pais}
          </p>
          <h3 className="text-white font-extrabold text-xl leading-tight">
            {destination.ciudad}
          </h3>
        </div>
      </div>

      {/* Expanded state */}
      <div
        className={[
          "absolute inset-0 flex flex-col justify-end p-7 transition-all duration-400",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        ].join(" ")}
      >
        <span className="flex items-center gap-1.5 w-fit bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30 mb-3">
          <MapPin size={11} />
          {destination.pais}
        </span>

        <h3 className="text-white font-extrabold text-2xl leading-tight mb-1">
          {destination.ciudad}
        </h3>
        <p className="text-white/80 text-sm font-medium mb-4">{destination.tagline}</p>

        <p className="text-white/60 text-xs mb-5">
          {destination.packageCount} paquetes disponibles
        </p>

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
  destination: Destino;
  onOpen: () => void;
}

const MobileDestinationCard: React.FC<MobileCardProps> = ({ destination, onOpen }) => (
  <div className="relative overflow-hidden rounded-3xl h-52 w-full flex-shrink-0 snap-center">
    <img
      src={destination.image}
      alt={destination.ciudad}
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div
      className={`absolute inset-0 bg-gradient-to-t ${destination.color || 'from-primary/80'} to-transparent opacity-85`}
    />

    <div className="absolute inset-0 flex flex-col justify-end p-5">
      <span className="flex items-center gap-1 w-fit text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-1">
        <MapPin size={9} />
        {destination.pais}
      </span>
      <h3 className="text-white font-extrabold text-xl leading-tight mb-0.5">
        {destination.ciudad}
      </h3>
      <p className="text-white/75 text-xs mb-4">{destination.tagline}</p>

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
  const [selectedDestination, setSelectedDestination] = useState<Destino | null>(null);
  const [destinations, setDestinations] = useState<Destino[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<"DB_FAIL" | "EMPTY" | null>(null);

  React.useEffect(() => {
    api.getDestinationsDetailed()
      .then(({ data, error }) => {
        setDestinations(data);
        setFetchError(error);
      })
      .catch(() => setFetchError("DB_FAIL"))
      .finally(() => setIsLoading(false));
  }, []);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (selectedDestination) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [selectedDestination]);

  if (isLoading) {
    return (
      <section className="py-20 bg-light flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
          <p className="text-primary/60 font-medium">Buscando destinos increíbles...</p>
        </div>
      </section>
    );
  }

  if (fetchError === "DB_FAIL") {
    return (
      <section className="py-20 bg-light flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertTriangle size={32} className="text-amber-400" />
          <p className="text-primary/60 font-semibold text-sm">Conexión a DB fallida — los destinos no están disponibles en este momento.</p>
        </div>
      </section>
    );
  }

  if (fetchError === "EMPTY" || destinations.length === 0) {
    return (
      <section className="py-20 bg-light flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <MapPinIcon size={32} className="text-primary/20" />
          <p className="text-primary/50 font-semibold text-sm">No hay destinos creados en la base de datos.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        id="destinos"
        className="py-20 sm:py-28 bg-light overflow-hidden"
        aria-labelledby="destinations-title"
      >
        <div className="container mx-auto px-4 sm:px-6">

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
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-secondary/40 rounded-full" />
              </span>
            </h2>
            <p className="mt-4 text-primary/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Explora los destinos más soñados del mundo. Pasa el cursor sobre cada tarjeta
              y déjate sorprender.
            </p>
          </motion.div>

          {/* Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex gap-3 h-[480px]"
          >
            {destinations.map((dest) => (
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

          {/* Mobile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:hidden -mx-4 px-4"
          >
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
              {destinations.map((dest) => (
                <div key={dest.id} className="w-[80vw] flex-shrink-0 snap-center">
                  <MobileDestinationCard
                    destination={dest}
                    onOpen={() => setSelectedDestination(dest)}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              {destinations.map((dest) => (
                <span key={dest.id} className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedDestination?.id === dest.id ? 'bg-secondary' : 'bg-primary/20'}`} />
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      <DestinationModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
      />
    </>
  );
};

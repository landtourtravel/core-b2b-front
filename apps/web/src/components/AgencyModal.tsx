"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, MessageCircle, Mail, Building2 } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const AGENCIES = [
  { id: 1, name: "Viajes Andina Tours",  city: "Guayaquil", phone: "593912345678", email: "ventas@andinatours.com"  },
  { id: 2, name: "Mundo Mágico Travel",  city: "Quito",     phone: "593987654321", email: "info@mundomagico.com"    },
  { id: 3, name: "Costa Sol Agencia",    city: "Cuenca",    phone: "593922334455", email: "reservas@costasol.com"   },
  { id: 4, name: "Tropical Vacations",   city: "Manta",     phone: "593933445566", email: "manta@tropical.com"      },
  { id: 5, name: "Paraíso Travel",       city: "Quito",     phone: "593944556677", email: "info@paraisotour.com"    },
  { id: 6, name: "Azul Marino Viajes",   city: "Guayaquil", phone: "593955667788", email: "ventas@azulmarino.com"   },
];

const CITIES = ["Todas", ...Array.from(new Set(AGENCIES.map((a) => a.city)))];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AgencyModal: React.FC<AgencyModalProps> = ({ isOpen, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeCity, setActiveCity] = useState("Todas");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
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
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const filtered =
    activeCity === "Todas" ? AGENCIES : AGENCIES.filter((a) => a.city === activeCity);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Agencias aliadas"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center">
                  <Building2 size={18} className="text-secondary" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-primary">Agencias Aliadas</h2>
                  <p className="text-[11px] text-primary/50 font-medium">Contacta con tu agencia más cercana</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-primary/50 hover:text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* City filter */}
            <div className="px-5 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-100 shrink-0">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeCity === city
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-primary/50 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Agency list */}
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {filtered.map((agency) => (
                <div
                  key={agency.id}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:border-secondary/20 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shrink-0">
                      {agency.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-primary">{agency.name}</h3>
                      <p className="flex items-center gap-1 text-[11px] text-primary/50 font-medium mt-0.5">
                        <MapPin size={10} className="text-secondary" /> {agency.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-[52px] sm:ml-0">
                    <a
                      href={`https://wa.me/${agency.phone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366]/10 text-[#25D366] text-[10px] font-bold rounded-xl hover:bg-[#25D366] hover:text-white transition-all"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                    <a
                      href={`mailto:${agency.email}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-[10px] font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                      <Mail size={13} /> Email
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
              <p className="text-[10px] text-primary/40 text-center font-medium">
                ¿No encuentras tu ciudad?{" "}
                <a
                  href="#contacto"
                  onClick={onClose}
                  className="text-secondary font-bold hover:underline"
                >
                  Contáctanos directamente
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

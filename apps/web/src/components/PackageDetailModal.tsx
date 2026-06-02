"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, Clock, Plane, CheckCircle, Calendar, Mail, Phone,
  MessageCircle, CreditCard, ChevronRight, ShieldCheck, AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { Package } from "@land-tour/shared";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ItineraryDay {
  day: number;
  date?: string;
  location?: string;
  title: string;
  description: string;
}

export interface PackageDetail extends Partial<Package> {
  dates?: string;
  airline?: string;
  reservationFee?: number;
  childPrice?: number;
  heroImage?: string;
  highlights?: string[];
  itinerary?: ItineraryDay[];
  notes?: string[];
}

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData?: PackageDetail | null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Agency = {
  id: string;
  nombre: string;
  correo: string | null;
  telefono: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  isOpen,
  onClose,
  packageData: incomingData,
}) => {
  const dialogRef    = useRef<HTMLDialogElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Resumen");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const packageData: PackageDetail = incomingData ?? {};

  const effectiveGallery = [
    packageData.image ?? packageData.heroImage,
    ...(packageData.gallery ?? []),
  ].filter((img, idx, arr): img is string => !!img && img !== "" && arr.indexOf(img) === idx).slice(0, 4);

  const [mainImage, setMainImage] = useState<string | undefined>(effectiveGallery[0]);
  const tabs = ["Resumen", "Itinerario", "Incluye", "Cotizar"];

  const locationLabel = packageData.location
    ? `${packageData.location.city}, ${packageData.location.country}`
    : "Destino variado";

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    fetch("/api/agencies")
      .then((res) => res.json())
      .then((data: Agency[]) => setAgencies(data))
      .catch(() => {});
  }, []);

  // Sync image when package changes
  useEffect(() => {
    const firstImg = effectiveGallery[0];
    if (firstImg) setMainImage(firstImg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageData.id]);

  // Open / close the native dialog — showModal() places it in the top layer,
  // which blocks ALL background interactions natively (no z-index required).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);

  // Handle Escape key via the native "cancel" event
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => { e.preventDefault(); onClose(); };
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [onClose]);

  // Close when clicking the backdrop (the dialog element itself, outside the card)
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog ref={dialogRef} onClick={handleDialogClick}>
      {/* Card — stopPropagation so backdrop click doesn't fire inside */}
      <div
        className="relative w-full max-w-4xl h-[90vh] max-h-[850px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Hero ── */}
        <div className="relative h-1/3 min-h-[240px] shrink-0 overflow-hidden group">
          {mainImage && (
            <Image
              src={mainImage}
              alt={packageData.title ?? ""}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-[110] p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all"
          >
            <X size={18} />
          </button>

          {/* Gallery thumbnails */}
          <div className="absolute top-4 left-6 flex flex-row gap-2 z-20">
            {effectiveGallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  mainImage === img
                    ? "border-secondary scale-110 shadow-lg"
                    : "border-white/20 opacity-60 hover:opacity-100 hover:scale-105"
                }`}
              >
                <Image src={img} alt="Thumbnail" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-1 w-full sm:w-auto">
              <div className="flex flex-wrap gap-2 mb-1.5 sm:mb-2">
                <span className="px-2 py-0.5 bg-secondary text-primary font-black text-[9px] uppercase rounded-md shadow-sm">
                  {packageData.duration}
                </span>
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white font-bold text-[9px] uppercase rounded-md border border-white/10">
                  Salida GYE
                </span>
              </div>
              <h2 className="text-white text-xl sm:text-2xl md:text-4xl font-black leading-tight tracking-tight max-w-[90%] sm:max-w-none">
                {packageData.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-[10px] sm:text-xs font-bold">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Calendar size={12} className="text-secondary" /> {packageData.dates}
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Plane size={12} className="text-secondary" /> {packageData.airline}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("Cotizar")}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-secondary hover:bg-secondary-light text-primary font-black text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(40,191,169,0.3)] active:scale-95"
            >
              <MessageCircle size={16} />
              Cotizar Ahora
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white border-b border-gray-100 px-6 shrink-0 z-30 overflow-x-auto scrollbar-hide">
          <div className="flex gap-8 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedAgency(null); }}
                className={`relative py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? "text-primary" : "text-gray-400 hover:text-primary/70"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-hidden bg-[#F9FBFA] p-6">
          <AnimatePresence mode="wait">
            <motion.div
              ref={scrollableRef}
              key={activeTab}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full overflow-y-auto scrollbar-hide"
            >
              {/* Resumen */}
              {activeTab === "Resumen" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 shrink-0">
                    {[
                      { label: "Destino",   value: locationLabel,                          icon: <MapPin      className="text-secondary" size={14} /> },
                      { label: "Duración",  value: packageData.duration ?? "",              icon: <Clock       className="text-secondary" size={14} /> },
                      ...(packageData.airline ? [{ label: "Aerolínea", value: packageData.airline, icon: <Plane className="text-secondary" size={14} /> }] : []),
                      { label: "Desde",     value: `$${packageData.price ?? 0} USD / pax`, icon: <CreditCard  className="text-secondary" size={14} /> },
                    ].map((item, i) => (
                      <div key={i} className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-0.5 sm:gap-1">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-tighter flex items-center gap-1">
                          {item.icon} {item.label}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-primary truncate leading-tight">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CheckCircle size={14} className="text-secondary" /> Lo más destacado
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                      {packageData.highlights?.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <div className="w-4 h-4 rounded bg-secondary/10 flex items-center justify-center mt-0.5 group-hover:bg-secondary/20 transition-colors">
                            <ChevronRight size={10} className="text-secondary" />
                          </div>
                          <span className="text-[13px] font-medium text-primary/70 leading-relaxed">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Itinerario */}
              {activeTab === "Itinerario" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Plan de viaje diario</h3>
                  {!packageData.actividades?.length && !packageData.traslados?.length ? (
                    <p className="text-sm text-gray-400 font-medium text-center py-8">No hay información de itinerario disponible.</p>
                  ) : (
                    <div className="space-y-4">
                      {packageData.traslados?.[0] && (
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                            <Plane size={14} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-primary">Traslado de llegada</h4>
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{packageData.traslados[0]}</p>
                          </div>
                        </div>
                      )}
                      {packageData.actividades?.map((act, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-md">
                            {i + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-primary">{act}</h4>
                          </div>
                        </div>
                      ))}
                      {(packageData.traslados?.length ?? 0) > 1 && (
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                            <Plane size={14} className="rotate-180" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-primary">Traslado de regreso</h4>
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{packageData.traslados![packageData.traslados!.length - 1]}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Incluye */}
              {activeTab === "Incluye" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldCheck size={14} /> Servicios Incluidos
                      </h3>
                      <div className="space-y-2.5">
                        {packageData.includes?.map((text, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle size={12} className="text-secondary mt-0.5 shrink-0" />
                            <span className="text-[11px] font-bold text-primary/70 leading-tight">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <X size={14} /> No incluye
                      </h3>
                      <div className="space-y-2.5">
                        {packageData.notIncludes?.map((text, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <X size={12} className="text-red-300 mt-0.5 shrink-0" />
                            <span className="text-[11px] font-bold text-primary/60 leading-tight">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <AlertCircle size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-amber-800 leading-snug">
                      <span className="font-black">NOTA IMPORTANTE:</span><br />
                      {packageData.notes?.map((n) => <span key={n}>{n}<br /></span>)}
                    </p>
                  </div>
                </div>
              )}

              {/* Cotizar */}
              {activeTab === "Cotizar" && (
                <div className="flex flex-col lg:flex-row gap-6 relative min-h-[400px]">
                  {/* Precio */}
                  <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
                    <div className="bg-primary p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                      <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Inversión Total</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-black tracking-tighter">${packageData.price}</span>
                        <span className="text-xs font-bold text-white/60">USD / pax</span>
                      </div>
                      <div className="mt-6 space-y-3 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-white/70">Abono Inicial</span>
                          <span className="font-black text-secondary">${packageData.reservationFee}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-white/70">Niños (2-11 años)</span>
                          <span className="font-black text-secondary-light">${packageData.childPrice ?? 500}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-2">
                          <span className="font-bold text-white/70">Saldo Pendiente</span>
                          <span className="font-black text-white/90">${(packageData.price ?? 0) - (packageData.reservationFee ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agencias */}
                  <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Contacta con una agencia</h3>
                    <div className="space-y-3">
                      {agencies.map((agency) => (
                        <div
                          key={agency.id}
                          className="p-4 border border-gray-50 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white hover:shadow-md hover:border-secondary/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-black text-[12px] shrink-0">
                              {agency.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-primary mb-0.5">{agency.nombre}</h4>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {agency.telefono && (
                              <a
                                href={`https://wa.me/${agency.telefono.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 sm:flex-none px-4 py-2 bg-[#25D366]/10 text-[#25D366] text-[10px] font-black rounded-lg hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-1.5"
                              >
                                <MessageCircle size={12} /> WhatsApp
                              </a>
                            )}
                            {agency.correo && (
                              <button
                                onClick={() => {
                                  scrollableRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                                  setSelectedAgency(agency);
                                }}
                                className="flex-1 sm:flex-none px-4 py-2 bg-primary/10 text-primary text-[10px] font-black rounded-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1.5"
                              >
                                <Mail size={12} /> Email
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email form overlay */}
                  <AnimatePresence>
                    {selectedAgency && (
                      <motion.div
                        key="agency-email-form"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-white z-50 p-6 flex flex-col rounded-2xl shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedAgency(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                              <ChevronRight size={18} className="rotate-180 text-gray-400" />
                            </button>
                            <div>
                              <h4 className="text-sm font-black text-primary">Enviar Email a {selectedAgency.nombre}</h4>
                              <p className="text-[10px] font-bold text-gray-400">{selectedAgency.correo}</p>
                            </div>
                          </div>
                          <button onClick={() => setSelectedAgency(null)} className="text-gray-400 hover:text-primary">
                            <X size={18} />
                          </button>
                        </div>
                        <form className="flex-1 flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Tu Nombre" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-secondary focus:ring-0 transition-all outline-none" />
                            <input type="email" placeholder="Tu Email" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-secondary focus:ring-0 transition-all outline-none" />
                          </div>
                          <input type="text" readOnly value={packageData.title ?? ""} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none cursor-default text-primary/50" />
                          <textarea
                            placeholder="Mensaje... (Indica fechas, número de personas, etc)"
                            className="flex-1 w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:border-secondary focus:ring-0 transition-all outline-none resize-none"
                          />
                          <button className="w-full py-3 bg-secondary text-primary font-black text-xs rounded-xl shadow-lg hover:brightness-105 transition-all">
                            Enviar Cotización
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="bg-white border-t border-gray-50 px-8 py-3 shrink-0 flex flex-row items-center justify-between gap-4">
          <div className="relative w-10 h-6">
            <Image src="/images/lttlogo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-primary/50">
              <Mail size={10} className="text-secondary" />
              <span className="text-[10px] font-bold">info@landtour.com</span>
            </div>
            <div className="flex items-center gap-2 text-primary/50">
              <Phone size={10} className="text-secondary" />
              <span className="text-[10px] font-bold">+593 4 123 4567</span>
            </div>
          </div>
          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest hidden lg:block">
            Mayorista de Turismo · {currentYear}
          </span>
        </div>
      </div>
    </dialog>
  );
};

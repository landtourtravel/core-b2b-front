"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Destino } from "@land-tour/shared";

export const Hero = () => {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destino[]>([]);
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");

  useEffect(() => {
    api.getDestinations().then(setDestinations).catch(console.error);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destino", destination);
    params.set("adultos", adults || "2");
    params.set("ninos", children || "0");
    // Fecha: solo referencial — se propaga a la URL pero NO filtra resultados
    // (los paquetes no tienen fechas de salida fijas en la BD).
    if (date) params.set("fecha", date);
    router.push(`/paquetes?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="inicio"
      className="relative w-full h-screen min-h-[650px] flex flex-col justify-center overflow-hidden"
    >
      <Image
        src="/images/playa_hero.jpg"
        alt="Playa tropical - Land Tour & Travel"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-primary/45" aria-hidden="true" />

      <motion.div
        className="relative z-10 w-full px-6 flex flex-col justify-center items-center mx-auto max-w-7xl mt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col justify-start gap-3 md:gap-7 drop-shadow-xl drop-shadow-primary-dark w-full">
          <motion.p
            variants={itemVariants}
            className="text-secondary-light text-[15px] font-semibold tracking-[0.22em] uppercase"
          >
            Mayorista de Turismo
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15]"
          >
            Vive experiencias{" "}
            <em className="not-italic text-secondary-light">inolvidables</em>
            <br />
            alrededor del mundo
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-md lg:max-w-xl xl:max-w-2xl"
          >
            Descubre nuestros paquetes turísticos diseñados para soñadores,
            aventureros y viajeros exigentes. Cotiza fácilmente con tu agencia de
            confianza.
          </motion.p>

          {/* ── Search card ── */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-2xl p-5 w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_auto_1px_auto_1px_auto_auto] items-end gap-4 md:gap-0">

              {/* Destino */}
              <div className="flex flex-col gap-1 md:pr-4">
                <label className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">
                  Destino
                </label>
                <div className="relative">
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none cursor-pointer pr-5"
                  >
                    <option value="">¿A dónde quieres ir?</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.ciudad}>
                        {d.ciudad}, {d.pais}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-0 bottom-2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Divisor */}
              <div className="hidden md:block self-stretch bg-gray-200 mx-3" aria-hidden="true" />

              {/* Fecha deseada — referencial, no filtra resultados */}
              <div className="flex flex-col gap-1 md:px-4">
                <label
                  className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase flex items-center gap-1"
                  title="Referencial — los paquetes no tienen fecha fija de salida"
                >
                  Fecha deseada
                  <span className="text-[8px] font-semibold text-secondary normal-case tracking-normal">(referencial)</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  title="Referencial — los paquetes no tienen fecha fija de salida"
                  className="text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none w-full"
                />
              </div>

              {/* Divisor */}
              <div className="hidden md:block self-stretch bg-gray-200 mx-3" aria-hidden="true" />

              {/* Adultos */}
              <div className="flex flex-col gap-1 md:px-4">
                <label className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">
                  Adultos
                </label>
                <div className="relative">
                  <select
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none cursor-pointer pr-5"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={String(n)}>
                        {n} {n === 1 ? "Adulto" : "Adultos"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-0 bottom-2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Divisor */}
              <div className="hidden md:block self-stretch bg-gray-200 mx-3" aria-hidden="true" />

              {/* Niños */}
              <div className="flex flex-col gap-1 md:px-4">
                <label className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">
                  Niños
                </label>
                <div className="relative">
                  <select
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none cursor-pointer pr-5"
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={String(n)}>
                        {n === 0 ? "Sin niños" : `${n} ${n === 1 ? "Niño" : "Niños"}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-0 bottom-2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Botón */}
              <button
                type="button"
                onClick={handleSearch}
                className="md:ml-4 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light active:scale-95 text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 whitespace-nowrap shrink-0"
              >
                <Search size={15} />
                Buscar
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

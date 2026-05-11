"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";

export const Hero = () => {
  const [travelers, setTravelers] = useState("1 Viajero");

  return (
    <section
      id="inicio"
      className="relative w-full h-screen min-h-[650px] flex flex-col justify-center overflow-hidden"
    >
      {/* Imagen de fondo del hero */}
      <Image
        src="/images/playa_hero.jpg"
        alt="Playa tropical - Land Tour & Travel"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Overlay verde oscuro semitransparente */}
      <div className="absolute inset-0 bg-primary/55" aria-hidden="true" />

      {/* ── Contenido ── */}
      <div className="relative z-10 w-full px-6 flex flex-col justify-center items-center mx-auto max-w-7xl mt-10">
        <div className="flex flex-col justify-start gap-3 md:gap-7">
          {/* Eyebrow label */}
          <p className="text-primary-light brightness-200 text-[15px] font-semibold tracking-[0.22em] uppercase ">
            Mayorista de Turismo
          </p>
          {/* Título */}
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15]">
            Vive experiencias{" "}
            <em className="not-italic text-secondary">inolvidables</em>
            <br />
            alrededor del mundo
          </h1>
          {/* Bajada */}
          <p className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-md lg:max-w-xl xl:max-w-2xl ">
            Descubre nuestros paquetes turísticos diseñados para soñadores,
            aventureros y viajeros exigentes. Cotiza fácilmente con tu agencia de
            confianza.
          </p>
          {/* ── Search card ── */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Campo: Destino */}
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">
                  Destino
                </label>
                <input
                  type="text"
                  placeholder="¿A dónde quieres ir?"
                  className="text-sm text-gray-700 placeholder:text-gray-300 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors"
                />
              </div>
              {/* Divisor */}
              <div className="hidden md:block w-px self-stretch bg-gray-200 mx-1" aria-hidden="true" />
              {/* Campo: Fecha */}
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">
                  Fecha
                </label>
                <input
                  type="date"
                  className="text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none w-full"
                />
              </div>
              {/* Divisor */}
              <div className="hidden md:block w-px self-stretch bg-gray-200 mx-1" aria-hidden="true" />
              {/* Campo: Viajeros */}
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">
                  Viajeros
                </label>
                <div className="relative">
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none cursor-pointer pr-5"
                  >
                    <option>1 Viajero</option>
                    <option>2 Viajeros</option>
                    <option>3 Viajeros</option>
                    <option>4+ Viajeros</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-0 bottom-2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              {/* Botón */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light active:scale-95 text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                <Search size={15} />
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export const Hero = () => {
  const [travelers, setTravelers] = useState("1 Viajero");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
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
      {/* Imagen de fondo del hero */}
      {window.innerWidth >= 768 ? (
        <Image
          src="https://images.unsplash.com/photo-1432889490240-84df33d47091?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Playa tropical - Land Tour & Travel"
          fill
          priority
          className="object-cover object-center"
      />
      ) : (
        <Image
          src="https://images.unsplash.com/photo-1544536871-6e891baa163f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Playa tropical - Land Tour & Travel"
          fill
          priority
          className="object-cover object-center"
      />
      )}

      {/* Overlay verde oscuro semitransparente */}
      <div className="absolute inset-0 bg-primary/45" aria-hidden="true" />

      {/* ── Contenido ── */}
      <motion.div
        className="relative z-10 w-full px-6 flex flex-col justify-center items-center mx-auto max-w-7xl mt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col justify-start gap-3 md:gap-7 drop-shadow-xl drop-shadow-primary-dark ">
          {/* Eyebrow label */}
          <motion.p
            variants={itemVariants}
            className="text-secondary-light text-[15px] font-semibold tracking-[0.22em] uppercase "
          >
            Mayorista de Turismo
          </motion.p>
          {/* Título */}
          <motion.h1
            variants={itemVariants}
            className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15]"
          >
            Vive experiencias{" "}
            <em className="not-italic text-secondary-light">inolvidables</em>
            <br />
            alrededor del mundo
          </motion.h1>
          {/* Bajada */}
          <motion.p
            variants={itemVariants}
            className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-md lg:max-w-xl xl:max-w-2xl "
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
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light active:scale-95 text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 whitespace-nowrap shrink-0"
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

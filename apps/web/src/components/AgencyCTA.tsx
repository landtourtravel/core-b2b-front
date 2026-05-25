"use client";

import React from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { motion } from "framer-motion";

const MotionLink = motion.create(Link);

// ─── Component ────────────────────────────────────────────────────────────────

export const AgencyCTA: React.FC = () => (
  <section
    id="agencias"
    className="
      relative overflow-hidden
      bg-gradient-to-br from-primary-dark via-primary to-secondary
      py-16 sm:py-24
    "
  >
    {/* ── Decorative blurred circles ── */}
    <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-primary-dark/50 blur-3xl pointer-events-none" />
    <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-secondary-light/20 blur-2xl pointer-events-none" />

    {/* ── Content ── */}
    <div className="relative z-10 container mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 max-w-2xl mx-auto text-center"
      >
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          ¿Eres una Agencia Minorista?
        </h2>

        {/* Description */}
        <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
          Regístrate y accede a nuestro portal exclusivo con tarifas de mayorista,
          cotizador en línea y herramientas para hacer crecer tu negocio.
        </p>

        {/* CTA Button */}
        <MotionLink
          href="/login"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="
            inline-flex items-center gap-2.5
            bg-secondary hover:bg-secondary-light
            text-primary-dark font-bold text-sm sm:text-base
            px-8 py-3.5 rounded-full
            transition-all duration-200
            shadow-lg hover:shadow-xl
          "
          aria-label="Regístrate como agencia aliada"
        >
          <UserPlus size={18} strokeWidth={2} />
          Regístrate
        </MotionLink>

      </motion.div>
    </div>

  </section>
);



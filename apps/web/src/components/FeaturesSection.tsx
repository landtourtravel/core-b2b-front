"use client";

import React from "react";
import { BadgeDollarSign, Headphones, ShieldCheck, Globe } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    id: 1,
    title: "Mejores Precios",
    description:
      "Tarifas exclusivas de mayorista para agencias minoristas con márgenes competitivos.",
    icon: <BadgeDollarSign size={28} className="text-primary" strokeWidth={1.75} />,
  },
  {
    id: 2,
    title: "Soporte 24/7",
    description:
      "Atención personalizada antes, durante y después del viaje de tus clientes.",
    icon: <Headphones size={28} className="text-primary" strokeWidth={1.75} />,
  },
  {
    id: 3,
    title: "Viajes Seguros",
    description:
      "Todos nuestros paquetes incluyen asistencia médica y seguro de viaje.",
    icon: <ShieldCheck size={28} className="text-primary" strokeWidth={1.75} />,
  },
  {
    id: 4,
    title: "+50 Destinos",
    description:
      "Cobertura en los 5 continentes con los mejores aliados locales.",
    icon: <Globe size={28} className="text-primary" strokeWidth={1.75} />,
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ─── Feature Card ─────────────────────────────────────────────────────────────

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <motion.div
    variants={itemVariants}
    className="
      flex flex-col items-center text-center h-full
      bg-white rounded-3xl
      shadow-[0_4px_30px_rgba(0,0,0,0.07)]
      hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]
      hover:-translate-y-1
      transition-all duration-300 ease-out
      px-8 py-10
      min-w-[220px]
    "
  >
    {/* Icon container */}
    <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6 flex-shrink-0">
      {feature.icon}
    </div>

    {/* Text */}
    <h3 className="text-primary font-bold text-base mb-2 leading-snug">
      {feature.title}
    </h3>
    <p className="text-primary/50 text-sm leading-relaxed">
      {feature.description}
    </p>
  </motion.div>
);

// ─── Section ──────────────────────────────────────────────────────────────────

export const FeaturesSection: React.FC = () => (
  <section className="py-20 bg-white" id="beneficios">
    <div className="container mx-auto px-4 sm:px-6">

      {/* ── Desktop: 4-col grid ── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="hidden md:grid md:grid-cols-4 gap-6 items-stretch"
      >
        {FEATURES.map((f) => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </motion.div>

      {/* ── Mobile: horizontal snap carousel ── */}
      <div className="md:hidden -mx-4 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="
            flex gap-4 overflow-x-auto
            snap-x snap-mandatory pb-4
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {FEATURES.map((f) => (
            <div key={f.id} className="w-[72vw] flex-shrink-0 snap-center">
              <FeatureCard feature={f} />
            </div>
          ))}
        </motion.div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {FEATURES.map((f) => (
            <span key={f.id} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          ))}
        </div>
      </div>

    </div>
  </section>
);


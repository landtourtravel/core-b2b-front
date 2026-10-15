"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/Skeleton";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  stars: number;
}

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-secondary/20 text-secondary",
  "bg-gold/20 text-primary",
];

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

// ─── Star Rating ──────────────────────────────────────────────────────────────

const StarRating: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex items-center gap-0.5" aria-label={`${count} de 5 estrellas`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < count ? "fill-amber-400 text-amber-400" : "fill-primary/10 text-primary/10"}
      />
    ))}
  </div>
);

// ─── Testimonial Card ─────────────────────────────────────────────────────────

const TestimonialCard: React.FC<{ testimonial: Testimonial; index: number }> = ({ testimonial, index }) => (
  <div
    className="
      flex flex-col justify-between
      bg-white rounded-3xl p-8 h-full
      shadow-[0_4px_30px_rgba(0,0,0,0.06)]
      hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)]
      hover:-translate-y-1
      transition-all duration-300 ease-out
      border border-lighter
    "
  >
    {/* ── Top row: stars + quote icon ── */}
    <div>
      <div className="flex items-start justify-between mb-5">
        <StarRating count={testimonial.stars} />
        <Quote size={28} className="text-secondary/40 flex-shrink-0" />
      </div>

      {/* ── Comment text ── */}
      <p className="text-primary/60 text-sm sm:text-[0.95rem] leading-relaxed">
        &ldquo;{testimonial.content}&rdquo;
      </p>
    </div>

    {/* ── Footer: avatar + name ── */}
    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-lighter">
      {/* Avatar circle with initials */}
      <div
        className={`
          w-11 h-11 rounded-full flex items-center justify-center
          font-bold text-sm flex-shrink-0 ${AVATAR_COLORS[index % AVATAR_COLORS.length]}
        `}
        aria-hidden="true"
      >
        {initialsOf(testimonial.name)}
      </div>

      <div>
        <p className="font-bold text-primary text-sm leading-tight">{testimonial.name}</p>
        {testimonial.role && <p className="text-primary/40 text-xs mt-0.5">{testimonial.role}</p>}
      </div>
    </div>
  </div>
);

// ─── Section ──────────────────────────────────────────────────────────────────

export const TestimonialsSection: React.FC = () => {
  const [items, setItems] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    fetch("/api/testimonios")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]));
  }, []);

  if (items && items.length === 0) return null;
  const list = items ?? [];

  return (
  <section className="py-20 sm:py-28 bg-light" id="testimonios">
    <div className="container mx-auto px-4 sm:px-6">

      {/* ── Section header (brand standard) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 sm:mb-16"
      >
        <span className="inline-block px-4 py-1.5 bg-secondary/15 text-secondary text-xs font-bold rounded-lg mb-4 uppercase tracking-widest">
          Testimonios
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary leading-tight">
          Lo que dicen nuestros{" "}
          <span className="relative">
            clientes
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-secondary/40 rounded-full" />
          </span>
        </h2>
        <p className="mt-4 text-primary/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Agencias aliadas y viajeros que ya confían en nosotros comparten su experiencia.
        </p>
      </motion.div>

      {/* ── Desktop: 3-col grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`hidden md:grid gap-6 items-stretch ${
          list.length === 2
              ? "md:grid-cols-2"
              : list.length === 1
                ? "md:grid-cols-1 max-w-md mx-auto"
                : "md:grid-cols-3"
        }`}
      >
        {items === null
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-3xl" />)
          : list.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
      </motion.div>

      {/* ── Mobile: horizontal snap carousel ── */}
      <div className="md:hidden -mx-4 px-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="
            flex gap-4 overflow-x-auto
            snap-x snap-mandatory pb-4
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {items === null ? (
            <Skeleton className="h-64 w-[80vw] flex-shrink-0 rounded-3xl" />
          ) : (
            list.map((t, i) => (
              <div key={t.id} className="w-[80vw] flex-shrink-0 snap-center">
                <TestimonialCard testimonial={t} index={i} />
              </div>
            ))
          )}
        </motion.div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {list.map((t) => (
            <span key={t.id} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          ))}
        </div>
      </div>

    </div>
  </section>
  );
};
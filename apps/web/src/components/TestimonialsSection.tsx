// Server Component
import React from "react";
import { Star, Quote } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  stars: number;
  initials: string;
  avatarColor: string; // bg color class for the avatar circle
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "María González",
    role: "Directora, Viajes del Sol",
    content:
      '"Land Tour ha sido nuestro aliado estratégico por más de 5 años. Sus tarifas y atención son insuperables. Nuestros clientes siempre quedan encantados."',
    stars: 5,
    initials: "MG",
    avatarColor: "bg-primary/20 text-primary",
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    role: "Gerente, Mundo Travel",
    content:
      '"El sistema de cotización es muy intuitivo y nos permite responder a nuestros clientes en minutos. La variedad de destinos es impresionante."',
    stars: 5,
    initials: "CM",
    avatarColor: "bg-secondary/20 text-secondary",
  },
  {
    id: 3,
    name: "Ana Lucía Vargas",
    role: "Viajera frecuente",
    content:
      '"Viajamos a Bali con el paquete de Land Tour y fue una experiencia mágica. Todo estuvo perfectamente organizado, desde los traslados hasta los tours."',
    stars: 4,
    initials: "AV",
    avatarColor: "bg-gold/20 text-primary",
  },
];

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

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
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
        {testimonial.content}
      </p>
    </div>

    {/* ── Footer: avatar + name ── */}
    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-lighter">
      {/* Avatar circle with initials */}
      <div
        className={`
          w-11 h-11 rounded-full flex items-center justify-center
          font-bold text-sm flex-shrink-0 ${testimonial.avatarColor}
        `}
        aria-hidden="true"
      >
        {testimonial.initials}
      </div>

      <div>
        <p className="font-bold text-primary text-sm leading-tight">{testimonial.name}</p>
        <p className="text-primary/40 text-xs mt-0.5">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

// ─── Section ──────────────────────────────────────────────────────────────────

export const TestimonialsSection: React.FC = () => (
  <section className="py-20 sm:py-28 bg-light" id="testimonios">
    <div className="container mx-auto px-4 sm:px-6">

      {/* ── Section header (brand standard) ── */}
      <div className="text-center mb-12 sm:mb-16">
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
      </div>

      {/* ── Desktop: 3-col grid ── */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 items-stretch">
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
      </div>

      {/* ── Mobile: horizontal snap carousel ── */}
      <div className="md:hidden -mx-4 px-4">
        <div
          className="
            flex gap-4 overflow-x-auto
            snap-x snap-mandatory pb-4
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="w-[80vw] flex-shrink-0 snap-center">
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {TESTIMONIALS.map((t) => (
            <span key={t.id} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          ))}
        </div>
      </div>

    </div>
  </section>
);

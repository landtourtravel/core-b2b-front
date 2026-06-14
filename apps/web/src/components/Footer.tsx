// Server Component
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook } from "lucide-react";

// ─── TikTok SVG icon (not in lucide-react) ────────────────────────────────────

const TikTokIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
);

// ─── Shared link class ────────────────────────────────────────────────────────

const linkCls =
  "text-white/50 hover:text-secondary text-sm transition-colors duration-200";

// ─── Column heading ───────────────────────────────────────────────────────────

const ColTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-secondary font-bold text-sm uppercase tracking-widest mb-5">
    {children}
  </h4>
);

// ─── Footer ───────────────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark text-white">

      {/* ── Main grid ── */}
      <div className="container mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12 border-b border-white/10 pb-8 sm:pb-12">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-5">
            {/* Logo — same as Navbar, white pill for contrast */}
            <Link href="/" aria-label="Land Tour & Travel - Inicio" className="inline-flex w-fit">
              <div className="bg-white rounded-2xl px-4 py-2.5 shadow-sm">
                <Image
                  src="/images/lttlogo.png"
                  alt="Land Tour & Travel"
                  width={110}
                  height={36}
                  className="object-contain"
                />
              </div>
            </Link>

            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Mayorista de turismo conectando viajeros con experiencias únicas a
              través de nuestra red de agencias.
            </p>
          </div>

          {/* Col 2+3 — Explorar & Agencias side by side on mobile */}
          <div className="grid grid-cols-2 md:contents gap-8">
            {/* Explorar */}
            <div>
              <ColTitle>Explorar</ColTitle>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Inicio",    href: "#inicio"   },
                  { label: "Paquetes",  href: "#paquetes" },
                  { label: "Destinos",  href: "#destinos" },
                  { label: "Nosotros",  href: "#nosotros" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkCls}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Agencias */}
            <div>
              <ColTitle>Agencias</ColTitle>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Ingreso",  href: "/login"          },
                  { label: "Registro", href: "/login?access=1" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkCls}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Col 4 — Síguenos */}
          <div>
            <ColTitle>Síguenos</ColTitle>
            {/* Mobile: centered icon-only row with white circle backgrounds */}
            <div className="flex items-center justify-center gap-4 md:hidden">
              {[
                { label: "Instagram", icon: <Instagram size={18} />, href: "#" },
                { label: "Facebook",  icon: <Facebook  size={18} />, href: "#" },
                { label: "TikTok",    icon: <TikTokIcon size={18} />, href: "#" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="
                    w-10 h-10 rounded-full
                    bg-white text-primary
                    flex items-center justify-center
                    hover:bg-secondary hover:text-white
                    transition-all duration-200
                    shadow-sm
                  "
                >
                  {item.icon}
                </Link>
              ))}
            </div>
            {/* Desktop: icon + text vertical list */}
            <ul className="hidden md:flex flex-col gap-3">
              {[
                { label: "Instagram", href: "#", icon: <Instagram size={15} /> },
                { label: "Facebook",  href: "#", icon: <Facebook  size={15} /> },
                { label: "TikTok",    href: "#", icon: <TikTokIcon size={15} /> },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`${linkCls} flex items-center gap-2`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Copyright bar ── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <p>© {year} Land Tour & Travel. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ en Ecuador</p>
        </div>
      </div>

    </footer>
  );
};

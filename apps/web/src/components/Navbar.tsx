"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRightToLine, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { hash: "inicio",      label: "Inicio"      },
  { hash: "paquetes",    label: "Paquetes"    },
  { hash: "destinos",    label: "Destinos"    },
  { hash: "testimonios", label: "Testimonios" },
  { hash: "contacto",    label: "Contáctanos" },
];

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const getHref = (hash: string) => isHome ? `#${hash}` : `/#${hash}`;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
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
  }, [isMenuOpen]);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm md:py-2 lg:py-4">
      <div className="max-w-7xl mx-auto h-[68px] flex items-center justify-between gap-6 px-2 xl:px-0">

        {/* ── Logo ── */}
        <Link href="/" className="shrink-0" aria-label="Land Tour & Travel - Inicio">
          <Image
            src="/images/lttlogo.png"
            alt="Land Tour & Travel"
            width={90}
            height={30}
            className="object-contain"
            priority
          />
        </Link>

        {/* ── Desktop nav ── */}
        <nav aria-label="Navegación principal" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const active = isHome && link.hash === "inicio";
              return (
                <li key={link.hash}>
                  <Link
                    href={getHref(link.hash)}
                    className={`relative text-sm pb-1 transition-colors duration-200 group ${
                      active
                        ? "font-semibold text-gray-900"
                        : "font-medium text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-900 rounded-full" />
                    )}
                    {!active && (
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gray-400 rounded-full group-hover:w-full transition-all duration-200" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── CTA ── */}
        <div className="hidden md:flex items-center shrink-0">
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-[7px] rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors duration-200"
          >
            <ArrowRightToLine size={14} />
            Ingreso Agencias
          </Link>
        </div>

        {/* ── Mobile toggle ── */}
        <button
          type="button"
          className="md:hidden text-gray-700 p-1 ml-auto"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg py-4 px-6 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.hash}
              href={getHref(link.hash)}
              onClick={() => setIsMenuOpen(false)}
              className="py-2 text-base font-medium text-gray-700 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 w-fit hover:border-primary hover:text-primary transition-colors"
          >
            <ArrowRightToLine size={14} />
            Ingreso Agencias
          </Link>
        </div>
      )}
    </header>

    </>
  );
};

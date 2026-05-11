"use client";

import React from "react";
import { PackageCard } from "./PackageCard";
import { Button } from "@land-tour/ui";
import { motion } from "framer-motion";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PACKAGES = [
  {
    title: "Italia Clásica 10 Días",
    price: 1899,
    duration: "10 Días / 9 Noches",
    location: "Italia",
    category: "Tour",
    image:
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
    flightIncluded: true,
    transport: "Tren incluido",
  },
  {
    title: "Cancún Todo Incluido",
    price: 850,
    duration: "5 Días / 4 Noches",
    location: "México",
    category: "Playa",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    flightIncluded: true,
    transport: undefined,
  },
  {
    title: "Madrid & París Express",
    price: 1250,
    duration: "8 Días / 7 Noches",
    location: "Europa",
    category: "Tour",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    flightIncluded: true,
    transport: "Tren Eurostar incluido",
  },
  {
    title: "Aventura en los Andes",
    price: 650,
    duration: "4 Días / 3 Noches",
    location: "Perú",
    category: "Montaña",
    image:
      "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    flightIncluded: false,
    transport: "Bus panorámico incluido",
  },
];

// ─── Section ──────────────────────────────────────────────────────────────────

export const PackagesSection = () => {
  return (
    <section className="py-24 bg-white" id="paquetes">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Header — mismo estilo que DestinationsSection */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 bg-secondary/15 text-secondary text-xs font-bold rounded-lg mb-4 uppercase tracking-widest">
            Destacados
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary leading-tight">
            Paquetes Turísticos{" "}
            <span className="relative">
              Más Populares
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-secondary/40 rounded-full" />
            </span>
          </h2>
          <p className="mt-4 text-primary/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Los destinos favoritos de nuestras agencias aliadas, con todo incluido y al mejor precio mayorista.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PACKAGES.map((pkg, idx) => (
            <motion.div
              key={idx}
              className="h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <PackageCard {...pkg} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button variant="outline">Ver todos los paquetes</Button>
        </div>
      </div>
    </section>
  );
};

"use client";

import React, { useState } from "react";
import { PackageCard } from "./PackageCard";
import { Button } from "@land-tour/ui";
import { motion } from "framer-motion";
import Link from "next/link";
import { PackageDetailModal } from "./PackageDetailModal";

import { Package } from "@land-tour/shared";
import { api } from "@/services/api";

// ─── Section ──────────────────────────────────────────────────────────────────

export const PackagesSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await api.getPackages();
        // Solo mostramos los primeros 4 en la sección de destacados
        setPackages(data.slice(0, 4));
      } catch (err) {
        console.error("Error fetching packages:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleOpenModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-white min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
          <p className="text-primary/60 font-medium text-sm">Cargando mejores ofertas...</p>
        </div>
      </section>
    );
  }

  if (packages.length === 0) return null;

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              className="h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <PackageCard {...pkg} onClick={() => handleOpenModal(pkg)} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/paquetes">
            <Button variant="outline">Ver todos los paquetes</Button>
          </Link>
        </div>
      </div>

      {/* Modal de Detalle */}
      <PackageDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        packageData={selectedPackage}
      />
    </section>
  );
};

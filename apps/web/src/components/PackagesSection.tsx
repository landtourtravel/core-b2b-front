"use client";

import React, { useState } from "react";
import { PackageCard } from "./PackageCard";
import { Button } from "@land-tour/ui";
import { motion } from "framer-motion";
import Link from "next/link";
import { PackageDetailModal } from "./PackageDetailModal";
import { AlertTriangle, Package as PackageIcon } from "lucide-react";
import { Package } from "@land-tour/shared";
import { api } from "@/services/api";

export const PackagesSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<"DB_FAIL" | "EMPTY" | null>(null);

  React.useEffect(() => {
    api.getPackagesDetailed()
      .then(({ data, error }) => {
        setPackages(data.slice(0, 8));
        setFetchError(error);
      })
      .catch(() => setFetchError("DB_FAIL"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 bg-white min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
          <p className="text-primary/60 font-medium text-sm">Cargando paquetes...</p>
        </div>
      </section>
    );
  }

  if (fetchError === "DB_FAIL") {
    return (
      <section className="py-24 bg-white min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertTriangle size={32} className="text-amber-400" />
          <p className="text-primary/60 font-semibold text-sm">Conexión a DB fallida — los paquetes no están disponibles en este momento.</p>
        </div>
      </section>
    );
  }

  if (fetchError === "EMPTY" || packages.length === 0) {
    return (
      <section className="py-24 bg-white min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <PackageIcon size={32} className="text-primary/20" />
          <p className="text-primary/50 font-semibold text-sm">No hay paquetes creados en la base de datos.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white" id="paquetes">
      <div className="container mx-auto px-4 sm:px-6">

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

        {/* ── Carousel ── */}
        <div className="relative">
          {/* Scroll track */}
          <div
            className="
              flex gap-4
              overflow-x-auto
              snap-x snap-mandatory
              pb-4
              scrollbar-hide
              -mx-4 px-4
              md:-mx-6 md:px-6 md:pr-16
            "
          >
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                className="
                  flex-shrink-0 snap-center
                  w-[calc(100vw-2rem)]
                  md:w-72
                  h-full
                "
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <PackageCard
                  {...pkg}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setIsModalOpen(true);
                  }}
                />
              </motion.div>
            ))}
          </div>
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-5">
            {packages.map((pkg) => (
              <span
                key={pkg.id}
                className={`
                  w-1.5 h-1.5 rounded-full transition-colors duration-300
                  ${selectedPackage?.id === pkg.id ? "bg-secondary" : "bg-primary/20"}
                `}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/paquetes">
            <Button variant="outline">Ver todos los paquetes</Button>
          </Link>
        </div>
      </div>

      <PackageDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageData={selectedPackage}
      />
    </section>
  );
};

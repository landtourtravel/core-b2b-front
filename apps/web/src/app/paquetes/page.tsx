"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PackageCard } from "@/components/PackageCard";
import { Search, Filter, Grid, List as ListIcon, ChevronDown } from 'lucide-react';
import { Button } from '@land-tour/ui';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { Package } from '@land-tour/shared';
import { PackageDetailModal } from '@/components/PackageDetailModal';

export default function PaquetesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await api.getPackages();
        setPackages(data);
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

  const filteredPackages = packages.filter(pkg =>
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof pkg.location === 'string'
      ? pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
      : (pkg.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.location.country.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <main className="min-h-screen bg-light">
      <Navbar />

      {/* Header Section */}
      <section className="pt-32 pb-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-4">Catálogo de <span className="text-secondary">Paquetes</span></h1>
            <p className="text-white/60 text-lg max-w-2xl">Explora nuestra selección exclusiva de destinos diseñados para crear recuerdos inolvidables.</p>
          </motion.div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-lighter py-4">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
              <input
                type="text"
                placeholder="Buscar por destino o nombre..."
                className="w-full bg-light py-2 pl-10 pr-4 rounded-full border-none focus:ring-2 focus:ring-secondary outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2">
              <Filter size={16} />
              Filtros
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-primary/60">
              <span>Ordenar por:</span>
              <button className="flex items-center gap-1 text-primary">
                Precio <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex bg-light p-1 rounded-lg">
              <button className="p-1.5 bg-white rounded-md shadow-sm text-primary"><Grid size={18} /></button>
              <button className="p-1.5 text-primary/40"><ListIcon size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
              <p className="text-primary/60 font-medium">Buscando los mejores destinos...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <p className="text-primary/60 font-medium">{filteredPackages.length} paquetes encontrados</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPackages.map((pkg, idx) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <PackageCard {...pkg} onClick={() => handleOpenModal(pkg)} />
                  </motion.div>
                ))}
              </div>

              {filteredPackages.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-primary/40 text-lg">No se encontraron paquetes que coincidan con tu búsqueda.</p>
                </div>
              )}

              {/* Pagination */}
              {filteredPackages.length > 0 && (
                <div className="flex justify-center mt-16 gap-2">
                  <Button variant="outline" className="w-10 h-10 p-0 rounded-lg bg-white border-lighter">1</Button>
                  <Button variant="outline" className="w-10 h-10 p-0 rounded-lg hover:bg-white border-transparent">2</Button>
                  <Button variant="outline" className="w-10 h-10 p-0 rounded-lg hover:bg-white border-transparent">3</Button>
                  <span className="flex items-center px-2">...</span>
                  <Button variant="outline" className="w-10 h-10 p-0 rounded-lg hover:bg-white border-transparent">12</Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />

      <PackageDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageData={selectedPackage}
      />
    </main>
  );
}

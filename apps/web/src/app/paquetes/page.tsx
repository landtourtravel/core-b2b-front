"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PackageCard } from "@/components/PackageCard";
import { PackageDetailModal } from '@/components/PackageDetailModal';
import { api } from '@/services/api';
import { Package } from '@land-tour/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CATEGORIES = ['Todos', 'Playa', 'Ciudad', 'Aventura', 'Naturaleza', 'Cultura'];
const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { label: 'Precio: menor a mayor', value: 'precio_asc' },
  { label: 'Precio: mayor a menor', value: 'precio_desc' },
  { label: 'Duración: menor a mayor', value: 'duracion_asc' },
  { label: 'Duración: mayor a menor', value: 'duracion_desc' },
];

export default function PaquetesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const sortRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getPackages().then(setPackages).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const destino = params.get('destino');
    if (destino) setSearchTerm(destino);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, sortBy]);

  const filtered = packages
    .filter(pkg => {
      const loc = `${pkg.location.city} ${pkg.location.country}`;
      const matchSearch = !searchTerm ||
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === 'Todos' || pkg.category === activeCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'precio_asc') return a.price - b.price;
      if (sortBy === 'precio_desc') return b.price - a.price;
      if (sortBy === 'duracion_asc') return a.nochesBase - b.nochesBase;
      if (sortBy === 'duracion_desc') return b.nochesBase - a.nochesBase;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasFilters = activeCategory !== 'Todos' || searchTerm || sortBy;
  const clearAll = () => { setActiveCategory('Todos'); setSearchTerm(''); setSortBy(''); };
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <main className="min-h-screen bg-light">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-28 pb-14 bg-primary relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1470&auto=format&fit=crop"
          alt="Destinos turísticos"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-20"
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary text-[11px] font-bold rounded-lg mb-3 uppercase tracking-widest border border-secondary/30">
              Catálogo completo
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight">
              Paquetes <span className="text-secondary">Turísticos</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base max-w-lg leading-relaxed">
              Selección exclusiva de destinos para agencias. Precios mayoristas y salidas programadas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Filtros sticky ── */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">

          {/* Fila 1: búsqueda + ordenar */}
          <div className="flex items-center gap-3 pt-3 pb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/30" size={15} />
              <input
                type="text"
                placeholder="Buscar destino o paquete..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-light py-2.5 pl-10 pr-9 rounded-xl border-none focus:ring-2 focus:ring-secondary/30 outline-none text-sm text-primary font-medium placeholder:text-primary/30"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary/60 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown ordenar */}
            <div className="relative shrink-0" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(v => !v)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  sortBy
                    ? 'bg-primary text-white border-primary'
                    : 'bg-light text-primary/60 border-transparent hover:border-gray-200'
                }`}
              >
                <SlidersHorizontal size={15} />
                <span className="hidden sm:inline max-w-[110px] truncate">
                  {sortBy ? activeSortLabel?.split(':')[1]?.trim() : 'Ordenar'}
                </span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    {sortBy && (
                      <button
                        onClick={() => { setSortBy(''); setIsSortOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-red-50 transition-colors border-b border-gray-50 flex items-center gap-2"
                      >
                        <X size={11} /> Quitar orden
                      </button>
                    )}
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                        className={`w-full px-4 py-3 text-left text-xs font-semibold transition-colors ${
                          sortBy === opt.value
                            ? 'bg-primary/5 text-primary font-bold'
                            : 'text-primary/50 hover:bg-gray-50 hover:text-primary/80'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Fila 2: chips de categoría */}
          <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-light text-primary/50 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Resultados ── */}
      <section className="py-10 sm:py-14" ref={resultsRef}>
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
              <p className="text-primary/50 font-medium text-sm">Buscando los mejores destinos...</p>
            </div>
          ) : (
            <>
              {/* Contador + limpiar */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <p className="text-primary/50 text-sm font-medium">
                  <span className="text-primary font-bold">{filtered.length}</span> paquetes
                  {activeCategory !== 'Todos' && (
                    <> en <span className="text-secondary font-bold">{activeCategory}</span></>
                  )}
                  {totalPages > 1 && (
                    <span className="ml-1.5 text-primary/40">· página {currentPage} de {totalPages}</span>
                  )}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary/40 hover:text-primary transition-colors"
                  >
                    <X size={12} /> Limpiar filtros
                  </button>
                )}
              </div>

              {/* Grid */}
              {filtered.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                    {paginated.map((pkg, idx) => (
                      <motion.div
                        key={`${pkg.id}-${currentPage}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.24) }}
                      >
                        <PackageCard
                          {...pkg}
                          onClick={() => setSelectedPackage(pkg)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-primary/50 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {getPageNumbers().map((page, i) =>
                        page === '...' ? (
                          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-primary/30 text-sm font-bold">
                            …
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToPage(page as number)}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                              currentPage === page
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-primary/60 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-primary/50 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-5">
                    <Search size={26} className="text-primary/20" />
                  </div>
                  <h3 className="text-primary font-bold text-lg mb-2">Sin resultados</h3>
                  <p className="text-primary/40 text-sm max-w-xs mb-7 leading-relaxed">
                    No encontramos paquetes que coincidan con tu búsqueda o filtros seleccionados.
                  </p>
                  <button
                    onClick={clearAll}
                    className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light transition-colors"
                  >
                    Ver todos los paquetes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />

      <PackageDetailModal
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        packageData={selectedPackage}
      />
    </main>
  );
}

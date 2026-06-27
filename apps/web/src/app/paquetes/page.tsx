"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PackageCard } from "@/components/PackageCard";
import { PackageDetailModal } from '@/components/PackageDetailModal';
import { api } from '@/services/api';
import { Package, Destino } from '@land-tour/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { label: 'Precio: menor a mayor', value: 'precio_asc' },
  { label: 'Precio: mayor a menor', value: 'precio_desc' },
  { label: 'Duración: menor a mayor', value: 'duracion_asc' },
  { label: 'Duración: mayor a menor', value: 'duracion_desc' },
];

export default function PaquetesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destino[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<"DB_FAIL" | "EMPTY" | null>(null);

  // Form state (lo que el usuario edita)
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");

  // Active state (lo que realmente filtra — se aplica al hacer clic en Buscar)
  const [activeDestination, setActiveDestination] = useState("");
  const [activeDate, setActiveDate] = useState("");
  const [activeAdults, setActiveAdults] = useState("2");
  const [activeChildren, setActiveChildren] = useState("0");

  // Filter bar state (reactivo)
  const [cityFilter, setCityFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const sortRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    api.getPackagesDetailed()
      .then(({ data, error }) => { if (!cancelled) { setPackages(data); setFetchError(error); } })
      .catch(() => { if (!cancelled) setFetchError("DB_FAIL"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Carga destinos y ciudades desde /api/destinations en un solo fetch
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/destinations", { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Destino[]) => {
        setDestinations(data);
        setAllCities([...new Set(data.map(d => d.ciudad).filter(Boolean))].sort());
      })
      .catch(err => { if (err?.name !== "AbortError") console.error(err); });
    return () => controller.abort();
  }, []);

  // Pre-carga params de URL en ambos estados (formulario y activo)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("destino") ?? "";
    const f = params.get("fecha")   ?? "";
    const a = params.get("adultos") ?? "2";
    const n = params.get("ninos")   ?? "0";
    setDestination(d);  setActiveDestination(d);
    setDate(f);         setActiveDate(f);
    setAdults(a);       setActiveAdults(a);
    setChildren(n);     setActiveChildren(n);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Resetea página cuando cambian los filtros activos o los filtros reactivos
  useEffect(() => {
    setCurrentPage(1);
  }, [activeDestination, cityFilter, sortBy, minPrice, maxPrice]);

  const filtered = packages
    .filter(pkg => {
      const loc = `${pkg.location.city} ${pkg.location.country}`.toLowerCase();
      const matchDestino = !activeDestination ||
        loc.includes(activeDestination.toLowerCase()) ||
        pkg.title.toLowerCase().includes(activeDestination.toLowerCase());
      const matchCity = !cityFilter ||
        pkg.location.city.toLowerCase() === cityFilter.toLowerCase();
      const matchMin = !minPrice || pkg.price >= parseFloat(minPrice);
      const matchMax = !maxPrice || pkg.price <= parseFloat(maxPrice);
      // numPax / numNinos existen en la BD. Solo filtran cuando el valor es
      // significativo (≥2 adultos / ≥1 niño); null-safe ante datos faltantes.
      const matchAdults   = !activeAdults   || parseInt(activeAdults)   <= 1 || (pkg.numPax   ?? Infinity) >= parseInt(activeAdults);
      const matchChildren = !activeChildren || parseInt(activeChildren) === 0 || (pkg.numNinos ?? Infinity) >= parseInt(activeChildren);
      // Fecha: referencial — nunca oculta resultados (sin fechas fijas en BD).
      return matchDestino && matchCity && matchMin && matchMax && matchAdults && matchChildren;
    })
    .sort((a, b) => {
      if (sortBy === 'precio_asc')   return a.price - b.price;
      if (sortBy === 'precio_desc')  return b.price - a.price;
      if (sortBy === 'duracion_asc') return a.nochesBase - b.nochesBase;
      if (sortBy === 'duracion_desc') return b.nochesBase - a.nochesBase;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasFilters = !!(activeDestination || cityFilter || sortBy || minPrice || maxPrice || activeDate);

  const clearAll = () => {
    setDestination("");     setActiveDestination("");
    setDate("");            setActiveDate("");
    setAdults("2");         setActiveAdults("2");
    setChildren("0");       setActiveChildren("0");
    setCityFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
  };

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label;

  const handleSearch = () => {
    setActiveDestination(destination);
    setActiveDate(date);
    setActiveAdults(adults);
    setActiveChildren(children);
    setCurrentPage(1);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

      {/* ── Hero con buscador compacto ── */}
      <section className="pt-28 pb-14 bg-primary relative overflow-hidden">
        <Image
          src="/images/hero_paquetes.webp"
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
            <p className="text-white/50 text-sm sm:text-base max-w-lg leading-relaxed mb-6">
              Selección exclusiva de destinos para agencias. Precios mayoristas y salidas programadas.
            </p>

            {/* Buscador compacto */}
            <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-4xl">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1px_auto_1px_auto_1px_auto_auto] items-end gap-3 sm:gap-0">

                {/* Destino */}
                <div className="flex flex-col gap-1 sm:pr-3">
                  <label className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">Destino</label>
                  <div className="relative">
                    <select
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none cursor-pointer pr-5"
                    >
                      <option value="">Todos los destinos</option>
                      {destinations.map(d => (
                        <option key={d.id} value={d.ciudad}>{d.ciudad}, {d.pais}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-0 bottom-2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="hidden sm:block self-stretch bg-gray-200 mx-2" aria-hidden="true" />

                {/* Fecha deseada — referencial, no filtra resultados */}
                <div className="flex flex-col gap-1 sm:px-3">
                  <label
                    className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase flex items-center gap-1"
                    title="Referencial — los paquetes no tienen fecha fija de salida"
                  >
                    Fecha deseada
                    <span className="text-[8px] font-semibold text-secondary normal-case tracking-normal">(referencial)</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    title="Referencial — los paquetes no tienen fecha fija de salida"
                    className="text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none w-full"
                  />
                </div>

                <div className="hidden sm:block self-stretch bg-gray-200 mx-2" aria-hidden="true" />

                {/* Adultos */}
                <div className="flex flex-col gap-1 sm:px-3">
                  <label className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">Adultos</label>
                  <div className="relative">
                    <select
                      value={adults}
                      onChange={e => setAdults(e.target.value)}
                      className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none cursor-pointer pr-5"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={String(n)}>{n} {n === 1 ? 'Adulto' : 'Adultos'}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-0 bottom-2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="hidden sm:block self-stretch bg-gray-200 mx-2" aria-hidden="true" />

                {/* Niños */}
                <div className="flex flex-col gap-1 sm:px-3">
                  <label className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">Niños</label>
                  <div className="relative">
                    <select
                      value={children}
                      onChange={e => setChildren(e.target.value)}
                      className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 pb-1.5 outline-none focus:border-secondary transition-colors appearance-none cursor-pointer pr-5"
                    >
                      {[0,1,2,3,4,5].map(n => (
                        <option key={n} value={String(n)}>{n === 0 ? 'Sin niños' : `${n} ${n === 1 ? 'Niño' : 'Niños'}`}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-0 bottom-2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Botón */}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="sm:ml-3 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light active:scale-95 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap shrink-0"
                >
                  <Search size={14} />
                  Buscar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Barra de filtros adicionales ── */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">

            {/* Chip "Todos" */}
            <button
              onClick={() => { setCityFilter(""); setMinPrice(""); setMaxPrice(""); }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                !cityFilter && !minPrice && !maxPrice
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-primary/60 border-gray-200 hover:border-primary/40 hover:text-primary'
              }`}
            >
              Todos
            </button>

            {/* Dropdown Ciudad */}
            <div className="relative shrink-0">
              <select
                value={cityFilter}
                onChange={e => { setCityFilter(e.target.value); setCurrentPage(1); }}
                className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer outline-none ${
                  cityFilter
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary/60 border-gray-200 hover:border-primary/40 hover:text-primary'
                }`}
              >
                <option value="">Ciudad</option>
                {allCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${cityFilter ? 'text-white' : 'text-primary/40'}`}
              />
            </div>

            {/* Filtro de precio */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-200 ${
              minPrice || maxPrice ? 'bg-secondary/10 border-secondary' : 'bg-white border-gray-200'
            }`}>
              <input
                type="number"
                placeholder="$ Mín"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-16 text-xs font-bold bg-transparent outline-none text-primary placeholder:text-primary/30"
              />
              <span className="text-primary/30 text-xs">—</span>
              <input
                type="number"
                placeholder="$ Máx"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-16 text-xs font-bold bg-transparent outline-none text-primary placeholder:text-primary/30"
              />
              {(minPrice || maxPrice) && (
                <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="text-secondary/60 hover:text-secondary transition-colors">
                  <X size={10} />
                </button>
              )}
            </div>

            {/* Ordenar */}
            <div className="ml-auto relative shrink-0" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(v => !v)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  sortBy
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary/60 border-gray-200 hover:border-primary/40 hover:text-primary'
                }`}
              >
                <SlidersHorizontal size={13} />
                <span className="hidden sm:inline max-w-[110px] truncate">
                  {sortBy ? activeSortLabel?.split(':')[1]?.trim() : 'Ordenar'}
                </span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
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
          ) : fetchError === "DB_FAIL" ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
              <AlertTriangle size={40} className="text-amber-400" />
              <h3 className="text-primary font-bold text-lg">Sin conexión al servidor</h3>
              <p className="text-primary/50 text-sm max-w-xs leading-relaxed">
                No hay conexión con el servidor en este momento. Verifica tu conexión y vuelve a intentarlo.
              </p>
              <button onClick={() => window.location.reload()} className="mt-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light transition-colors">
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* Resumen de búsqueda activa */}
              {(activeDestination || activeDate || activeAdults !== "2" || activeChildren !== "0") && (
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-primary/50 font-medium">Buscando:</span>
                  {activeDestination && <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">{activeDestination}</span>}
                  {activeDate && <span title="Referencial — no filtra resultados" className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full">📅 {new Date(activeDate + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })} <span className="text-primary/40 font-semibold">(deseada)</span></span>}
                  {activeAdults !== "2" && <span className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full">{activeAdults} adultos</span>}
                  {activeChildren !== "0" && <span className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full">{activeChildren} niños</span>}
                  <button onClick={clearAll} className="text-[10px] font-bold text-primary/30 hover:text-primary/60 flex items-center gap-1">
                    <X size={10} /> Limpiar
                  </button>
                </div>
              )}

              {/* Contador + limpiar */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <p className="text-primary/50 text-sm font-medium">
                  <span className="text-primary font-bold">{filtered.length}</span> paquetes
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
                        <PackageCard {...pkg} onClick={() => setSelectedPackage(pkg)} />
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
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-5">
                    <Search size={26} className="text-primary/20" />
                  </div>
                  <h3 className="text-primary font-bold text-lg mb-2">
                    {fetchError === "EMPTY" && !hasFilters ? "Sin paquetes disponibles" : "Sin resultados"}
                  </h3>
                  <p className="text-primary/40 text-sm max-w-xs mb-7 leading-relaxed">
                    {fetchError === "EMPTY" && !hasFilters
                      ? "No hay paquetes registrados en el sistema."
                      : "No encontramos paquetes que coincidan con tu búsqueda o filtros seleccionados."}
                  </p>
                  {hasFilters && (
                    <button
                      onClick={clearAll}
                      className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light transition-colors"
                    >
                      Ver todos los paquetes
                    </button>
                  )}
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

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PaqueteDetailView from "../../components/PaqueteDetailView";
import type { CotizarData, CotPaquete } from "../../cotizar-types";
import { Skeleton } from "@/components/Skeleton";

/** Mirrors PaqueteDetailView's header / gallery / info-card shape while it loads. */
function PaqueteDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <Skeleton className="h-3.5 w-40 mb-6" />
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6 space-y-3">
        <Skeleton className="h-4 w-28 rounded-lg" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="mb-6">
        <Skeleton className="w-full aspect-[16/9] rounded-3xl" />
        <div className="flex gap-2 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-20 h-14 rounded-xl shrink-0" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
        <Skeleton className="h-3.5 w-32 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <Skeleton className="h-3.5 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone package detail page — opened from the "Ver detalles" button in the
 * Paquetes tab. Fetches its own data (no DashboardContext, which only lives inside
 * dashboard/page.tsx) so it works independently, same pattern as
 * dashboard/cotizaciones/[id]/page.tsx.
 */
export default function PaqueteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [paquete, setPaquete] = useState<CotPaquete | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch("/api/cotizar-datos")
      .then(async (r) => {
        if (!r.ok) throw new Error("No se pudo cargar el catálogo de paquetes.");
        return r.json() as Promise<CotizarData>;
      })
      .then((data) => {
        const found = data.paquetes.find((p) => p.id === Number(id));
        if (!found) throw new Error("Paquete no encontrado.");
        setPaquete(found);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light p-6">
        <div className="text-center">
          <p className="text-sm font-black text-primary/60 mb-3">{error}</p>
          <a href="/dashboard" className="text-secondary text-xs font-black uppercase tracking-wider underline underline-offset-4">
            Ir al panel
          </a>
        </div>
      </div>
    );
  }

  if (!paquete) {
    return (
      <div className="min-h-screen bg-light py-8">
        <PaqueteDetailSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8">
      <PaqueteDetailView paquete={paquete} />
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PaqueteDetailView from "../../components/PaqueteDetailView";
import type { CotizarData, CotPaquete } from "../../cotizar-types";

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
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="w-8 h-8 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8">
      <PaqueteDetailView paquete={paquete} />
    </div>
  );
}

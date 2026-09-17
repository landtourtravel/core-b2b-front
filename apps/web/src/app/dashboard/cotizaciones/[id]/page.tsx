"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CotizacionDetailView from "../../components/CotizacionDetailView";
import type { CotizacionExtended } from "../../DashboardContext";
import { Skeleton } from "@/components/Skeleton";

/** Mirrors the document sheet's header / client-trip grid / table shape while it loads. */
function CotizacionDocumentSkeleton() {
  return (
    <div className="max-w-[820px] mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10">
      <div className="flex items-start justify-between gap-4 pb-4 mb-7 border-b-[3px] border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="w-[72px] h-[30px] shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-2.5 w-40" />
          </div>
        </div>
        <div className="space-y-1.5 items-end flex flex-col shrink-0">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-4 w-16 rounded-md mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-6">
        {Array.from({ length: 2 }).map((_, col) => (
          <div key={col}>
            <Skeleton className="h-2.5 w-32 mb-3" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-2 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-2.5 w-40 mb-3" />
      <div className="flex flex-wrap gap-1.5 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-20 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-2.5 w-32 mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Standalone document view for a single cotización — opened in a new tab from
 * the Eye icon in the dashboard. Fetches its own data (no DashboardContext,
 * which only lives inside dashboard/page.tsx) so it works independently.
 */
export default function CotizacionDocumentPage() {
  const { id } = useParams<{ id: string }>();

  const [cot, setCot] = useState<CotizacionExtended | null>(null);
  const [error, setError] = useState<string | null>(null);

  // No placeholder defaults — the document renders only once this (and `cot`) resolve,
  // so nothing fake ("Viajes Andina Tours" etc.) can flash before the real DB data. Every
  // field comes straight from `Agencia` (BD, gestionada por lt-core-admin) — nunca
  // localStorage (esa tabla no tiene columna `direccion`; el viejo hack de Marca Blanca
  // guardaba una dirección inventada ahí, ya no se usa aquí).
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyDescripcion, setAgencyDescripcion] = useState("");
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);
  const [isLoadingAgency, setIsLoadingAgency] = useState(true);

  useEffect(() => {
    fetch("/api/agency/config")
      .then((r) => r.json())
      .then((data) => {
        setAgencyName(data?.nombre ?? "");
        setAgencyEmail(data?.correo ?? "");
        setAgencyPhone(data?.telefono ?? "");
        setAgencyDescripcion(data?.descripcion ?? "");
        setAgencyLogo(data?.logoUrl ?? null);
      })
      .catch(() => {})
      .finally(() => setIsLoadingAgency(false));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/cotizaciones/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || "No se pudo cargar la cotización.");
        }
        return r.json();
      })
      .then(setCot)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  // El navegador usa `document.title` como nombre sugerido al Imprimir/Guardar como PDF —
  // sin esto sugiere el título genérico del layout ("Land Tour & Travel | ...").
  useEffect(() => {
    if (!cot) return;
    document.title = `${cot.codigo} - ${cot.paqueteNombre}`;
  }, [cot]);

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

  if (!cot || isLoadingAgency) {
    return (
      <div className="min-h-screen bg-light py-8 px-4">
        <CotizacionDocumentSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8 px-4 print:p-0 print:bg-white">
      <CotizacionDetailView
        cot={cot}
        agencyName={agencyName}
        agencyEmail={agencyEmail}
        agencyPhone={agencyPhone}
        agencyDescripcion={agencyDescripcion}
        agencyLogo={agencyLogo}
      />
    </div>
  );
}

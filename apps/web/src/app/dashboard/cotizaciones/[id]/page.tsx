"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CotizacionDetailView from "../../components/CotizacionDetailView";
import type { CotizacionExtended } from "../../DashboardContext";

/**
 * Standalone document view for a single cotización — opened in a new tab from
 * the Eye icon in the dashboard. Fetches its own data (no DashboardContext,
 * which only lives inside dashboard/page.tsx) so it works independently.
 */
export default function CotizacionDocumentPage() {
  const { id } = useParams<{ id: string }>();

  const [cot, setCot] = useState<CotizacionExtended | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [agencyName, setAgencyName] = useState("Viajes Andina Tours");
  const [agencyPhone, setAgencyPhone] = useState("+593 912345678");
  const [agencyAddress, setAgencyAddress] = useState("Av. Francisco de Orellana, Guayaquil");
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("agencyConfig");
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        if (cfg.agencyName)    setAgencyName(cfg.agencyName);
        if (cfg.agencyPhone)   setAgencyPhone(cfg.agencyPhone);
        if (cfg.agencyAddress) setAgencyAddress(cfg.agencyAddress);
        if (cfg.agencyLogo)    setAgencyLogo(cfg.agencyLogo);
      } catch {}
    }
    fetch("/api/agency/config")
      .then((r) => r.json())
      .then((data) => {
        if (data?.nombre)   setAgencyName(data.nombre);
        if (data?.telefono) setAgencyPhone(data.telefono);
      })
      .catch(() => {});
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

  if (!cot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="w-8 h-8 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8 px-4 print:p-0 print:bg-white">
      <CotizacionDetailView
        cot={cot}
        agencyName={agencyName}
        agencyPhone={agencyPhone}
        agencyAddress={agencyAddress}
        agencyLogo={agencyLogo}
      />
    </div>
  );
}

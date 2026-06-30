"use client";
import React, { createContext, useContext } from "react";
import type { Cotizacion, CotizacionStatus } from "@land-tour/shared";

// Extended cotizacion type used within the dashboard (adds local-only fields)
export type HotelCompSnapshot = {
  hotelId: number;
  nombre: string;
  estrellas: number;
  // v2 fields: destination grouping + column breakdown
  destinoId?: number;
  destinoCiudad?: string;
  destinoPais?: string;
  tipoPax?: string;
  adultColPerPax?: number;    // alojamiento + services + extra nights, per adult pax
  boletoPerPax?: number;      // flight price per pax (0 when not active)
  // Existing
  avgChildPerPax: number | null;
  pricePerPax: number;        // full all-in price per adult pax (includes markup)
  total: number;
  // Set to true on approval (multi-destino tracking)
  selected?: boolean;
};

export type CotizacionExtended = Cotizacion & {
  hotelsComparison?: HotelCompSnapshot[];
  selectedHotelId?: number | null;
};

export interface DashboardContextValue {
  // Cotizaciones
  cotizaciones: CotizacionExtended[];
  setCotizaciones: React.Dispatch<React.SetStateAction<CotizacionExtended[]>>;
  isLoadingCots: boolean;
  // Agency
  agencyName: string;
  agencyPhone: string;
  agencyAddress: string;
  agencyLogo: string | null;
  agencyMarkup: number;
  setAgencyMarkup: React.Dispatch<React.SetStateAction<number>>;
  defaultMarkup: string;
  // Session
  userName: string;
  agenciaDisplay: string;
  userRoleDisplay: string;
  isAdmin: boolean;
  rawRole: string | undefined;
  // KPIs
  kpiTotal: number;
  kpiAprobadas: number;
  kpiRechazadas: number;
  kpiPendientes: number;
  // Actions
  handleEliminar: (id: string) => Promise<void>;
  patchCotizacionStatus: (id: string, status: CotizacionStatus, extra?: Record<string, unknown>) => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardContext.Provider");
  return ctx;
}

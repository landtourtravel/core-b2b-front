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
  adultColPerPax?: number;    // alojamiento (precioBase×noches, por persona) + servicios LOCALES de su destino, por adulto
  boletoPerPax?: number;      // adult flight price per pax (0 when not active)
  // v3 fields: per-destino breakdown for correct multi-destino combine
  accomTotal?: number;        // total combinable del tramo: alojamiento + servicios locales de ESTE destino (sin boleto/markup)
  sharedTotal?: number;       // boleto + markup — costo global, igual para todos los hoteles, se cuenta UNA sola vez
  // v4 fields: explicit adult/child split (per destino) + child air fare (global)
  adultAccomTotal?: number;     // alojamiento adultos de ESTE destino
  adultServicesTotal?: number;  // servicios locales adultos de ESTE destino
  childAccomTotal?: number;     // alojamiento niños de ESTE destino
  childServicesTotal?: number;  // servicios locales niños de ESTE destino (incluye traslado @ tarifa adulto)
  boletoChildPerPax?: number;   // child flight price per pax (global; 0 when not active)
  // Per-person accommodation total (precioBase×noches) for EACH room type quoted at this
  // hotel/leg (SGL/DBL/TPL/QUAD, CHD excluded) — a cotización can mix room types (e.g. 1
  // SGL + 1 DBL), so `adultAccomTotal` alone (blended across the mix) can't reconstruct
  // the per-type price the document must show. Absent on snapshots saved before this field
  // existed — consumers must fall back to the blended adult price in that case.
  roomRates?: Record<string, number>;
  // Set only by `POST /api/cotizaciones/quick` (cotización rápida never asks for the
  // child's real age — see `getChildRateTiers`). When true and the hotel has more than one
  // configured child price tier, the document shows every tier (age range + price) instead
  // of a single price computed from a guessed default age (previously always 5), which could
  // silently land on the wrong tier when a hotel declares several (bug reported 2026-08-11).
  childAgeUnknown?: boolean;
  childRateTiers?: { label: string; edadMin: number; edadMax: number; accomTotal: number }[];
  // Si el paquete tiene el boleto NO modificable, el B2B no debe ver su precio:
  // se muestra "Incluido" en vez del monto (en pantalla y en el PDF). El monto sigue
  // sumado al total; solo se oculta la cifra. undefined/false = precio visible (legado).
  boletoPrecioOculto?: boolean;
  // Set by the quick-quote endpoint when this hotel has no CHD tarifa: the child's
  // accommodation at this hotel is $0 (not "free" — just unpriced). Never set by the
  // normal wizard flow (its hotelAptoNinos filter excludes such hotels beforehand).
  sinTarifaNino?: boolean;
  // Existing
  avgChildPerPax: number | null;  // v3: suplemento de menores por adulto (legacy display)
  pricePerPax: number;        // full all-in price per adult pax (includes markup)
  total: number;              // accomTotal + sharedTotal — total single-stop de este hotel
  // Set to true on approval (multi-destino tracking)
  selected?: boolean;
};

export type CotizacionExtended = Cotizacion & {
  hotelsComparison?: HotelCompSnapshot[];
  selectedHotelId?: number | null;
  // Estado crudo del wizard al guardar — permite reabrir cotizaciones BORRADOR en edición.
  wizardState?: Record<string, unknown> | null;
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

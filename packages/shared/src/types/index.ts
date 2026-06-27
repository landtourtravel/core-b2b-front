export interface Destino {
  id: number;
  pais: string;
  ciudad: string;
  tagline?: string;
  description?: string;
  image?: string;
  highlights?: string[];
  packageCount?: number;
  color?: string; // Para el gradiente de UI
}

export interface Hotel {
  id: number;
  destinoId: number;
  nombre: string;
  estrellas: number;
  description?: string;
  image?: string;
}

export interface Tarifa {
  id: number;
  tipo: 'HABITACION' | 'ACTIVIDAD' | 'TRASLADO';
  referenciaId: number;
  tipoNombre: string; // Ej: 'DBL', 'ADULTO', 'POR_PERSONA'
  precio: number;
}

export interface ItineraryDay {
  day: number;
  date?: string;
  location?: string;
  title: string;
  description: string;
}

export interface Package {
  id: string | number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  duration: string;
  nochesBase: number;
  diasEstancia: number;
  location: {
    country: string;
    city: string;
  };
  includes: string[];
  notIncludes: string[];
  prices: {
    sgl?: number;
    dbl?: number;
    tpl?: number;
    quad?: number;
    chd?: number;
  };
  hoteles?: Hotel[];
  actividades?: string[];
  traslados?: string[];
  flightIncluded?: boolean;
  incluyeBoleto?: boolean; // campo real de la BD (Paquete.incluyeBoleto)
  transport?: string;
  gallery?: string[];
  // Campos de detalle
  dates?: string;
  airline?: string;
  reservationFee?: number;
  childPrice?: number;
  highlights?: string[];
  itinerary?: ItineraryDay[];
  notes?: string[];
  numPax: number;
  numNinos: number;
  visibleEnFront: boolean;
}

// ─── Autenticación / Usuarios ──────────────────────────────────────────────
//
// Enum RolUsuario definido en la BD (lt-core-admin es la fuente de verdad).
// SUPERADMIN          → admin de Land Tour Travel, opera en lt-core-admin.
// COLABORADOR_INTERNO → personal interno de LTT con acceso al portal B2B.
// ASESOR_MINORISTA    → asesor de agencia minorista: rol estándar del portal B2B.
export type UserRole = 'SUPERADMIN' | 'COLABORADOR_INTERNO' | 'ASESOR_MINORISTA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agenciaId: string;       // Scope: toda acción está limitada a esta agencia
  agenciaNombre?: string;  // Denormalizado para UI sin query extra
}

// ─── Cotizaciones ──────────────────────────────────────────────────────────
//
// Ciclo de vida:
//   BORRADOR → ENVIADA → APROBADA  (Kevin crea liquidación en lt-core-admin)
//                      → RECHAZADA (cliente rechazó, crear nueva cotización)

export type CotizacionStatus = 'BORRADOR' | 'ENVIADA' | 'APROBADA' | 'RECHAZADA';

export const COTIZACION_STATUS_LABEL: Record<CotizacionStatus, string> = {
  BORRADOR:  'Borrador',
  ENVIADA:   'Enviada',
  APROBADA:  'Aprobada',
  RECHAZADA: 'Rechazada',
};

export const COTIZACION_STATUS_COLOR: Record<CotizacionStatus, string> = {
  BORRADOR:  'bg-gray-100 text-gray-600',
  ENVIADA:   'bg-amber-50 text-amber-600',
  APROBADA:  'bg-emerald-50 text-emerald-600',
  RECHAZADA: 'bg-red-50 text-red-500',
};

/// Cliente final (el pasajero) — pertenece a una agencia.
/// No es un User del sistema.
export interface Cliente {
  id: string;
  agenciaId: string;
  nombre: string;
  email?: string;
  telefono?: string;
  documento?: string;  // CC, Pasaporte
  direccion?: string;
}

/// Snapshot de pasajeros por tipo de habitación.
export interface PasajerosCotizacion {
  cantSGL:  number;  // habitaciones simples
  cantDBL:  number;  // habitaciones dobles
  cantTPL:  number;  // habitaciones triples
  cantQUAD: number;  // habitaciones cuádruples
  cantCHD:  number;  // niños
}

/// Snapshot de precios tomados del Paquete al momento de cotizar.
/// Se congela para que cambios futuros en tarifas no afecten cotizaciones pasadas.
export interface PreciosCotizacion {
  precioSGL?:   number;
  precioDBL?:   number;
  precioTPL?:   number;
  precioQUAD?:  number;
  precioCHD?:   number;
  precioBoleto?: number;  // por persona (si incluyeBoleto = true)
}

/// Cotización / Proforma generada por la agencia para un cliente.
export interface Cotizacion {
  id: string;
  codigo: string;            // COT-YYYYMMDD-NNN

  // Referencias
  agenciaId:   string;
  creadoPorId: string;
  paqueteId:   number;
  clienteId:   string;
  cliente?:    Cliente;

  // Snapshot del paquete
  paqueteNombre:   string;
  paqueteDuracion: string;   // "5 Días / 4 Noches"
  paqueteDestino:  string;
  paqueteIncluye:  string[];
  incluyeBoleto:   boolean;

  // Pasajeros y precios
  pasajeros: PasajerosCotizacion;
  precios:   PreciosCotizacion;

  // Totales
  subtotal: number;  // Σ(cant × precio) por tipo
  markup:   number;  // Comisión de la agencia (oculta en PDF)
  total:    number;  // subtotal + markup

  // Fechas de viaje
  fechaViaje?:   string;  // ISO
  fechaRetorno?: string;

  // Estado
  status: CotizacionStatus;
  notas?: string;

  // Timestamps
  fechaCreacion:    string;
  fechaEnvio?:      string;
  fechaAprobacion?: string;
  fechaVencimiento?: string;
}

/// Calcula el subtotal de una cotización a partir de pasajeros y precios.
/// Usar esta función en el cotizador para consistencia en toda la app.
export function calcularSubtotal(
  pasajeros: PasajerosCotizacion,
  precios: PreciosCotizacion
): number {
  return (
    pasajeros.cantSGL  * (precios.precioSGL  ?? 0) +
    pasajeros.cantDBL  * (precios.precioDBL  ?? 0) +
    pasajeros.cantTPL  * (precios.precioTPL  ?? 0) +
    pasajeros.cantQUAD * (precios.precioQUAD ?? 0) +
    pasajeros.cantCHD  * (precios.precioCHD  ?? 0)
  );
}

/// Genera texto legible para el resumen de pasajeros.
/// Ej: "1 SGL, 2 DBL, 1 CHD"
export function resumenPasajeros(p: PasajerosCotizacion): string {
  const partes: string[] = [];
  if (p.cantSGL  > 0) partes.push(`${p.cantSGL} SGL`);
  if (p.cantDBL  > 0) partes.push(`${p.cantDBL} DBL`);
  if (p.cantTPL  > 0) partes.push(`${p.cantTPL} TPL`);
  if (p.cantQUAD > 0) partes.push(`${p.cantQUAD} QUAD`);
  if (p.cantCHD  > 0) partes.push(`${p.cantCHD} CHD`);
  return partes.join(', ') || '—';
}

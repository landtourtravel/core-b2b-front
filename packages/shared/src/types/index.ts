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
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'COLABORADOR' | 'AGENCIA';
}

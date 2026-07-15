// Shared type definitions for the catalog cotizador (wizard, package detail page,
// and the quick-quote API route). No React imports — safe to import from server code.

export interface CotHotelTarifa { id: number; tipoHabitacion: string; precioBase: number }
/**
 * `tarifaChdId` — FK a la fila TarifaHotel (tipoHabitacion="CHD") específica de ESTE rango
 * de edad. Un hotel puede declarar varios rangos CHD (ej. "Niño" 0-3 y "Menor" 4-12), cada
 * uno con su propia tarifa — NO hay una única fila "CHD" por hotel.
 */
export interface CotPoliticaNinos { rangoNombre: string; edadMin: number; edadMax: number; precio: number | null; tarifaChdId: number | null }
export interface CotHotel { id: number; nombre: string; estrellas: number; tarifas: CotHotelTarifa[]; politicaNinos: CotPoliticaNinos[] }
export interface CotActividadTarifa { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }
export interface CotActividad { id: number; nombre: string; descripcion: string | null; tarifas: CotActividadTarifa[] }
export interface CotTrasladoTarifa { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }
export interface CotTraslado { id: number; tipo: string; tarifas: CotTrasladoTarifa[] }
export interface CotDestino { id: number; ciudad: string; pais: string; hoteles: CotHotel[]; actividades: CotActividad[]; traslados: CotTraslado[] }
export interface CotPaqueteVersion { tipoPax: string; numPax: number; precioPorPersona: number | null }
export interface CotPaqueteActividad {
  id: number; nombre: string; descripcion: string | null;
  destinoId: number; destinoCiudad: string;
  tarifas: { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }[];
}
export interface CotPaqueteTraslado {
  id: number; tipo: string; destinoId: number; destinoCiudad: string;
  tarifas: { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }[];
}
export interface CotPaqueteDestino { id: number; ciudad: string; pais: string }
export interface CotPaqueteHotel {
  id: number; nombre: string; estrellas: number;
  destinoId: number; destinoCiudad: string; noches: number;
  tarifas: { id: number; tipoHabitacion: string; precioBase: number }[];
  politicaNinos: CotPoliticaNinos[];
}
/** One day of `ItinerarioDiaRef`, mapped for display (no `location` field — table has none). */
export interface CotPaqueteItinerarioDia { day: number; title: string; description: string }
export interface CotPaquete {
  id: number; nombre: string; numPax: number; numNinos: number; diasEstancia: number; nochesBase: number;
  incluyeBoleto: boolean; precioBoleto: number | null; descripcionBoleto: string | null;
  precioBoletoNino: number | null; descripcionBoletoNino: string | null;
  visibleBoleto: boolean;
  permitirModificarBoleto: boolean; permitirModificarNoches: boolean;
  destinoCiudad: string; destinoPais: string;
  destinos: CotPaqueteDestino[];
  hoteles: CotPaqueteHotel[];
  hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[];
  actividades: CotPaqueteActividad[];
  traslados: CotPaqueteTraslado[];
  versiones: CotPaqueteVersion[];
  imagenes: string[];
  itinerario: CotPaqueteItinerarioDia[];
}
export interface CotizarData { destinos: CotDestino[]; paquetes: CotPaquete[] }

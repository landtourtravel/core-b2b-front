// Shared Prisma include + row→CotPaquete mapping for the catalog cotizador.
// Used by GET /api/cotizar-datos (list) and POST /api/cotizaciones/quick (single lookup)
// so both stay in sync with one source of truth for this complex query shape.
import type { Prisma } from "@/generated/prisma";
import type { CotPaquete, CotPaqueteHotel } from "@/app/dashboard/cotizar-types";

export const paqueteInclude = {
  versiones: { orderBy: { tipoPax: "asc" } },
  hoteles: {
    include: {
      hotel: { include: { destino: true, tarifas: true, politicaNinos: true } },
    },
  },
  actividades: {
    include: { actividad: { include: { destino: true, tarifas: true } } },
  },
  traslados: {
    include: { traslado: { include: { destino: true, tarifas: true } } },
  },
  imagenes: { orderBy: { orden: "asc" } },
  itinerario: { orderBy: { orden: "asc" } },
} satisfies Prisma.PaqueteRefInclude;

export type PaqueteRow = Prisma.PaqueteRefGetPayload<{ include: typeof paqueteInclude }>;

export function mapPaqueteRow(p: PaqueteRow): CotPaquete {
  // Unique destinations from hotels (preserves order of first occurrence)
  const destinosMap = new Map<number, { id: number; ciudad: string; pais: string }>();
  p.hoteles.forEach((ph) => {
    const d = ph.hotel?.destino;
    if (d && !destinosMap.has(d.id)) {
      destinosMap.set(d.id, { id: d.id, ciudad: d.ciudad, pais: d.pais });
    }
  });
  const destinosList = [...destinosMap.values()];
  const primerDestino = destinosList[0];

  // Deduplicate hotels by id, but ACCUMULATE `habitaciones` across every PaqueteHotelRef
  // row for that hotel — a hotel can have several rows (one per tipoHabitacion, e.g.
  // SGL+DBL+TPL+CHD) that together define the package's base room composition. Metadata
  // (nombre/tarifas/politicaNinos) is only set from the FIRST row seen for that hotel.
  const hotelesMap = new Map<number, CotPaqueteHotel>();
  p.hoteles.forEach((ph) => {
    if (!ph.hotel) return;
    let entry = hotelesMap.get(ph.hotel.id);
    if (!entry) {
      entry = {
        id: ph.hotel.id,
        nombre: ph.hotel.nombre,
        estrellas: ph.hotel.estrellas,
        destinoId: ph.hotel.destino?.id ?? 0,
        destinoCiudad: ph.hotel.destino?.ciudad ?? "",
        noches: ph.noches ?? 1,
        tarifas: ph.hotel.tarifas.map((t) => ({
          id: t.id,
          tipoHabitacion: t.tipoHabitacion,
          precioBase: Number(t.precioBase),
        })),
        politicaNinos: ph.hotel.politicaNinos.map((pol) => ({
          rangoNombre: pol.rangoNombre,
          edadMin: pol.edadMin,
          edadMax: pol.edadMax,
          precio: pol.precio ?? null,
          tarifaChdId: pol.tarifaChdId ?? null,
        })),
        habitaciones: [],
      };
      hotelesMap.set(ph.hotel.id, entry);
    }
    entry.habitaciones.push({ tipoHabitacion: ph.tipoHabitacion, cantidad: ph.cantidad });
  });

  const hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[] = [];
  p.hoteles.forEach((ph) => {
    if (ph.hotel?.tarifas) {
      ph.hotel.tarifas.forEach((t) => {
        hotelTarifas.push({
          hotelId: ph.hotel!.id,
          tipoHabitacion: t.tipoHabitacion,
          precioBase: Number(t.precioBase),
        });
      });
    }
  });

  return {
    id: p.id,
    nombre: p.nombre,
    numPax: p.numPax,
    numNinos: p.numNinos,
    diasEstancia: p.diasEstancia,
    nochesBase: p.nochesBase,
    incluyeBoleto: p.incluyeBoleto,
    precioBoleto: p.precioBoleto ?? null,
    precioBoletoNino: p.precioBoletoNino ?? null,
    descripcionBoletoNino: p.descripcionBoletoNino ?? null,
    visibleBoleto: p.visibleBoleto,
    descripcionBoleto: p.descripcionBoleto ?? null,
    permitirModificarBoleto: p.permitirModificarBoleto,
    permitirModificarNoches: p.permitirModificarNoches,
    ajustePrecio: p.ajustePrecio ?? 0,
    gananciaAgencia: p.gananciaAgencia ?? 0,
    precioPorPersona: p.precioPorPersona ?? null,
    destinoCiudad: primerDestino?.ciudad ?? "",
    destinoPais: primerDestino?.pais ?? "",
    destinos: destinosList,
    hoteles: [...hotelesMap.values()],
    hotelTarifas,
    versiones: p.versiones
      .filter((v) => v.precioPorPersona !== null)
      .map((v) => ({
        tipoPax: v.tipoPax,
        numPax: v.numPax,
        precioPorPersona: v.precioPorPersona,
        ajuste: v.ajuste ?? 0,
        gananciaAgencia: v.gananciaAgencia ?? 0,
      })),
    actividades: p.actividades.map((pa) => ({
      id: pa.actividad.id,
      nombre: pa.actividad.nombre,
      descripcion: pa.actividad.descripcion ?? null,
      destinoId: pa.actividad.destinoId,
      destinoCiudad: pa.actividad.destino?.ciudad ?? "",
      tarifas: pa.actividad.tarifas.map((t) => ({
        precio: Number(t.precio),
        tipoPasajero: t.tipoPasajero,
        paxMin: t.paxMin,
        paxMax: t.paxMax,
      })),
    })),
    traslados: p.traslados.map((pt) => ({
      id: pt.traslado.id,
      tipo: pt.traslado.tipo,
      destinoId: pt.traslado.destinoId,
      destinoCiudad: pt.traslado.destino?.ciudad ?? "",
      tarifas: pt.traslado.tarifas.map((t) => ({
        precio: Number(t.precio),
        tipoPasajero: t.tipoPasajero,
        paxMin: t.paxMin,
        paxMax: t.paxMax,
      })),
    })),
    imagenes: p.imagenes.map((i) => i.url),
    itinerario: p.itinerario.map((i) => ({
      day: i.dia,
      title: i.titulo,
      description: i.descripcion ?? "",
    })),
  };
}

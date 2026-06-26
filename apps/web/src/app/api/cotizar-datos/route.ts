import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const destinos = await prisma.destinoRef.findMany({
      include: {
        hoteles: {
          include: { tarifas: true },
          orderBy: { estrellas: "desc" },
        },
        actividades: {
          include: { tarifas: true },
        },
        traslados: {
          include: { tarifas: true },
        },
      },
      orderBy: { ciudad: "asc" },
    });

    const paquetes = await prisma.paqueteRef.findMany({
      where: { visibleEnFront: true },
      include: {
        versiones: { orderBy: { tipoPax: "asc" } },
        hoteles: {
          include: { hotel: { include: { destino: true } } },
        },
        actividades: {
          include: { actividad: { include: { destino: true } } },
        },
        traslados: {
          include: { traslado: { include: { destino: true } } },
        },
      },
      orderBy: { nombre: "asc" },
    });

    const paquetesMapeados = paquetes.map((p) => {
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

      // Deduplicate hotels by id (PaqueteHotelRef has one row per hotelId+tipoHabitacion)
      const hotelesMap = new Map<number, { id: number; nombre: string; estrellas: number }>();
      p.hoteles.forEach((ph) => {
        if (ph.hotel && !hotelesMap.has(ph.hotel.id)) {
          hotelesMap.set(ph.hotel.id, { id: ph.hotel.id, nombre: ph.hotel.nombre, estrellas: ph.hotel.estrellas });
        }
      });

      return {
        id: p.id,
        nombre: p.nombre,
        diasEstancia: p.diasEstancia,
        nochesBase: p.nochesBase,
        incluyeBoleto: p.incluyeBoleto,
        precioBoleto: p.precioBoleto ?? null,
        descripcionBoleto: p.descripcionBoleto ?? null,
        permitirModificarBoleto: p.permitirModificarBoleto,
        permitirModificarNoches: p.permitirModificarNoches,
        destinoCiudad: primerDestino?.ciudad ?? "",
        destinoPais: primerDestino?.pais ?? "",
        destinos: destinosList,
        hoteles: [...hotelesMap.values()],
        versiones: p.versiones
          .filter((v) => v.precioPorPersona !== null)
          .map((v) => ({
            tipoPax: v.tipoPax,
            numPax: v.numPax,
            precioPorPersona: v.precioPorPersona,
          })),
        actividades: p.actividades.map((pa) => ({
          id: pa.actividad.id,
          nombre: pa.actividad.nombre,
          destinoId: pa.actividad.destinoId,
          destinoCiudad: pa.actividad.destino?.ciudad ?? "",
        })),
        traslados: p.traslados.map((pt) => ({
          id: pt.traslado.id,
          tipo: pt.traslado.tipo,
          destinoId: pt.traslado.destinoId,
          destinoCiudad: pt.traslado.destino?.ciudad ?? "",
        })),
      };
    });

    return NextResponse.json({
      destinos: destinos.map((d) => ({
        id: d.id,
        ciudad: d.ciudad,
        pais: d.pais,
        hoteles: d.hoteles.map((h) => ({
          id: h.id,
          nombre: h.nombre,
          estrellas: h.estrellas,
          tarifas: h.tarifas.map((t) => ({
            tipoHabitacion: t.tipoHabitacion,
            precioBase: t.precioBase,
          })),
        })),
        actividades: d.actividades.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          descripcion: a.descripcion ?? null,
          tarifas: a.tarifas.map((t) => ({
            precio: t.precio,
            tipoPasajero: t.tipoPasajero,
            paxMin: t.paxMin,
            paxMax: t.paxMax,
          })),
        })),
        traslados: d.traslados.map((t) => ({
          id: t.id,
          tipo: t.tipo,
          tarifas: t.tarifas.map((tt) => ({
            precio: tt.precio,
            tipoCobro: tt.tipoCobro,
            paxMin: tt.paxMin,
            paxMax: tt.paxMax,
          })),
        })),
      })),
      paquetes: paquetesMapeados,
    });
  } catch (error) {
    console.error("Error en GET /api/cotizar-datos:", error);
    return NextResponse.json({ destinos: [], paquetes: [] }, { status: 503 });
  }
}

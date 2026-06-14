import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const destinos = await prisma.destinoRef.findMany({
      include: {
        hoteles: {
          include: { tarifas: true },
          orderBy: { estrellas: "desc" },
          take: 4,
        },
      },
      orderBy: { ciudad: "asc" },
    });

    const paquetes = await prisma.paqueteRef.findMany({
      include: {
        versiones: { orderBy: { tipoPax: "asc" } },
        hoteles: {
          include: { hotel: { include: { destino: true } } },
          take: 1,
        },
      },
      orderBy: { nombre: "asc" },
    });

    const paquetesMapeados = paquetes.map((p) => {
      const primerHotel = p.hoteles[0]?.hotel;
      return {
        id: p.id,
        nombre: p.nombre,
        diasEstancia: p.diasEstancia,
        nochesBase: p.nochesBase,
        incluyeBoleto: p.incluyeBoleto,
        destinoCiudad: primerHotel?.destino?.ciudad ?? "",
        destinoPais: primerHotel?.destino?.pais ?? "",
        versiones: p.versiones
          .filter((v) => v.precioPorPersona !== null)
          .map((v) => ({
            tipoPax: v.tipoPax,
            numPax: v.numPax,
            precioPorPersona: v.precioPorPersona,
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
      })),
      paquetes: paquetesMapeados,
    });
  } catch (error) {
    console.error("Error en GET /api/cotizar-datos:", error);
    return NextResponse.json({ destinos: [], paquetes: [] }, { status: 503 });
  }
}

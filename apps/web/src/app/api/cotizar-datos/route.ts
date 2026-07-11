import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { paqueteInclude, mapPaqueteRow } from "@/lib/cotizar-paquete-mapper";

export async function GET() {
  const session = await auth();
  if (!session?.user?.agenciaId) {
    return NextResponse.json({ destinos: [], paquetes: [] }, { status: 401 });
  }

  try {
    const destinos = await prisma.destinoRef.findMany({
      include: {
        hoteles: {
          include: { tarifas: true, politicaNinos: true },
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
      include: paqueteInclude,
      orderBy: { nombre: "asc" },
    });

    const paquetesMapeados = paquetes.map(mapPaqueteRow);

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
          politicaNinos: h.politicaNinos.map((pol) => ({
            edadMin: pol.edadMin,
            edadMax: pol.edadMax,
            precio: pol.precio ?? null,
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
            tipoPasajero: tt.tipoPasajero,
            paxMin: tt.paxMin,
            paxMax: tt.paxMax,
          })),
        })),
      })),
      paquetes: paquetesMapeados,
    });
  } catch (error) {
    logError("GET /api/cotizar-datos", error);
    return NextResponse.json({ destinos: [], paquetes: [] }, { status: 503 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Package } from "@land-tour/shared";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const p = await prisma.paqueteRef.findUnique({
      where: { id: Number(id) },
      include: {
        versiones: true,
        imagenes: { orderBy: { orden: "asc" }, take: 1 },
        hoteles: {
          include: { hotel: { include: { destino: true } } },
          take: 1,
        },
        actividades: { include: { actividad: true } },
        traslados:   { include: { traslado: true } },
      },
    });

    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const dblVersion = p.versiones.find((v) => v.tipoPax === "DBL");
    const pkg: Package = {
      id:           String(p.id),
      title:        p.nombre,
      description:  p.descripcion ?? "",
      price:        dblVersion?.precioPorPersona ?? p.precioPorPersona ?? 0,
      image:        p.imagenes[0]?.url ?? "",
      category:     "",
      duration:     `${p.diasEstancia} días / ${p.nochesBase} noches`,
      nochesBase:   p.nochesBase,
      diasEstancia: p.diasEstancia,
      location: {
        country: p.hoteles[0]?.hotel?.destino?.pais   ?? "",
        city:    p.hoteles[0]?.hotel?.destino?.ciudad ?? "",
      },
      includes:    [
        ...p.actividades.map(a => a.actividad.nombre),
        ...p.traslados.map(t => t.traslado.tipo),
      ],
      notIncludes: [],
      prices: {
        sgl:  p.versiones.find((v) => v.tipoPax === "SGL")?.precioPorPersona  ?? 0,
        dbl:  p.versiones.find((v) => v.tipoPax === "DBL")?.precioPorPersona  ?? 0,
        tpl:  p.versiones.find((v) => v.tipoPax === "TPL")?.precioPorPersona  ?? 0,
        quad: p.versiones.find((v) => v.tipoPax === "QUAD")?.precioPorPersona ?? 0,
        chd:  0,
      },
      flightIncluded: p.incluyeBoleto,
      actividades: p.actividades.map(a => a.actividad.nombre),
      traslados:   p.traslados.map(t => t.traslado.tipo),
    };

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('[/api/packages/[id]] Error:', error);
    return NextResponse.json(
      { error: "DB_FAIL", message: "No se pudo conectar a la base de datos." },
      { status: 503 }
    );
  }
}

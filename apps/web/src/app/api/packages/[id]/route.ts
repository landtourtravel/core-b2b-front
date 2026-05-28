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
      include: { destino: true },
    });

    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const pkg: Package = {
      id:           String(p.id),
      title:        p.nombre,
      description:  p.descripcion ?? "",
      price:        p.precioDBL ?? p.precioPorPersona ?? 0,
      image:        p.imagen    ?? "",
      category:     p.categoria ?? "Paquete",
      duration:     `${p.diasEstancia} días / ${p.nochesBase} noches`,
      nochesBase:   p.nochesBase,
      diasEstancia: p.diasEstancia,
      location: {
        country: p.destino?.pais  ?? "",
        city:    p.destino?.ciudad ?? p.nombre,
      },
      includes:    [],
      notIncludes: [],
      prices: {
        sgl:  p.precioSGL  ?? 0,
        dbl:  p.precioDBL  ?? 0,
        tpl:  p.precioTPL  ?? 0,
        quad: p.precioQUAD ?? 0,
        chd:  0,
      },
      flightIncluded: p.incluyeBoleto ?? false,
    };

    return NextResponse.json(pkg);
  } catch {
    return NextResponse.json(
      { error: "DB_FAIL", message: "No se pudo conectar a la base de datos." },
      { status: 503 }
    );
  }
}

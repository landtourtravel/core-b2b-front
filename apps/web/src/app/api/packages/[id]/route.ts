import { NextRequest, NextResponse } from "next/server";
import { Package } from "@land-tour/shared";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// Markup público (+9%) — SOLO para la landing/`/paquetes`. Ver nota en
// /api/packages/route.ts: el cotizador del dashboard nunca usa este markup.
const LANDING_MARKUP = 1.09;
const withMarkup = (n: number | null | undefined): number =>
  n != null && n > 0 ? Math.ceil(n * LANDING_MARKUP) : 0;

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
        imagenes: { orderBy: { orden: "asc" } },
        hoteles: {
          include: { hotel: { include: { destino: true } } },
        },
        actividades: { include: { actividad: true } },
        traslados:   { include: { traslado: true } },
        itinerario:  { orderBy: { orden: "asc" } },
      },
    });

    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const destinosUnicos = [
      ...new Map(
        p.hoteles.map((h) => [h.hotel.destino.id, h.hotel.destino])
      ).values(),
    ];
    const isMultiDestino = destinosUnicos.length > 1;
    const primerDestino = destinosUnicos[0];

    const versionPrice = (tipo: string) =>
      withMarkup(p.versiones.find((v) => v.tipoPax === tipo)?.precioPorPersona);

    const dblVersion = p.versiones.find((v) => v.tipoPax === "DBL");
    const precioBase = dblVersion?.precioPorPersona ?? p.precioPorPersona ?? 0;
    const chdVersion = p.versiones.find((v) => v.tipoPax === "CHD")?.precioPorPersona;

    const itinerary = p.itinerario
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((d) => ({ day: d.dia, title: d.titulo, description: d.descripcion ?? "" }));

    const pkg: Package = {
      id:           String(p.id),
      title:        p.nombre,
      description:  p.descripcion ?? "",
      price:        withMarkup(precioBase),
      image:        p.imagenes[0]?.url ?? "",
      gallery:      p.imagenes.map((img) => img.url),
      category:     "",
      duration:     `${p.diasEstancia} días / ${p.nochesBase} noches`,
      nochesBase:   p.nochesBase,
      diasEstancia: p.diasEstancia,
      location: {
        country: primerDestino?.pais   ?? "",
        city:    primerDestino?.ciudad ?? "",
      },
      isMultiDestino,
      destinos: destinosUnicos.map((d) => ({ id: d.id, ciudad: d.ciudad, pais: d.pais })),
      includes:    [
        ...p.actividades.map(a => a.actividad.nombre),
        ...p.traslados.map(t => t.traslado.tipo),
      ],
      notIncludes: [],
      prices: {
        sgl:  versionPrice("SGL"),
        dbl:  versionPrice("DBL"),
        tpl:  versionPrice("TPL"),
        quad: versionPrice("QUAD"),
        chd:  versionPrice("CHD"),
      },
      childPrice: chdVersion != null ? withMarkup(chdVersion) : undefined,
      flightIncluded:    p.incluyeBoleto,
      incluyeBoleto:     p.incluyeBoleto,
      descripcionBoleto: p.descripcionBoleto ?? undefined,
      precioBoleto:      p.precioBoleto != null ? withMarkup(p.precioBoleto) : undefined,
      ajustePrecio:      p.ajustePrecio ?? 0,
      itinerary:      itinerary.length > 0 ? itinerary : undefined,
      actividades:    p.actividades.map(a => a.actividad.nombre),
      traslados:      p.traslados.map(t => t.traslado.tipo),
      numPax:         p.numPax,
      numNinos:       p.numNinos,
      visibleEnFront: p.visibleEnFront ?? true,
    };

    return NextResponse.json(pkg);
  } catch (error) {
    logError("GET /api/packages/[id]", error);
    return NextResponse.json(
      { error: "DB_FAIL", message: "No se pudo conectar a la base de datos." },
      { status: 503 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Package } from "@land-tour/shared";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// Markup público (+9%) — SOLO para la landing/`/paquetes`. Nunca debe aparecer
// en el cotizador del dashboard (`/api/cotizar-datos` usa sus propias queries
// sin markup). No exportar esta constante.
const LANDING_MARKUP = 1.09;
const withMarkup = (n: number | null | undefined): number =>
  n != null && n > 0 ? Math.ceil(n * LANDING_MARKUP) : 0;

function toPackage(p: {
  id: number;
  nombre: string;
  descripcion: string | null;
  incluyeBoleto: boolean;
  descripcionBoleto: string | null;
  precioBoleto: number | null;
  ajustePrecio: number | null;
  precioPorPersona: number | null;
  numPax: number;
  numNinos: number;
  visibleEnFront: boolean;
  diasEstancia: number;
  nochesBase: number;
  versiones: { tipoPax: string; precioPorPersona: number | null }[];
  imagenes: { url: string }[];
  hoteles: { hotel: { destino: { id: number; pais: string; ciudad: string } } }[];
  actividades: { actividad: { nombre: string } }[];
  traslados: { traslado: { tipo: string } }[];
  itinerario: { dia: number; titulo: string; descripcion: string | null; orden: number }[];
}): Package {
  // ── Destinos únicos del paquete (un paquete puede tener hoteles en varios) ──
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

  return {
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
    itinerary:    itinerary.length > 0 ? itinerary : undefined,
    actividades: p.actividades.map(a => a.actividad.nombre),
    traslados:   p.traslados.map(t => t.traslado.tipo),
    numPax:         p.numPax,
    numNinos:       p.numNinos,
    visibleEnFront: p.visibleEnFront,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // `destino` (landing) actúa como alias de city/country: matchea ciudad o país.
  const destino  = searchParams.get("destino");
  const country  = searchParams.get("country");
  const city     = searchParams.get("city");
  const adultos  = parseInt(searchParams.get("adultos") || "0", 10);
  const ninos    = parseInt(searchParams.get("ninos")   || "0", 10);
  const precioMin = parseFloat(searchParams.get("precioMin") || "0");
  const precioMax = parseFloat(searchParams.get("precioMax") || "0");
  const incluyeBoletoParam = searchParams.get("incluyeBoleto");

  // ── Filtro de destino vía relación hoteles → hotel → destino ──
  // `destino` busca en ciudad o país; `city`/`country` (legacy) son específicos.
  const destinoFilter: Prisma.DestinoRefWhereInput | null = destino
    ? {
        OR: [
          { ciudad: { contains: destino, mode: "insensitive" } },
          { pais:   { contains: destino, mode: "insensitive" } },
        ],
      }
    : city
    ? { ciudad: { contains: city, mode: "insensitive" } }
    : country
    ? { pais: { contains: country, mode: "insensitive" } }
    : null;

  const where: Prisma.PaqueteRefWhereInput = {
    visibleEnFront: true,
    ...(destinoFilter
      ? { hoteles: { some: { hotel: { destino: destinoFilter } } } }
      : {}),
    // numPax / numNinos existen en la BD (capacidad del paquete).
    ...(adultos > 0 ? { numPax: { gte: adultos } } : {}),
    ...(ninos   > 0 ? { numNinos: { gte: ninos } } : {}),
    ...(incluyeBoletoParam !== null
      ? { incluyeBoleto: incluyeBoletoParam === "true" }
      : {}),
  };

  try {
    const rows = await prisma.paqueteRef.findMany({
      where,
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
      orderBy: { id: "asc" },
    });

    let packages = rows.map(toPackage);

    // El precio mostrado es el de la versión DBL (o base) → filtrar sobre `price`
    // en JS mantiene la consistencia con lo que se ve en la PackageCard.
    if (precioMin > 0) packages = packages.filter((p) => p.price >= precioMin);
    if (precioMax > 0) packages = packages.filter((p) => p.price <= precioMax);

    return NextResponse.json(packages satisfies Package[]);
  } catch (error) {
    logError("GET /api/packages", error);
    return new NextResponse(null, { status: 503 });
  }
}

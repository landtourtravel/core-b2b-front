import { NextRequest, NextResponse } from "next/server";
import { Package } from "@land-tour/shared";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

function toPackage(p: {
  id: number;
  nombre: string;
  descripcion: string | null;
  incluyeBoleto: boolean;
  precioPorPersona: number | null;
  numPax: number;
  numNinos: number;
  visibleEnFront: boolean;
  diasEstancia: number;
  nochesBase: number;
  versiones: { tipoPax: string; precioPorPersona: number | null }[];
  imagenes: { url: string }[];
  hoteles: { hotel: { destino: { pais: string; ciudad: string } } }[];
  actividades: { actividad: { nombre: string } }[];
  traslados: { traslado: { tipo: string } }[];
}): Package {
  const dblVersion = p.versiones.find((v) => v.tipoPax === "DBL");
  return {
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
      chd:  p.versiones.find((v) => v.tipoPax === "CHD")?.precioPorPersona  ?? 0,
    },
    flightIncluded: p.incluyeBoleto,
    incluyeBoleto:  p.incluyeBoleto,
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
        imagenes: { orderBy: { orden: "asc" }, take: 1 },
        hoteles: {
          include: { hotel: { include: { destino: true } } },
          take: 1,
        },
        actividades: { include: { actividad: true } },
        traslados:   { include: { traslado: true } },
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

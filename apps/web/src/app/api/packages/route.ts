import { NextRequest, NextResponse } from "next/server";
import { Package } from "@land-tour/shared";
import { prisma } from "@/lib/prisma";
import { MOCK_PACKAGES } from "@/lib/mock-data";

function toPackage(p: {
  id: number;
  nombre: string;
  descripcion: string | null;
  incluyeBoleto: boolean;
  precioPorPersona: number | null;
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
      chd:  0,
    },
    flightIncluded: p.incluyeBoleto,
    actividades: p.actividades.map(a => a.actividad.nombre),
    traslados:   p.traslados.map(t => t.traslado.tipo),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const city    = searchParams.get("city");

  try {
    const rows = await prisma.paqueteRef.findMany({
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

    if (country) packages = packages.filter((p) => p.location.country.toLowerCase().includes(country.toLowerCase()));
    if (city)    packages = packages.filter((p) => p.location.city.toLowerCase().includes(city.toLowerCase()));

    return NextResponse.json(packages satisfies Package[]);
  } catch (error) {
    console.error('[/api/packages] Error:', error);
    let packages = MOCK_PACKAGES;
    if (country) packages = packages.filter((p) => p.location.country.toLowerCase().includes(country.toLowerCase()));
    if (city)    packages = packages.filter((p) => p.location.city.toLowerCase().includes(city.toLowerCase()));
    return NextResponse.json(packages);
  }
}

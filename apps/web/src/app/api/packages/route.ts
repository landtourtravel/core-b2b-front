import { NextRequest, NextResponse } from "next/server";
import { Package } from "@land-tour/shared";
import { prisma } from "@/lib/prisma";

function toPackage(p: any): Package {
  return {
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
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const city    = searchParams.get("city");

  try {
    const rows = await prisma.paqueteRef.findMany({
      include: { destino: true },
      orderBy: { id: "asc" },
    });

    let packages = rows.map(toPackage);

    if (country) packages = packages.filter((p) => p.location.country.toLowerCase().includes(country.toLowerCase()));
    if (city)    packages = packages.filter((p) => p.location.city.toLowerCase().includes(city.toLowerCase()));

    return NextResponse.json(packages satisfies Package[]);
  } catch {
    return NextResponse.json(
      { error: "DB_FAIL", message: "No se pudo conectar a la base de datos." },
      { status: 503 }
    );
  }
}

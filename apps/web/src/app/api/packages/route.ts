import { NextRequest, NextResponse } from "next/server";
import { Package } from "@land-tour/shared";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/auth";

// Markup público (+9%) — SOLO para la landing/`/paquetes`. Nunca debe aparecer
// en el cotizador del dashboard (`/api/cotizar-datos` usa sus propias queries
// sin markup). No exportar esta constante.
const LANDING_MARKUP = 1.09;
const withMarkup = (n: number | null | undefined): number =>
  n != null && n > 0 ? Math.ceil(n * LANDING_MARKUP) : 0;

// Precio "real" para agencias (`?agency=true`, requiere sesión): SIN el +9% público.
// Verificado contra lt-core-admin (WizardClient.tsx/PackageEditorClient.tsx, `calcularResumenVersion`):
// tanto `Paquete.precioPorPersona` (base) como `VersionPaquete.precioPorPersona` (cada versión) YA
// vienen guardados como `costoTotal + ajuste` — el ajuste del admin está horneado en el precio, no
// es un componente aparte a sumar. `gananciaAgencia` no se usa en ningún cálculo de precio dentro de
// lt-core-admin (no aparece en su código en absoluto pese a existir la columna en Supabase) — sumarla
// aquí duplicaba el ajuste y además agregaba un monto que el admin nunca aplicó. El propio catálogo
// del admin (`PaquetesClient.tsx`) también muestra `precioPorPersona` tal cual, sin sumarle nada.
const asIs = (n: number | null | undefined): number => (n != null && n > 0 ? n : 0);

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
}, mode: "public" | "agency"): Package {
  // ── Destinos únicos del paquete (un paquete puede tener hoteles en varios) ──
  const destinosUnicos = [
    ...new Map(
      p.hoteles.map((h) => [h.hotel.destino.id, h.hotel.destino])
    ).values(),
  ];
  const isMultiDestino = destinosUnicos.length > 1;
  const primerDestino = destinosUnicos[0];

  const applyPricing = (n: number | null | undefined) => (mode === "agency" ? asIs(n) : withMarkup(n));

  const versionPrice = (tipo: string) =>
    applyPricing(p.versiones.find((v) => v.tipoPax === tipo)?.precioPorPersona);

  // "Desde $X" = la más económica entre la ocupación BASE (`Paquete.precioPorPersona`, implícita,
  // no vive en `VersionPaquete`) y todas las versiones de adultos configuradas (SGL/DBL/TPL/QUAD;
  // CHD se excluye porque es precio de niño, no una ocupación adulta alternativa).
  const adultVersionPrices = p.versiones
    .filter((v) => v.tipoPax !== "CHD")
    .map((v) => v.precioPorPersona)
    .filter((n): n is number => n != null && n > 0);
  const allOccupancyPrices = [p.precioPorPersona, ...adultVersionPrices].filter(
    (n): n is number => n != null && n > 0
  );
  const precioBase = allOccupancyPrices.length > 0 ? Math.min(...allOccupancyPrices) : 0;

  const chdVersion = p.versiones.find((v) => v.tipoPax === "CHD")?.precioPorPersona;

  const itinerary = p.itinerario
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((d) => ({ day: d.dia, title: d.titulo, description: d.descripcion ?? "" }));

  return {
    id:           String(p.id),
    title:        p.nombre,
    description:  p.descripcion ?? "",
    price:        applyPricing(precioBase),
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
    childPrice: chdVersion != null ? applyPricing(chdVersion) : undefined,
    flightIncluded:    p.incluyeBoleto,
    incluyeBoleto:     p.incluyeBoleto,
    descripcionBoleto: p.descripcionBoleto ?? undefined,
    // En modo agencia se muestra el precio real de BD (sin el +9% público).
    precioBoleto:      p.precioBoleto != null ? applyPricing(p.precioBoleto) : undefined,
    ajustePrecio: p.ajustePrecio ?? 0,
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
  const agencyParam = searchParams.get("agency") === "true";

  // El modo agencia (catálogo del dashboard B2B) requiere sesión — igual que
  // `/api/cotizar-datos` — para no exponer el ajuste/ganancia de cada paquete públicamente.
  if (agencyParam) {
    const session = await auth();
    if (!session?.user?.agenciaId) {
      return NextResponse.json([] satisfies Package[], { status: 401 });
    }
  }
  const mode: "public" | "agency" = agencyParam ? "agency" : "public";

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
    // `visibleEnFront` solo controla la visibilidad en la web pública — el portal B2B
    // (modo agencia) debe ver TODOS los paquetes que el admin creó, los oculte o no del front.
    ...(mode === "public" ? { visibleEnFront: true } : {}),
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

    let packages = rows.map((p) => toPackage(p, mode));

    // El precio mostrado es el de la versión DBL (o base) → filtrar sobre `price`
    // en JS mantiene la consistencia con lo que se ve en la PackageCard.
    if (precioMin > 0) packages = packages.filter((p) => p.price >= precioMin);
    if (precioMax > 0) packages = packages.filter((p) => p.price <= precioMax);

    // Más económico primero, siempre — todos los consumidores de este endpoint (landing,
    // /paquetes, catálogo del panel de agencias) heredan el orden sin ordenar por su cuenta.
    packages.sort((a, b) => a.price - b.price);

    return NextResponse.json(packages satisfies Package[]);
  } catch (error) {
    logError("GET /api/packages", error);
    return new NextResponse(null, { status: 503 });
  }
}

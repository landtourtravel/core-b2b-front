import type { Cliente, Cotizacion, CotizacionDetalle, PrismaClient } from "@/generated/prisma";
import type { IncluyeDestinoGroup } from "@land-tour/shared";

type CotizacionRow = Cotizacion & { cliente: Cliente; detalles: CotizacionDetalle[] };

const PAX_TIPOS = ["SGL", "DBL", "TPL", "QUAD", "CHD"] as const;

/** Shapes a Prisma Cotizacion row (with cliente + detalles) into the flat DTO the frontend expects. */
export function mapCotizacionRow(c: CotizacionRow) {
  const getDetalle = (tipoPax: string) => c.detalles.find((d) => d.tipoPax === tipoPax);

  return {
    id:            c.id,
    codigo:        c.codigo,
    agenciaId:     c.agenciaId,
    creadoPorId:   c.creadoPorId,
    paqueteId:     c.paqueteId,
    clienteId:     c.clienteId,
    cliente:       c.cliente,
    paqueteNombre:   c.snapshotNombre,
    paqueteDuracion: c.snapshotDuracion,
    paqueteDestino:  c.snapshotDestino,
    paqueteIncluye:  c.snapshotIncluye,
    paqueteIncluyeDestinos: (c.snapshotIncluyeDestinos as any) ?? undefined,
    incluyeBoleto:   c.incluyeBoleto,
    pasajeros: Object.fromEntries(
      PAX_TIPOS.map((t) => [`cant${t}`, getDetalle(t)?.cantidad ?? 0])
    ) as Record<`cant${typeof PAX_TIPOS[number]}`, number>,
    precios: {
      precioSGL:    getDetalle("SGL")?.precioPorPersona  ?? 0,
      precioDBL:    getDetalle("DBL")?.precioPorPersona  ?? 0,
      precioTPL:    getDetalle("TPL")?.precioPorPersona  ?? 0,
      precioQUAD:   getDetalle("QUAD")?.precioPorPersona ?? 0,
      precioCHD:    getDetalle("CHD")?.precioPorPersona  ?? 0,
      precioBoleto: c.precioBoleto ?? undefined,
    },
    subtotal:      c.subtotal,
    markup:        c.markup,
    total:         c.total,
    fechaViaje:    c.fechaViaje?.toISOString().slice(0, 10)   ?? null,
    fechaRetorno:  c.fechaRetorno?.toISOString().slice(0, 10) ?? null,
    status:        c.status,
    notas:         c.notas,
    hotelsComparison: (c.hotelsComparisonSnapshot as any) ?? null,
    selectedHotelId:  c.selectedHotelId ?? null,
    wizardState:      (c.wizardState as any) ?? null,
    fechaCreacion: c.fechaCreacion.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Guayaquil" }),
  };
}

/**
 * Resuelve `detalle` (descripción larga) de cada actividad EN VIVO contra `Actividad.descripcion`,
 * por `id` — nunca se congela en BD (solo `nombre`+`id` se persisten, ver `groupIncluyeByDestino`
 * en cotizar-price.ts). Si la actividad fue borrada del catálogo después de cotizada, `detalle`
 * llega vacío pero `nombre` se mantiene intacto (viene congelado). Los traslados no tienen
 * `detalle` en BD (tabla `Traslado` no tiene columna de descripción) — se dejan tal cual.
 *
 * Cotizaciones guardadas antes de este cambio no tienen `id` en sus ítems de actividad; para
 * esas se conserva el `detalle` congelado que ya traían (fallback, sin romper documentos viejos).
 */
export async function attachLiveActividadDetalle<T extends { paqueteIncluyeDestinos?: IncluyeDestinoGroup[] }>(
  dto: T,
  prisma: PrismaClient
): Promise<T> {
  const grupos = dto.paqueteIncluyeDestinos;
  if (!Array.isArray(grupos) || grupos.length === 0) return dto;

  const ids = [...new Set(
    grupos.flatMap((g) => g.actividades.map((a) => a.id).filter((id): id is number => typeof id === "number"))
  )];
  if (ids.length === 0) return dto;

  const rows = await prisma.actividadRef.findMany({ where: { id: { in: ids } }, select: { id: true, descripcion: true } });
  const byId = new Map(rows.map((r) => [r.id, r.descripcion ?? undefined]));

  dto.paqueteIncluyeDestinos = grupos.map((g) => ({
    ...g,
    actividades: g.actividades.map((a) =>
      typeof a.id === "number" ? { ...a, detalle: byId.get(a.id) } : a
    ),
  }));
  return dto;
}

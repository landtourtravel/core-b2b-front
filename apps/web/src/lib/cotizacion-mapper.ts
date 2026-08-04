import type { Cliente, Cotizacion, CotizacionDetalle } from "@/generated/prisma";

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
    fechaCreacion: c.fechaCreacion.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { logError } from "@/lib/logger";
import { mapCotizacionRow } from "@/lib/cotizacion-mapper";

const PAX_BY_TYPE: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

/** Round to 2 decimals to avoid cent drift between UI and DB. */
const r2 = (n: number) => Math.round(n * 100) / 100;

function generateCodigo(agenciaId: string, userId: string, seq: number): string {
  const agCod  = agenciaId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  const usrCod = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `${agCod}-${usrCod}-${String(seq).padStart(4, "0")}`;
}

// `count()` de filas restantes no sirve de base para la secuencia: si se borró alguna
// cotización (BORRADOR/RECHAZADA son borrables), el conteo baja por debajo del máximo ya
// usado y el próximo código generado choca con uno que todavía existe (P2002 en `codigo`,
// @unique). Se toma el máximo sufijo numérico realmente usado por esa agencia+usuario.
async function nextCodigoSeq(agenciaId: string, creadoPorId: string): Promise<number> {
  const last = await prisma.cotizacion.findFirst({
    where: { agenciaId, creadoPorId },
    orderBy: { codigo: "desc" },
    select: { codigo: true },
  });
  const lastSeq = last ? parseInt(last.codigo.slice(-4), 10) || 0 : 0;
  return lastSeq + 1;
}

// GET /api/cotizaciones — lista cotizaciones de la agencia activa
export async function GET() {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json([], { status: 401 });

  try {
    const userId = (session.user as any).id as string;
    const rows = await prisma.cotizacion.findMany({
      where: { agenciaId: session.user.agenciaId, creadoPorId: userId },
      include: { cliente: true, detalles: true },
      orderBy: { fechaCreacion: "desc" },
    });

    const cotizaciones = rows.map(mapCotizacionRow);

    return NextResponse.json(cotizaciones);
  } catch (err) {
    logError("GET /api/cotizaciones", err);
    return NextResponse.json([]);
  }
}

// POST /api/cotizaciones — crea nueva cotización (BORRADOR)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const {
    clienteId, paqueteId,
    paqueteNombre, paqueteDuracion, paqueteDestino, paqueteIncluyeDestinos, incluyeBoleto, precioBoleto,
    cantSGL = 0, cantDBL = 0, cantTPL = 0, cantQUAD = 0, cantCHD = 0,
    precioSGL = 0, precioDBL = 0, precioTPL = 0, precioQUAD = 0, precioCHD = 0,
    subtotal, markup, total,
    fechaViaje, fechaRetorno, notas,
    hotelsComparison, wizardState,
  } = body;

  if (!clienteId || subtotal === undefined) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // ─── Server-side input validation ─────────────────────────────────────────────
  const MAX_PRICE = 1_000_000;
  const isValidAmount = (v: unknown): v is number =>
    typeof v === "number" && isFinite(v) && v >= 0 && v <= MAX_PRICE;
  // `markup` incluye la comisión de agencia (siempre >= 0, piso `Paquete.gananciaAgencia`) MÁS
  // el ajuste de precio automático del paquete (`Paquete.ajustePrecio`), que puede ser negativo
  // (descuento del admin) — el neto puede quedar negativo si el descuento supera la comisión.
  const isValidMarkup = (v: unknown): v is number =>
    typeof v === "number" && isFinite(v) && v >= -MAX_PRICE && v <= MAX_PRICE;
  const isValidCount = (v: unknown): v is number =>
    typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 99;
  if (
    !isValidAmount(subtotal) ||
    !isValidAmount(total) ||
    !isValidMarkup(markup) ||
    !isValidCount(cantSGL) || !isValidCount(cantDBL) ||
    !isValidCount(cantTPL) || !isValidCount(cantQUAD) || !isValidCount(cantCHD)
  ) {
    return NextResponse.json({ error: "Valores numéricos inválidos" }, { status: 400 });
  }
  // `total` ya no debe ser siempre >= subtotal: un ajuste de precio negativo puede llevarlo
  // por debajo del subtotal (alojamiento+servicios). Solo se valida que no sea negativo.
  if (total < 0) {
    return NextResponse.json(
      { error: "El total no puede ser negativo" },
      { status: 400 }
    );
  }

  const agenciaId   = session.user.agenciaId;
  const creadoPorId = (session.user as any).id as string;

  // Construir detalles de habitaciones
  const habitaciones = [
    { tipoPax: "SGL",  cantidad: cantSGL,  precioPorPersona: precioSGL },
    { tipoPax: "DBL",  cantidad: cantDBL,  precioPorPersona: precioDBL },
    { tipoPax: "TPL",  cantidad: cantTPL,  precioPorPersona: precioTPL },
    { tipoPax: "QUAD", cantidad: cantQUAD, precioPorPersona: precioQUAD },
    { tipoPax: "CHD",  cantidad: cantCHD,  precioPorPersona: precioCHD },
  ]
    .filter((h) => h.cantidad > 0)
    .map((h) => {
      const numPax = PAX_BY_TYPE[h.tipoPax] ?? 1;
      const precioPorPersona = r2(h.precioPorPersona);
      const precioUnitario = r2(precioPorPersona * numPax);
      return { tipoPax: h.tipoPax, numPax, cantidad: h.cantidad, precioPorPersona, precioUnitario, subtotal: r2(precioUnitario * h.cantidad) };
    });

  // boletoTotal = precioBoleto × total passengers across all room types
  const totalPax = habitaciones.reduce((sum, h) => sum + h.numPax * h.cantidad, 0);
  const boletoTotal = (incluyeBoleto && precioBoleto) ? r2(precioBoleto * totalPax) : 0;

  try {
    let seq = await nextCodigoSeq(agenciaId, creadoPorId);
    // Reintento acotado ante choque de `codigo` (P2002) — cubre la rara carrera de dos
    // guardados casi simultáneos leyendo la misma secuencia (nextCodigoSeq ya resuelve el
    // caso normal: huecos por cotizaciones borradas).
    for (let attempt = 0; attempt < 3; attempt++) {
      const codigo = generateCodigo(agenciaId, creadoPorId, seq);
      try {
        const cotizacion = await prisma.cotizacion.create({
          data: {
            codigo, agenciaId, creadoPorId, clienteId,
            paqueteId: paqueteId && Number(paqueteId) > 0 ? Number(paqueteId) : null,
            snapshotNombre:   (paqueteNombre   ?? "").slice(0, 200),
            snapshotDestino:  (paqueteDestino  ?? "").slice(0, 200),
            snapshotDuracion: (paqueteDuracion ?? "").slice(0, 100),
            // snapshotIncluye (array plano) ya no se escribe — snapshotIncluyeDestinos lo
            // reemplaza (mismos datos, agrupados, sin duplicar). La columna se conserva solo
            // como fallback de lectura para cotizaciones creadas antes de este cambio.
            snapshotIncluyeDestinos: Array.isArray(paqueteIncluyeDestinos) ? paqueteIncluyeDestinos : Prisma.JsonNull,
            hotelsComparisonSnapshot: Array.isArray(hotelsComparison) ? hotelsComparison : Prisma.JsonNull,
            wizardState: wizardState ?? Prisma.JsonNull,
            incluyeBoleto:    incluyeBoleto   ?? false,
            precioBoleto:     precioBoleto != null ? r2(precioBoleto) : null,
            boletoTotal,
            subtotal: r2(subtotal), markup: r2(markup ?? 0), total: r2(total),
            fechaViaje:   fechaViaje   ? new Date(fechaViaje)   : null,
            fechaRetorno: fechaRetorno ? new Date(fechaRetorno) : null,
            status: "BORRADOR",
            notas:  notas ?? null,
            detalles: { create: habitaciones },
          },
          include: { cliente: true, detalles: true },
        });

        return NextResponse.json(mapCotizacionRow(cotizacion), { status: 201 });
      } catch (err) {
        const isCodigoClash = err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
        if (!isCodigoClash || attempt === 2) throw err;
        seq += 1;
      }
    }
    throw new Error("No se pudo generar un código único");
  } catch (err) {
    logError("POST /api/cotizaciones", err);
    return NextResponse.json({ error: "Error al guardar cotización" }, { status: 500 });
  }
}

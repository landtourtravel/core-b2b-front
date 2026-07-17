import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { logError } from "@/lib/logger";
import { mapCotizacionRow } from "@/lib/cotizacion-mapper";

const PAX_BY_TYPE: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

/** Round to 2 decimals to avoid cent drift between UI and DB. */
const r2 = (n: number) => Math.round(n * 100) / 100;

function generateCodigo(agenciaId: string, userId: string, count: number): string {
  const agCod  = agenciaId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  const usrCod = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  const seq    = String(count + 1).padStart(4, "0");
  return `${agCod}-${usrCod}-${seq}`;
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
    paqueteNombre, paqueteDuracion, paqueteDestino, paqueteIncluye, incluyeBoleto, precioBoleto,
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
  const isValidCount = (v: unknown): v is number =>
    typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 99;
  if (
    !isValidAmount(subtotal) ||
    !isValidAmount(total) ||
    !isValidAmount(markup) ||
    !isValidCount(cantSGL) || !isValidCount(cantDBL) ||
    !isValidCount(cantTPL) || !isValidCount(cantQUAD) || !isValidCount(cantCHD)
  ) {
    return NextResponse.json({ error: "Valores numéricos inválidos" }, { status: 400 });
  }
  if (total < subtotal) {
    return NextResponse.json(
      { error: "El total no puede ser menor al subtotal" },
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

  try {
    const count  = await prisma.cotizacion.count({ where: { agenciaId, creadoPorId } });
    const codigo = generateCodigo(agenciaId, creadoPorId, count);

    // boletoTotal = precioBoleto × total passengers across all room types
    const totalPax = habitaciones.reduce((sum, h) => sum + h.numPax * h.cantidad, 0);
    const boletoTotal = (incluyeBoleto && precioBoleto) ? r2(precioBoleto * totalPax) : 0;

    const cotizacion = await prisma.cotizacion.create({
      data: {
        codigo, agenciaId, creadoPorId, clienteId,
        paqueteId: paqueteId && Number(paqueteId) > 0 ? Number(paqueteId) : null,
        snapshotNombre:   (paqueteNombre   ?? "").slice(0, 200),
        snapshotDestino:  (paqueteDestino  ?? "").slice(0, 200),
        snapshotDuracion: (paqueteDuracion ?? "").slice(0, 100),
        snapshotIncluye:  paqueteIncluye  ?? [],
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
    logError("POST /api/cotizaciones", err);
    return NextResponse.json({ error: "Error al guardar cotización" }, { status: 500 });
  }
}

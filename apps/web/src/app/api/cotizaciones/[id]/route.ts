import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { logError } from "@/lib/logger";
import { mapCotizacionRow } from "@/lib/cotizacion-mapper";

const PAX_BY_TYPE: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

/** Round to 2 decimals to avoid cent drift between UI and DB. */
const r2 = (n: number) => Math.round(n * 100) / 100;

// GET /api/cotizaciones/[id] — una cotización de la agencia/usuario activo
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as any).id as string;

  try {
    const cot = await prisma.cotizacion.findUnique({
      where: { id },
      include: { cliente: true, detalles: true },
    });

    if (!cot) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    if (cot.agenciaId !== session.user.agenciaId || cot.creadoPorId !== userId)
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

    return NextResponse.json(mapCotizacionRow(cot));
  } catch (err) {
    logError("GET /api/cotizaciones/[id]", err);
    return NextResponse.json({ error: "Error al cargar cotización" }, { status: 500 });
  }
}

// PUT /api/cotizaciones/[id] — actualiza una cotización propia en estado BORRADOR
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as any).id as string;

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

  // ─── Server-side input validation (idéntica a POST) ───────────────────────────
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

  try {
    const existing = await prisma.cotizacion.findUnique({
      where: { id },
      select: { status: true, agenciaId: true, creadoPorId: true },
    });

    if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    if (existing.agenciaId !== session.user.agenciaId || existing.creadoPorId !== userId)
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    if (existing.status !== "BORRADOR")
      return NextResponse.json({ error: "Solo se pueden editar cotizaciones en estado Borrador" }, { status: 409 });

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

    const updated = await prisma.cotizacion.update({
      where: { id },
      data: {
        clienteId,
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
        notas: notas ?? null,
        // Reemplaza las líneas de detalle por las del wizard editado.
        detalles: { deleteMany: {}, create: habitaciones },
      },
      include: { cliente: true, detalles: true },
    });

    return NextResponse.json(mapCotizacionRow(updated));
  } catch (err) {
    logError("PUT /api/cotizaciones/[id]", err);
    return NextResponse.json({ error: "Error al actualizar cotización" }, { status: 500 });
  }
}

// DELETE /api/cotizaciones/[id] — solo BORRADOR o RECHAZADA
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as any).id as string;

  try {
    const cot = await prisma.cotizacion.findUnique({ where: { id }, select: { status: true, agenciaId: true, creadoPorId: true } });

    if (!cot) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    if (cot.agenciaId !== session.user.agenciaId || cot.creadoPorId !== userId)
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    if (cot.status === "APROBADA")
      return NextResponse.json({ error: "No se puede eliminar una cotización aprobada" }, { status: 409 });

    await prisma.cotizacion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("DELETE /api/cotizaciones/[id]", err);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}

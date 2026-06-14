import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PAX_BY_TYPE: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

function generateCodigo(count: number): string {
  const now = new Date();
  const d = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `COT-${d}-${String(count + 1).padStart(3, "0")}`;
}

// GET /api/cotizaciones — lista cotizaciones de la agencia activa
export async function GET() {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json([], { status: 401 });

  try {
    const rows = await prisma.cotizacion.findMany({
      where: { agenciaId: session.user.agenciaId },
      include: { cliente: true, detalles: true },
      orderBy: { fechaCreacion: "desc" },
    });

    const cotizaciones = rows.map((c) => {
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
        incluyeBoleto:   c.incluyeBoleto,
        pasajeros: {
          cantSGL:  getDetalle("SGL")?.cantidad  ?? 0,
          cantDBL:  getDetalle("DBL")?.cantidad  ?? 0,
          cantTPL:  getDetalle("TPL")?.cantidad  ?? 0,
          cantQUAD: getDetalle("QUAD")?.cantidad ?? 0,
          cantCHD:  getDetalle("CHD")?.cantidad  ?? 0,
        },
        precios: {
          precioSGL:   getDetalle("SGL")?.precioPorPersona  ?? 0,
          precioDBL:   getDetalle("DBL")?.precioPorPersona  ?? 0,
          precioTPL:   getDetalle("TPL")?.precioPorPersona  ?? 0,
          precioQUAD:  getDetalle("QUAD")?.precioPorPersona ?? 0,
          precioCHD:   getDetalle("CHD")?.precioPorPersona  ?? 0,
          precioBoleto: c.precioBoleto,
        },
        subtotal:      c.subtotal,
        markup:        c.markup,
        total:         c.total,
        fechaViaje:    c.fechaViaje?.toISOString().slice(0, 10) ?? null,
        status:        c.status,
        notas:         c.notas,
        tokenAprobacion: c.tokenAprobacion,
        fechaCreacion: c.fechaCreacion.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" }),
      };
    });

    return NextResponse.json(cotizaciones);
  } catch (err) {
    console.error("GET /api/cotizaciones:", err);
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
  } = body;

  if (!clienteId || subtotal === undefined) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
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
      const precioUnitario = h.precioPorPersona * numPax;
      return { tipoPax: h.tipoPax, numPax, cantidad: h.cantidad, precioPorPersona: h.precioPorPersona, precioUnitario, subtotal: precioUnitario * h.cantidad };
    });

  try {
    const count  = await prisma.cotizacion.count({ where: { agenciaId } });
    const codigo = generateCodigo(count);

    const cotizacion = await prisma.cotizacion.create({
      data: {
        codigo, agenciaId, creadoPorId, clienteId,
        paqueteId: paqueteId && Number(paqueteId) > 0 ? Number(paqueteId) : null,
        snapshotNombre:   paqueteNombre   ?? "",
        snapshotDestino:  paqueteDestino  ?? "",
        snapshotDuracion: paqueteDuracion ?? "",
        snapshotIncluye:  paqueteIncluye  ?? [],
        incluyeBoleto:    incluyeBoleto   ?? false,
        precioBoleto:     precioBoleto    ?? null,
        boletoTotal:      0,
        subtotal, markup: markup ?? 0, total,
        fechaViaje:   fechaViaje   ? new Date(fechaViaje)   : null,
        fechaRetorno: fechaRetorno ? new Date(fechaRetorno) : null,
        status: "BORRADOR",
        notas:  notas ?? null,
        detalles: { create: habitaciones },
      },
      include: { cliente: true, detalles: true },
    });

    const getDetalle = (tipoPax: string) => cotizacion.detalles.find((d) => d.tipoPax === tipoPax);

    return NextResponse.json({
      id:            cotizacion.id,
      codigo:        cotizacion.codigo,
      agenciaId:     cotizacion.agenciaId,
      creadoPorId:   cotizacion.creadoPorId,
      paqueteId:     cotizacion.paqueteId,
      clienteId:     cotizacion.clienteId,
      cliente:       cotizacion.cliente,
      paqueteNombre:   cotizacion.snapshotNombre,
      paqueteDuracion: cotizacion.snapshotDuracion,
      paqueteDestino:  cotizacion.snapshotDestino,
      paqueteIncluye:  cotizacion.snapshotIncluye,
      incluyeBoleto:   cotizacion.incluyeBoleto,
      pasajeros: {
        cantSGL:  getDetalle("SGL")?.cantidad  ?? 0,
        cantDBL:  getDetalle("DBL")?.cantidad  ?? 0,
        cantTPL:  getDetalle("TPL")?.cantidad  ?? 0,
        cantQUAD: getDetalle("QUAD")?.cantidad ?? 0,
        cantCHD:  getDetalle("CHD")?.cantidad  ?? 0,
      },
      precios: {
        precioSGL:   getDetalle("SGL")?.precioPorPersona  ?? 0,
        precioDBL:   getDetalle("DBL")?.precioPorPersona  ?? 0,
        precioTPL:   getDetalle("TPL")?.precioPorPersona  ?? 0,
        precioQUAD:  getDetalle("QUAD")?.precioPorPersona ?? 0,
        precioCHD:   getDetalle("CHD")?.precioPorPersona  ?? 0,
      },
      subtotal:      cotizacion.subtotal,
      markup:        cotizacion.markup,
      total:         cotizacion.total,
      fechaViaje:    cotizacion.fechaViaje?.toISOString().slice(0, 10) ?? null,
      status:        cotizacion.status,
      fechaCreacion: cotizacion.fechaCreacion.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" }),
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/cotizaciones:", err);
    return NextResponse.json({ error: "Error al guardar cotización" }, { status: 500 });
  }
}

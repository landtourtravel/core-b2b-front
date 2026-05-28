import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function generateCodigo(count: number): string {
  const now = new Date();
  const d   = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `COT-${d}-${String(count + 1).padStart(3, "0")}`;
}

// GET /api/cotizaciones — lista cotizaciones de la agencia activa
export async function GET() {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json([], { status: 401 });

  try {
    const rows = await prisma.cotizacion.findMany({
      where: { agenciaId: session.user.agenciaId },
      include: { cliente: true, paquete: true },
      orderBy: { fechaCreacion: "desc" },
    });

    // Mapear a la forma que espera el dashboard (con pasajeros/precios anidados)
    const cotizaciones = rows.map((c) => ({
      id:            c.id,
      codigo:        c.codigo,
      agenciaId:     c.agenciaId,
      creadoPorId:   c.creadoPorId,
      paqueteId:     c.paqueteId,
      clienteId:     c.clienteId,
      cliente:       c.cliente,
      paqueteNombre:   c.paqueteNombre,
      paqueteDuracion: c.paqueteDuracion,
      paqueteDestino:  c.paqueteDestino,
      paqueteIncluye:  c.paqueteIncluye,
      incluyeBoleto:   c.incluyeBoleto,
      pasajeros: { cantSGL: c.cantSGL, cantDBL: c.cantDBL, cantTPL: c.cantTPL, cantQUAD: c.cantQUAD, cantCHD: c.cantCHD },
      precios: { precioSGL: c.precioSGL ?? 0, precioDBL: c.precioDBL ?? 0, precioTPL: c.precioTPL ?? 0, precioQUAD: c.precioQUAD ?? 0, precioCHD: c.precioCHD ?? 0, precioBoleto: c.precioBoleto },
      subtotal:      c.subtotal,
      markup:        c.markup,
      total:         c.total,
      fechaViaje:    c.fechaViaje?.toISOString().slice(0, 10) ?? null,
      status:        c.status,
      notas:         c.notas,
      tokenAprobacion: c.tokenAprobacion,
      fechaCreacion: c.fechaCreacion.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" }),
    }));

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
    paqueteNombre, paqueteDuracion, paqueteDestino, paqueteIncluye, incluyeBoleto,
    cantSGL, cantDBL, cantTPL, cantQUAD, cantCHD,
    precioSGL, precioDBL, precioTPL, precioQUAD, precioCHD, precioBoleto,
    subtotal, markup, total,
    fechaViaje, notas,
  } = body;

  if (!clienteId || !paqueteId || subtotal === undefined) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const agenciaId   = session.user.agenciaId;
  const creadoPorId = (session.user as any).id as string;

  try {
    const count  = await prisma.cotizacion.count({ where: { agenciaId } });
    const codigo = generateCodigo(count);

    const cotizacion = await prisma.cotizacion.create({
      data: {
        codigo, agenciaId, creadoPorId, paqueteId: Number(paqueteId), clienteId,
        paqueteNombre, paqueteDuracion, paqueteDestino,
        paqueteIncluye: paqueteIncluye ?? [],
        incluyeBoleto: incluyeBoleto ?? false,
        cantSGL: cantSGL ?? 0, cantDBL: cantDBL ?? 0, cantTPL: cantTPL ?? 0,
        cantQUAD: cantQUAD ?? 0, cantCHD: cantCHD ?? 0,
        precioSGL: precioSGL ?? null, precioDBL: precioDBL ?? null,
        precioTPL: precioTPL ?? null, precioQUAD: precioQUAD ?? null,
        precioCHD: precioCHD ?? null, precioBoleto: precioBoleto ?? null,
        subtotal, markup: markup ?? 0, total,
        fechaViaje: fechaViaje ? new Date(fechaViaje) : null,
        status: "BORRADOR",
        notas: notas ?? null,
      },
      include: { cliente: true },
    });

    return NextResponse.json({
      ...cotizacion,
      pasajeros: { cantSGL: cotizacion.cantSGL, cantDBL: cotizacion.cantDBL, cantTPL: cotizacion.cantTPL, cantQUAD: cotizacion.cantQUAD, cantCHD: cotizacion.cantCHD },
      precios: { precioSGL: cotizacion.precioSGL ?? 0, precioDBL: cotizacion.precioDBL ?? 0, precioTPL: cotizacion.precioTPL ?? 0, precioQUAD: cotizacion.precioQUAD ?? 0, precioCHD: cotizacion.precioCHD ?? 0 },
      fechaCreacion: cotizacion.fechaCreacion.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" }),
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/cotizaciones:", err);
    return NextResponse.json({ error: "Error al guardar cotización" }, { status: 500 });
  }
}

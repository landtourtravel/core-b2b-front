import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// PATCH /api/cotizaciones/[id]/status — cambia el estado de una cotización
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, selectedHotel, nota } = body;

  const validStatuses = ["BORRADOR", "ENVIADA", "APROBADA", "RECHAZADA"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  try {
    const cotizacion = await prisma.cotizacion.findUnique({ where: { id } });
    if (!cotizacion || cotizacion.agenciaId !== session.user.agenciaId) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const creadoPorId = (session.user as any).id as string;

    const [updated] = await prisma.$transaction([
      prisma.cotizacion.update({
        where: { id },
        data: {
          status,
          notas:           selectedHotel ? `Hotel seleccionado: ${selectedHotel}` : cotizacion.notas,
          fechaAprobacion: status === "APROBADA" ? new Date() : cotizacion.fechaAprobacion,
          fechaEnvio:      status === "ENVIADA"  ? new Date() : cotizacion.fechaEnvio,
        },
      }),
      prisma.historialCotizacion.create({
        data: {
          cotizacionId: id,
          cambiadoPorId: creadoPorId,
          statusAnterior: cotizacion.status,
          statusNuevo: status as any,
          nota: nota ?? null,
        },
      }),
    ]);

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (err) {
    logError("PATCH /api/cotizaciones/[id]/status", err);
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.agenciaId)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    status,
    selectedHotel,        // legacy: string (hotel name for nota)
    selectedHotelId,      // new: number (chosen hotel ID in comparative mode)
    total: newTotal,      // new: recalculated total when approving comparative
    nota,
  } = body;

  const validStatuses = ["BORRADOR", "ENVIADA", "APROBADA", "RECHAZADA"];
  if (!status || !validStatuses.includes(status))
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });

  if (newTotal !== undefined && (typeof newTotal !== "number" || newTotal < 0 || !isFinite(newTotal)))
    return NextResponse.json({ error: "Total inválido" }, { status: 400 });

  try {
    const cotizacion = await prisma.cotizacion.findUnique({ where: { id } });
    if (!cotizacion || cotizacion.agenciaId !== session.user.agenciaId)
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const creadoPorId = (session.user as { id?: string }).id as string;

    const hotelNota = selectedHotel ? `Hotel seleccionado: ${selectedHotel}` : undefined;

    const updateData: Parameters<typeof prisma.cotizacion.update>[0]["data"] = {
      status,
      notas: hotelNota ?? cotizacion.notas,
      fechaAprobacion: status === "APROBADA" ? new Date() : cotizacion.fechaAprobacion,
      fechaEnvio: status === "ENVIADA" ? new Date() : cotizacion.fechaEnvio,
    };

    if (status === "APROBADA" && typeof newTotal === "number") {
      updateData.total = newTotal;
    }

    const [updated] = await prisma.$transaction([
      prisma.cotizacion.update({ where: { id }, data: updateData }),
      prisma.historialCotizacion.create({
        data: {
          cotizacionId: id,
          cambiadoPorId: creadoPorId,
          statusAnterior: cotizacion.status as any,
          statusNuevo: status as any,
          nota: nota ?? hotelNota ?? null,
        },
      }),
    ]);

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (err) {
    logError("PATCH /api/cotizaciones/[id]/status", err);
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}

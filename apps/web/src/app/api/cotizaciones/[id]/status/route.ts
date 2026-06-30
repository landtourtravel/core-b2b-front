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
    selectedHotelId,       // primary hotel ID (single-destino or first in multi)
    selectedHotelIds,      // all selected hotel IDs for multi-destino
    total: newTotal,
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
    const snapshot = cotizacion.hotelsComparisonSnapshot as any[] | null;

    // Validate hotel IDs against stored comparison snapshot
    if (status === "APROBADA") {
      const idsToValidate: number[] = [];
      if (Array.isArray(selectedHotelIds) && selectedHotelIds.length > 0) {
        for (const hId of selectedHotelIds) {
          if (typeof hId !== "number" || !Number.isInteger(hId) || hId <= 0)
            return NextResponse.json({ error: "selectedHotelIds contiene un valor inválido" }, { status: 400 });
          idsToValidate.push(hId);
        }
      } else if (selectedHotelId !== undefined && selectedHotelId !== null) {
        if (typeof selectedHotelId !== "number" || !Number.isInteger(selectedHotelId) || selectedHotelId <= 0)
          return NextResponse.json({ error: "selectedHotelId inválido" }, { status: 400 });
        idsToValidate.push(selectedHotelId);
      }
      if (idsToValidate.length > 0 && Array.isArray(snapshot) && snapshot.length > 0) {
        for (const hId of idsToValidate) {
          if (!snapshot.find((h: any) => h.hotelId === hId))
            return NextResponse.json({ error: "Hotel no válido para esta cotización" }, { status: 400 });
        }
      }
    }

    const updateData: Parameters<typeof prisma.cotizacion.update>[0]["data"] = {
      status,
      notas: nota ?? cotizacion.notas,
      fechaAprobacion: status === "APROBADA" ? new Date() : cotizacion.fechaAprobacion,
      fechaEnvio: status === "ENVIADA" ? new Date() : cotizacion.fechaEnvio,
    };

    if (status === "APROBADA") {
      // Determine primary selected hotel ID
      const primaryId = Array.isArray(selectedHotelIds) && selectedHotelIds.length > 0
        ? selectedHotelIds[0]
        : (typeof selectedHotelId === "number" ? selectedHotelId : null);
      if (primaryId) updateData.selectedHotelId = primaryId;
      if (typeof newTotal === "number") updateData.total = newTotal;

      // Mark selected hotels in comparison snapshot (v2 multi-destino support)
      const allIds = Array.isArray(selectedHotelIds) && selectedHotelIds.length > 0
        ? selectedHotelIds
        : (primaryId ? [primaryId] : []);
      if (allIds.length > 0 && Array.isArray(snapshot) && snapshot.length > 0) {
        updateData.hotelsComparisonSnapshot = snapshot.map((h: any) => ({
          ...h,
          selected: allIds.includes(h.hotelId),
        }));
      }
    }

    const [updated] = await prisma.$transaction([
      prisma.cotizacion.update({ where: { id }, data: updateData }),
      prisma.historialCotizacion.create({
        data: {
          cotizacionId: id,
          cambiadoPorId: creadoPorId,
          statusAnterior: cotizacion.status as any,
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

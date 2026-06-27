import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    console.error("DELETE /api/cotizaciones/[id]:", err);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}

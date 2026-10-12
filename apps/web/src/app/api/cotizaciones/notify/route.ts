import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendCotizacionNotifyEmail } from "@/lib/mailer";
import { logError } from "@/lib/logger";
import { mapCotizacionRow, attachLiveActividadDetalle } from "@/lib/cotizacion-mapper";
import { buildCotizacionEmailHtml } from "@/lib/cotizacion-email";
import type { CotizacionExtended } from "@/app/dashboard/DashboardContext";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const cotizacionId = typeof body?.cotizacionId === "string" ? body.cotizacionId : "";
  const actualizada = body?.actualizada === true;

  // Datos de respaldo (los que manda el navegador) — solo se usan si no se puede armar el
  // documento desde la BD, para no perder el aviso.
  let codigo: string        = body?.codigo ?? "";
  let clienteNombre: string = body?.clienteNombre ?? "";
  let agenciaNombre: string = body?.agenciaNombre ?? "";
  let html: string | undefined;

  // El documento se arma SIEMPRE desde la BD (nunca con precios enviados por el cliente) y
  // solo si la cotización es del asesor y la agencia de la sesión.
  try {
    const userId = (session.user as { id?: string }).id;
    const agenciaId = session.user.agenciaId;
    if (cotizacionId && agenciaId && userId) {
      const row = await prisma.cotizacion.findUnique({
        where: { id: cotizacionId },
        include: { cliente: true, detalles: true },
      });
      if (row && row.agenciaId === agenciaId && row.creadoPorId === userId) {
        const [cot, agencia] = await Promise.all([
          attachLiveActividadDetalle(mapCotizacionRow(row), prisma),
          prisma.agencia.findUnique({
            where: { id: agenciaId },
            select: { nombre: true, descripcion: true, correo: true, telefono: true, logoUrl: true },
          }),
        ]);
        codigo = cot.codigo;
        clienteNombre = cot.cliente?.nombre || clienteNombre;
        agenciaNombre = agencia?.nombre || agenciaNombre;
        html = buildCotizacionEmailHtml(
          cot as unknown as CotizacionExtended,
          {
            nombre:      agencia?.nombre ?? agenciaNombre,
            email:       agencia?.correo ?? "",
            telefono:    agencia?.telefono ?? "",
            descripcion: agencia?.descripcion ?? "",
            logo:        agencia?.logoUrl ?? null,
          },
          { actualizada }
        );
      }
    }
  } catch (err) {
    logError("POST /api/cotizaciones/notify (documento)", err);
  }

  try {
    await sendCotizacionNotifyEmail({
      cotizacionId, codigo, agenciaNombre, clienteNombre, actualizada, html,
      agenciaEmail: session.user.email ?? undefined,
    });
  } catch (err) {
    logError("POST /api/cotizaciones/notify", err);
  }

  return NextResponse.json({ ok: true });
}

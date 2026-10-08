import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendCotizacionNotifyEmail } from "@/lib/mailer";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { cotizacionId, codigo, agenciaEmail, agenciaNombre, clienteNombre, actualizada } = await req.json();

  try {
    await sendCotizacionNotifyEmail({
      cotizacionId, codigo, agenciaEmail, agenciaNombre, clienteNombre,
      actualizada: actualizada === true,
    });
  } catch (err) {
    logError("POST /api/cotizaciones/notify", err);
  }

  return NextResponse.json({ ok: true });
}

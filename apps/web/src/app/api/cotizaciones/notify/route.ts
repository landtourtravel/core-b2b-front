import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendCotizacionNotifyEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { cotizacionId, codigo, agenciaEmail, agenciaNombre, clienteNombre } = await req.json();

  try {
    await sendCotizacionNotifyEmail({ cotizacionId, codigo, agenciaEmail, agenciaNombre, clienteNombre });
  } catch (err) {
    console.error("[NOTIFY] Error enviando correo de cotización:", err);
  }

  return NextResponse.json({ ok: true });
}

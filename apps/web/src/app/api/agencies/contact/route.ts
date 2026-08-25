import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAgencyContactEmail } from "@/lib/mailer";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (v: unknown, max = 200): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "agency-contact", {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta más tarde." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const agencyId    = clean(body.agencyId, 100);
  const senderName   = clean(body.name);
  const senderEmail  = clean(body.email);
  const senderPhone  = clean(body.phone, 30);
  const packageTitle = clean(body.packageTitle, 300);
  const message      = clean(body.message, 2000);

  if (!agencyId || !senderName || !senderEmail || !packageTitle) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  if (!EMAIL_RE.test(senderEmail)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  try {
    // Se busca el correo real en BD (nunca se confía en un destino enviado por el cliente).
    const agency = await prisma.agencia.findUnique({
      where: { id: agencyId },
      select: { nombre: true, correo: true },
    });

    if (!agency || !agency.correo) {
      return NextResponse.json({ error: "Agencia no encontrada." }, { status: 404 });
    }

    await sendAgencyContactEmail({
      agenciaNombre: agency.nombre,
      agenciaEmail:  agency.correo,
      senderName,
      senderEmail,
      senderPhone,
      packageTitle,
      message,
    });
  } catch (err) {
    logError("POST /api/agencies/contact", err);
    return NextResponse.json({ error: "No se pudo enviar el mensaje." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, message: "Mensaje enviado a la agencia. Te contactarán pronto." });
}

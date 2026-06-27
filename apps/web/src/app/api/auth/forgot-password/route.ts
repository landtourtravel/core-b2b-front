import { NextRequest, NextResponse } from "next/server";
import { sendForgotPasswordEmail } from "@/lib/mailer";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "forgot-password", {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta más tarde." },
      { status: 429 }
    );
  }

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Correo requerido." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  if (process.env.ADMIN_EMAIL && process.env.SMTP_USER) {
    try {
      await sendForgotPasswordEmail(email);
    } catch (err) {
      logError("POST /api/auth/forgot-password", err);
    }
  } else {
    console.log(`[FORGOT-PASSWORD] ${email} solicitó cambio de clave — ${new Date().toISOString()}`);
  }

  return NextResponse.json({ ok: true, message: "Se notificó al administrador. Recibirás tus nuevas credenciales pronto." });
}

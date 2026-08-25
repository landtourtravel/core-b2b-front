import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/mailer";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (v: unknown, max = 200): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "contact", {
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
  const name    = clean(body.name);
  const email   = clean(body.email);
  const pkg     = clean(body.package);
  const message = clean(body.message, 2000);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  if (process.env.ADMIN_EMAIL && process.env.SMTP_USER) {
    try {
      await sendContactEmail({ name, email, package: pkg, message });
    } catch (err) {
      logError("POST /api/contact", err);
    }
  } else {
    console.log("[CONTACT]", { name, email, package: pkg, message });
  }

  return NextResponse.json({ ok: true, message: "Mensaje enviado. Te contactaremos pronto." });
}

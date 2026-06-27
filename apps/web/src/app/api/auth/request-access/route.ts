import { NextRequest, NextResponse } from "next/server";
import { sendRequestAccessEmail } from "@/lib/mailer";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

const clean = (v: unknown): string =>
  typeof v === "string" ? v.trim().slice(0, 200) : "";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "request-access", {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta más tarde." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const fullName        = clean(body.fullName);
  const ruc             = clean(body.ruc);
  const idNumber        = clean(body.idNumber);
  const email           = clean(body.email);
  const tourismRegistry = clean(body.tourismRegistry);
  const socialMedia     = clean(body.socialMedia);
  const phone           = clean(body.phone);
  const country         = clean(body.country);
  const city            = clean(body.city);

  if (!fullName || !email || !phone || !idNumber || !ruc || !country || !city) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  if (process.env.ADMIN_EMAIL && process.env.SMTP_USER) {
    try {
      await sendRequestAccessEmail({
        fullName, ruc, idNumber, email, tourismRegistry,
        socialMedia, phone, country, city,
      });
    } catch (err) {
      logError("POST /api/auth/request-access", err);
    }
  } else {
    console.log("[REQUEST-ACCESS]", { fullName, email, phone, idNumber, ruc, country, city });
  }

  return NextResponse.json({ ok: true, message: "Solicitud recibida. El administrador te contactará en 24-48 horas." });
}

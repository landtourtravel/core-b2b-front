import { NextRequest, NextResponse } from "next/server";
import { sendRequestAccessEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    fullName, ruc, idNumber, email, tourismRegistry,
    socialMedia, phone, country, city,
  } = body;

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
      console.error("Email error (request-access):", err);
    }
  } else {
    console.log("[REQUEST-ACCESS]", { fullName, email, phone, idNumber, ruc, country, city });
  }

  return NextResponse.json({ ok: true, message: "Solicitud recibida. El administrador te contactará en 24-48 horas." });
}

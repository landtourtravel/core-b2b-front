import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    fullName, ruc, idNumber, email, tourismRegistry,
    socialMedia, phone, country, city,
  } = body;

  if (!fullName || !email || !phone || !idNumber || !ruc || !country || !city) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  const lines = [
    `Nombre:            ${fullName}`,
    `Email:             ${email}`,
    `Teléfono:          ${phone}`,
    `C.I. / Pasaporte:  ${idNumber}`,
    `RUC / NIT:         ${ruc}`,
    `Registro Turismo:  ${tourismRegistry || "—"}`,
    `País / Ciudad:     ${country}, ${city}`,
    `Redes Sociales:    ${socialMedia || "—"}`,
  ].join("\n");

  const adminEmail = process.env.ADMIN_EMAIL;
  const smtpUser   = process.env.SMTP_USER;

  if (adminEmail && smtpUser) {
    try {
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: { user: smtpUser, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from:    `"Land Tour Portal" <${process.env.SMTP_FROM}>`,
        to:      adminEmail,
        subject: `[SOLICITUD DE ACCESO] ${fullName} — ${city}, ${country}`,
        text:    `Nueva solicitud de acceso al portal B2B:\n\n${lines}\n\nFecha: ${new Date().toLocaleString("es-EC")}`,
      });
    } catch (err) {
      console.error("Email error (request-access):", err);
      // No falla el request — el registro ya se logueó
    }
  } else {
    // Sin SMTP configurado: log en servidor
    console.log("[REQUEST-ACCESS]", lines);
  }

  return NextResponse.json({ ok: true, message: "Solicitud recibida. El administrador te contactará en 24-48 horas." });
}

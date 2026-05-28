import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Correo requerido." }, { status: 400 });
  }

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
        subject: `[CAMBIO DE CLAVE] Solicitud de ${email}`,
        text:    `El usuario con correo ${email} solicita un restablecimiento de contraseña.\n\nPor favor, genera una nueva clave temporal y comunícasela por el canal habitual.\n\nFecha: ${new Date().toLocaleString("es-EC")}`,
      });
    } catch (err) {
      console.error("Email error (forgot-password):", err);
    }
  } else {
    console.log(`[FORGOT-PASSWORD] ${email} solicitó cambio de clave — ${new Date().toISOString()}`);
  }

  return NextResponse.json({ ok: true, message: "Se notificó al administrador. Recibirás tus nuevas credenciales pronto." });
}

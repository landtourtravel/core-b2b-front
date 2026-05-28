import { NextRequest, NextResponse } from "next/server";
import { sendForgotPasswordEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Correo requerido." }, { status: 400 });
  }

  if (process.env.ADMIN_EMAIL && process.env.SMTP_USER) {
    try {
      await sendForgotPasswordEmail(email);
    } catch (err) {
      console.error("Email error (forgot-password):", err);
    }
  } else {
    console.log(`[FORGOT-PASSWORD] ${email} solicitó cambio de clave — ${new Date().toISOString()}`);
  }

  return NextResponse.json({ ok: true, message: "Se notificó al administrador. Recibirás tus nuevas credenciales pronto." });
}

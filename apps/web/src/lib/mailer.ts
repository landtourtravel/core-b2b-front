import nodemailer from "nodemailer";

export interface RequestAccessData {
  fullName:        string;
  ruc:             string;
  idNumber:        string;
  email:           string;
  tourismRegistry: string;
  socialMedia:     string;
  phone:           string;
  country:         string;
  city:            string;
}

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

// AUTH_URL debe apuntar al dominio de producción para que el logo cargue en clientes externos
const baseUrl = (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
const logoUrl = `${baseUrl}/images/lttlogo.png`;

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Land Tour &amp; Travel</title>
</head>
<body style="margin:0;padding:0;background-color:#f5faf9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5faf9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,67,57,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0b4339 0%,#156b5a 100%);padding:32px 40px;text-align:center;">
              <img src="${logoUrl}" alt="Land Tour &amp; Travel" height="56" style="display:inline-block;border:0;" />
            </td>
          </tr>

          <!-- Content -->
          ${content}

          <!-- Footer -->
          <tr>
            <td style="background:#f5faf9;padding:24px 40px;text-align:center;border-top:1px solid #edf7f5;">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.8;">
                Este correo fue generado automáticamente por el sistema de
                <strong style="color:#0b4339;">Land Tour &amp; Travel</strong>.<br/>
                &copy; ${new Date().getFullYear()} Land Tour &amp; Travel &mdash; Mayorista de Turismo
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Template 1: Forgot Password ─────────────────────────────────────────────

function forgotPasswordHtml(userEmail: string): string {
  const date = new Date().toLocaleString("es-EC", { dateStyle: "full", timeStyle: "short" });

  return emailWrapper(`
    <tr>
      <td style="padding:40px;">

        <!-- Icon + Title -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:68px;height:68px;background:#edf7f5;border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="font-size:30px;line-height:68px;">&#128274;</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#0b4339;letter-spacing:-0.5px;">
                Solicitud de Restablecimiento
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;max-width:400px;">
                Un usuario del portal B2B solicit&oacute; un cambio de contrase&ntilde;a.
              </p>
            </td>
          </tr>
        </table>

        <!-- User email box -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#f5faf9;border-left:4px solid #28bfa9;border-radius:0 10px 10px 0;padding:20px 24px;">
              <p style="margin:0 0 4px 0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#28bfa9;">
                Correo del usuario
              </p>
              <p style="margin:0;font-size:19px;font-weight:800;color:#0b4339;">
                ${userEmail}
              </p>
            </td>
          </tr>
        </table>

        <!-- Date -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#edf7f5;border-radius:10px;padding:14px 20px;">
              <p style="margin:0;font-size:12px;color:#6b7280;">
                <strong style="color:#0b4339;">Fecha de solicitud:</strong>&nbsp;${date}
              </p>
            </td>
          </tr>
        </table>

        <!-- Action notice -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px 22px;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.7;">
                <strong>&#9888; Acci&oacute;n requerida:</strong> Genera una nueva contrase&ntilde;a temporal para este usuario y
                comp&aacute;rtela por el canal habitual (WhatsApp o correo directo).
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  `);
}

// ─── Template 2: Request Access ───────────────────────────────────────────────

function requestAccessHtml(data: RequestAccessData): string {
  const date = new Date().toLocaleString("es-EC", { dateStyle: "full", timeStyle: "short" });

  const rows: Array<{ label: string; value: string }> = [
    { label: "Nombre completo",     value: data.fullName },
    { label: "Correo electrónico",  value: data.email },
    { label: "Teléfono",            value: data.phone },
    { label: "C.I. / Pasaporte",    value: data.idNumber },
    { label: "RUC / NIT",           value: data.ruc },
    { label: "Registro de Turismo", value: data.tourismRegistry || "—" },
    { label: "País",                value: data.country },
    { label: "Ciudad",              value: data.city },
    { label: "Redes Sociales",      value: data.socialMedia || "—" },
  ];

  const tableRows = rows
    .map(
      (r, i) => `
      <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f5faf9"};">
        <td style="padding:11px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;border-bottom:1px solid #edf7f5;white-space:nowrap;">
          ${r.label}
        </td>
        <td style="padding:11px 16px;font-size:14px;font-weight:700;color:#0b4339;border-bottom:1px solid #edf7f5;">
          ${r.value}
        </td>
      </tr>`
    )
    .join("");

  return emailWrapper(`
    <tr>
      <td style="padding:40px;">

        <!-- Badge + Title -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span style="display:inline-block;padding:7px 18px;background:#edf7f5;border-radius:100px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#28bfa9;">
                &#10022; Nueva Solicitud
              </span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#0b4339;letter-spacing:-0.5px;">
                Solicitud de Acceso al Portal B2B
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;max-width:400px;">
                Una agencia solicita acceso al portal mayorista. Revisa los datos y asigna credenciales.
              </p>
            </td>
          </tr>
        </table>

        <!-- Data table -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid #edf7f5;margin-bottom:20px;">
          <tr>
            <td colspan="2" style="background:#0b4339;padding:13px 16px;">
              <p style="margin:0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#28bfa9;">
                Datos del Solicitante
              </p>
            </td>
          </tr>
          ${tableRows}
        </table>

        <!-- Date -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#edf7f5;border-radius:10px;padding:14px 20px;">
              <p style="margin:0;font-size:12px;color:#6b7280;">
                <strong style="color:#0b4339;">Fecha de solicitud:</strong>&nbsp;${date}
              </p>
            </td>
          </tr>
        </table>

        <!-- Action notice -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px 22px;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.7;">
                <strong>&#9888; Acci&oacute;n requerida:</strong> Valida el RUC/NIT de la agencia y crea las credenciales
                de acceso en el panel de administraci&oacute;n del portal.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  `);
}

// ─── Template 3: Cotización guardada ─────────────────────────────────────────

export interface CotizacionNotifyData {
  cotizacionId:  string;
  codigo:        string;
  agenciaEmail?: string;
  agenciaNombre: string;
  clienteNombre: string;
}

function cotizacionNotifyHtml(data: CotizacionNotifyData): string {
  const date = new Date().toLocaleString("es-EC", { dateStyle: "full", timeStyle: "short" });
  return emailWrapper(`
    <tr>
      <td style="padding:40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span style="display:inline-block;padding:7px 18px;background:#edf7f5;border-radius:100px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#28bfa9;">
                &#10022; Nueva Cotización
              </span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#0b4339;letter-spacing:-0.5px;">
                Cotización guardada exitosamente
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
                La agencia <strong style="color:#0b4339;">${data.agenciaNombre}</strong> ha generado una nueva cotización.
              </p>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid #edf7f5;margin-bottom:20px;">
          <tr><td colspan="2" style="background:#0b4339;padding:13px 16px;"><p style="margin:0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#28bfa9;">Detalles</p></td></tr>
          <tr style="background:#ffffff;"><td style="padding:11px 16px;font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #edf7f5;">Código</td><td style="padding:11px 16px;font-size:14px;font-weight:800;color:#0b4339;border-bottom:1px solid #edf7f5;">${data.codigo}</td></tr>
          <tr style="background:#f5faf9;"><td style="padding:11px 16px;font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #edf7f5;">Agencia</td><td style="padding:11px 16px;font-size:14px;font-weight:700;color:#0b4339;border-bottom:1px solid #edf7f5;">${data.agenciaNombre}</td></tr>
          <tr style="background:#ffffff;"><td style="padding:11px 16px;font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #edf7f5;">Cliente</td><td style="padding:11px 16px;font-size:14px;font-weight:700;color:#0b4339;border-bottom:1px solid #edf7f5;">${data.clienteNombre}</td></tr>
          <tr style="background:#f5faf9;"><td style="padding:11px 16px;font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;">Fecha</td><td style="padding:11px 16px;font-size:12px;font-weight:700;color:#6b7280;">${date}</td></tr>
        </table>
      </td>
    </tr>
  `);
}

// ─── Exported send functions ──────────────────────────────────────────────────

export async function sendForgotPasswordEmail(userEmail: string): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from:    `"Land Tour Portal" <${process.env.SMTP_FROM}>`,
    to:      process.env.ADMIN_EMAIL,
    subject: `[CAMBIO DE CLAVE] Solicitud de ${userEmail}`,
    text:    `El usuario ${userEmail} solicitó un restablecimiento de contraseña. Fecha: ${new Date().toLocaleString("es-EC")}`,
    html:    forgotPasswordHtml(userEmail),
  });
}

export async function sendCotizacionNotifyEmail(data: CotizacionNotifyData): Promise<void> {
  const transporter = createTransporter();
  const lttEmail = process.env.LAND_TOUR_NOTIFY_EMAIL ?? "reservas@landtourtavel.com";
  const to = [lttEmail, data.agenciaEmail].filter(Boolean).join(", ");
  await transporter.sendMail({
    from:    `"Land Tour Portal" <${process.env.SMTP_FROM}>`,
    to,
    subject: `[COTIZACIÓN] ${data.codigo} — ${data.clienteNombre}`,
    html:    cotizacionNotifyHtml(data),
  });
}

export async function sendRequestAccessEmail(data: RequestAccessData): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from:    `"Land Tour Portal" <${process.env.SMTP_FROM}>`,
    to:      process.env.ADMIN_EMAIL,
    subject: `[SOLICITUD DE ACCESO] ${data.fullName} — ${data.city}, ${data.country}`,
    text:    `Nueva solicitud de acceso al portal B2B de ${data.fullName} (${data.email}). Fecha: ${new Date().toLocaleString("es-EC")}`,
    html:    requestAccessHtml(data),
  });
}

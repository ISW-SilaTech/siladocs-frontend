import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

interface SendAccessCodeData {
  email: string;
  fullName: string;
  institutionName: string;
  code: string;
  signUpUrl: string;
}

function buildEmailHtml(data: SendAccessCodeData): string {
  const now = new Date().toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu código de acceso a Siladocs</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(71,103,237,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4767ed 0%,#7b5cff 100%);padding:36px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Sistema de Registro</p>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">¡Tu solicitud fue aprobada!</h1>
                  </td>
                  <td align="right" valign="middle">
                    <div style="width:52px;height:52px;background:rgba(255,255,255,0.18);border-radius:14px;display:inline-block;line-height:52px;text-align:center;font-size:26px;">🔑</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#eef2ff;padding:14px 40px;border-bottom:2px solid #e0e7ff;">
              <p style="margin:0;color:#4767ed;font-size:14px;font-weight:600;">
                📅 &nbsp;Generado el ${now}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Hola <strong style="color:#111827;">${data.fullName}</strong>, el equipo de Siladocs revisó la solicitud de
                <strong style="color:#111827;">${data.institutionName}</strong> y ha sido aprobada. A continuación
                encontrarás tu código de acceso único para completar el registro de tu institución.
              </p>

              <!-- Code box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f8faff;border:2px dashed #4767ed;border-radius:14px;padding:28px;text-align:center;">
                    <p style="margin:0 0 12px;color:#6b7280;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Código de Acceso</p>
                    <span style="font-size:34px;font-weight:800;letter-spacing:6px;color:#4767ed;display:block;margin-bottom:12px;">${data.code}</span>
                    <span style="display:inline-block;background:#fef3c7;color:#92400e;border-radius:6px;padding:3px 10px;font-size:12px;font-weight:600;">Válido por 7 días</span>
                  </td>
                </tr>
              </table>

              <!-- Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #e0e7ff;border-radius:10px;margin-bottom:8px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;color:#374151;font-size:13px;font-weight:700;">¿Cómo completar tu registro?</p>
                    <p style="margin:0 0 8px;color:#475569;font-size:13px;"><strong style="color:#4767ed;">1.</strong> Haz clic en el botón de abajo o copia el código</p>
                    <p style="margin:0 0 8px;color:#475569;font-size:13px;"><strong style="color:#4767ed;">2.</strong> Valida el código en el formulario de registro</p>
                    <p style="margin:0;color:#475569;font-size:13px;"><strong style="color:#4767ed;">3.</strong> Completa tus datos y crea tu contraseña</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 28px;">
              <a href="${data.signUpUrl}"
                 style="display:inline-block;background:linear-gradient(135deg,#4767ed 0%,#7b5cff 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                Completar mi Registro →
              </a>
              <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                <span style="color:#4767ed;word-break:break-all;">${data.signUpUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8faff;border-top:1px solid #e0e7ff;padding:20px 40px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Este correo fue generado automáticamente por <strong style="color:#4767ed;">Siladocs</strong> — Sistema de Gestión de Sílabos con Blockchain.<br/>
                Si no solicitaste este acceso, puedes ignorar este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body: SendAccessCodeData = await req.json();

    if (!body.email || !body.fullName || !body.institutionName || !body.code || !body.signUpUrl) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      console.error('GMAIL_USER or GMAIL_PASSWORD not configured');
      return NextResponse.json({ error: 'Servicio de email no configurado' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailPassword },
    });

    await transporter.sendMail({
      from: `"Siladocs" <${gmailUser}>`,
      to: body.email,
      subject: '✅ Tu código de acceso a Siladocs está listo',
      html: buildEmailHtml(body),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending access code email:', error);
    return NextResponse.json({ error: 'Error al enviar el correo con el código de acceso' }, { status: 500 });
  }
}

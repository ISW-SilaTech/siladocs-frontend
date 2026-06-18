import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

interface SendPasswordResetData {
  email: string;
  userName: string;
  code: string;
}

function buildEmailHtml(data: SendPasswordResetData): string {
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
  <title>Recupera tu contraseña de Siladocs</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(71,103,237,0.10);">

          <tr>
            <td style="background:linear-gradient(135deg,#4767ed 0%,#7b5cff 100%);padding:36px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Seguridad de la cuenta</p>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Recupera tu contraseña</h1>
                  </td>
                  <td align="right" valign="middle">
                    <div style="width:52px;height:52px;background:rgba(255,255,255,0.18);border-radius:14px;display:inline-block;line-height:52px;text-align:center;font-size:26px;">🔒</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#eef2ff;padding:14px 40px;border-bottom:2px solid #e0e7ff;">
              <p style="margin:0;color:#4767ed;font-size:14px;font-weight:600;">
                📅 &nbsp;Solicitado el ${now}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Hola <strong style="color:#111827;">${data.userName}</strong>, recibimos una solicitud para restablecer la contraseña
                de tu cuenta en Siladocs. Usa el siguiente código de verificación para continuar con el proceso.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f8faff;border:2px dashed #4767ed;border-radius:14px;padding:28px;text-align:center;">
                    <p style="margin:0 0 12px;color:#6b7280;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Código de Verificación</p>
                    <span style="font-size:34px;font-weight:800;letter-spacing:6px;color:#4767ed;display:block;margin-bottom:12px;">${data.code}</span>
                    <span style="display:inline-block;background:#fef3c7;color:#92400e;border-radius:6px;padding:3px 10px;font-size:12px;font-weight:600;">Válido por 15 minutos</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                Si no solicitaste este cambio, puedes ignorar este correo: tu contraseña seguirá siendo la misma.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f8faff;border-top:1px solid #e0e7ff;padding:20px 40px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Este correo fue generado automáticamente por <strong style="color:#4767ed;">Siladocs</strong> — Sistema de Gestión de Sílabos con Blockchain.
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
    const body: SendPasswordResetData = await req.json();

    if (!body.email || !body.userName || !body.code) {
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
      subject: '🔒 Código de recuperación de contraseña - Siladocs',
      html: buildEmailHtml(body),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return NextResponse.json({ error: 'Error al enviar el correo de recuperación' }, { status: 500 });
  }
}

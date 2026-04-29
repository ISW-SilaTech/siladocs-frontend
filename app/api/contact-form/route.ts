import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ContactFormData {
  institutionName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
}

function buildEmailHtml(data: ContactFormData): string {
  const fullName = `${data.firstName} ${data.lastName}`;
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
  <title>Nueva Solicitud de Contacto</title>
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
                    <p style="margin:0 0 4px;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Sistema de Contacto</p>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Nueva Solicitud de Información</h1>
                  </td>
                  <td align="right" valign="middle">
                    <div style="width:52px;height:52px;background:rgba(255,255,255,0.18);border-radius:14px;display:inline-block;line-height:52px;text-align:center;font-size:26px;">📩</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#eef2ff;padding:14px 40px;border-bottom:2px solid #e0e7ff;">
              <p style="margin:0;color:#4767ed;font-size:14px;font-weight:600;">
                📅 &nbsp;Recibido el ${now}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Has recibido una nueva solicitud de información. A continuación encontrarás todos los detalles del contacto.
              </p>

              <!-- Info cards -->
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Institución -->
                <tr>
                  <td style="padding-bottom:12px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #e0e7ff;border-radius:10px;overflow:hidden;">
                      <tr>
                        <td width="6" style="background:linear-gradient(180deg,#4767ed,#7b5cff);"></td>
                        <td style="padding:14px 16px;">
                          <p style="margin:0 0 2px;color:#6b7280;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Institución</p>
                          <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${data.institutionName}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Nombre -->
                <tr>
                  <td style="padding-bottom:12px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #e0e7ff;border-radius:10px;overflow:hidden;">
                      <tr>
                        <td width="6" style="background:linear-gradient(180deg,#4767ed,#7b5cff);"></td>
                        <td style="padding:14px 16px;">
                          <p style="margin:0 0 2px;color:#6b7280;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Nombre Completo</p>
                          <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${fullName}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Email y teléfono en 2 columnas -->
                <tr>
                  <td style="padding-bottom:12px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="49%" style="padding-right:6px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #e0e7ff;border-radius:10px;overflow:hidden;">
                            <tr>
                              <td width="6" style="background:linear-gradient(180deg,#4767ed,#7b5cff);"></td>
                              <td style="padding:14px 16px;">
                                <p style="margin:0 0 2px;color:#6b7280;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Email</p>
                                <a href="mailto:${data.email}" style="margin:0;color:#4767ed;font-size:14px;font-weight:600;text-decoration:none;">${data.email}</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="49%" style="padding-left:6px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #e0e7ff;border-radius:10px;overflow:hidden;">
                            <tr>
                              <td width="6" style="background:linear-gradient(180deg,#4767ed,#7b5cff);"></td>
                              <td style="padding:14px 16px;">
                                <p style="margin:0 0 2px;color:#6b7280;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Teléfono</p>
                                <p style="margin:0;color:#111827;font-size:14px;font-weight:600;">${data.phone || '—'}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${data.message ? `
                <!-- Mensaje -->
                <tr>
                  <td style="padding-bottom:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;overflow:hidden;">
                      <tr>
                        <td width="6" style="background:linear-gradient(180deg,#f59e0b,#fbbf24);"></td>
                        <td style="padding:14px 16px;">
                          <p style="margin:0 0 8px;color:#6b7280;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Mensaje</p>
                          <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap;">${data.message}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}

              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 36px;">
              <a href="mailto:${data.email}?subject=Re:%20Solicitud%20de%20Información%20-%20${encodeURIComponent(data.institutionName)}"
                 style="display:inline-block;background:linear-gradient(135deg,#4767ed 0%,#7b5cff 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                Responder a ${data.firstName} →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8faff;border-top:1px solid #e0e7ff;padding:20px 40px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Este correo fue generado automáticamente por <strong style="color:#4767ed;">Siladocs</strong> — Sistema de Gestión de Sílabos con Blockchain.<br/>
                Por favor no respondas directamente a este email.
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
    const body: ContactFormData = await req.json();

    if (!body.institutionName || !body.firstName || !body.lastName || !body.email) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_PASSWORD;
    const adminEmail = process.env.CONTACT_ADMIN_EMAIL || gmailUser;

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
      from: `"Siladocs Contacto" <${gmailUser}>`,
      to: adminEmail,
      replyTo: body.email,
      subject: `Nueva solicitud: ${body.institutionName} — ${body.firstName} ${body.lastName}`,
      html: buildEmailHtml(body),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error sending contact email:', error);
    return NextResponse.json({ error: 'Error al enviar el mensaje' }, { status: 500 });
  }
}

const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM    = process.env.RESEND_FROM || 'lawkit <onboarding@resend.dev>';

let resend = null;
if (RESEND_API_KEY) resend = new Resend(RESEND_API_KEY);

/**
 * Convierte texto plano a HTML con saltos de línea y reemplaza [link] por el link público.
 */
function textoAHtml(texto, link) {
  const escapado = (texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escapado
    .replace(/\[link\]/g, `<a href="${link}" style="color:#9A6510">${link}</a>`)
    .split('\n')
    .map(l => l.trim() ? `<p style="margin:0 0 12px 0">${l}</p>` : '')
    .join('');
}

function plantilla({ mensaje, link, nombreAbogado }) {
  const cuerpo = textoAHtml(mensaje, link);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#EFEEEA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFEEEA;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="padding:28px 32px 20px 32px;text-align:center;background-color:#1F2125;">
          <div style="font-size:28px;font-weight:600;letter-spacing:-0.5px;color:#ffffff;line-height:1;">lawkit<span style="display:inline-block;width:8px;height:8px;background-color:#E0A52E;border-radius:50%;margin-left:4px;vertical-align:baseline;"></span></div>
        </td></tr>
        <tr><td style="padding:28px 32px;font-size:15px;line-height:1.6;color:#334155;">
          ${cuerpo}
          <div style="text-align:center;margin:28px 0 8px 0;">
            <a href="${link}" style="display:inline-block;background-color:#E0A52E;color:#1F2125;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
              Ver presupuesto
            </a>
          </div>
          <p style="font-size:12px;color:#94a3b8;text-align:center;margin:16px 0 0 0;">
            O copia este link en tu navegador:<br>
            <span style="word-break:break-all;">${link}</span>
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:12px;color:#94a3b8;">
          ${nombreAbogado ? `Enviado por ${nombreAbogado} · ` : ''}lawkit
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function enviarPresupuesto({ destinatario, asunto, mensaje, link, nombreAbogado, emailAbogado }) {
  if (!resend) {
    throw { status: 500, mensaje: 'RESEND_API_KEY no configurado en el backend' };
  }
  if (!destinatario) {
    throw { status: 400, mensaje: 'El prospecto no tiene correo registrado' };
  }

  const html = plantilla({ mensaje, link, nombreAbogado });

  const payload = {
    from: RESEND_FROM,
    to: [destinatario],
    subject: asunto,
    html,
  };
  if (emailAbogado) payload.reply_to = emailAbogado;

  const { data, error } = await resend.emails.send(payload);
  if (error) {
    console.error('Error Resend:', error);
    throw { status: 502, mensaje: error.message || 'Error enviando correo' };
  }
  return data;
}

/**
 * Plantilla del correo "Portal de ingreso" para el cliente nuevo
 * (luego del primer pago).
 */
function plantillaPortalIngreso({ nombreCliente, link, nombreAbogado }) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#EFEEEA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFEEEA;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="padding:28px 32px 20px 32px;text-align:center;background-color:#1F2125;">
          <div style="font-size:28px;font-weight:600;letter-spacing:-0.5px;color:#ffffff;line-height:1;">lawkit<span style="display:inline-block;width:8px;height:8px;background-color:#E0A52E;border-radius:50%;margin-left:4px;vertical-align:baseline;"></span></div>
        </td></tr>
        <tr><td style="padding:28px 32px;font-size:15px;line-height:1.6;color:#334155;">
          <p style="margin:0 0 12px 0">Hola ${nombreCliente || ''},</p>
          <p style="margin:0 0 12px 0">¡Gracias por confiar en nosotros! Recibimos tu primer pago.</p>
          <p style="margin:0 0 20px 0">Para terminar de ingresarte como cliente y comenzar a trabajar en tu caso, necesitamos algunos datos. Solo te tomará unos minutos.</p>
          <div style="text-align:center;margin:28px 0 8px 0;">
            <a href="${link}" style="display:inline-block;background-color:#E0A52E;color:#1F2125;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
              Completar mis datos
            </a>
          </div>
          <p style="font-size:12px;color:#94a3b8;text-align:center;margin:16px 0 0 0;">
            O copia este link en tu navegador:<br>
            <span style="word-break:break-all;">${link}</span>
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:12px;color:#94a3b8;">
          ${nombreAbogado ? `Enviado por ${nombreAbogado} · ` : ''}lawkit
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function enviarPortalIngreso({ destinatario, nombreCliente, link, nombreAbogado, emailAbogado }) {
  if (!resend) {
    console.warn('RESEND_API_KEY no configurado: no se enviará correo del portal');
    return null;
  }
  if (!destinatario) {
    console.warn('Cliente sin email: no se enviará correo del portal');
    return null;
  }

  const payload = {
    from: RESEND_FROM,
    to: [destinatario],
    subject: 'Completa tus datos para activar tu ficha - lawkit',
    html: plantillaPortalIngreso({ nombreCliente, link, nombreAbogado }),
  };
  if (emailAbogado) payload.reply_to = emailAbogado;

  try {
    const { data, error } = await resend.emails.send(payload);
    if (error) {
      console.error('Error Resend (portal):', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Error enviando portal:', err);
    return null;
  }
}

module.exports = { enviarPresupuesto, enviarPortalIngreso };

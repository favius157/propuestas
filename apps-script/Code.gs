/**
 * Envío de la selección de las propuestas modulares desde el Gmail de UNISOFT.
 * Publicar como Aplicación web: Ejecutar como "Yo", acceso "Cualquier usuario".
 */
const DESTINO = 'faviolpz58@gmail.com,juanhosting@gmail.com';
const RESPONDER_A = 'faviolpz58@gmail.com';
const REMITENTE = 'UNISOFT';

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) || '';
    if (raw.length > 20000) return json_({ success: false, message: 'Solicitud demasiado grande' });
    const data = JSON.parse(raw);
    const email = String(data.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ success: false, message: 'Correo no válido' });
    const filas = Array.isArray(data.filas) ? data.filas.slice(0, 30) : [];
    const cliente = String(data.cliente || 'Clínica Jiménez').trim().slice(0, 80) || 'Clínica Jiménez';

    const tabla = filas.map(function (f) {
      return '<tr><td style="padding:8px 12px;border:1px solid #d3e1e2;background:#eef4f4;font-weight:bold;white-space:nowrap">'
        + esc_(f[0]) + '</td><td style="padding:8px 12px;border:1px solid #d3e1e2">' + esc_(f[1]) + '</td></tr>';
    }).join('');
    const cuerpo = function (intro) {
      return '<div style="font-family:Arial,sans-serif;color:#16252b;max-width:640px">'
        + '<div style="background:#0f7e8a;color:#fff;padding:12px 16px;font-weight:bold;letter-spacing:1px">UNISOFT</div>'
        + '<p style="margin:16px 0">' + intro + '</p>'
        + '<table style="border-collapse:collapse;width:100%;font-size:14px">' + tabla + '</table>'
        + '<p style="margin:16px 0;color:#5b6f75;font-size:13px">UNISOFT · Soluciones tecnológicas</p></div>';
    };

    // Aviso para UNISOFT
    MailApp.sendEmail({
      to: DESTINO,
      replyTo: email,
      subject: 'Selección de propuesta · ' + cliente + ' · ' + email,
      htmlBody: cuerpo('Se recibió una selección de la propuesta modular para <b>' + esc_(cliente) + '</b>. Correo del cliente: <b>' + esc_(email) + '</b>.'),
      name: REMITENTE
    });
    // Copia para el cliente
    MailApp.sendEmail({
      to: email,
      replyTo: RESPONDER_A,
      subject: 'Su selección · Propuesta UNISOFT para ' + cliente,
      htmlBody: cuerpo('Gracias. Recibimos su selección de la propuesta. Este es el resumen de lo que eligió; nos pondremos en contacto con usted.'),
      name: REMITENTE
    });
    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, message: String(err && err.message || err) });
  }
}

function doGet() {
  return json_({ ok: true, servicio: 'propuesta-clinica-jimenez' });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function esc_(t) {
  return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

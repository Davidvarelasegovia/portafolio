import nodemailer from "nodemailer";

const DESTINO_POR_DEFECTO = "davidvareladavid@gmail.com";

const getTransport = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "Faltan EMAIL_USER o EMAIL_PASS en las variables de entorno"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

const fila = (etiqueta, valor) => `
  <tr>
    <td style="padding:8px 12px;border-bottom:1px solid #e5e5f5;color:#666;font-size:13px;white-space:nowrap;">
      ${etiqueta}
    </td>
    <td style="padding:8px 12px;border-bottom:1px solid #e5e5f5;color:#1a1a2e;font-size:14px;font-weight:500;">
      ${valor ?? "—"}
    </td>
  </tr>`;

const escaparHtml = (texto) =>
  String(texto ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]
  );

const escaparUrl = (url) => {
  const limpio = String(url ?? "").trim();
  if (!limpio) return "No presente";
  return escaparHtml(limpio);
};

const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleString("es-CL", {
    timeZone: process.env.TZ || "America/Santiago",
    dateStyle: "full",
    timeStyle: "medium",
  });

/**
 * Envía el resumen diario de visitas al correo configurado.
 */
export const enviarResumenDiario = async ({ visitas, totalDia, totalAbsoluto, sitio }) => {
  const transporte = getTransport();
  const destino = process.env.EMAIL_DESTINO || DESTINO_POR_DEFECTO;

  const fechaTitulo = formatearFecha(new Date());
  const asunto = `📊 Resumen de visitas — ${fechaTitulo}`;

  const filasVisitas = visitas
    .map(
      (v, i) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5f5;font-size:13px;color:#3931e1;font-weight:600;">
          ${i + 1}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5f5;font-size:13px;color:#1a1a2e;">
          ${escaparHtml(
            new Date(v.fecha).toLocaleTimeString("es-CL", {
              timeZone: process.env.TZ || "America/Santiago",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          )}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5f5;font-size:13px;color:#1a1a2e;">
          ${escaparHtml(
            [v.ciudad, v.region].filter(Boolean).join(", ") || "Desconocida"
          )}<br>
          <span style="color:#888;">${escaparHtml(v.pais)}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5f5;font-size:13px;color:#4a4b6d;">
          ${escaparHtml(v.pagina || "/")}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5f5;font-size:13px;color:#4a4b6d;">
          ${escaparHtml(v.navegador)} · ${escaparHtml(v.sistema)}<br>
          <span style="color:#888;">${escaparHtml(v.dispositivo)}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5f5;font-size:12px;color:#999;font-family:monospace;">
          ${escaparHtml(v.ip)}
        </td>
      </tr>`
    )
    .join("");

  const html = `
  <!doctype html>
  <html lang="es">
    <body style="margin:0;padding:24px;background:#f3f0ff;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:900px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">

        <div style="background:linear-gradient(135deg,#3931e1,#5b52f0);padding:28px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">Resumen diario de visitas</h1>
          <p style="margin:6px 0 0;color:#dcd9ff;font-size:14px;">
            ${escaparHtml(fechaTitulo)}
          </p>
        </div>

        <div style="padding:28px 32px;">
          <table style="width:100%;border-collapse:separate;border-spacing:10px 0;margin-bottom:28px;">
            <tr>
              <td style="background:#f7f7fd;border-radius:10px;padding:18px;text-align:center;">
                <div style="font-size:30px;font-weight:bold;color:#3931e1;">${totalDia}</div>
                <div style="font-size:13px;color:#666;margin-top:4px;">Visitas hoy</div>
              </td>
              <td style="background:#f7f7fd;border-radius:10px;padding:18px;text-align:center;">
                <div style="font-size:30px;font-weight:bold;color:#232155;">${totalAbsoluto}</div>
                <div style="font-size:13px;color:#666;margin-top:4px;">Total histórico</div>
              </td>
              <td style="background:#f7f7fd;border-radius:10px;padding:18px;text-align:center;">
                <div style="font-size:30px;font-weight:bold;color:#25D366;">
                  ${new Set(visitas.map((v) => v.pais)).size}
                </div>
                <div style="font-size:13px;color:#666;margin-top:4px;">Países distintos hoy</div>
              </td>
            </tr>
          </table>

          ${
            visitas.length === 0
              ? `<div style="background:#f7f7fd;border-radius:10px;padding:26px;text-align:center;color:#888;">
                   No se registraron visitas hoy.
                 </div>`
              : `
          <h2 style="font-size:17px;color:#232155;margin:0 0 12px;">
            Detalle de las visitas
          </h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f7f7fd;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#3931e1;text-transform:uppercase;letter-spacing:.5px;">#</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#3931e1;text-transform:uppercase;letter-spacing:.5px;">Hora</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#3931e1;text-transform:uppercase;letter-spacing:.5px;">Lugar</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#3931e1;text-transform:uppercase;letter-spacing:.5px;">Página</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#3931e1;text-transform:uppercase;letter-spacing:.5px;">Navegador</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#3931e1;text-transform:uppercase;letter-spacing:.5px;">IP</th>
              </tr>
            </thead>
            <tbody>${filasVisitas}</tbody>
          </table>`
          }

          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #eee;">
            <table style="width:100%;border-collapse:collapse;">
              ${fila("Sitio web visto", escaparUrl(sitio))}
              ${fila("Enviado automáticamente", "Vercel Cron")}
              ${fila("Destinatario", escaparHtml(destino))}
            </table>
          </div>
        </div>
      </div>
    </body>
  </html>`;

  const info = await transporte.sendMail({
    from: `"Portafolio David Varela" <${process.env.EMAIL_USER}>`,
    to: destino,
    subject: asunto,
    html,
  });

  console.log(`📧 Resumen enviado a ${destino} — ${info.messageId}`);
  return info;
};
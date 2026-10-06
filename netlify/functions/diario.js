import { visitasCollection } from "../lib/db.js";
import { enviarResumenDiario } from "../lib/mailer.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * GET /api/diario
 * Envía el resumen de visitas del día por correo.
 *
 * Se dispara desde:
 *   - GitHub Actions (plan gratuito de Netlify) -> .github/workflows/daily-report.yml
 *   - Netlify Scheduled Functions (plan Pro)
 *
 * Se protege con la variable de entorno CRON_SECRET.
 */
export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Seguridad: si no hay CRON_SECRET definido, no se envía nada
  const secreto = process.env.CRON_SECRET;
  if (!secreto) {
    return new Response(
      JSON.stringify({ error: "CRON_SECRET no está configurado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const recibido =
    request.headers.get("x-cron-secret") ||
    new URL(request.url).searchParams.get("secret");

  if (recibido !== secreto) {
    return new Response(
      JSON.stringify({ error: "No autorizado" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const col = await visitasCollection();
    const db = col.db;
    const registros = db.collection("envios");

    const tz = process.env.TZ || "America/Santiago";
    const ahora = new Date();

    // Ventana del día: desde las 00:00 hasta ahora
    const inicioDia = new Date(ahora.toLocaleString("en-US", { timeZone: tz }));
    const finDia = new Date(inicioDia);
    finDia.setDate(finDia.getDate() + 1);

    const visitas = await col
      .find({ fecha: { $gte: inicioDia, $lt: finDia } })
      .sort({ fecha: 1 })
      .toArray();

    const totalAbsoluto = await col.countDocuments({});
    const totalDia = visitas.length;

    // Evita correos duplicados si el cron se dispara más de una vez al día
    const clave = inicioDia.toISOString().slice(0, 10); // p.ej. "2026-10-05"
    const yaEnviado = await registros.findOne({ _id: clave });

    if (yaEnviado) {
      console.log(`⏭️  Ya se envió el resumen del ${clave}. Omitido.`);
      return new Response(
        JSON.stringify({ ok: true, omitido: true, fecha: clave }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sitio =
      process.env.SITE_URL || request.headers.get("origin") || "tu-portafolio";

    await enviarResumenDiario({
      visitas,
      totalDia,
      totalAbsoluto,
      sitio,
    });

    await registros.insertOne({
      _id: clave,
      fecha: new Date(),
      totalDia,
      totalAbsoluto,
      enviado: true,
    });

    return new Response(
      JSON.stringify({ ok: true, enviadas: totalDia, totalAbsoluto, fecha: clave }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error enviando resumen diario:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};
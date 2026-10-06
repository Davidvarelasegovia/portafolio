import { visitasCollection } from "../lib/db.js";
import { obtenerIp, geolocalizar, parseUserAgent } from "../lib/geo.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * POST /api/visita
 * Registra una visita: quién, cuándo, desde dónde y qué página vio.
 */
export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método no permitido. Usa POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));

    const ip = obtenerIp(request);
    const userAgent = request.headers.get("user-agent") || "";
    const { navegador, sistema, dispositivo } = parseUserAgent(userAgent);

    const geo = await geolocalizar(ip);

    const visita = {
      fecha: new Date(),
      ip,
      ...geo,
      navegador,
      sistema,
      dispositivo,
      pagina: body.pagina || "/",
      referrer: request.headers.get("referer") || "",
      idioma: request.headers.get("accept-language") || "",
      userAgent,
    };

    const col = await visitasCollection();
    await col.insertOne(visita);

    const totalAbsoluto = await col.countDocuments({});

    console.log(
      `📥 Visita registrada: ${visita.ciudad}, ${visita.pais} — Total: ${totalAbsoluto}`
    );

    return new Response(
      JSON.stringify({ ok: true, total: totalAbsoluto }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error registrando visita:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};
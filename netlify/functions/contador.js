import { visitasCollection } from "../lib/db.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * GET /api/contador
 * Devuelve el total histórico de visitas y las de hoy.
 */
export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const col = await visitasCollection();

    const total = await col.countDocuments({});

    // Inicio del día según la zona horaria configurada
    const tz = process.env.TZ || "America/Santiago";
    const ahora = new Date();
    const inicioDia = new Date(
      ahora.toLocaleString("en-US", { timeZone: tz })
    );
    const hoy = await col.countDocuments({ fecha: { $gte: inicioDia } });

    return new Response(
      JSON.stringify({ total, hoy }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error obteniendo contador:", error);
    return new Response(
      JSON.stringify({ total: 0, hoy: 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};
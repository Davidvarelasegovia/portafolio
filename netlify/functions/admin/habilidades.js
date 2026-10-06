import { visitasCollection } from "../../lib/db.js";
import { corsHeaders, responderError, tokenValido } from "../../lib/auth.js";
import seed from "../../../src/data/habilidades.js";

/**
 * GET /api/admin/habilidades   → devuelve las habilidades (público)
 * PUT /api/admin/habilidades   → guarda todas (solo admin)
 *
 * La primera vez, si la base de datos está vacía, se siembran
 * automáticamente los datos de src/data/habilidades.js. Así el
 * sitio funciona desde el primer día sin configurar nada.
 */

const coleccion = async () => {
  const col = await visitasCollection();
  return { col, hab: col.db.collection("habilidades") };
};

/** Quita campos que no se pueden guardar (Mongo no admite undefined) */
const limpiar = (objeto) => JSON.parse(JSON.stringify(objeto));

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // =================================================================
  //  PASO 1 — Autorización y validación de los datos enviados
  //  Esto va ANTES de conectar a MongoDB: es rápido, no gasta una
  //  conexión y evita revelar nada a quien no está autorizado.
  // =================================================================
  let pendientes = null;

  if (request.method === "PUT") {
    if (!tokenValido(request.headers.get("x-admin-token"))) {
      return responderError(401, "No autorizado. Inicia sesión otra vez.");
    }

    const body = await request.json().catch(() => ({}));

    try {
      const { backend, frontend, agentesIA } = body;

      const secciones = { backend, frontend, agentesIA };

      for (const [nombre, seccion] of Object.entries(secciones)) {
        if (!seccion || !Array.isArray(seccion.grupos)) {
          return responderError(400, `La sección "${nombre}" no es válida`);
        }
        for (const grupo of seccion.grupos) {
          if (!grupo.titulo || !Array.isArray(grupo.habilidades)) {
            return responderError(400, `Hay un grupo inválido en "${nombre}"`);
          }
          for (const h of grupo.habilidades) {
            if (!h.nombre || !String(h.nombre).trim()) {
              return responderError(400, "Hay una habilidad sin nombre");
            }
            const pct = Number(h.porcentaje);
            if (Number.isNaN(pct) || pct < 0 || pct > 100) {
              return responderError(
                400,
                `El porcentaje de "${h.nombre}" debe estar entre 0 y 100`
              );
            }
            h.porcentaje = pct;
          }
        }
      }

      pendientes = { backend, frontend, agentesIA };
    } catch (error) {
      return responderError(400, `Datos inválidos: ${error.message}`);
    }
  }

  // =================================================================
  //  PASO 2 — Operar sobre la base de datos
  // =================================================================
  try {
    const { hab } = await coleccion();

    // ---------------- GET: lectura pública ----------------
    if (request.method === "GET") {
      const doc = await hab.findOne({ _id: "principal" });

      if (!doc) {
        // Base vacía: se siembra por primera vez
        await hab.insertOne({
          _id: "principal",
          actualizado: new Date(),
          ...limpiar({
            backend: seed.backend,
            frontend: seed.frontend,
            agentesIA: seed.agentesIA,
          }),
        });
        console.log("🌱 Habilidades sembradas desde el archivo de seed");

        return new Response(
          JSON.stringify({
            backend: seed.backend,
            frontend: seed.frontend,
            agentesIA: seed.agentesIA,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          backend: doc.backend,
          frontend: doc.frontend,
          agentesIA: doc.agentesIA,
          actualizado: doc.actualizado,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ---------------- PUT: guardado (solo admin) ----------------
    if (request.method === "PUT") {
      await hab.updateOne(
        { _id: "principal" },
        {
          $set: {
            ...limpiar(pendientes),
            actualizado: new Date(),
          },
        },
        { upsert: true }
      );

      const total = Object.values(pendientes).reduce(
        (suma, s) =>
          suma + s.grupos.reduce((n, g) => n + g.habilidades.length, 0),
        0
      );

      console.log(`💾 Habilidades guardadas: ${total} en total`);

      return new Response(
        JSON.stringify({ ok: true, total }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return responderError(405, "Método no permitido.");
  } catch (error) {
    console.error("❌ Error en habilidades:", error);
    return responderError(500, error.message);
  }
};
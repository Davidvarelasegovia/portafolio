/**
 * Convierte una función del proyecto (formato Netlify: Request ->
 * Response) en un handler de Vercel.
 *
 * Es el mismo concepto que server/adaptador.js, que sirve para Express,
 * pero las funciones serverless de Vercel dan el req y el res de otra
 * forma:
 *   - la URL viene en req.url, no en req.originalUrl
 *   - el cuerpo puede venir ya parseado o en bruto
 *
 * Así la lógica de las funciones queda en un solo lugar y el sitio
 * funciona igual en Netlify, en Vercel o en un VPS.
 */

const SIN_CUERPO = ["GET", "HEAD"];

/** Lee el cuerpo de la petición, sin importar si viene parseado o en bruto */
const leerCuerpo = async (req) => {
  if (req.body !== undefined && req.body !== null) {
    /* Vercel ya lo parseo si vino como JSON */
    if (typeof req.body === "object") return JSON.stringify(req.body);
    if (typeof req.body === "string") return req.body;
    return String(req.body);
  }

  /* Si no hay cuerpo parseado, se lee del flujo de la peticion */
  if (typeof req.body === "undefined" && req.readable) {
    const trozos = [];
    for await (const trozo of req) trozos.push(trozo);
    return Buffer.concat(trozos).toString("utf8") || undefined;
  }

  return undefined;
};

/** Construye el Request estándar que espera la función */
const aRequest = async (req, baseUrl) => {
  const headers = new Headers();

  for (const [clave, valor] of Object.entries(req.headers || {})) {
    if (valor === undefined) continue;
    headers.set(clave, Array.isArray(valor) ? valor.join(", ") : String(valor));
  }

  const opciones = { method: req.method, headers };

  if (!SIN_CUERPO.includes(req.method)) {
    const cuerpo = await leerCuerpo(req);

    if (cuerpo !== undefined) {
      opciones.body = cuerpo;
    }

    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  }

  /* Vercel pone la ruta completa en req.url, incluida la query */
  const ruta = req.originalUrl || req.url || "/";

  return new Request(new URL(ruta, baseUrl), opciones);
};

/**
 * Envuelve una función `(Request) => Response` como handler de Vercel.
 *
 * @param {Function} fn función del proyecto
 * @param {string} baseUrl origen con el que se arman las URLs
 */
export const adaptarVercel = (fn, baseUrl) =>
  async (req, res) => {
    /* Vercel manda OPTIONS para preguntar si el CORS esta bien */
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    const origen =
      baseUrl ||
      process.env.PUBLIC_URL ||
      process.env.SITE_URL ||
      "http://localhost:3000";

    try {
      const response = await fn(await aRequest(req, origen));

      res.status(response.status);

      for (const [clave, valor] of response.headers.entries()) {
        /* Vercel no acepta que se manden algunos headers */
        if (clave.toLowerCase() === "content-length") continue;
        res.setHeader(clave, valor);
      }

      const texto = await response.text();

      if (!texto) {
        res.end();
        return;
      }

      try {
        res.json(JSON.parse(texto));
      } catch {
        res.send(texto);
      }
    } catch (error) {
      console.error("❌ Error en la ruta:", req.method, req.url);
      console.error("   ", error?.stack || error);

      if (!res.headersSent) {
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  };

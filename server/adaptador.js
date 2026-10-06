/**
 * Convierte una función escrita para Netlify en un handler de Express.
 *
 * Las funciones del proyecto siguen el formato de Netlify:
 *   (Request) => Response
 *
 * Este adaptador las conecta a Express sin reescribirlas, así la lógica
 * que ya está probada (tests) sigue funcionando igual en un VPS.
 */

const SIN_CUERPO = ["GET", "HEAD"];

/** Convierte un req de Express en un Request estándar */
const aRequest = (req, baseUrl) => {
  const headers = new Headers();

  for (const [clave, valor] of Object.entries(req.headers)) {
    if (valor === undefined) continue;
    if (Array.isArray(valor)) {
      headers.set(clave, valor.join(", "));
    } else {
      headers.set(clave, String(valor));
    }
  }

  const opciones = {
    method: req.method,
    headers,
  };

  if (!SIN_CUERPO.includes(req.method)) {
    opciones.body = JSON.stringify(req.body ?? {});
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  }

  return new Request(new URL(req.originalUrl, baseUrl), opciones);
};

/**
 * Envuelve una función `(Request) => Response` como handler de Express.
 *
 * @param {Function} fn función del proyecto
 * @param {string} baseUrl origen con el que se construyen las URLs
 */
export const adaptar = (fn, baseUrl = "http://localhost:8888") =>
  async (req, res) => {
    try {
      const response = await fn(aRequest(req, baseUrl));

      res.status(response.status);

      for (const [clave, valor] of response.headers.entries()) {
        res.setHeader(clave, valor);
      }

      const texto = await response.text();

      if (!texto) {
        return res.end();
      }

      try {
        res.json(JSON.parse(texto));
      } catch {
        res.send(texto);
      }
    } catch (error) {
      console.error("❌ Adaptador:", req.method, req.originalUrl);
      console.error("   ", error?.stack || error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  };
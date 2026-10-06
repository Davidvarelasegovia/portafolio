/**
 * Borra un sitio de Netlify usando su API oficial.
 *
 * Se hace con fetch y no con la CLI porque en Windows PowerShell
 * destruye las comillas de los argumentos JSON y node no puede
 * lanzar archivos .cmd de forma fiable.
 *
 * Uso:  node scripts/borrar-sitio.mjs <site_id>
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Reusa el token de Netlify guardado por la CLI */
const obtenerToken = () => {
  const rutas = [
    resolve(process.env.APPDATA || "", "netlify", "Config", "config.json"),
    resolve(process.env.APPDATA || "", "netlify", "config.json"),
    resolve(process.env.HOME || "", ".netlify", "config.json"),
  ];

  for (const ruta of rutas) {
    if (!existsSync(ruta)) continue;

    try {
      const cfg = JSON.parse(readFileSync(ruta, "utf8"));

      // La CLI guarda un usuario por ID, no en "currentUser"
      const usuarios = Object.values(cfg.users || {});

      for (const usuario of usuarios) {
        const token = usuario?.auth?.token || usuario?.token;
        if (token) return token;
      }
    } catch {
      /* siguiente ruta */
    }
  }

  throw new Error(
    "No se encontro el token de Netlify. Ejecuta 'npx netlify login' primero."
  );
};

const siteId = process.argv[2];

if (!siteId) {
  console.error("Uso: node scripts/borrar-sitio.mjs <site_id>");
  process.exit(1);
}

const token = obtenerToken();

const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});

if (res.ok) {
  console.log("Sitio borrado:", siteId);
} else {
  const texto = await res.text();
  console.error(`No se pudo borrar (${res.status}):`, texto);
  process.exit(1);
}

void raiz;

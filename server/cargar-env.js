import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Carga el archivo .env sin depender de ninguna librería.
 *
 * Importante: NO pisa las variables que ya existan en el sistema.
 * Así, en el servidor (VPS) las variables quedefiniste con systemd
 * o pm2 mandan sobre el archivo.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUTA = resolve(__dirname, "../.env");

export const cargarEnv = (ruta = RUTA) => {
  if (!existsSync(ruta)) {
    console.log("⚠️  No se encontró .env (se usarán las variables del sistema)");
    return {};
  }

  let cargadas = 0;

  for (const linea of readFileSync(ruta, "utf8").split(/\r?\n/)) {
    const limpia = linea.trim();

    if (!limpia || limpia.startsWith("#")) continue;

    const igual = limpia.indexOf("=");
    if (igual === -1) continue;

    const clave = limpia.slice(0, igual).trim();
    const valor = limpia
      .slice(igual + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    // Las que ya vienen del sistema tienen prioridad
    if (process.env[clave] === undefined) {
      process.env[clave] = valor;
      cargadas++;
    }
  }

  console.log(`🔑 .env cargado: ${cargadas} variables`);
  return process.env;
};
/**
 * Utilidades para hablar con la API de Netlify con el token de la CLI.
 *
 * El token vive en un archivo de configuración de Netlify, en una ruta
 * que cambia entre Windows, macOS y Linux, y la estructura no siempre
 * es la misma. Este modulo la encuentra siempre.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const API = "https://api.netlify.com/api/v1";

/** Busca el token de Netlify guardado por la CLI */
export const obtenerToken = () => {
  const rutas = [
    resolve(process.env.APPDATA || "", "netlify", "Config", "config.json"),
    resolve(process.env.APPDATA || "", "netlify", "config.json"),
    resolve(process.env.HOME || "", ".netlify", "config.json"),
    resolve(process.env.HOME || "", ".config", "netlify", "config.json"),
  ];

  for (const ruta of rutas) {
    if (!existsSync(ruta)) continue;

    try {
      const cfg = JSON.parse(readFileSync(ruta, "utf8"));

      for (const usuario of Object.values(cfg.users || {})) {
        const token = usuario?.auth?.token;
        if (token) return token;
      }
    } catch {
      /* siguiente ruta */
    }
  }

  throw new Error(
    "No se encontro el token de Netlify. Ejecuta 'npx netlify login'."
  );
};

/** Llamada a la API de Netlify */
export const api = async (ruta, token, opciones = {}) => {
  const res = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...opciones.headers,
    },
  });

  const texto = await res.text();

  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }

  return { ok: res.ok, status: res.status, datos };
};

/** Igual que api(), pero falla si la respuesta no es correcta */
export const apiObligatoria = async (ruta, token, opciones = {}) => {
  const r = await api(ruta, token, opciones);

  if (!r.ok) {
    throw new Error(
      `${opciones.method || "GET"} ${ruta} -> ${r.status}: ${JSON.stringify(r.datos)}`
    );
  }

  return r.datos;
};

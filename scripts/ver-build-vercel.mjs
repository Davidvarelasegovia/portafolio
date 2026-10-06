/**
 * Muestra el registro completo del ultimo build en Vercel.
 *
 * El comando `vercel inspect --logs` recorta el mensaje importante: los
 * errores de rolldown vienen en una propiedad que no imprime. La API de
 * Vercel si los trae completos, en `payload.text` de cada evento.
 *
 * Uso: node scripts/ver-build-vercel.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* --- Token de Vercel (la CLI lo guarda con "Data" en el medio) --- */
const rutas = [
  resolve(process.env.APPDATA || "", "com.vercel.cli", "Data", "auth.json"),
  resolve(process.env.APPDATA || "", "com.vercel.cli", "auth.json"),
  resolve(process.env.LOCALAPPDATA || "", "com.vercel.cli", "Data", "auth.json"),
  resolve(process.env.HOME || "", ".local", "share", "com.vercel.cli", "auth.json"),
];

let token = null;

for (const r of rutas) {
  if (!existsSync(r)) continue;
  try {
    const cfg = JSON.parse(readFileSync(r, "utf8"));
    if (cfg.token) {
      token = cfg.token;
      break;
    }
  } catch {
    /* siguiente ruta */
  }
}

if (!token) {
  console.error("No se encontro el token de Vercel.");
  process.exit(1);
}

/* --- Datos del proyecto vinculado --- */
const archivoProj = resolve(raiz, ".vercel", "project.json");

if (!existsSync(archivoProj)) {
  console.error("El proyecto no esta vinculado. Corre 'npx vercel link'.");
  process.exit(1);
}

const proj = JSON.parse(readFileSync(archivoProj, "utf8"));
const cabeceras = { Authorization: `Bearer ${token}` };

/* --- El ultimo deploy --- */
const r = await fetch(
  `https://api.vercel.com/v6/deployments?projectId=${proj.projectId}&limit=1&teamId=${proj.orgId}`,
  { headers: cabeceras }
);

if (!r.ok) {
  console.error(`No se pudieron leer los deploys (HTTP ${r.status})`);
  process.exit(1);
}

const ultimo = (await r.json()).deployments?.[0];

if (!ultimo) {
  console.error("No hay deploys");
  process.exit(1);
}

console.log(`proyecto: ${proj.projectName}`);
console.log(`deploy:   ${ultimo.uid}`);
console.log(`estado:   ${ultimo.state}\n`);

/* --- Los eventos del build --- */
const ev = await fetch(
  `https://api.vercel.com/v2/deployments/${ultimo.uid}/events?limit=500&builds=1&teamId=${proj.orgId}`,
  { headers: cabeceras }
);

if (!ev.ok) {
  console.error(`No se pudieron leer los eventos (HTTP ${ev.status})`);
  process.exit(1);
}

const eventos = await ev.json();

console.log("=== REGISTRO DEL BUILD ===\n");

for (const e of eventos) {
  const texto = e.payload?.text;
  if (!texto || !texto.trim()) continue;

  const marca = e.type === "stderr" ? "!!" : "  ";
  console.log(`${marca} ${texto}`);
}

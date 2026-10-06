/**
 * Muestra el estado de un sitio de Netlify y ayuda a diagnostocar
 * por que no se conecta con GitHub.
 *
 * Uso: node scripts/ver-sitio.mjs <site_id>
 */
import { obtenerToken, api } from "./netlify-api.mjs";

const sitioId = process.argv[2];

if (!sitioId) {
  console.error("Uso: node scripts/ver-sitio.mjs <site_id>");
  process.exit(1);
}

const token = obtenerToken();

/* --- Estado del sitio --- */
const r = await api(`/sites/${sitioId}`, token);

if (!r.ok) {
  console.error(`No se pudo leer el sitio (${r.status})`);
  process.exit(1);
}

const s = r.datos;
const b = s.build_settings || {};

console.log("SITIO");
console.log("  nombre:  " + s.name);
console.log("  url:     " + s.ssl_url);
console.log("  repo:    " + (b.repo_url || "NINGUNO"));
console.log("  rama:    " + (b.repo_branch || "-"));
console.log("  dir:     " + (b.dir || "-"));
console.log("  comando: " + (b.build_command || "-"));
console.log("  builds:  " + s.deploy_count);

/* --- Endpoints que pruebo para ver cuales existen --- */
const pruebas = [
  ["llave de despliegue", "POST", `/sites/${sitioId}/deploy-key`],
  ["webhooks del sitio", "GET", `/sites/${sitioId}/webhooks`],
  ["deployed site", "GET", `/sites/${sitioId}/deployed`],
  ["log de build", "GET", `/sites/${sitioId}/logs`],
];

console.log("\nENDPOINTS");
for (const [nombre, metodo, ruta] of pruebas) {
  const res = await api(ruta, token, { method: metodo });
  const marca = res.ok ? "OK   " : res.status === 405 ? "existe(metodo)" : "no  ";
  console.log(`  ${marca} ${nombre.padEnd(22)} ${metodo} ${ruta} -> ${res.status}`);
}

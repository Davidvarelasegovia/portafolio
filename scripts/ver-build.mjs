/**
 * Muestra el registro de error del ultimo despliegue fallido.
 *
 * Uso: node scripts/ver-build.mjs <site_id>
 */
import { obtenerToken, api } from "./netlify-api.mjs";

const sitioId = process.argv[2];

if (!sitioId) {
  console.error("Uso: node scripts/ver-build.mjs <site_id>");
  process.exit(1);
}

const token = obtenerToken();

/* --- Ultimos despliegues --- */
const r = await api(`/sites/${sitioId}/deploys?per_page=5`, token);

if (!r.ok) {
  console.error(`No se pudieron leer los despliegues (${r.status})`);
  process.exit(1);
}

const despliegues = Array.isArray(r.datos) ? r.datos : r.datos.deploys || [];

if (despliegues.length === 0) {
  console.log("No hay despliegues todavia.");
  process.exit(0);
}

const ult = despliegues[0];

console.log("ULTIMO DESPLIEGUE");
console.log("  id:     " + ult.id);
console.log("  estado: " + ult.state);
console.log("  rama:   " + (ult.branch || "-"));
console.log("  commit: " + (ult.commit_ref || "-"));

if (ult.error_message) {
  console.log("  error:  " + ult.error_message);
}

/* --- Log del build --- */
const log = await api(`/sites/${sitioId}/deploys/${ult.id}/log`, token);

console.log("\nREGISTRO DEL BUILD");

if (log.ok && typeof log.datos === "object" && log.datos.logs) {
  const entradas = log.datos.logs;
  const texto = entradas.map((l) => l.message || JSON.stringify(l)).join("\n");
  console.log(texto.slice(-6000));
} else if (log.ok && typeof log.datos === "string") {
  console.log(log.datos.slice(-6000));
} else {
  console.log("  (no se pudo leer el log, status " + log.status + ")");
  console.log("  respuesta:", JSON.stringify(log.datos).slice(0, 500));
}

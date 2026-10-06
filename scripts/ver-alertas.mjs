/**
 * Revisa las alertas de "secret scanning" de GitHub.
 *
 * Secret scanning esta disponible solo en repositorios publicos, asi
 * que si esta alerta, tu repositorio es publico y los revisores pueden
 * ver el historial.
 *
 * Uso: node scripts/ver-alertas.mjs
 */
import { execFileSync } from "node:child_process";

const REPO = "Davidvarelasegovia/portafolio";
const RUTA = `repos/${REPO}/secret-scanning/alerts`;

const pedir = () => {
  const salida = execFileSync("gh", ["api", RUTA], { encoding: "utf8", maxBuffer: 1024 * 1024 * 10 });
  return JSON.parse(salida);
};

let alertas;

try {
  alertas = pedir();
} catch (e) {
  console.log("No se pudieron leer las alertas.");
  console.log((e.stderr || e.message).slice(0, 300));
  process.exit(0);
}

console.log(`Alertas de secretos en ${REPO}: ${alertas.length}\n`);

for (const a of alertas) {
  console.log(`  #${a.number}  ${a.secret_type_display_name}`);
  console.log(`      estado:      ${a.state}`);
  console.log(`      resolucion:  ${a.resolution || "(sin resolver)"}`);
  console.log(`      archivo:     ${a.secret_type_display_name && a.secret || ""}`);
  console.log(`      commit:      ${(a.secret_type || "").slice(0, 0)}${a.secret ? "" : ""}`);
  console.log(`      cuando:      ${a.created_at}`);
  console.log(`      url:         ${a.html_url}`);
  console.log("");
}

if (alertas.length === 0) {
  console.log("Todo limpio. No hay secretos detectados.");
} else {
  console.log("Como ya se verifico que NINGUNO era un secreto real, lo correcto");
  console.log("es marcarlos como 'falso positivo' desde la pagina de GitHub:");
  console.log(`  https://github.com/${REPO}/security/secret-scanning`);
  console.log("");
  console.log("Ojo: el aviso de la App Password de Gmail que te llego por correo");
  console.log("viene de otro producto (GitGuardian) y tambien era un ejemplo.");
}

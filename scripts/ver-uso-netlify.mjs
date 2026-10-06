/**
 * Revisa por que Netlify bloquea los deploys.
 *
 * En el plan Free, cuando se acaban los 300 creditos del mes, Netlify
 * pausa el sitio y el error que muestra es "Forbidden", que no dice
 * nada de creditos. Por eso hay que contarlos a mano.
 */
import { obtenerToken, api } from "./netlify-api.mjs";

const token = obtenerToken();
const SITIO = "c9b23c1b-0487-48c6-b1b0-4b5460154e1b";

const mesActual = new Date().toISOString().slice(0, 7);

console.log("=== ESTADO DEL SITIO ===\n");

const sitio = await api(`/sites/${SITIO}`, token);

if (!sitio.ok) {
  console.log(`  no se pudo leer (HTTP ${sitio.status})`);
  console.log(`  ${JSON.stringify(sitio.datos)}`);
} else {
  const s = sitio.datos;

  console.log(`  nombre:          ${s.name}`);
  console.log(`  plan:            ${s.plan}`);
  console.log(`  locked:          ${s.locked}`);
  console.log(`  published:       ${JSON.stringify(s.published)}`);
  console.log(`  quick_setup:     ${s.quick_setup_in_progress}`);
  console.log(`  deploy_count:    ${s.deploy_count}`);
  console.log(`  processing:      ${JSON.stringify(s.processing_settings || {})}`);
}

/* --- Cuantos deploys van este mes --- */
console.log(`\n=== DEPLOYS DE ${mesActual} ===\n`);

const deploys = await api(`/sites/${SITIO}/deploys?per_page=100`, token);

if (Arrays(deploys.datos)) {
  const lista = deploys.datos;
  const delMes = lista.filter(
    (d) => (d.created_at || "").slice(0, 7) === mesActual
  );

  console.log(`  deploys este mes:   ${delMes.length}`);
  console.log(`  costo (15 c/u):     ${delMes.length * 15} creditos`);
  console.log(`  limite del mes:     300 creditos`);
  console.log(`  quedan:             ${300 - delMes.length * 15} creditos`);
  console.log(`  disponibles:        ${Math.floor((300 - delMes.length * 15) / 15)} deploys\n`);

  const conError = delMes.filter((d) => d.state === "error").length;
  console.log(`  con error:          ${conError}`);
  console.log(`  exitosos:           ${delMes.length - conError}`);

  console.log("\n  ultimos 8:");
  for (const d of delMes.slice(0, 8)) {
    console.log(
      `    ${d.created_at.slice(5, 16).replace("T", " ")}  ${String(d.state).padEnd(8)}  ${(d.title || "").slice(0, 40)}`
    );
  }
} else {
  console.log(`  no se pudieron leer (HTTP ${deploys.status})`);
  console.log(`  ${JSON.stringify(deploys.datos).slice(0, 200)}`);
}

/* --- La web sigue en linea? --- */
console.log("\n=== WEB EN VIVA ===\n");

try {
  const res = await fetch("https://david-varela-portafolio.netlify.app/");
  console.log(`  respuesta: HTTP ${res.status}`);

  const html = await res.text();

  console.log(`  ¿tiene GitHub en el footer? ${
    html.includes("github.com/Davidvarelasegovia") ? "SI" : "NO (aun sin publicar)"
  }`);
} catch (e) {
  console.log(`  no responde: ${e.message}`);
}

function Arrays(x) {
  return Array.isArray(x);
}

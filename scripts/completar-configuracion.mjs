/**
 * Completa la configuracion inicial de un sitio de Netlify.
 *
 * Si el asistente de creacion quedo a medias (porque el primer build
 * fallo), el sitio queda protegido y responde 401 a todas las visitas.
 *
 * Uso: node scripts/completar-configuracion.mjs <site_id>
 */
import { obtenerToken, api } from "./netlify-api.mjs";

const sitioId = process.argv[2];

if (!sitioId) {
  console.error("Uso: node scripts/completar-configuracion.mjs <site_id>");
  process.exit(1);
}

const token = obtenerToken();

const cambios = [
  ["quick_setup_in_progress", false],
  ["published", true],
  ["password", null],
  ["sso_login", false],
];

for (const [campo, valor] of cambios) {
  const r = await api(`/sites/${sitioId}`, token, {
    method: "PATCH",
    body: JSON.stringify({ [campo]: valor }),
  });

  console.log(
    `  ${campo} = ${JSON.stringify(valor)}  ->  HTTP ${r.status}` +
      (r.ok ? "" : "  " + JSON.stringify(r.datos).slice(0, 160))
  );
}

/* --- Ver el estado final --- */
const s = (await api(`/sites/${sitioId}`, token)).datos;

console.log("\nESTADO");
console.log("  quick_setup_in_progress: " + s.quick_setup_in_progress);
console.log("  published:               " + s.published);
console.log("  sso_login:               " + s.sso_login);
console.log("  url:                     " + s.ssl_url);

/* --- Probar --- */
await new Promise((r) => setTimeout(r, 4000));

const res = await fetch(s.ssl_url, { redirect: "manual" });
console.log("\nrespuesta del sitio: HTTP " + res.status);

if (res.status === 401) {
  console.log("\nSigue protegido. El sitio quedo a medias y hay que rehacerlo.");
}

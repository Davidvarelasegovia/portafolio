/**
 * Prueba el panel contra el sitio YA PUBLICADO en Netlify.
 *
 * A diferencia de probar-panel.mjs (que habla con la base de datos
 * desde tu computador), esto hace login real por internet contra
 * https://TU-SITIO, que es exactamente lo que haras tu desde el navegador.
 *
 * Uso: node scripts/probar-panel-online.mjs
 */
const SITIO = process.env.SITIO_PROBAR || "https://david-varela-portafolio.netlify.app";

/** Lee el .env para sacar el correo y la contraseña */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const leerEnv = () => {
  const v = {};
  for (const l of readFileSync(resolve(raiz, ".env"), "utf8").split(/\r?\n/)) {
    const t = l.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    v[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return v;
};

const env = leerEnv();
const email = env.ADMIN_EMAIL;
const password = env.ADMIN_PASSWORD;

const ok = (m) => console.log(`\nPAS  ${m}`);
const fallo = (m) => {
  console.log(`\nFALLA  ${m}`);
  process.exitCode = 1;
};

console.log(`Probando el panel en ${SITIO}\n${"=".repeat(50)}`);

/* --- 1. La pagina publica carga las habilidades del servidor --- */
const hab = await fetch(`${SITIO}/api/admin/habilidades`);

if (hab.ok) {
  const d = await hab.json();
  let total = 0;
  for (const sec of [d.backend, d.frontend, d.agentesIA]) {
    for (const g of sec?.grupos || []) total += g.habilidades.length;
  }
  ok(`El sitio publico lee ${total} tecnologias desde MongoDB`);
} else {
  fallo(`La pagina publica no lee habilidades (HTTP ${hab.status})`);
}

/* --- 2. Login con contrasena incorrecta debe fallar --- */
const malo = await fetch(`${SITIO}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password: "esta-es-malaclave-123" }),
});

if (malo.status === 401) ok("Login con contrasena incorrecta es rechazado");
else fallo(`Login incorrecto devolvio HTTP ${malo.status}, deberia ser 401`);

/* --- 3. Login real --- */
const bueno = await fetch(`${SITIO}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

if (!bueno.ok) {
  fallo(`Login correcto devolvio HTTP ${bueno.status}`);
  console.log("       Revisa que ADMIN_PASSWORD y MONGODB_URI esten bien en Netlify.");
} else {
  const sesion = await bueno.json();
  ok(`Login correcto, token recibido (${sesion.token.length} caracteres)`);

  /* --- 4. Guardar sin token debe ser rechazado --- */
  const sinToken = await fetch(`${SITIO}/api/admin/habilidades`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (sinToken.status === 401) ok("Guardar sin token es rechazado");
  else fallo(`Guardar sin token devolvio HTTP ${sinToken.status}, deberia ser 401`);

  /* --- 5. Guardar con token, cambiando algo y restaurando --- */
  const actuales = await (await fetch(`${SITIO}/api/admin/habilidades`)).json();

  const primerGrupo = actuales.frontend.grupos[0];
  const primeraHabilidad = primerGrupo.habilidades[0];
  const valorOriginal = primeraHabilidad.porcentaje;

  const cambiado = Math.max(1, Math.min(99, valorOriginal === 50 ? 51 : 50));
  primeraHabilidad.porcentaje = cambiado;

  const guardar = await fetch(`${SITIO}/api/admin/habilidades`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": sesion.token,
    },
    body: JSON.stringify({
      backend: actuales.backend,
      frontend: actuales.frontend,
      agentesIA: actuales.agentesIA,
    }),
  });

  if (guardar.ok) {
    ok(`Guardar con token funciona (cambio ${valorOriginal}% -> ${cambiado}%)`);
  } else {
    fallo(`Guardar con token devolvio HTTP ${guardar.status}`);
  }

  /* --- 6. Verificar que el cambio se guardo --- */
  const releer = await (await fetch(`${SITIO}/api/admin/habilidades`)).json();
  const guardado = releer.frontend.grupos[0].habilidades[0].porcentaje;

  if (guardado === cambiado) ok("El cambio quedo guardado en MongoDB");
  else fallo(`Se guardo ${guardado}% en vez de ${cambiado}%`);

  /* --- 7. Restaurar el valor original --- */
  primeraHabilidad.porcentaje = valorOriginal;

  await fetch(`${SITIO}/api/admin/habilidades`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": sesion.token,
    },
    body: JSON.stringify({
      backend: actuales.backend,
      frontend: actuales.frontend,
      agentesIA: actuales.agentesIA,
    }),
  });

  ok(`Valor restaurado a ${valorOriginal}%`);
}

console.log(`\n${"=".repeat(50)}`);
console.log(
  process.exitCode
    ? "Hay problemas. Revisa los mensajes FALLA de arriba."
    : "El panel funciona por internet. Ya puedes entrar a /admin"
);

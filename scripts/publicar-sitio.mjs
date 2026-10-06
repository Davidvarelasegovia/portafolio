/**
 * Publica un sitio de Netlify (lo saca del modo privado).
 *
 * Cuando un sitio se crea importando un repositorio, Netlify puede
 * dejarlo protegido. En ese caso responde 401 a todas las visitas.
 *
 * Uso: node scripts/publicar-sitio.mjs <site_id>
 */
import { obtenerToken, api } from "./netlify-api.mjs";

const sitioId = process.argv[2];

if (!sitioId) {
  console.error("Uso: node scripts/publicar-sitio.mjs <site_id>");
  process.exit(1);
}

const token = obtenerToken();

const antes = await api(`/sites/${sitioId}`, token);
const s = antes.datos || {};

console.log("ESTADO ACTUAL");
console.log("  nombre:          " + s.name);
console.log("  url:             " + s.ssl_url);
console.log("  published:       " + JSON.stringify(s.published));
console.log("  password:        " + (s.password ? "SI" : "no"));
console.log("  admin_url:       " + s.admin_url);

/* --- Ver si responde y con que codigo --- */
try {
  const res = await fetch(s.ssl_url, { redirect: "manual" });
  console.log("  respuesta actual: HTTP " + res.status);
} catch (e) {
  console.log("  no se pudo consultar: " + e.message);
}

/* --- Publicar --- */
const r = await api(`/sites/${sitioId}`, token, {
  method: "PATCH",
  body: JSON.stringify({ published: true }),
});

console.log("\nPATCH published=true ->", r.status);

if (!r.ok) {
  console.log(JSON.stringify(r.datos, null, 2));
  process.exit(1);
}

/* Quitar contraseña si tuviera */
const conPass = await api(`/sites/${sitioId}`, token, {
  method: "PATCH",
  body: JSON.stringify({ password: null }),
});
console.log("PATCH password=null ->", conPass.status);

/* --- Comprobar --- */
await new Promise((r) => setTimeout(r, 3000));

try {
  const res = await fetch(s.ssl_url, { redirect: "manual" });
  console.log("\nrespuesta ahora: HTTP " + res.status);
  if (res.status === 200) {
    console.log("El sitio esta publico y funcionando.");
  }
} catch (e) {
  console.log("no se pudo consultar: " + e.message);
}

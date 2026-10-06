// Prueba de extremo a extremo contra MongoDB Atlas.
// Simula lo que hace Netlify cuando alguien entra al panel.
// Ejecutar con:  node scripts/probar-panel.mjs
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* --- Carga el .env --- */
for (const linea of readFileSync(resolve(raiz, ".env"), "utf8").split(/\r?\n/)) {
  const t = linea.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const { default: login } = await import("../netlify/functions/admin/login.js");
const { default: habilidades } = await import("../netlify/functions/admin/habilidades.js");
const { getDb } = await import("../netlify/lib/db.js");

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const MASK = (s) => String(s).replace(/(.{3}).*(.{2})/, "$1***$2");

const post = (cuerpo, headers = {}) =>
  new Request("http://x/api", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(cuerpo),
  });

let fallos = 0;
const check = (nombre, ok, extra = "") => {
  console.log(`${ok ? "PASS " : "FALLA"}  ${nombre}${extra ? "  -> " + extra : ""}`);
  if (!ok) fallos++;
};

console.log("\n=== 1. Login con email y contraseña ===\n");
console.log(`   Email:      ${EMAIL}`);
console.log(`   Contraseña: ${MASK(PASSWORD)}\n`);

// Primero comprobamos que un password mal NO entre
let r = await login(post({ email: EMAIL, password: "esta-es-mal-123" }));
check("Contraseña incorrecta es rechazada", r.status === 401, "status=" + r.status);

r = await login(post({ email: "nadie@ejemplo.com", password: PASSWORD }));
check("Email desconocido es rechazado", r.status === 401, "status=" + r.status);

r = await login(post({ email: EMAIL, password: PASSWORD }));
const datos = await r.json().catch(() => ({}));
check("Login correcto", r.status === 200, "status=" + r.status);
check("Devuelve token", typeof datos.token === "string" && datos.token.length > 20);

const token = datos.token;
if (!token) {
  console.log("\nNo se pudo obtener token, no sigo.\n");
  process.exit(1);
}

/* --- ¿Se guardó bien en Mongo? --- */
console.log("\n=== 2. Qué quedó guardado en MongoDB ===\n");

const db = await getDb();
const admins = db.collection("administradores");
const guardado = await admins.findOne({ _id: EMAIL });

check("El administrador se creó en la base", !!guardado);
if (guardado) {
  check("NO guarda la contraseña en texto plano",
    !JSON.stringify(guardado).includes(PASSWORD),
    "solo hash + sal");
  check("Guarda la sal", typeof guardado.sal === "string" && guardado.sal.length >= 32);
  check("Guarda el hash", typeof guardado.passwordHash === "string" && guardado.passwordHash.length >= 64);
  check("Registra último acceso", !!guardado.ultimoAcceso);
}

/* --- Semilla de habilidades --- */
// Cada lectura usa un Request nuevo: un Request no se puede reutilizar
const leerHabilidades = () =>
  habilidades(new Request("http://x/api/admin/habilidades"));

console.log("\n=== 3. Cargar habilidades (público) ===\n");

r = await leerHabilidades();
const habs = await r.json();
check("GET habilidades responde 200", r.status === 200);
check("Trae la sección backend", Array.isArray(habs.backend?.grupos));
check("Trae la sección frontend", Array.isArray(habs.frontend?.grupos));
check("Trae la sección agentesIA", Array.isArray(habs.agentesIA?.grupos));

const totalHab = Object.values(habs)
  .filter((s) => s?.grupos)
  .reduce((n, s) => n + s.grupos.reduce((m, g) => m + g.habilidades.length, 0), 0);
console.log(`   Total de tecnologías: ${totalHab}`);

const docHab = await db.collection("habilidades").findOne({ _id: "principal" });
check("Quedó sembrado en MongoDB", !!docHab);

/* --- Escritura protegida --- */
console.log("\n=== 4. Guardar cambios con y sin permiso ===\n");

r = await habilidades(new Request("http://x/api/admin/habilidades", { method: "PUT" }));
check("Guardar SIN token es rechazado", r.status === 401, "status=" + r.status);

// Cambio real: subo el porcentaje de la primera habilidad
const copia = structuredClone({
  backend: habs.backend, frontend: habs.frontend, agentesIA: habs.agentesIA,
});
const objetivo = copia.backend.grupos[0].habilidades[0];
const valorOriginal = objetivo.porcentaje;
objetivo.porcentaje = 77;
console.log(`   Probando: ${objetivo.nombre} de ${valorOriginal}% a 77%`);

r = await habilidades(new Request("http://x/api/admin/habilidades", {
  method: "PUT",
  headers: { "content-type": "application/json", "x-admin-token": token },
  body: JSON.stringify(copia),
}));
const resPut = await r.json().catch(() => ({}));
check("Guardar CON token funciona", r.status === 200, JSON.stringify(resPut));

const leido = await (await leerHabilidades()).json();
const guardadoAhora = leido.backend.grupos[0].habilidades[0];
check("El cambio se guardó en la base",
  guardadoAhora.porcentaje === 77,
  `${guardadoAhora.nombre} = ${guardadoAhora.porcentaje}%`);

// Restauramos
copia.backend.grupos[0].habilidades[0].porcentaje = valorOriginal;
await habilidades(new Request("http://x/api/admin/habilidades", {
  method: "PUT",
  headers: { "content-type": "application/json", "x-admin-token": token },
  body: JSON.stringify(copia),
}));
const restaurado = await (await leerHabilidades()).json();
check("Se restauró el valor original",
  restaurado.backend.grupos[0].habilidades[0].porcentaje === valorOriginal,
  `${restaurado.backend.grupos[0].habilidades[0].nombre} = ${restaurado.backend.grupos[0].habilidades[0].porcentaje}%`);

console.log(`\n${fallos === 0 ? "✅ TODO FUNCIONA" : "❌ " + fallos + " problema(s)"}\n`);
process.exit(fallos === 0 ? 0 : 1);
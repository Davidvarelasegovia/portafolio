// Verifica la conexión a MongoDB Atlas y prepara las colecciones.
// Ejecutar con:  node scripts/verificar-mongo.mjs
//
// Lee la MONGODB_URI del archivo .env (o de la variable de entorno).
// NO necesitas pasarme la contraseña de tu base de datos.

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

/* ---------- Lee el .env a mano (sin dependencias) ---------- */
function leerEnv() {
  const ruta = resolve(raiz, ".env");

  if (!existsSync(ruta)) {
    console.log("⚠️  No existe el archivo .env");
    console.log("   Créalo copiando .env.example -> .env y rellena MONGODB_URI\n");
    return {};
  }

  const valores = {};
  for (const linea of readFileSync(ruta, "utf8").split(/\r?\n/)) {
    const trimmed = linea.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const clave = trimmed.slice(0, i).trim();
    const valor = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    valores[clave] = valor;
  }
  return valores;
}

const env = { ...leerEnv(), ...process.env };
const URI = env.MONGODB_URI;
const NOMBRE_DB = env.MONGODB_DB || "portafolio";

/* ---------- Validaciones previas ---------- */
console.log("\n=== 1. Revisar la configuración ===\n");

if (!URI) {
  console.log("❌ Falta MONGODB_URI");
  console.log("\n  Sigue estos pasos en https://cloud.mongodb.com :\n");
  console.log("  1. Crea un cluster (el gratuito M0 sirve)");
  console.log("  2. Database Access > Add New Database User");
  console.log("     -> anota el usuario y la contraseña");
  console.log("  3. Network Access > Add IP Address");
  console.log("     -> escribe 0.0.0.0/0  (Netlify no tiene IP fija)");
  console.log("  4. Click en 'Connect' > Drivers > Copia la URL");
  console.log("\n  Luego ponla en tu .env así:\n");
  console.log("  MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@cluster0.xxxxx.mongodb.net");
  console.log("  MONGODB_DB=portafolio\n");
  process.exit(1);
}

// Detecta problemas típicos antes de intentar conectar
const problemas = [];
if (!URI.startsWith("mongodb+srv://") && !URI.startsWith("mongodb://")) {
  problemas.push("La URI no empieza con mongodb:// ni mongodb+srv://");
}
if (URI.includes("<") || URI.includes("PASSWORD") || URI.includes("TU_USUARIO")) {
  problemas.push('Te falta reemplazar el usuario o la contraseña (sustituye "<password>")');
}

if (problemas.length) {
  console.log("❌ La URI tiene problemas:\n");
  problemas.forEach((p) => console.log("   - " + p));
  console.log("\n  Formato esperado:");
  console.log("  mongodb+srv://TU_USUARIO:TU_CONTRASENA@cluster0.xxxxx.mongodb.net");
  console.log("\n  Ojo: si tu contraseña trae @ : / # o % hay que escaparlos:");
  console.log("  @  -> %40     :  -> %3A     /  -> %2F     #  -> %23   %  -> %25\n");
  process.exit(1);
}

console.log("✅ MONGODB_URI encontrada");
console.log("✅ Base de datos: " + NOMBRE_DB);

// No imprimir la contraseña
const sinClave = URI.replace(/\/\/([^:]+):[^@]+@/, "//$1:****@");
console.log("   " + sinClave);

/* ---------- Conexión ---------- */
console.log("\n=== 2. Conectar con el servidor ===\n");

const cliente = new MongoClient(URI, {
  serverSelectionTimeoutMS: 12000,
});

try {
  await cliente.connect();
  console.log("✅ Conectado al servidor");
} catch (error) {
  console.log("❌ No se pudo conectar: " + error.message);
  console.log("\n  Causas habituales:");
  console.log("  - La contraseña está mal escrita");
  console.log("  - El usuario del cluster no existe");
  console.log("  - Faltó tu IP en Network Access (agrega 0.0.0.0/0)");
  console.log("  - El cluster está pausado (reactívalo en Atlas)");
  await cliente.close().catch(() => {});
  process.exit(1);
}

/* ---------- Colecciones ---------- */
console.log("\n=== 3. Revisar las colecciones ===\n");

const db = cliente.db(NOMBRE_DB);

const esperadas = [
  { nombre: "visitas", para: "contador de visitas" },
  { nombre: "habilidades", para: "panel de habilidades" },
  { nombre: "administradores", para: "acceso al panel" },
  { nombre: "codigos_recuperacion", para: "recuperar contraseña" },
  { nombre: "envios", para: "resumen diario" },
];

const existentes = new Set(
  (await db.listCollections().toArray()).map((c) => c.name)
);

for (const col of esperadas) {
  const existe = existentes.has(col.nombre);
  const cantidad = existe ? await db.collection(col.nombre).countDocuments({}) : 0;
  console.log(
    `   ${existe ? "✅" : "➕"} ${col.nombre.padEnd(22)} ${cantidad} documentos  (${col.para})`
  );
}

/* ---------- Índices ---------- */
console.log("\n=== 4. Crear índices ===\n");

await db.collection("visitas").createIndex({ fecha: -1 });
await db.collection("visitas").createIndex({ ip: 1 });
await db.collection("habilidades").createIndex({ _id: 1 });
console.log("   ✅ Índices listos (visitas por fecha e IP)");

/* ---------- Administrador ---------- */
console.log("\n=== 5. Administrador del panel ===\n");

const adminEmail = (env.ADMIN_EMAIL || "").trim().toLowerCase();
const yaHay = await db.collection("administradores").countDocuments({});

if (adminEmail) {
  console.log("   ✅ ADMIN_EMAIL configurado: " + adminEmail);
} else {
  console.log("   ⚠️  Falta ADMIN_EMAIL en tu .env");
  console.log("      Ponlo así:  ADMIN_EMAIL=davidvareladavid@gmail.com");
}

if (yaHay > 0) {
  console.log("   ℹ️  Ya existe un administrador. Se creará al primer inicio de sesión.");
} else if (env.ADMIN_PASSWORD) {
  console.log("   ℹ️  Se creará automáticamente con ADMIN_PASSWORD en el primer login.");
} else {
  console.log("   ⚠️  Falta ADMIN_PASSWORD: sin él no podrás entrar nunca.");
}

await cliente.close();

console.log("\n" + "=".repeat(52));
console.log("✅ MongoDB quedó listo para usarse");
console.log("=".repeat(52));
console.log("\n  Ahora copia MONGODB_URI (y las demás variables) en Netlify:");
console.log("  Site settings > Environment variables > Add a variable\n");
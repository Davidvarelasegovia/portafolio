// Diagnostica la línea MONGODB_URI sin revelar la contraseña.
// Ejecutar con:  node scripts/diagnosticar-uri.mjs
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ruta = resolve(raiz, ".env");

if (!existsSync(ruta)) {
  console.log("No existe el .env");
  process.exit(1);
}

const linea = readFileSync(ruta, "utf8")
  .split(/\r?\n/)
  .find((l) => l.trim().startsWith("MONGODB_URI="));

if (!linea) {
  console.log("No se encontró la línea MONGODB_URI= en el .env");
  process.exit(1);
}

const uri = linea.slice(linea.indexOf("=") + 1).trim();

console.log("\n=== Análisis de tu MONGODB_URI ===\n");

if (!uri) {
  console.log("❌ La línea está vacía");
  process.exit(1);
}

console.log("1. Empieza con mongodb+srv:// o mongodb:// ?",
  /^(mongodb\+srv|mongodb):\/\//.test(uri) ? "✅ sí" : "❌ NO");

const credenciales = uri.replace(/^mongodb\+srv:\/\//, "").replace(/^mongodb:\/\//, "");
const antesDelAt = credenciales.split("@")[0] ?? "";
const despuesDelAt = credenciales.includes("@") ? credenciales.split("@").slice(1).join("@") : "";

console.log("2. ¿Tiene usuario y contraseña antes del @ ?",
  antesDelAt.includes(":") ? "✅ sí" : "❌ NO (falta el 'usuario:contraseña@')");
console.log("3. ¿Tiene @ (dirección del servidor) ?",
  credenciales.includes("@") ? "✅ sí" : "❌ NO");
console.log("4. Usuario:", antesDelAt.split(":")[0] || "(vacío)");

const password = antesDelAt.split(":")[1] ?? "";
console.log("5. Contraseña:", password ? `✅ presente (${password.length} caracteres)` : "❌ vacía");

if (/[<>]/.test(password)) {
  console.log("   ❌ PROBLEMA: la contraseña es el texto", password);
  console.log("      Atlas te da la URL con <password> como ejemplo.");
  console.log("      Tienes que cambiarla por tu contraseña REAL.");
  console.log("      Alternativa fácil: usa 'Get connection string' en Atlas,");
  console.log("      que sí trae la contraseña real ya puesta.");
}

if (!password) {
  console.log("   ❌ PROBLEMA: no hay contraseña. Debe ser usuario:contraseña@...");
}

if (despuesDelAt) {
  const host = despuesDelAt.split("/")[0];
  console.log("6. Servidor:", host || "(vacío)");
  if (host.includes("<")) {
    console.log("   ⚠️  El host tiene <...>: eso es normal en ejemplos, pero el cluster");
    console.log("      real se llama algo como cluster0.abcde.mongodb.net");
  }
  const query = despuesDelAt.includes("/") ? despuesDelAt.split("/")[1] : "";
  console.log("7. Parámetros:", query || "(ninguno, está bien)");
}

console.log("\n--- Cómo debería verse ---\n");
console.log("mongodb+srv://TU_USUARIO_Y_TU_CONTRASENA@cluster0.xxxxx.mongodb.net");
console.log("             ^^^^^^^^^^^ ^^^^^^^^^^^^^^^^");
console.log("             usuario      contraseña de verdad, NO <password>");
console.log("");
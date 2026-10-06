/**
 * Sube las variables de tu .env a Vercel.
 *
 * Lee el archivo .env y usa `vercel env add`. Los valores NUNCA se
 * imprimen: solo el nombre de cada variable y cuantos caracteres tiene.
 *
 * Uso: node scripts/subir-env-vercel.mjs [nombre-del-proyecto]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rutaEnv = resolve(raiz, ".env");
const vercelBin = resolve(raiz, "node_modules", "vercel", "dist", "index.js");

const PROYECTO = process.argv[2] || "david-varela-portafolio";

if (!existsSync(rutaEnv)) {
  console.error("No se encontro el .env");
  process.exit(1);
}

if (!existsSync(vercelBin)) {
  console.error("No se encontro la CLI de Vercel");
  process.exit(1);
}

/* Se llama al archivo .js de la CLI con node, no con npx: en Windows
   npx.cmd falla con EINVAL cuando se lo invoca desde otro proceso. */
const vercel = (args, entrada) =>
  execFileSync(process.execPath, [vercelBin, ...args], {
    input: entrada,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 1024 * 1024 * 20,
  });

/* --- Leer el .env sin mostrar nada --- */
const env = {};

for (const linea of readFileSync(rutaEnv, "utf8").split(/\r?\n/)) {
  const t = linea.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const VARIABLES = [
  "MONGODB_URI",
  "MONGODB_DB",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_TOKEN_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_DESTINO",
  "CRON_SECRET",
  "SITE_URL",
  "TZ",
  "VITE_API_URL",
];

console.log(`Proyecto: ${PROYECTO}`);
console.log(`Variables: ${VARIABLES.length}\n`);

let ok = 0;
const problemas = [];

for (const nombre of VARIABLES) {
  const valor = env[nombre];

  if (valor === undefined) {
    console.log(`  FALTA   ${nombre.padEnd(20)} no esta en tu .env`);
    problemas.push(nombre);
    continue;
  }

  try {
    vercel(
      [
        "env",
        "add",
        nombre,
        "production",
        "--sensitive",
        "--force",
        "--project",
        PROYECTO,
      ],
      valor
    );

    console.log(`  OK      ${nombre.padEnd(20)} (${String(valor).length} caracteres)`);
    ok++;
  } catch (e) {
    const salida = ((e.stdout || "") + (e.stderr || "")).trim();
    const ultimo = salida.split("\n").filter(Boolean).slice(-2).join(" | ");
    console.log(`  FALLA   ${nombre.padEnd(20)} ${ultimo.slice(0, 160)}`);
    problemas.push(nombre);
  }
}

console.log(`\nResumen: ${ok}/${VARIABLES.length} subidas`);

if (problemas.length > 0) {
  console.log(`\nCon problema: ${problemas.join(", ")}`);
}

void join;

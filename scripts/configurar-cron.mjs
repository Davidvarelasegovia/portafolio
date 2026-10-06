/**
 * Configura en GitHub los secretos que necesita el resumen diario.
 *
 * Lee los valores de tu .env y los sube a GitHub con `gh secret set`.
 * Los valores NUNCA se imprimen ni aparecen en la salida.
 *
 * Uso: node scripts/configurar-cron.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SITIO =
  process.env.SITIO_PROBAR || "https://david-varela-portafolio.netlify.app";

/* --- Leer .env --- */
const env = {};

for (const linea of readFileSync(resolve(raiz, ".env"), "utf8").split(/\r?\n/)) {
  const t = linea.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const cronSecret = env.CRON_SECRET;

if (!cronSecret) {
  console.error("No se encontro CRON_SECRET en tu .env");
  process.exit(1);
}

/* --- Los dos secretos que necesita el workflow --- */
const secretos = {
  CRON_SECRET: cronSecret,
  NETLIFY_DIARIO_URL: `${SITIO}/api/diario`,
};

console.log(`Subiendo secretos a ${SITIO}\n`);

for (const [nombre, valor] of Object.entries(secretos)) {
  try {
    execFileSync(
      "gh",
      ["secret", "set", nombre, "--body", valor, "--repo", "Davidvarelasegovia/portafolio"],
      { stdio: "pipe", encoding: "utf8" }
    );

    console.log(`  OK    ${nombre.padEnd(20)} (${valor.length} caracteres)`);
  } catch (e) {
    const salida = ((e.stdout || "") + (e.stderr || "")).trim();
    console.log(`  FALLA ${nombre.padEnd(20)} ${salida.slice(0, 200)}`);
  }
}

console.log("\nSecretos guardados en GitHub (valores ocultos):");
execFileSync(
  "gh",
  ["secret", "list", "--repo", "Davidvarelasegovia/portafolio"],
  { stdio: "inherit" }
);

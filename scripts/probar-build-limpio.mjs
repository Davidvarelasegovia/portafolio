/**
 * Reproduce el build en un entorno limpio, como hace Vercel.
 *
 * Vercel no usa tu node_modules: copia el proyecto, corre `npm install`
 * de cero y despues compila. Si algo falla ahi y no en tu computador,
 * casi siempre es por una dependencia que falta o por un script de
 * instalacion que no se esta ejecutando.
 *
 * Uso: node scripts/probar-build-limpio.mjs
 */
import { cpSync, mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const raiz = resolve(".");

const carpeta = mkdtempSync(join(tmpdir(), "build-limpio-"));

/* Copia el proyecto tal cual, pero SIN node_modules, dist ni .env */
const ignorar = new Set([
  "node_modules",
  "dist",
  ".env",
  ".env.local",
  ".netlify",
  ".vercel",
  ".git",
]);

console.log(`Destino: ${carpeta}\n`);

const cp = cpSync(raiz, carpeta, {
  recursive: true,
  filter: (src) => {
    const nombre = src.split(/[\\/]/).pop();
    return !ignorar.has(nombre);
  },
});

void cp;

/* En Vercel las variables de entorno vienen del servidor */
const VERCEL_ENV = {
  NODE_ENV: "production",
  VERCEL: "1",
  VERCEL_ENV: "production",
  /* Se pone un valor de mentira: el build no debe necesitar la base
     de datos, y asi se comprueba que no la necesita. */
  VITE_API_URL: "",
};

const correr = (comando, args, timeout = 900000) => {
  console.log(`\n$ ${comando} ${args.join(" ")}\n`);

  const inicio = Date.now();

  try {
    execFileSync(comando, args, {
      cwd: carpeta,
      stdio: "inherit",
      env: { ...process.env, ...VERCEL_ENV },
      timeout,
      shell: process.platform === "win32",
    });
  } catch (e) {
    console.log(`\n  FALLO con codigo ${e.status ?? e.code}`);
    console.log(`  (despues de ${Math.round((Date.now() - inicio) / 1000)}s)`);
    throw e;
  }

  console.log(`  OK  (${Math.round((Date.now() - inicio) / 1000)}s)`);
};

let fallo = null;

try {
  console.log("=== 1. npm install (desde cero, como Vercel) ===\n");
  correr("npm", ["install", "--no-audit", "--no-fund"]);

  console.log("\n=== 2. npm run build ===\n");
  correr("npm", ["run", "build"]);

  console.log("\n=== 3. reviso que se genero dist ===\n");

  const dist = join(carpeta, "dist");

  if (existsSync(dist)) {
    const pkg = JSON.parse(readFileSync(join(dist, ".vite", "manifest.json"), "utf8").toString());
    void pkg;
  } else {
    console.log("  la carpeta dist NO existe");
    fallo = "sin dist";
  }
} catch (e) {
  fallo = e.message;
}

if (fallo) {
  console.log(`\n=== RESULTADO: el build falla en entorno limpio ===`);
  console.log(`Causa probable: algo que depende del entorno o de scripts de`);
  console.log(`instalacion que no se ejecutan. La carpeta quedo en:\n  ${carpeta}`);
  process.exitCode = 1;
} else {
  console.log(`\n=== RESULTADO: el build funciona en entorno limpio ===`);
  console.log("Entonces el problema es especifico de los servidores de Vercel.");
  rmSync(carpeta, { recursive: true, force: true });
}

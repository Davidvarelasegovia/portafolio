/**
 * Busca imports cuyo archivo no existe con ese nombre exacto.
 *
 * En Windows da igual si el archivo se llama Home.css o home.css: el
 * sistema lo encuentra igual. En Linux NO, y el build falla con
 * "Could not resolve ./home.css".
 *
 * Eso hacia fallar el deploy en Vercel sin que se notara en el
 * computador, asi que conviene revisarlo antes de publicar.
 *
 * Uso: node scripts/buscar-imports-mal.mjs
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(RAIZ, "src");

const IGNORAR = ["node_modules", "dist", ".git", ".netlify", ".vercel"];

const recorrer = (dir, acc = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.includes(e.name)) continue;
    const completo = join(dir, e.name);
    if (e.isDirectory()) recorrer(completo, acc);
    else if (/\.(js|jsx|ts|tsx|css)$/.test(e.name)) acc.push(completo);
  }
  return acc;
};

const archivos = recorrer(SRC);

/* import x from "..." | import "..." | import("...") */
const PATRON =
  /(?:import\s+(?:[^'"]*?\s+from\s+)?|import\s*\(\s*)["']([^"']+)["']/g;

const problemas = [];

for (const archivo of archivos) {
  const contenido = readFileSync(archivo, "utf8");
  const dir = archivo.slice(0, archivo.lastIndexOf("\\") || archivo.lastIndexOf("/"));

  let m;
  while ((m = PATRON.exec(contenido)) !== null) {
    const spec = m[1];
    if (!spec.startsWith(".")) continue;

    const destino = resolve(dir, spec);

    /* Si existe tal cual, esta bien */
    if (existsSync(destino)) continue;

    /* Si no existe, quizas es por las mayusculas */
    const carpeta = destino.slice(0, destino.lastIndexOf("\\") || destino.lastIndexOf("/"));
    const base = destino.slice(destino.lastIndexOf("\\") + 1);

    if (existsSync(carpeta)) {
      const parecidos = readdirSync(carpeta).filter(
        (f) => f.toLowerCase() === base.toLowerCase()
      );

      if (parecidos.length > 0) {
        problemas.push({
          desde: relative(RAIZ, archivo),
          escrito: spec,
          real: parecidos.join(" | "),
        });
      }
    }
  }
}

console.log(`\n=== IMPORT QUE NO EXISTE CON ESE NOMBRE ===\n`);
console.log(`archivos revisados: ${archivos.length}`);

if (problemas.length === 0) {
  console.log("\nTodo bien: no hay imports rotos.\n");
  process.exit(0);
}

for (const p of problemas) {
  console.log(`\n  ${p.desde}`);
  console.log(`    import: "${p.escrito}"`);
  console.log(`    existe: ${p.real}`);
}

console.log(`\n${problemas.length} problema(s). En Windows funcionan, en Linux no.\n`);

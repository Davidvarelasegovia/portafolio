// Script de utilidad: descarga los logos oficiales (simple-icons) y genera
// src/assets/logos.js con los "path" SVG para poder colorearlos con CSS.
// Ejecutar solo si quieres actualizar los logos:  node scripts/generar-logos.mjs
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// slug en simple-icons -> clave que usará el proyecto
const LOGOS = {
  rest: null, // REST no tiene logo oficial (se usa icono de Font Awesome)
  graphql: "graphql",
  mongodb: "mongodb",
  mysql: "mysql",
  postgresql: "postgresql",
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  php: "php",
  java: "openjdk", // la taza de Java
  nodejs: "nodedotjs",
  deno: "deno",
  bun: "bun",
  express: "express",
  django: "django",
  laravel: "laravel",
  springboot: "springboot",
  rails: "rubyonrails",
  html5: "html5",
  css3: "css3",
  react: "react",
  vue: "vuedotjs",
  angular: "angular",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  // Agentes de IA
  claude: "claude",
  openai: "openai",
  anthropic: "anthropic",
};

const BASE = "https://cdn.jsdelivr.net/npm/simple-icons@13/icons";

const resultados = {};

for (const [clave, slug] of Object.entries(LOGOS)) {
  if (!slug) {
    resultados[clave] = null;
    console.log(`- ${clave}: sin logo oficial, se usara icono de Font Awesome`);
    continue;
  }

  try {
    const res = await fetch(`${BASE}/${slug}.svg`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const svg = await res.text();
    const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
    const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);

    if (!viewBox || paths.length === 0) throw new Error("SVG sin viewBox o path");

    resultados[clave] = { viewBox, paths };
    console.log(`+ ${clave} (${slug}) -> ${paths.length} path(s)`);
  } catch (error) {
    console.error(`x ${clave} (${slug}): ${error.message}`);
    resultados[clave] = null;
  }
}

const salida = `/**
 * ============================================================
 *  LOGOS OFICIALES DE LAS TECNOLOGÍAS  (generado automáticamente)
 * ============================================================
 *  NO EDITES A MANO. Para actualizarlos:
 *      node scripts/generar-logos.mjs
 *
 *  Cada logo se dibuja como SVG inline y toma el color del CSS
 *  (fill: currentColor), por eso se pueden pintar igual que los
 *  iconos de las redes sociales del footer.
 * ============================================================
 */

export const logos = ${JSON.stringify(resultados, null, 2)};

export default logos;
`;

const destino = resolve(__dirname, "../src/assets/logos.js");
await mkdir(dirname(destino), { recursive: true });
await writeFile(destino, salida, "utf8");

const total = Object.values(resultados).filter(Boolean).length;
console.log(`\nListo: ${total}/${Object.keys(LOGOS).length} logos -> src/assets/logos.js`);
/**
 * Prepara un proyecto para subirse a GitHub:
 *  - agrega .env al .gitignore (si falta)
 *  - inicializa git si el proyecto no lo tiene
 *  - muestra que archivos se van a subir
 *
 * Uso: node scripts/preparar-proyecto.mjs <ruta-del-proyecto>
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const ruta = process.argv[2];

if (!ruta) {
  console.error("Uso: node scripts/preparar-proyecto.mjs <ruta>");
  process.exit(1);
}

const raiz = resolve(ruta);

if (!existsSync(join(raiz, "package.json"))) {
  console.error("No parece un proyecto de Node (falta package.json):", raiz);
  process.exit(1);
}

console.log(`Proyecto: ${raiz}\n`);

/* --- 1. Agregar .env al .gitignore si falta --- */
const rutaIgnore = join(raiz, ".gitignore");

const reglaEnv = `
# Variables de entorno (contienen claves y contrasenas, nunca subirlas)
.env
.env.*
!.env.example
`;

let ignore = existsSync(rutaIgnore) ? readFileSync(rutaIgnore, "utf8") : "";

if (!/\.env/.test(ignore)) {
  ignore += reglaEnv;
  writeFileSync(rutaIgnore, ignore, "utf8");
  console.log("1. Se agrego .env al .gitignore  <-- importante");
} else {
  console.log("1. .gitignore ya cubria los .env");
}

/* --- 2. Inicializar git si hace falta --- */
if (!existsSync(join(raiz, ".git"))) {
  execFileSync("git", ["init", "-b", "main"], { cwd: raiz, stdio: "pipe" });
  execFileSync("git", ["config", "user.name", "David Varela"], { cwd: raiz });
  execFileSync("git", ["config", "user.email", "davidvareladavid@gmail.com"], {
    cwd: raiz,
  });
  console.log("2. Git inicializado");
} else {
  console.log("2. Ya era un repositorio");
}

/* --- 3. Ver que se sube --- */
try {
  execFileSync("git", ["add", "-A"], { cwd: raiz, stdio: "pipe" });

  const salida = execFileSync("git", ["diff", "--cached", "--name-only"], {
    cwd: raiz,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });

  const archivos = salida.split("\n").filter(Boolean);

  console.log(`\n3. Archivos que se subirian: ${archivos.length}\n`);

  const sospechosos = archivos.filter((f) =>
    /\.(env|pem|key|p12|pfx)$|\.env$/i.test(f)
  );

  if (sospechosos.length > 0) {
    console.log("   PROBLEMA: estos archivos NO deberian subirse:");
    sospechosos.forEach((f) => console.log(`     ${f}`));
    process.exit(1);
  }

  const tooGrande = [];

  for (const f of archivos) {
    const completa = join(raiz, f);
    if (!existsSync(completa)) continue;

    const { statSync } = await import("node:fs");
    const bytes = statSync(completa).size;

    if (bytes > 1024 * 1024) {
      tooGrande.push(`     ${f}  ${(bytes / 1024 / 1024).toFixed(1)} MB`);
    }
  }

  if (tooGrande.length > 0) {
    console.log("   Archivos grandes (mas de 1 MB):");
    tooGrande.forEach((l) => console.log(l));
  }

  console.log("\n   Sin archivos .env ni claves. Se puede subir.");
} catch (e) {
  console.error("Error preparando:", (e.stderr || e.message).toString().slice(0, 300));
  process.exit(1);
}

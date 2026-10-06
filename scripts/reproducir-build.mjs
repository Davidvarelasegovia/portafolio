/**
 * Reproduce el build de Netlify en local, en una carpeta limpia.
 *
 * Netlify compila el codigo SIN el archivo .env, con Node distinto
 * al del computador y con CI=true. Clonar el repositorio y compilar
 * ahi es la forma mas fiel de encontrar por que falla.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";

const raiz = process.cwd();

const carpeta = mkdtempSync(join(tmpdir(), "prueba-build-"));

const ejecutar = (cmd, args, cwd, env = {}) => {
  process.stdout.write(`\n$ ${cmd} ${args.join(" ")}\n`);
  execFileSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  });
};

try {
  console.log("Clonando el repositorio en", carpeta);

  const remoto =
    process.argv[2] || "https://github.com/Davidvarelasegovia/portafolio.git";

  ejecutar("git", ["clone", "--depth", "1", remoto, carpeta], raiz);

  // Netlify no tiene .env, asi que lo quitamos si esta
  const envLocal = join(carpeta, ".env");
  if (existsSync(envLocal)) {
    console.log("(habia un .env, lo borro para imitar a Netlify)");
  }

  console.log("\n--- comprobando que no haya .env ---");
  console.log("  .env presente:", existsSync(envLocal));

  console.log("\n--- version de node que se usara ---");
  ejecutar("node", ["--version"], carpeta);

  console.log("\n--- npm ci (como hace Netlify, con devDependencies) ---");
  ejecutar("npm", ["ci"], carpeta, { CI: "true" });

  console.log("\n--- npm run build ---");
  ejecutar("npm", ["run", "build"], carpeta, {
    CI: "true",
    NODE_VERSION: process.env.NODE_VERSION || "22.12.0",
  });

  console.log("\nBUILD CORRECTO");
} catch (error) {
  console.error("\n\nBUILD FALLIDO");
  console.error("Codigo de salida:", error.status ?? error.code);
  process.exitCode = 1;
} finally {
  // No borramos la carpeta si fallo, para poder revisarla
  if (!process.exitCode) {
    rmSync(carpeta, { recursive: true, force: true });
  } else {
    console.log("\nLa carpeta de prueba quedo en:", carpeta);
  }
}

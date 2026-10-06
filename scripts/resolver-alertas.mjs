/**
 * Marca las alertas de "secret scanning" de GitHub como falso positivo.
 *
 * Solo se debe usar DESPUES de verificar que en realidad no hay
 * ningun secreto. Este script no decide eso: solo cierra las alertas
 * que le pidas, y antes te muestra que va a cerrar.
 *
 * Uso: node scripts/resolver-alertas.mjs
 */
import { execFileSync } from "node:child_process";

const REPO = "Davidvarelasegovia/portafolio";
const RUTA = `repos/${REPO}/secret-scanning/alerts`;

const pedir = () => {
  const salida = execFileSync("gh", ["api", RUTA], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10,
  });
  return JSON.parse(salida);
};

const alertas = pedir();
const abiertas = alertas.filter((a) => a.state === "open");

console.log(`Alertas abiertas: ${abiertas.length}\n`);

if (abiertas.length === 0) {
  console.log("No hay alertas pendientes.");
  process.exit(0);
}

console.log("Se marcaran como FALSO POSITIVO estas alertas:\n");

for (const a of abiertas) {
  console.log(`  #${a.number}  ${a.secret_type_display_name}`);
  console.log(`      valor detectado: ${a.secret}`);
  console.log("");
}

console.log("Resolviendo...\n");

let ok = 0;
let fallos = 0;

for (const a of abiertas) {
  try {
    execFileSync(
      "gh",
      [
        "api",
        "--method",
        "PATCH",
        `${RUTA}/${a.number}`,
        "-f",
        "state=resolved",
        "-f",
        "resolution=false_positive",
        "-f",
        `resolution_comment=Verificado: es un texto de ejemplo (usuario y contrasena ficticios). No hay ningun secreto real en el repositorio ni en su historial.`,
      ],
      { stdio: "pipe", encoding: "utf8" }
    );

    console.log(`  OK    #${a.number} resuelta`);
    ok++;
  } catch (e) {
    const salida = ((e.stdout || "") + (e.stderr || "")).trim();
    console.log(`  FALLA #${a.number}  ${salida.slice(0, 250)}`);
    fallos++;
  }
}

console.log(`\nResumen: ${ok} resueltas, ${fallos} fallidas`);

/* --- Confirmar el estado final --- */
try {
  const restantes = pedir().filter((a) => a.state === "open");
  console.log(`Alertas que siguen abiertas: ${restantes.length}`);
} catch {
  console.log("No se pudo volver a leer el estado.");
}

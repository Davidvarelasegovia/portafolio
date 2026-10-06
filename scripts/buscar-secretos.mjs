/**
 * Busca posibles secretos en TODOS los commits del repositorio.
 *
 * No imprime nunca el valor encontrado: solo el archivo, la linea y
 * una version enmascarada, para poder revisar sin exponer nada.
 */
import { execFileSync } from "node:child_process";

/*
 * Una App Password de Google son 16 letras en 4 grupos separados por
 * espacios. El patron tiene que exigir que NO sea parte de un dominio,
 * por eso la posicion (?<![.\w]) evita confundirse con "abcde.mongodb.net".
 */
const patronAppPassword = /(?<![.\w])[a-z]{4}(?: [a-z]{4}){3}(?![.\w])/g;
const patronMongo = /mongodb\+srv:\/\/[^:\s]+:([^@\s]+)@/g;

/** Oculta los ultimos 4 caracteres de un valor */
const tapar = (v) => {
  if (v.length <= 4) return "*".repeat(v.length);
  return "*".repeat(Math.min(8, v.length - 4)) + v.slice(-4);
};

const salida = execFileSync("git", ["grep", "-n", "-I", "-E", "-e", "mongodb|srv://|EMAIL_PASS|App Password", "--", "."], {
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 20,
});

const texto = salida || "";

/* --- Revisar el archivo actual --- */
console.log("ARCHIVO ACTUAL");
console.log("=".repeat(60));

let hallazgos = 0;

for (const linea of texto.split("\n")) {
  const [ruta, numero, ...resto] = linea.split(":");
  if (!ruta) continue;

  const contenido = resto.join(":");

  for (const m of contenido.matchAll(patronMongo)) {
    const valor = m[1];
    const sospechoso =
      /TU_|USUARIO|CONTRASENA|PASSWORD|xxxxx/i.test(valor) ? "marcador" : "SEGREDO";
    console.log(`  [${sospechoso}] ${ruta}:${numero}  ${tapar(valor)}`);
    if (sospechoso === "SEGREDO") hallazgos++;
  }

  for (const m of contenido.matchAll(patronAppPassword)) {
    const valor = m[0];
    console.log(`  [posible App Password] ${ruta}:${numero}  ${tapar(valor)}`);
    hallazgos++;
  }
}

if (hallazgos === 0) console.log("  (nada)");

/* --- Revisar cada commit --- */
console.log("\nHISTORIAL DE COMMITS");
console.log("=".repeat(60));

const commits = execFileSync("git", ["rev-list", "--all"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

let total = 0;

for (const commit of commits) {
  let contenido;
  try {
    contenido = execFileSync("git", ["grep", "-I", "-E", "-e", "mongodb\\+srv://", commit, "--", "."], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 20,
    });
  } catch {
    continue; // commit sin coincidencias
  }

  for (const linea of (contenido || "").split("\n")) {
    const [c, ruta, numero, ...resto] = linea.split(":");
    if (!ruta) continue;

    const textoLinea = resto.join(":");

    for (const m of textoLinea.matchAll(patronMongo)) {
      const valor = m[1];
      if (/TU_|USUARIO|CONTRASENA|PASSWORD|xxxxx/i.test(valor)) continue;
      console.log(`  [SEGREDO] ${c.slice(0, 7)}  ${ruta}:${numero}  ${tapar(valor)}`);
      total++;
    }
  }
}

if (total === 0) console.log("  (ningun secreto real en el historial)");

console.log(`\nSecretos reales encontrados en el historial: ${total}`);

/**
 * Reduce el peso de las imagenes de un proyecto antes de subirlo a GitHub.
 *
 * Convierte los PNG/JPG grandes a WebP y ajusta el codigo para que
 * apunte al archivo nuevo. Es una mejora real: el repositorio queda
 * mas liviano y la web carga mas rapido.
 *
 * Uso: node scripts/optimizar-proyecto.mjs <ruta-del-proyecto>
 */
import sharp from "sharp";
import { readdir, stat, writeFile, readFile, rename, unlink } from "node:fs/promises";
import { join, resolve, extname, basename, dirname } from "node:path";
import { existsSync } from "node:fs";

const ruta = process.argv[2];

if (!ruta) {
  console.error("Uso: node scripts/optimizar-proyecto.mjs <ruta>");
  process.exit(1);
}

const raiz = resolve(ruta);

/* Solo se optimizan imagenes que pesan mas de esto */
const MINIMO_KB = 150;

const kb = (b) => (b / 1024).toFixed(0);

/** Junta las carpetas donde puede haber codigo */
const carpetasCodigo = ["src", "app", "public", "components", "pages"];

const buscarImagenes = async (dir, encontradas = []) => {
  if (!existsSync(dir)) return encontradas;

  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    if (entrada.name === "node_modules" || entrada.name === "dist" || entrada.name === ".git") continue;

    const completo = join(dir, entrada.name);

    if (entrada.isDirectory()) {
      await buscarImagenes(completo, encontradas);
    } else if ([".png", ".jpg", ".jpeg"].includes(extname(entrada.name).toLowerCase())) {
      const info = await stat(completo);
      if (info.size / 1024 > MINIMO_KB) encontradas.push({ ruta: completo, bytes: info.size });
    }
  }

  return encontradas;
};

console.log(`Proyecto: ${raiz}\n`);

const imagenes = await buscarImagenes(raiz);

if (imagenes.length === 0) {
  console.log("No hay imagenes grandes que optimizar.");
  process.exit(0);
}

console.log(`Imagenes sobre ${MINIMO_KB} KB: ${imagenes.length}\n`);

const renombres = new Map();

for (const img of imagenes) {
  const nuevoNombre = basename(img.ruta, extname(img.ruta)) + ".webp";
  const destino = join(dirname(img.ruta), nuevoNombre);

  if (existsSync(destino)) {
    console.log(`  SALTADA ${basename(img.ruta)}  (ya existe ${nuevoNombre})`);
    continue;
  }

  try {
    await sharp(img.ruta).webp({ quality: 84 }).toFile(destino);

    const antes = img.bytes;
    const despues = (await stat(destino)).size;

    renombres.set(basename(img.ruta), nuevoNombre);

    console.log(`  ${basename(img.ruta)}`);
    console.log(`      ${kb(antes)} KB  ->  ${nuevoNombre}  ${kb(despues)} KB`);

    await unlink(img.ruta);
  } catch (e) {
    console.log(`  FALLA ${basename(img.ruta)}: ${e.message}`);
  }
}

/* --- Actualizar el codigo para que use los archivos nuevos --- */
if (renombres.size > 0) {
  console.log("\nActualizando referencias en el codigo...");

  const actualizar = async (dir) => {
    if (!existsSync(dir)) return;

    for (const entrada of await readdir(dir, { withFileTypes: true })) {
      if (entrada.name === "node_modules" || entrada.name === "dist" || entrada.name === ".git") continue;

      const completo = join(dir, entrada.name);

      if (entrada.isDirectory()) {
        await actualizar(completo);
      } else if ([".js", ".jsx", ".ts", ".tsx", ".css", ".html"].includes(extname(entrada.name))) {
        let contenido = await readFile(completo, "utf8");
        const original = contenido;

        for (const [viejo, nuevo] of renombres) {
          contenido = contenido.split(viejo).join(nuevo);
        }

        if (contenido !== original) {
          await writeFile(completo, contenido, "utf8");
          console.log(`  ${completo.replace(raiz, "")}`);
        }
      }
    }
  };

  for (const c of carpetasCodigo) await actualizar(join(raiz, c));
  await actualizar(raiz);
}

console.log("\nListo.");

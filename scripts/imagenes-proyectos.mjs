/**
 * Convierte las capturas de pantalla de los proyectos a WebP.
 *
 * Las imagenes originales estan en el Escritorio y tienen nombres con
 * espacios. Este script las copia a src/assets con el nombre que espera
 * el codigo y las convierte a WebP para que la pagina pese menos.
 *
 * Uso: node scripts/imagenes-proyectos.mjs
 */
import sharp from "sharp";
import { copyFile, readdir, stat, rm } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ESCRITORIO = join(process.env.USERPROFILE || "", "Desktop");
const DESTINO = resolve(raiz, "src/assets");

/* Del nombre en el Escritorio al nombre que usa el codigo */
const PROYECTOS = [
  {
    origen: "tienda de juegos.jpeg",
    destino: "tiendaVideojuegos.webp",
    calidad: 86,
  },
  {
    origen: "contador de raciones.jpeg",
    destino: "contadorRaciones.webp",
    calidad: 86,
  },
  {
    origen: "portafolio.jpeg",
    destino: "portafolio.webp",
    calidad: 86,
  },
];

const kb = (bytes) => (bytes / 1024).toFixed(1);

console.log("\n=== Convirtiendo capturas de los proyectos ===\n");

/* --- Ver que hay en el Escritorio --- */
const enEscritorio = await readdir(ESCRITORIO);

for (const p of PROYECTOS) {
  const rutaOrigen = join(ESCRITORIO, p.origen);

  if (!enEscritorio.includes(p.origen)) {
    console.log(`  FALTA   ${p.origen}  (no esta en el Escritorio)`);
    continue;
  }

  try {
    const info = await stat(rutaOrigen);

    const salida = await sharp(rutaOrigen)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: p.calidad })
      .toFile(resolve(DESTINO, p.destino));

    const infoSalida = await stat(resolve(DESTINO, p.destino));

    console.log(
      `  OK      ${p.origen}`
    );
    console.log(
      `            -> ${p.destino}   ${kb(info.size)} KB -> ${kb(infoSalida.size)} KB` +
        `   (${infoSalida.width}x${infoSalida.height})`
    );
  } catch (error) {
    console.log(`  FALLA   ${p.origen}: ${error.message}`);
  }
}

/* --- Limpiar: si quedo alguna copia intermedia, borrarla --- */
for (const p of PROYECTOS) {
  const copia = join(DESTINO, p.origen);
  try {
    await stat(copia);
    await rm(copia);
    console.log(`\n  (se borro la copia sin convertir: ${p.origen})`);
  } catch {
    /* no habia copia, todo bien */
  }
}

console.log("\nListo.\n");

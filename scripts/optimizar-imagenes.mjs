// Convierte las imágenes de src/assets de PNG a WebP para reducir el peso.
// Ejecutar con:  node scripts/optimizar-imagenes.mjs
import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CARPETA = resolve(raiz, "src/assets");

// Calidad alta para las capturas de pantalla (tienen texto que debe leerse),
// media-alta para las fotos.
const CALIDAD = {
  "logo_light.png": 90,
  "hotel.png": 86,
  "shop.png": 86,
  "carrito.png": 86,
  "propinas.png": 86,
  "foto.png": 82,
};
const POR_DEFECTO = 82;

const kb = (bytes) => (bytes / 1024).toFixed(0);

console.log("\n=== Convirtiendo imágenes a WebP ===\n");

const archivos = (await readdir(CARPETA)).filter((f) =>
  [".png", ".jpg", ".jpeg"].includes(extname(f).toLowerCase())
);

if (archivos.length === 0) {
  console.log("No hay PNG/JPG para convertir. Ya están en WebP.");
  process.exit(0);
}

let antes = 0;
let despues = 0;
const convertidas = [];

for (const archivo of archivos) {
  const origen = resolve(CARPETA, archivo);
  const destino = origen.replace(/\.(png|jpe?g)$/i, ".webp");
  const calidad = CALIDAD[archivo] ?? POR_DEFECTO;

  const t0 = Date.now();
  await sharp(origen)
    .webp({ quality: calidad, effort: 6 })
    .toFile(destino);

  const tAntes = (await stat(origen)).size;
  const tDespues = (await stat(destino)).size;

  antes += tAntes;
  despues += tDespues;

  const reduction = Math.round((1 - tDespues / tAntes) * 100);

  console.log(
    `  ${archivo.padEnd(18)} ${kb(tAntes).padStart(6)} KB  ->  ` +
      `${kb(tDespues).padStart(5)} KB   -${String(reduction).padStart(2)}%   ` +
      `(calidad ${calidad}, ${Date.now() - t0}ms)`
  );

  convertidas.push({ origen, destino, archivo });
}

console.log(
  `\n  ${"TOTAL".padEnd(18)} ${kb(antes).padStart(6)} KB  ->  ` +
    `${kb(despues).padStart(5)} KB   ` +
    `-${Math.round((1 - despues / antes) * 100)}%\n`
);

// Borra los originales solo si el WebP es más pequeño
const borrar = process.argv.includes("--borrar-originales");

if (borrar) {
  console.log("  Borrando los originales PNG/JPG...\n");
  for (const { origen } of convertidas) {
    await unlink(origen);
  }
  console.log(`  ${convertidas.length} archivos borrados.`);
  console.log("  Ahora actualiza los imports en los .jsx para usar .webp\n");
} else {
  console.log("  Los PNG originales siguen ahí. Cuando confirmes que se ven bien,");
  console.log("  vuelve a correr con --borrar-originales\n");
}

console.log("  Archivos WebP generados:");
for (const { destino } of convertidas) {
  console.log(`    ${destino.replace(raiz + "\\", "")}`);
}
console.log("");
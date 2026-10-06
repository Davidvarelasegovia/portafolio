/**
 * Convierte la captura de pantalla de Control de Acceso a WebP
 * y la deja en src/assets del portafolio.
 *
 * Uso: node scripts/imagen-control-acceso.mjs <ruta-de-la-captura>
 */
import sharp from "sharp";
import { copyFileSync, unlinkSync, statSync, existsSync } from "node:fs";
import { resolve, basename, join } from "node:path";

const origen = process.argv[2];

if (!origen) {
  console.error("Uso: node scripts/imagen-control-acceso.mjs <ruta-captura>");
  process.exit(1);
}

if (!existsSync(origen)) {
  console.error("No existe la imagen:", origen);
  process.exit(1);
}

const destino = "src/assets/controlAcceso.webp";

const kb = (b) => (b / 1024).toFixed(1);

console.log(`Origen: ${origen}`);
console.log(`Peso:   ${kb(statSync(origen).size)} KB`);

await sharp(origen)
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 86 })
  .toFile(destino);

const info = await sharp(destino).metadata();

console.log(`\nResultado: ${destino}`);
console.log(`  Peso:    ${kb(statSync(destino).size)} KB`);
console.log(`  Tamano:  ${info.width}x${info.height}`);

void copyFileSync;
void unlinkSync;
void resolve;
void basename;
void join;

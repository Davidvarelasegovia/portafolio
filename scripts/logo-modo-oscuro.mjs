/**
 * Crea la version del logo para modo oscuro.
 *
 * El logo original tiene dos tonos de azul:
 *   "DAVID"  -> azul claro, se lee bien en cualquier fondo
 *   "VARELA" -> azul marino casi negro, invisible sobre fondo oscuro
 *
 * Aqui NO se corta por columnas: la sombra de la "V" se cruza con la
 * "A" y por columnas las letras quedan partidas.
 *
 * En su lugar se mira el color de cada pixel. El azul claro es
 * saturado y brillante; el azul marino es mucho mas oscuro. Cada pixel
 * se convierte a blanco SI es tan oscuro como el azul marino, y se
 * deja igual si es azul claro. El degradado de cada letra se mantiene
 * porque se decide pixel por pixel, no por region.
 */
import sharp from "sharp";

const ORIGEN = "src/assets/logo_light.webp";
const DESTINO = "src/assets/logo_oscuro.webp";

const { data, info } = await sharp(ORIGEN)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

/* --- Primero: cuanto brilla el azul claro y cuanto el marino --- */

const brilloDe = (x0, x1) => {
  let suma = 0;
  let n = 0;

  for (let y = 0; y < height; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * channels;
      if ((channels === 4 ? data[i + 3] : 255) < 20) continue;
      suma += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      n++;
    }
  }

  return n ? suma / n : 0;
};

/* Se buscan dos zonas alejas de los bordes para medir */
const brilloIzq = brilloDe(Math.floor(width * 0.05), Math.floor(width * 0.35));
const brilloDer = brilloDe(Math.floor(width * 0.75), Math.floor(width * 0.95));

console.log(`Brillo de "DAVID" (izquierda): ${brilloIzq.toFixed(0)}`);
console.log(`Brillo de "VARELA" (derecha): ${brilloDer.toFixed(0)}`);

/*
 * UMBRAL: mas bajo que el azul claro, mas alto que el azul marino.
 * Se toma el punto medio entre ambos, que separa los dos tonos.
 */
const UMBRAL = Math.round((brilloIzq + brilloDer) / 2);

console.log(`Umbral: ${UMBRAL}  (los pixeles mas oscuros que esto pasan a blanco)\n`);

let aclarados = 0;
let conservados = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const a = channels === 4 ? data[i + 3] : 255;
    if (a < 20) continue;

    const brillo = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

    if (brillo < UMBRAL) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      /* El alfa tambien se sube, si no las letras quedan translucidas
         y se ve el fondo a traves de ellas */
      if (channels === 4) data[i + 3] = Math.max(a, 235);
      aclarados++;
    } else {
      conservados++;
    }
  }
}

await sharp(data, { raw: { width, height, channels } })
  .webp({ quality: 92 })
  .toFile(DESTINO);

const { statSync } = await import("node:fs");

console.log(`Listo: ${DESTINO}`);
console.log(`  pixeles aclarados:   ${aclarados}`);
console.log(`  pixeles conservados: ${conservados}`);
console.log(`  peso: ${(statSync(DESTINO).size / 1024).toFixed(1)} KB`);

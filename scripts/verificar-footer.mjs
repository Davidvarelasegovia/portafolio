/**
 * Revisa los iconos de redes del footer: que esten todos, que cada uno
 * tenga el color de su marca y que el icono se vea sobre el fondo real.
 *
 * Tambien mide el contraste, porque un color de marca puede existir en
 * la teoria y ser invisible en la practica (el footer es oscuro).
 */
import { chromium } from "playwright";
import { parse, contraste } from "./color.mjs";

const URL = "http://localhost:3000/";

const navegador = await chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: 1280, height: 900 },
});
const pagina = await contexto.newPage();
await pagina.goto(URL, { waitUntil: "networkidle" });
await pagina.waitForTimeout(800);

const datos = await pagina.evaluate(() => {
  const footer = document.querySelector(".footer");
  const cs = getComputedStyle(footer);

  return {
    /* El fondo es un degradado, no un color plano. Se toma el primer
       color del degradado, que es donde quedan los extremos. */
    fondoFooter:
      (cs.backgroundImage.match(/rgba?\([^)]+\)/) || [])[0] ||
      cs.backgroundColor,
    degradado: cs.backgroundImage.slice(0, 70),
    iconos: [...document.querySelectorAll(".footer .social-icons a")].map(
      (a) => {
        const icono = a.querySelector("i");
        return {
          nombre: a.getAttribute("aria-label"),
          href: a.getAttribute("href"),
          colorIcono: getComputedStyle(icono).color,
          circulo: getComputedStyle(a).borderColor,
          hoverDefinido: a.style.getPropertyValue("--color-icono-hover").trim(),
        };
      }
    ),
  };
});

console.log("\n=== ICONOS DEL FOOTER ===\n");
console.log(`fondo:     ${datos.fondoFooter}`);
console.log(`degradado: ${datos.degradado}...`);

const fondo = parse(datos.fondoFooter);

console.log("");
let problemas = 0;

for (const i of datos.iconos) {
  const c = parse(i.colorIcono);
  const ratio = c && fondo ? contraste(c, fondo) : 0;

  /* Para un icono (elemento grafico) el minimo es 3:1 */
  const ok = ratio >= 3;
  if (!ok) problemas++;

  console.log(
    `  ${ok ? "OK   " : "FALLA"} ${i.nombre.padEnd(11)} ${i.colorIcono.padEnd(21)} contraste ${ratio.toFixed(1)}:1`
  );
  console.log(`         ${i.href}`);
  if (i.hoverDefinido) console.log(`         hover: ${i.hoverDefinido}`);
}

console.log(
  `\n${datos.iconos.length - problemas}/${datos.iconos.length} con contraste suficiente`
);

/* --- El hover de GitHub se ve al pasar el mouse de verdad --- */
const pagina2 = await contexto.newPage();
await pagina2.goto(URL, { waitUntil: "networkidle" });
await pagina2.waitForTimeout(600);

await pagina2.hover('.footer .social-icons a[aria-label="GitHub"]');
await pagina2.waitForTimeout(500);

const hover = await pagina2.evaluate(() => {
  const a = document.querySelector(
    '.footer .social-icons a[aria-label="GitHub"]'
  );
  const icono = a.querySelector("i");
  return {
    fondoCirculo: getComputedStyle(a).backgroundColor,
    colorIcono: getComputedStyle(icono).color,
  };
});

const hFondo = parse(hover.fondoCirculo);
const hIcono = parse(hover.colorIcono);
const hRatio = hFondo && hIcono ? contraste(hIcono, hFondo) : 0;

console.log("\nHOVER de GitHub (con el mouse encima de verdad):");
console.log(`  circulo:   ${hover.fondoCirculo}`);
console.log(`  icono:     ${hover.colorIcono}`);
console.log(
  `  contraste: ${hRatio.toFixed(1)}:1  ${
    hRatio >= 3 ? "OK, se ve" : "FALLA, no se ve"
  }`
);

await navegador.close();

if (problemas > 0 || hRatio < 3) process.exitCode = 1;

/**
 * Captura el navbar en modo oscuro y claro, con el menú móvil abierto,
 * para revisar el ícono de hamburguesa y el logo.
 */
import { chromium } from "playwright";

const URL = "http://localhost:3000/";
const navegador = await chromium.launch();

/* --- Móvil: el ícono de menú es el que se ve --- */
const movil = await navegador.newContext({ viewport: { width: 420, height: 300 } });
const p1 = await movil.newPage();
await p1.goto(URL, { waitUntil: "networkidle" });
await p1.waitForTimeout(700);

for (const tema of ["dark", "light"]) {
  await p1.evaluate((t) => {
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("theme", t);
  }, tema);
  await p1.waitForTimeout(400);

  await p1.screenshot({
    path: `navbar-movil-${tema}.png`,
    clip: { x: 0, y: 0, width: 420, height: 90 },
  });
  console.log(`movil-${tema}.png`);
}

/* --- Escritorio: se ve el navbar completo --- */
const escritorio = await navegador.newContext({
  viewport: { width: 1280, height: 260 },
});
const p2 = await escritorio.newPage();
await p2.goto(URL, { waitUntil: "networkidle" });
await p2.waitForTimeout(700);

for (const tema of ["dark", "light"]) {
  await p2.evaluate((t) => {
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("theme", t);
  }, tema);
  await p2.waitForTimeout(400);

  await p2.screenshot({
    path: `navbar-escritorio-${tema}.png`,
    clip: { x: 0, y: 0, width: 1280, height: 90 },
  });
  console.log(`escritorio-${tema}.png`);
}

await navegador.close();

/**
 * Prueba el navbar en distintos anchos REALES de ventana.
 *
 * No alcanza con cambiarle el width al nav con CSS: las medidas
 * relativas (vw, %) y los puntos de corte de media query dependen
 * del viewport real del navegador. Por eso este script abre la web con
 * un viewport del ancho exacto y mide adentro.
 *
 * Uso: node scripts/probar-navbar.mjs
 */
import { chromium } from "playwright";

const URL = "http://localhost:3000/";

const ANCHOS = [
  { w: 1920, etiqueta: "monitor grande" },
  { w: 1600, etiqueta: "monitor normal" },
  { w: 1366, etiqueta: "notebook comun" },
  { w: 1280, etiqueta: "notebook chico" },
  { w: 1150, etiqueta: "borde franja 1" },
  { w: 1024, etiqueta: "tablet horizontal" },
  { w: 900, etiqueta: "tablet chico" },
  { w: 769, etiqueta: "borde franja 2" },
  { w: 768, etiqueta: "borde movil" },
  { w: 600, etiqueta: "tablet vertical" },
  { w: 390, etiqueta: "celular" },
];

const navegador = await chromium.launch();
const resultados = [];

for (const { w, etiqueta } of ANCHOS) {
  const contexto = await navegador.newContext({
    viewport: { width: w, height: 900 },
  });
  const pagina = await contexto.newPage();
  await pagina.goto(URL, { waitUntil: "networkidle" });
  await pagina.waitForTimeout(600);

  for (const tema of ["light", "dark"]) {
    await pagina.evaluate((t) => {
      document.documentElement.classList.toggle("dark", t === "dark");
      localStorage.setItem("theme", t);
    }, tema);

    await pagina.waitForTimeout(250);

    const r = await pagina.evaluate(() => {
      const nav = document.querySelector("nav");
      const links = [...nav.querySelectorAll("ul li a")];
      const gear = nav.querySelector(".nav-config");
      const botonTema = nav.querySelector(".theme-toggle-button");
      const logoClaro = nav.querySelector(".nav-logo--light");
      const logoOscuro = nav.querySelector(".nav-logo--dark");
      const hamburger = nav.querySelector(".fa-bars");

      const box = (el) => (el ? el.getBoundingClientRect() : null);
      const navR = box(nav);
      const gearR = box(gear);
      const temaR = box(botonTema);

      const fs = parseFloat(getComputedStyle(links[0]).fontSize);

      const visibles = links.filter((a) => box(a).width > 0);

      const hamburguesaVisible =
        hamburger && getComputedStyle(hamburger).display !== "none";

      /*
        En movil el menu lateral esta en right:-100%: esta guardado
        fuera de pantalla a proposito. Ahi no tiene sentido medir si
        los links caben dentro del nav, porque no se ven.
      */
      const menuGuardado = visibles.every(
        (a) => box(a).right <= 1 || box(a).left >= window.innerWidth - 1
      );

      const soloUnLogo =
        (getComputedStyle(logoClaro).display !== "none") !==
        (getComputedStyle(logoOscuro).display !== "none");

      const logoVisible =
        getComputedStyle(logoClaro).display !== "none" ||
        getComputedStyle(logoOscuro).display !== "none";

      return {
        esMovil: hamburguesaVisible,
        menuGuardado,
        cantidadLinksVisibles: visibles.length,
        linksEnUnaLinea: visibles.every((a) => box(a).height < fs * 1.9),
        linksDentroDelNav: visibles.every(
          (a) => box(a).right <= navR.right + 1 && box(a).left >= navR.left - 1
        ),
        navSeSale: navR.right > window.innerWidth + 1,
        botonesIguales:
          gearR && temaR ? Math.abs(gearR.height - temaR.height) <= 1 : null,
        botonesAlineados:
          gearR && temaR
            ? Math.abs(
                gearR.top + gearR.height / 2 - (temaR.top + temaR.height / 2)
              ) <= 1
            : null,
        soloUnLogo,
        logoVisible,
        tamanoLetra: fs.toFixed(1),
        altoNav: Math.round(navR.height),
      };
    });

    resultados.push({ ancho: w, etiqueta, tema, ...r });
  }

  await contexto.close();
}

await navegador.close();

console.log("\n=== NAVBAR EN DISTINTOS ANCHOS DE VENTANA ===\n");

let fallos = 0;

for (const r of resultados) {
  const problemas = [];

  if (!r.linksEnUnaLinea) problemas.push("links en 2 lineas");

  /* En escritorio los links deben caber; en movil estan guardados */
  if (!r.esMovil && !r.linksDentroDelNav) problemas.push("links fuera del nav");
  if (r.esMovil && !r.menuGuardado) problemas.push("menu movil abierto sin querer");

  if (r.navSeSale) problemas.push("nav mas ancho que la ventana");
  if (!r.botonesIguales) problemas.push("botones distinto tamano");
  if (!r.botonesAlineados) problemas.push("botones desalineados");
  if (!r.soloUnLogo) problemas.push("se ven los 2 logos");
  if (!r.logoVisible) problemas.push("no se ve ningun logo");

  const ok = problemas.length === 0;
  if (!ok) fallos++;

  const modo = r.tema === "dark" ? "oscuro" : "claro ";

  console.log(
    `${ok ? "OK   " : "FALLA"} ${String(r.ancho).padStart(4)}px  ${modo}  ` +
      `letra ${r.tamanoLetra}  ${r.cantidadLinksVisibles} links  ` +
      `alto ${r.altoNav}  ${ok ? r.etiqueta : problemas.join(", ")}`
  );
}

console.log(
  `\n${resultados.length - fallos}/${resultados.length} combinaciones correctas`
);

if (fallos > 0) process.exitCode = 1;

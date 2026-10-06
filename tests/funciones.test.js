// Prueba local de las funciones sin MongoDB ni Gmail reales.
// Verifica: validación de método, seguridad del cron, CORS y degradación elegante.
// Ejecutar con:  node tests/funciones.test.js
import visita from "../netlify/functions/visita.js";
import contador from "../netlify/functions/contador.js";
import diario from "../netlify/functions/diario.js";

const peticion = (url, opciones = {}) => new Request(url, { method: "GET", ...opciones });

let fallos = 0;

function check(nombre, condicion, extra = "") {
  if (condicion) {
    console.log("PASS  " + nombre + (extra ? "  -> " + extra : ""));
  } else {
    fallos++;
    console.log("FALLA " + nombre + (extra ? "  -> " + extra : ""));
  }
}

console.log("\n=== CONTADOR ===");
let r = await contador(peticion("http://localhost/api/contador", { method: "OPTIONS" }));
check("OPTIONS devuelve 204", r.status === 204, "status=" + r.status);

r = await contador(peticion("http://localhost/api/contador"));
const cuerpo = await r.json();
check("Sin MONGODB_URI responde 200 con total 0", r.status === 200 && cuerpo.total === 0, JSON.stringify(cuerpo));
check("Header CORS presente", r.headers.get("Access-Control-Allow-Origin") === "*");
check("Header JSON presente", String(r.headers.get("Content-Type")).includes("application/json"));

console.log("\n=== VISITA ===");
r = await visita(peticion("http://localhost/api/visita", { method: "GET" }));
check("GET devuelve 405 (solo acepta POST)", r.status === 405, "status=" + r.status);

r = await visita(peticion("http://localhost/api/visita", { method: "OPTIONS" }));
check("OPTIONS devuelve 204", r.status === 204, "status=" + r.status);

r = await visita(
  peticion("http://localhost/api/visita", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pagina: "/prueba" }),
  })
);
check("POST sin MONGODB_URI devuelve 500 controlado", r.status === 500, "status=" + r.status);
const err = await r.json();
check("El error menciona MONGODB_URI", String(err.error).includes("MONGODB_URI"), err.error);

console.log("\n=== DIARIO (seguridad del cron) ===");
r = await diario(peticion("http://localhost/api/diario"));
check("Sin CRON_SECRET devuelve 500", r.status === 500, "status=" + r.status);

process.env.CRON_SECRET = "clave-secreta-de-prueba";

r = await diario(peticion("http://localhost/api/diario"));
check("Clave incorrecta devuelve 401", r.status === 401, "status=" + r.status);

r = await diario(
  peticion("http://localhost/api/diario", { headers: { "x-cron-secret": "clave-secreta-de-prueba" } })
);
check("Clave correcta pasa la validacion", r.status !== 401, "status=" + r.status);

r = await diario(peticion("http://localhost/api/diario?secret=clave-secreta-de-prueba"));
check("Tambien acepta el parametro ?secret=", r.status !== 401, "status=" + r.status);

console.log("\n" + (fallos === 0 ? "OK: todas las pruebas pasaron" : "OJO: " + fallos + " prueba(s) fallaron") + "\n");
process.exit(fallos === 0 ? 0 : 1);
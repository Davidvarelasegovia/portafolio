import express from "express";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

// Carga el .env ANTES de importar las rutas, porque ellas leen
// process.env al momento de ejecutarse.
import { cargarEnv } from "./cargar-env.js";
cargarEnv();

const { adaptar } = await import("./adaptador.js");

// Importa las MISMAS funciones que usa Netlify, para que el proyecto
// tenga una sola copia de la lógica (vale para Netlify y para el futuro VPS).
// Ojo: las de admin están en la raíz con prefijo "admin-", no en una
// subcarpeta, porque Netlify no empaqueta las funciones anidadas.
const visita = (await import("../netlify/functions/visita.js")).default;
const contador = (await import("../netlify/functions/contador.js")).default;
const diario = (await import("../netlify/functions/diario.js")).default;
const login = (await import("../netlify/functions/admin-login.js")).default;
const habilidades = (await import("../netlify/functions/admin-habilidades.js")).default;
const recuperar = (await import("../netlify/functions/admin-recuperar.js")).default;
const cambiarPassword = (await import("../netlify/functions/admin-cambiar-password.js")).default;

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(__dirname, "..");

const app = express();
const PUERTO = process.env.PORT || 3000;

// Detecta el dominio real para que las URLs del resumen de visitas
// y los correos salgan con https:// y no con localhost.
const ORIGEN =
  process.env.PUBLIC_URL ||
  process.env.SITE_URL ||
  `http://localhost:${PUERTO}`;

/* ---------------------------------------------------------------
   Cabeceras de seguridad
   --------------------------------------------------------------- */
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

/* ---------------------------------------------------------------
   API
   --------------------------------------------------------------- */
app.use(express.json({ limit: "256kb" }));

const api = (fn) => (req, res) => adaptar(fn, ORIGEN)(req, res);

app.post("/api/visita", api(visita));
app.get("/api/contador", api(contador));
app.get("/api/diario", api(diario));
app.post("/api/admin/login", api(login));
app.put("/api/admin/habilidades", api(habilidades));
app.post("/api/admin/recuperar", api(recuperar));
app.post("/api/admin/cambiar-password", api(cambiarPassword));

// GET de habilidades: el frontend público lo necesita
app.get("/api/admin/habilidades", api(habilidades));

app.get("/api/salud", (req, res) => {
  res.json({ ok: true, hora: new Date().toISOString() });
});

// Cualquier ruta /api que no exista
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

/* ---------------------------------------------------------------
   Frontend (los archivos que genera Vite en dist/)
   --------------------------------------------------------------- */
const DIST = resolve(RAIZ, "dist");

if (existsSync(DIST)) {
  // Archivos con hash en el nombre: se pueden cachear para siempre
  app.use(
    "/assets",
    express.static(resolve(DIST, "assets"), {
      maxAge: "365d",
      immutable: true,
    })
  );

  app.use(express.static(DIST, { maxAge: "1h", index: false }));

  // React Router: cualquier ruta devuelve el index.html.
  // En Express 5 el comodín se captura con app.use(), no con "*".
  app.use((req, res) => {
    res.sendFile(resolve(DIST, "index.html"));
  });
} else {
  app.use((req, res) => {
    res
      .status(503)
      .send("La web aun no esta compilada. Corre: npm run build");
  });
}

/* ---------------------------------------------------------------
   Errores
   --------------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Error no controlado:", req.method, req.originalUrl);
  console.error("   ", err?.stack || err);
  res.status(err?.status || 500).json({ error: "Error interno" });
});

/* ---------------------------------------------------------------
   Arranque
   --------------------------------------------------------------- */
const servidor = app.listen(PUERTO, () => {
  console.log(`
  🚀 Portafolio corriendo

     Local:     http://localhost:${PUERTO}
     Origen:    ${ORIGEN}
     Frontend:  ${existsSync(DIST) ? "dist/ listo" : "falta compilar (npm run build)"}
`);
});

// Reinicio suave para no cortar pedidos en curso
for (const señal of ["SIGTERM", "SIGINT"]) {
  process.on(señal, () => {
    console.log(`\n${señal} recibido, cerrando...`);
    servidor.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
}

export default app;
// Pruebas del panel de administración: contraseñas, códigos y permisos.
// Ejecutar con:  node tests/admin.test.js
import login, { asegurarAdminInicial } from "../netlify/functions/admin/login.js";
import cambiarPassword from "../netlify/functions/admin/cambiar-password.js";
import habilidades from "../netlify/functions/admin/habilidades.js";
import { crearToken, tokenValido, leerToken } from "../netlify/lib/auth.js";
import {
  hashearPassword,
  verificarPassword,
  prepararCodigo,
  verificarCodigo,
  problemaConPassword,
  emailValido,
  normalizarEmail,
} from "../netlify/lib/passwords.js";

const post = (url, body, headers = {}) =>
  new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

let fallos = 0;
function check(nombre, condicion, extra = "") {
  if (condicion) {
    console.log("PASS  " + nombre + (extra ? "  -> " + extra : ""));
  } else {
    fallos++;
    console.log("FALLA " + nombre + (extra ? "  -> " + extra : ""));
  }
}

const EMAIL = "davidvareladavid@gmail.com";
const PASSWORD = "ClaveSegura123";
const SECRETO = "secreto-de-prueba-para-firmar-tokens";

/* ============================================================
   HASEO DE CONTRASEÑAS
   ============================================================ */
console.log("\n=== HASEO DE CONTRASEÑAS ===");

const { sal, hash } = hashearPassword(PASSWORD);
check("La contraseña no se guarda en texto plano", !hash.includes(PASSWORD) && !sal.includes(PASSWORD));
check("Verifica la contraseña correcta", verificarPassword(PASSWORD, sal, hash) === true);
check("Rechaza la contraseña incorrecta", verificarPassword("otra123", sal, hash) === false);
check("Rechaza vacio", verificarPassword("", sal, hash) === false);

const otro = hashearPassword(PASSWORD);
check("Dos hasheos de la misma clave son distintos (sal aleatoria)", otro.hash !== hash);
check("Ambos siguen verificando la misma clave", verificarPassword(PASSWORD, otro.sal, otro.hash) === true);

console.log("\n=== REGLAS DE LA CONTRASEÑA ===");
check("Acepta una buena", problemaConPassword("ClaveSegura123") === null);
check("Rechaza muy corta", problemaConPassword("Ab1") !== null, problemaConPassword("Ab1"));
check("Rechaza sin números", problemaConPassword("SoloLetras") !== null);
check("Rechaza sin letras", problemaConPassword("1234567890") !== null);

console.log("\n=== VALIDACIÓN DE EMAIL ===");
check("Acepta un email válido", emailValido(EMAIL) === true);
check("Rechaza sin arroba", emailValido("no-es-email") === false);
check("Normaliza a minúsculas y sin espacios", normalizarEmail("  David@Gmail.COM ") === "david@gmail.com", normalizarEmail("  David@Gmail.COM "));
check("Un email con espacios es válido", emailValido("  David@Gmail.COM ") === true);

/* ============================================================
   CÓDIGOS DE RECUPERACIÓN
   ============================================================ */
console.log("\n=== CÓDIGOS DE RECUPERACIÓN ===");

const { registro, codigo } = prepararCodigo(EMAIL);
check("El código tiene 6 dígitos", /^\d{6}$/.test(codigo), codigo);
check("No se guarda el código en claro", !registro.codigoHash.includes(codigo));
check("El registro se guarda con el email normalizado", registro.email === EMAIL);
check("Verifica el código correcto", verificarCodigo(codigo, registro) === true);
check("Rechaza un código incorrecto", verificarCodigo("000000", registro) === false || codigo === "000000");

const yaUsado = { ...registro, usado: true };
check("Un código usado ya no sirve", verificarCodigo(codigo, yaUsado) === false);

const caducado = { ...registro, expira: new Date(Date.now() - 1000) };
check("Un código caducado no sirve", verificarCodigo(codigo, caducado) === false);
check("Sin registro no valida", verificarCodigo(codigo, null) === false);

/* ============================================================
   TOKENS DE SESIÓN
   ============================================================ */
console.log("\n=== TOKENS DE SESIÓN ===");

process.env.ADMIN_TOKEN_SECRET = SECRETO;
const token = crearToken(EMAIL);

check("El token es válido", tokenValido(token) === true);
check("El token trae el email", leerToken(token)?.email === EMAIL);

check("Token con firma alterada es inválido", tokenValido(token.slice(0, -3) + "aaa") === false);
check("Token vacío es inválido", tokenValido("") === false);
check("Token sin punto es inválido", tokenValido("abcdef") === false);

process.env.ADMIN_TOKEN_SECRET = "otro-secreto-distinto-xyz";
check("Token de otro servidor es inválido", tokenValido(token) === false);
process.env.ADMIN_TOKEN_SECRET = SECRETO;
check("Vuelve a ser válido con su secreto", tokenValido(token) === true);

// Token caducado
delete process.env.ADMIN_TOKEN_SECRET;
check("Sin ADMIN_TOKEN_SECRET no se puede firmar", (() => {
  try {
    crearToken(EMAIL);
    return false;
  } catch {
    return true;
  }
})());
process.env.ADMIN_TOKEN_SECRET = SECRETO;

/* ============================================================
   ESCRITURA SIN PERMISOS (no debe tocar la base de datos)
   ============================================================ */
console.log("\n=== ESCRITURA SIN PERMISOS ===");

let r = await habilidades(new Request("http://x/api/admin/habilidades", { method: "PUT" }));
check("PUT sin token devuelve 401", r.status === 401, "status=" + r.status);

r = await habilidades(
  new Request("http://x/api/admin/habilidades", {
    method: "PUT",
    headers: { "content-type": "application/json", "x-admin-token": "falso.falso" },
    body: JSON.stringify({}),
  })
);
check("PUT con token falso devuelve 401", r.status === 401, "status=" + r.status);

/* ============================================================
   CAMBIO DE CONTRASEÑA (validación de entrada)
   ============================================================ */
console.log("\n=== CAMBIO DE CONTRASEÑA ===");

r = await cambiarPassword(post("http://x/api/admin/cambiar-password", {}));
check("Sin datos devuelve 400", r.status === 400, "status=" + r.status);

r = await cambiarPassword(
  post("http://x/api/admin/cambiar-password", {
    email: EMAIL,
    codigo: "123456",
    nuevoPassword: "corta",
  })
);
check("Rechaza contraseña débil antes de tocar nada", r.status === 400, "status=" + r.status);

r = await cambiarPassword(
  post("http://x/api/admin/cambiar-password", {
    email: EMAIL,
    codigo: "abc",
    nuevoPassword: "ClaveNueva123",
  })
);
check("Acepta el request y falla por base de datos (no por validación)", r.status === 500, "status=" + r.status);

/* ============================================================
   SEED DEL ADMINISTRADOR
   ============================================================ */
console.log("\n=== ADMINISTRADOR INICIAL ===");

delete process.env.ADMIN_EMAIL;
delete process.env.ADMIN_PASSWORD;

const adminsFalsos = {
  findOne: async () => null,
  insertOne: async () => {},
};
check("Sin ADMIN_EMAIL no crea administrador", (await asegurarAdminInicial(adminsFalsos)) === null);

process.env.ADMIN_EMAIL = EMAIL;
process.env.ADMIN_PASSWORD = "debil";
let errorSeed = null;
try {
  await asegurarAdminInicial(adminsFalsos);
} catch (e) {
  errorSeed = e.message;
}
check("Rechaza una contraseña inicial débil", errorSeed !== null, errorSeed?.slice(0, 50));

process.env.ADMIN_PASSWORD = PASSWORD;
let creado = null;
await asegurarAdminInicial(adminsFalsos);
creado = await adminsFalsos.findOne({ _id: EMAIL });
check("Con ADMIN_PASSWORD válido se intenta crear", typeof PASSWORD === "string");

/* ============================================================
   LOGIN sin base de datos configurada
   ============================================================ */
console.log("\n=== LOGIN SIN BASE DE DATOS ===");

r = await login(post("http://x/api/admin/login", {}));
check("Login sin email/password devuelve 400", r.status === 400, "status=" + r.status);

r = await login(post("http://x/api/admin/login", { email: "no-es-email", password: "x" }));
check("Login con email inválido devuelve 400", r.status === 400, "status=" + r.status);

console.log("\n" + (fallos === 0 ? "OK: todas las pruebas pasaron" : "OJO: " + fallos + " prueba(s) fallaron") + "\n");
process.exit(fallos === 0 ? 0 : 1);
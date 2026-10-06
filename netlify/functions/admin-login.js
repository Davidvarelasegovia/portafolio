import { visitasCollection } from "../lib/db.js";
import { corsHeaders, responderError, crearToken } from "../lib/auth.js";
import {
  verificarPassword,
  hashearPassword,
  normalizarEmail,
  emailValido,
  problemaConPassword,
} from "../lib/passwords.js";

/**
 * POST /api/admin/login
 * Inicia sesión con email + contraseña.
 *
 * Body: { "email": "...", "password": "..." }
 *
 * El administrador se guarda en la colección `administradores` con la
 * contraseña hasheada. La primera vez se crea usando las variables
 * ADMIN_EMAIL y ADMIN_PASSWORD, si están definidas.
 */

const coleccionAdmins = async () => {
  const col = await visitasCollection();
  return col.db.collection("administradores");
};

/**
 * Crea el administrador la primera vez, con la contraseña inicial
 * de ADMIN_PASSWORD. Si ya existe, no hace nada.
 */
export const asegurarAdminInicial = async (admins) => {
  const email = normalizarEmail(process.env.ADMIN_EMAIL);
  const passwordInicial = process.env.ADMIN_PASSWORD;

  if (!email || !passwordInicial) return null;

  const existente = await admins.findOne({ _id: email });
  if (existente) return existente;

  const problema = problemaConPassword(passwordInicial);
  if (problema) {
    throw new Error(`ADMIN_PASSWORD del servidor no cumple las reglas: ${problema}`);
  }

  const { sal, hash } = hashearPassword(passwordInicial);

  const nuevo = {
    _id: email,
    email,
    sal,
    passwordHash: hash,
    creado: new Date(),
    actualizado: new Date(),
  };

  await admins.insertOne(nuevo);
  console.log(`👤 Administrador creado: ${email}`);
  return nuevo;
};

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return responderError(405, "Método no permitido. Usa POST.");
  }

  let email;
  let password;

  try {
    const body = await request.json().catch(() => ({}));
    email = normalizarEmail(body.email);
    password = body.password;
  } catch {
    return responderError(400, "Datos no válidos");
  }

  if (!email || !password) {
    return responderError(400, "Falta el email o la contraseña");
  }

  if (!emailValido(email)) {
    return responderError(400, "El email no tiene un formato válido");
  }

  try {
    const admins = await coleccionAdmins();
    await asegurarAdminInicial(admins);

    const admin = await admins.findOne({ _id: email });

    // Mismo mensaje para "no existe" y "contraseña incorrecta":
    // así no se puede averiguar qué emails están registrados.
    if (!admin) {
      console.warn(`🔓 Intento de acceso con email desconocido: ${email}`);
      return responderError(401, "Email o contraseña incorrectos");
    }

    if (!verificarPassword(password, admin.sal, admin.passwordHash)) {
      console.warn(`🔒 Contraseña incorrecta para ${email}`);
      return responderError(401, "Email o contraseña incorrectos");
    }

    await admins.updateOne(
      { _id: email },
      { $set: { ultimoAcceso: new Date() } }
    );

    const token = crearToken(email);
    console.log(`✅ Acceso concedido a ${email}`);

    return new Response(JSON.stringify({ ok: true, token, email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return responderError(500, error.message);
  }
};
import crypto from "node:crypto";

/**
 * Tokens de sesión del panel de administración.
 *
 * Se firma un token con HMAC-SHA256 usando ADMIN_TOKEN_SECRET.
 * Lleva la hora de emisión y caduca a las 8 horas, así que sirve
 * para iniciar sesión y para autorizar el guardado de habilidades.
 *
 * No usa ninguna librería externa: solo el módulo `crypto` de Node.
 */

const DURACION_MS = 8 * 60 * 60 * 1000; // 8 horas

const enBase64url = (buffer) =>
  buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const deBase64url = (texto) =>
  Buffer.from(
    texto.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");

const firmar = (datos, secreto) =>
  enBase64url(crypto.createHmac("sha256", secreto).update(datos).digest());

/** Crea un token de sesión */
export const crearToken = (email) => {
  const secreto = process.env.ADMIN_TOKEN_SECRET;

  if (!secreto) {
    throw new Error(
      "Falta ADMIN_TOKEN_SECRET en las variables de entorno del servidor"
    );
  }

  const payload = enBase64url(
    Buffer.from(
      JSON.stringify({
        email,
        exp: Date.now() + DURACION_MS,
      })
    )
  );

  return `${payload}.${firmar(payload, secreto)}`;
};

/** Devuelve los datos del token si es válido, o null */
export const leerToken = (token) => {
  const secreto = process.env.ADMIN_TOKEN_SECRET;
  if (!secreto || !token || typeof token !== "string") return null;

  const [payload, firma] = token.split(".");
  if (!payload || !firma) return null;

  const esperada = firmar(payload, secreto);
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);

  // La firma no coincide: el token fue alterado
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const datos = JSON.parse(deBase64url(payload));
    if (typeof datos.exp !== "number" || Date.now() >= datos.exp) return null;
    return datos;
  } catch {
    return null;
  }
};

/** true si el token es válido y no ha caducado */
export const tokenValido = (token) => leerToken(token) !== null;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
};

export const responderError = (status, mensaje) =>
  new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
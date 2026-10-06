import crypto from "node:crypto";

/**
 * Manejo de contraseñas y códigos de recuperación.
 *
 * Las contraseñas NO se guardan en texto plano ni en variables de
 * entorno: se guardan hasheadas con scrypt (incluye una sal
 * aleatoria por contraseña) en MongoDB.
 *
 * Todo se hace con el módulo `crypto` de Node, sin librerías externas.
 */

const LARGO = 64;

/** Genera sal + hash para guardar en la base de datos */
export const hashearPassword = (password) => {
  const sal = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), sal, LARGO).toString("hex");
  return { sal, hash };
};

/** Comprueba la contraseña en tiempo constante (no filtra información) */
export const verificarPassword = (password, sal, hash) => {
  try {
    const calculado = crypto.scryptSync(String(password), String(sal), LARGO);
    const guardado = Buffer.from(String(hash), "hex");
    if (calculado.length !== guardado.length) return false;
    return crypto.timingSafeEqual(calculado, guardado);
  } catch {
    return false;
  }
};

/* ------------------------------------------------------------------
   Códigos de recuperación de contraseña
   ------------------------------------------------------------------ */

const DURACION_CODIGO_MS = 15 * 60 * 1000; // 15 minutos

/** Código numérico de 6 dígitos, fácil de dictar */
export const generarCodigo = () =>
  String(crypto.randomInt(100000, 1000000));

/** Prepara el registro del código: se guarda el hash, nunca el código */
export const prepararCodigo = (email) => {
  const codigo = generarCodigo();
  return {
    registro: {
      email: String(email).toLowerCase(),
      codigoHash: crypto.scryptSync(codigo, "recuperacion", 32).toString("hex"),
      expira: new Date(Date.now() + DURACION_CODIGO_MS),
      usado: false,
      creado: new Date(),
    },
    codigo,
  };
};

/** Valida un código contra el registro guardado */
export const verificarCodigo = (codigo, registro) => {
  if (!registro || registro.usado) return false;
  if (new Date(registro.expira).getTime() < Date.now()) return false;

  const calculado = crypto.scryptSync(
    String(codigo).trim(),
    "recuperacion",
    32
  );
  const guardado = Buffer.from(String(registro.codigoHash), "hex");

  if (calculado.length !== guardado.length) return false;
  return crypto.timingSafeEqual(calculado, guardado);
};

/* ------------------------------------------------------------------
   Validación de contraseñas
   ------------------------------------------------------------------ */

export const PASSWORD_MINIMO = 8;

/** Devuelve un mensaje de error, o null si la contraseña sirve */
export const problemaConPassword = (password) => {
  const valor = String(password ?? "");

  if (valor.length < PASSWORD_MINIMO) {
    return `La contraseña debe tener al menos ${PASSWORD_MINIMO} caracteres`;
  }
  if (!/[a-zA-Z]/.test(valor)) {
    return "La contraseña debe incluir al menos una letra";
  }
  if (!/[0-9]/.test(valor)) {
    return "La contraseña debe incluir al menos un número";
  }
  return null;
};

/** Normaliza un email para comparar siempre igual */
export const normalizarEmail = (email) => String(email ?? "").trim().toLowerCase();

/** Comprobación básica de formato de email */
export const emailValido = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizarEmail(email));
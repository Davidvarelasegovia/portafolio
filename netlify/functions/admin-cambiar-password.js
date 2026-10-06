import { visitasCollection } from "../lib/db.js";
import { corsHeaders, responderError } from "../lib/auth.js";
import {
  verificarCodigo,
  hashearPassword,
  normalizarEmail,
  problemaConPassword,
} from "../lib/passwords.js";

/**
 * POST /api/admin/cambiar-password
 * Cambia la contraseña del panel usando el código recibido por email.
 *
 * Body: { "email": "...", "codigo": "123456", "nuevoPassword": "..." }
 *
 * El código debe ser el último enviado, no estar usado y no haber caducado.
 */

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return responderError(405, "Método no permitido. Usa POST.");
  }

  let email;
  let codigo;
  let nuevoPassword;

  try {
    const body = await request.json().catch(() => ({}));
    email = normalizarEmail(body.email);
    codigo = String(body.codigo ?? "").trim();
    nuevoPassword = body.nuevoPassword;
  } catch {
    return responderError(400, "Datos no válidos");
  }

  if (!email || !codigo || !nuevoPassword) {
    return responderError(400, "Falta el email, el código o la contraseña nueva");
  }

  // Reglas de la contraseña nueva antes de tocar nada
  const problema = problemaConPassword(nuevoPassword);
  if (problema) return responderError(400, problema);

  try {
    const col = await visitasCollection();
    const admins = col.db.collection("administradores");
    const codigos = col.db.collection("codigos_recuperacion");

    const admin = await admins.findOne({ _id: email });
    if (!admin) {
      return responderError(401, "El código no es válido o ya venció");
    }

    // Busca el último código pendiente de ese email
    const registro = await codigos.findOne({ email, usado: false });

    if (!verificarCodigo(codigo, registro)) {
      console.warn(`🔒 Código inválido para ${email}`);
      return responderError(401, "El código no es válido o ya venció");
    }

    const { sal, hash } = hashearPassword(nuevoPassword);

    await admins.updateOne(
      { _id: email },
      {
        $set: {
          sal,
          passwordHash: hash,
          actualizado: new Date(),
          // Por seguridad, invalida cualquier sesión previa
          passwordCambradaEl: new Date(),
        },
      }
    );

    // El código no se puede reutilizar
    await codigos.updateOne(
      { _id: registro._id },
      { $set: { usado: true, usadoEl: new Date() } }
    );

    console.log(`🔑 Contraseña cambiada para ${email}`);

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: "Contraseña actualizada. Ya puedes entrar con la nueva.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error cambiando contraseña:", error);
    return responderError(500, error.message);
  }
};
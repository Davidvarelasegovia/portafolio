import nodemailer from "nodemailer";
import { corsHeaders, responderError } from "../lib/auth.js";
import {
  prepararCodigo,
  normalizarEmail,
  emailValido,
} from "../lib/passwords.js";

/**
 * POST /api/admin/recuperar
 * Envía por correo un código para cambiar la contraseña del panel.
 *
 * Body: { "email": "..." }
 *
 * El código dura 15 minutos y solo se puede usar una vez.
 * Nunca se guarda el código en texto plano: se guarda su hash.
 */

const codigoEnviado = (destino, codigo) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: `"Portafolio" <${process.env.EMAIL_USER}>`,
    to: destino,
    subject: `Código para cambiar tu contraseña: ${codigo}`,
    text: `Tu código es ${codigo}. Vence en 15 minutos. Si no lo pediste, ignora este correo.`,
    html: `
      <div style="font-family:Segoe UI,Roboto,Arial,sans-serif;background:#f3f0ff;padding:24px;">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
          <div style="background:linear-gradient(135deg,#3931e1,#5b52f0);padding:24px 28px;">
            <h1 style="margin:0;color:#fff;font-size:19px;">Cambiar contraseña</h1>
          </div>
          <div style="padding:28px;">
            <p style="color:#4a4b6d;font-size:15px;margin:0 0 18px;">
              Usa este código en el panel de habilidades para poner una contraseña nueva:
            </p>
            <div style="background:#f7f7fd;border:1px dashed #b8b8d8;border-radius:10px;padding:18px;text-align:center;">
              <span style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#3931e1;font-family:monospace;">
                ${codigo}
              </span>
            </div>
            <p style="color:#8a8aa3;font-size:13px;margin:20px 0 0;">
              Vence en 15 minutos y sirve una sola vez.
              Si no solicitaste este cambio, puedes ignorar este correo: tu contraseña actual sigue igual.
            </p>
          </div>
        </div>
      </div>`,
  });
};

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return responderError(405, "Método no permitido. Usa POST.");
  }

  let email;
  try {
    const body = await request.json().catch(() => ({}));
    email = normalizarEmail(body.email);
  } catch {
    return responderError(400, "Datos no válidos");
  }

  if (!email || !emailValido(email)) {
    return responderError(400, "Escribe un email válido");
  }

  // El mismo texto de respuesta exista o no el email: no revelamos
  // qué direcciones están registradas en el panel.
  const respuesta =
    "Si ese email es el administrador del panel, te enviamos un código.";

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return responderError(
        500,
        "El envío de correos no está configurado (faltan EMAIL_USER o EMAIL_PASS)"
      );
    }

    // Importación diferida para no cargar nodemailer si no hace falta
    const { visitasCollection } = await import("../lib/db.js");
    const col = await visitasCollection();
    const admins = col.db.collection("administradores");
    const codigos = col.db.collection("codigos_recuperacion");

    const admin = await admins.findOne({ _id: email });

    if (!admin) {
      console.warn(`📭 Código no enviado: ${email} no es administrador`);
      return new Response(JSON.stringify({ ok: true, mensaje: respuesta }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { registro, codigo } = prepararCodigo(email);

    // Invalida los códigos anteriores de ese email
    await codigos.updateMany(
      { email, usado: false },
      { $set: { usado: true } }
    );
    await codigos.insertOne(registro);

    await codigoEnviado(email, codigo);

    console.log(`📧 Código de recuperación enviado a ${email}`);

    return new Response(JSON.stringify({ ok: true, mensaje: respuesta }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error enviando código:", error);
    return responderError(500, error.message);
  }
};
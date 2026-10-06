import seed from "../data/habilidades";

const API_BASE = import.meta.env.VITE_API_URL || "";
const CLAVE_TOKEN = "admin-token";

/** Datos por defecto: lo que hay en el código. Se usan si la API falla. */
export const datosIniciales = {
  backend: seed.backend,
  frontend: seed.frontend,
  agentesIA: seed.agentesIA,
};

/**
 * Carga las habilidades desde el servidor.
 *
 * Cuando el backend está en el mismo dominio (lo normal), API_BASE va
 * vacío y las rutas relativas funcionan igual. Si la petición falla,
 * se usan los datos del código para que la página nunca quede vacía.
 */
export const cargarHabilidades = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/habilidades`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data.backend || !data.frontend) throw new Error("Respuesta incompleta");

    return { ...data, desdeServidor: true };
  } catch {
    // Sin servidor: seguimos con los datos del código
    return { ...datosIniciales, desdeServidor: false };
  }
};

export const guardarToken = (token) =>
  sessionStorage.setItem(CLAVE_TOKEN, token);

export const leerToken = () => sessionStorage.getItem(CLAVE_TOKEN);

export const borrarToken = () => sessionStorage.removeItem(CLAVE_TOKEN);

/** Verifica el email + contraseña contra el servidor y guarda el token */
export const iniciarSesion = async (email, password) => {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "No se pudo iniciar sesión");
  }

  guardarToken(data.token);
  return data;
};

/** Pide que le envíen un código por correo para cambiar la contraseña */
export const pedirCodigoRecuperacion = async (email) => {
  const res = await fetch(`${API_BASE}/api/admin/recuperar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "No se pudo enviar el código");
  }

  return data;
};

/** Cambia la contraseña usando el código recibido por correo */
export const cambiarPassword = async (email, codigo, nuevoPassword) => {
  const res = await fetch(`${API_BASE}/api/admin/cambiar-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, codigo, nuevoPassword }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "No se pudo cambiar la contraseña");
  }

  return data;
};

/** Envía todos los cambios al servidor */
export const guardarHabilidades = async (datos) => {
  const token = leerToken();

  if (!token) throw new Error("Sesión no iniciada");

  const res = await fetch(`${API_BASE}/api/admin/habilidades`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({
      backend: datos.backend,
      frontend: datos.frontend,
      agentesIA: datos.agentesIA,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    // Token caducado o inválido
    borrarToken();
    throw new Error("La sesión expiró. Vuelve a iniciar sesión.");
  }

  if (!res.ok) throw new Error(data.error || "No se pudo guardar");

  return data;
};
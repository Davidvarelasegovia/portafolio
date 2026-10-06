// Detecta el país/ciudad a partir de la IP.
// ipwho.io es gratis, soporta HTTPS y no pide API key.

const PRIVATE_IPS = [
  "127.0.0.1",
  "::1",
  "localhost",
  "0.0.0.0",
  "::",
];

export const esIpPrivada = (ip) => {
  if (!ip) return true;
  const limpia = String(ip).trim().toLowerCase();
  if (PRIVATE_IPS.includes(limpia)) return true;
  // IPv4 privadas y redes locales
  return (
    limpia.startsWith("10.") ||
    limpia.startsWith("192.168.") ||
    limpia.startsWith("172.16.") ||
    limpia.startsWith("172.17.") ||
    limpia.startsWith("172.18.") ||
    limpia.startsWith("172.19.") ||
    limpia.startsWith("172.2") ||
    limpia.startsWith("172.30.") ||
    limpia.startsWith("172.31.") ||
    limpia.startsWith("169.254.") ||
    limpia.startsWith("fc") ||
    limpia.startsWith("fd") ||
    limpia.startsWith("fe80")
  );
};

// Valida que la IP tenga forma correcta, para no gastar llamadas
// a la API de geolocalización con valores inútiles.
const esIpValida = (ip) => {
  const limpia = String(ip ?? "").trim();

  if (limpia.includes(".")) {
    const partes = limpia.split(".");
    return partes.length === 4 && partes.every((o) => /^\d{1,3}$/.test(o) && Number(o) <= 255);
  }

  if (limpia.includes(":")) {
    return /^[0-9a-f:]+$/i.test(limpia) && limpia.split(":").length >= 3;
  }

  return false;
};

const desconocida = () => ({
  ciudad: "No disponible",
  region: "",
  pais: "No disponible",
  latitud: null,
  longitud: null,
  zonaHoraria: "",
});

export const obtenerIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // Puede venir una cadena: "ip1, ip2, ip3" -> nos quedamos con la primera
    return forwarded.split(",")[0].trim();
  }
  return (
    req.headers["x-real-ip"] ||
    req.headers["cf-connecting-ip"] ||
    req.socket?.remoteAddress ||
    "desconocida"
  );
};

export const geolocalizar = async (ip) => {
  if (esIpPrivada(ip) || !esIpValida(ip)) {
    return esIpPrivada(ip)
      ? {
          ciudad: "Local / Privada",
          region: "",
          pais: "Red local",
          latitud: null,
          longitud: null,
          zonaHoraria: "",
        }
      : desconocida();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://ipwho.is/${ip}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`ipwho.is respondió ${res.status}`);

    const data = await res.json();

    if (data.success === false) {
      return desconocida();
    }

    return {
      ciudad: data.city || "Desconocida",
      region: data.region || "",
      pais: data.country || "Desconocido",
      latitud: data.latitude ?? null,
      longitud: data.longitude ?? null,
      zonaHoraria: data.timezone?.id || "",
    };
  } catch (error) {
    console.warn("⚠️ Geolocalización falló:", error.message);
    return desconocida();
  }
};

/**
 * Saca navegador, sistema y tipo de dispositivo del user-agent.
 * Es una aproximación: si algún día necesitas precisión, usa ua-parser-js.
 */
export const parseUserAgent = (ua = "") => {
  const esMovil = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  const esTablet = /iPad|Tablet|PlayBook|Silk/i.test(ua);

  let navegador = "Desconocido";
  if (/Edg\//i.test(ua)) navegador = "Edge";
  else if (/OPR\//i.test(ua)) navegador = "Opera";
  else if (/Firefox\//i.test(ua)) navegador = "Firefox";
  else if (/Chrome\//i.test(ua)) navegador = "Chrome";
  else if (/Safari\//i.test(ua)) navegador = "Safari";

  let sistema = "Desconocido";
  if (/Windows NT 10/i.test(ua)) sistema = "Windows 10/11";
  else if (/Windows/i.test(ua)) sistema = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) sistema = "iOS";
  else if (/Android/i.test(ua)) sistema = "Android";
  else if (/Mac OS X/i.test(ua)) sistema = "macOS";
  else if (/Linux/i.test(ua)) sistema = "Linux";

  let dispositivo = "Escritorio";
  if (esMovil && !esTablet) dispositivo = "Móvil";
  else if (esTablet) dispositivo = "Tablet";

  return { navegador, sistema, dispositivo };
};
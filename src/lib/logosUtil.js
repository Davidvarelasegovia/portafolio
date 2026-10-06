/**
 * Utilidades de logos, fuera de los componentes para que
 * React Fast Refresh no se queje al importar desde ellos.
 */

/** Quita el prefijo de Font Awesome: "fa-solid fa-x" -> "x" */
export const limpiarNombreLogo = (valor) =>
  String(valor ?? "")
    .trim()
    .replace(/^fa-(brands|solid)\s+fa-/, "")
    .replace(/^fa-/, "");

/**
 * Iniciales como último recurso cuando no hay logo ni sigla:
 * "Tailwind CSS" -> "TC", "MySQL" -> "MY"
 */
export const iniciales = (nombre) => {
  const limpio = String(nombre || "").trim();
  if (!limpio) return "??";

  const partes = limpio.split(/\s+/);
  if (partes.length > 1) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return limpio.slice(0, 2).toUpperCase();
};
/**
 * Funciones para medir contraste de colores.
 *
 * Sirve para comprobar que un texto o icono se vea sobre un fondo.
 * Usa la formula de la WCAG: la relacion entre la luminancia del
 * color mas claro y el mas oscuro debe ser al menos 4.5:1 para texto
 * normal y 3:1 para elementos graficos (iconos, bordes).
 */

/** Convierte "rgb(24, 24, 24)" en {r,g,b} */
export const parse = (color) => {
  if (!color) return null;

  const numeros = color.match(/\d+(\.\d+)?/g);
  if (!numeros || numeros.length < 3) return null;

  return {
    r: Number(numeros[0]),
    g: Number(numeros[1]),
    b: Number(numeros[2]),
  };
};

/** Aplica la curva gamma que usa WCAG a un canal de 0 a 255 */
const gamma = (canal) => {
  const c = canal / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/** Luminancia relativa de un color, de 0 (negro) a 1 (blanco) */
export const luminancia = ({ r, g, b }) =>
  0.2126 * gamma(r) + 0.7152 * gamma(g) + 0.0722 * gamma(b);

/**
 * Relacion de contraste entre dos colores.
 * Devuelve un numero entre 1 (iguales) y 21 (negro sobre blanco).
 */
export const contraste = (colorA, colorB) => {
  const la = luminancia(colorA);
  const lb = luminancia(colorB);

  const claro = Math.max(la, lb);
  const oscuro = Math.min(la, lb);

  return (claro + 0.05) / (oscuro + 0.05);
};

/** Indica si un color se ve bien sobre otro (3:1 para iconos) */
export const seLee = (color, fondo, minimo = 3) =>
  contraste(color, fondo) >= minimo;

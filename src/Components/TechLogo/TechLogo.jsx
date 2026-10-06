import logos from "../../assets/logos";
import { iniciales } from "../../lib/logosUtil";

/**
 * Dibuja el logo oficial de una tecnología como SVG inline.
 *
 * Usa `fill="currentColor"`, así que el logo toma el color del CSS
 * y se comporta igual que los iconos de las redes sociales del
 * footer (colorea en reposo, se pone blanco y brilla al hacer hover).
 *
 * Cadena de respaldo (para que el círculo nunca quede vacío):
 *   1. Logo oficial descargado
 *   2. Icono de Font Awesome (`fallbackIcono`)
 *   3. Sigla explícita (`sigla`)
 *   4. Iniciales calculadas del nombre
 *
 * `grande` sirve para los logos que son un texto o un contorno
 * (Express, Django...): a tamaño normal sus trazos finos se
 * pierden dentro del círculo, así que se dibujan más grandes.
 */
const TechLogo = ({ logo, fallbackIcono, sigla, nombre, grande }) => {
  const datos = logo ? logos[logo] : null;

  if (datos) {
    return (
      <svg
        className={grande ? "tech-logo tech-logo--grande" : "tech-logo"}
        viewBox={datos.viewBox}
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        {datos.paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  }

  if (fallbackIcono) {
    return <i className={fallbackIcono}></i>;
  }

  return <span className="tech-logo__sigla">{sigla || iniciales(nombre)}</span>;
};

export default TechLogo;
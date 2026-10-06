import "./SkillBar.css";
import { NIVELES, nivelDesdePorcentaje } from "../../data/habilidades";
import TechLogo from "../TechLogo/TechLogo";

/**
 * Barra de estado de una habilidad o herramienta.
 * Muestra el logo oficial, el nombre, el porcentaje,
 * la barra de progreso y la etiqueta de nivel.
 */
const SkillBar = ({ habilidad }) => {
  const {
    nombre, logo, iconoFa, sigla, color, colorIcono, porcentaje, nota, desc, grande,
  } = habilidad;
  const nivel = nivelDesdePorcentaje(porcentaje);
  const nivelInfo = NIVELES[nivel];

  return (
    <div className="skill" role="listitem">
      <span
        className="skill__logo icono-marca"
        style={{ "--color-marca": color, "--color-icono": colorIcono || color }}
      >
        <TechLogo
          logo={logo}
          fallbackIcono={iconoFa}
          sigla={sigla}
          nombre={nombre}
          grande={grande}
        />
      </span>

      <div className="skill__info">
        <div className="skill__fila">
          <div className="skill__titulo">
            <span className="skill__nombre">
              {nombre}
              {nota && <em className="skill__nota">{nota}</em>}
            </span>
            {desc && <em className="skill__desc">{desc}</em>}
          </div>

          <span
            className="skill__nivel"
            style={{ "--color-nivel": nivelInfo.color }}
          >
            {nivelInfo.etiqueta}
          </span>
        </div>

        <div
          className="skill__barra"
          role="progressbar"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${nombre}: ${porcentaje}%`}
        >
          <span
            className={`skill__progreso skill__progreso--${nivel}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        <span className="skill__porcentaje">{porcentaje}%</span>
      </div>
    </div>
  );
};

export default SkillBar;
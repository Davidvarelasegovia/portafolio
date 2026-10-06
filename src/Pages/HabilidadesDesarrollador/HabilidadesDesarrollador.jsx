import { useEffect, useState } from "react";
import "./HabilidadesDesarrollador.css";
import SkillBar from "../../Components/SkillBar/SkillBar";
import { NIVELES, datosIniciales } from "../../data/habilidades";
import { cargarHabilidades } from "../../lib/habilidadesApi";

/**
 * Página "Progreso Desarrollador".
 * Sigue la estructura de la infografía: dos columnas,
 * Back End y Front End, cada una con sus grupos de tecnologías.
 * Abajo, los agentes de IA en una sección a lo ancho.
 *
 * Los datos vienen del servidor (editables desde /admin) y, si no
 * hay servidor disponible, se usan los del código como respaldo.
 */
const Columna = ({ datos, gruposEnGrid }) => {
  return (
    <section className="col">
      <header className="col__cabecera">
        <span className="col__icono">
          <i className={datos.icono}></i>
        </span>
        <div>
          <h2>{datos.titulo}</h2>
          <p>{datos.subtitulo}</p>
        </div>
      </header>

      <div className={gruposEnGrid ? "col__grupos col__grupos--grid" : "col__grupos"}>
        {datos.grupos.map((grupo) => (
          <article className="grupo" key={grupo.titulo}>
            <div className="grupo__titulo">
              <i className={grupo.icono}></i>
              <div>
                <h3>{grupo.titulo}</h3>
                <p>{grupo.descripcion}</p>
              </div>
            </div>

            <div className="grupo__skills" role="list">
              {grupo.habilidades.map((habilidad) => (
                <SkillBar key={habilidad.nombre} habilidad={habilidad} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const HabilidadesDesarrollador = () => {
  const [datos, setDatos] = useState(datosIniciales);

  useEffect(() => {
    let cancelado = false;
    cargarHabilidades().then((r) => {
      if (!cancelado) setDatos(r);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  // Si los datos del servidor vienen sin alguna sección, se completa
  // con los del código para que la página nunca se rompa.
  const backend = datos.backend || datosIniciales.backend;
  const frontend = datos.frontend || datosIniciales.frontend;
  const agentesIA = datos.agentesIA || datosIniciales.agentesIA;

  return (
    <div className="habilidades">
      {/* Encabezado */}
      <header className="hab__cabecera">
        <h1>
          Progreso
          <span>Desarrollador</span>
        </h1>
        <p className="hab__lema">Build · Learn · Create · Grow</p>
      </header>

      {/* Leyenda de niveles */}
      <div className="leyenda">
        <span className="leyenda__titulo">Niveles</span>
        {Object.entries(NIVELES).map(([clave, info]) => (
          <span key={clave} className={`leyenda__item leyenda__item--${clave}`}>
            {info.etiqueta}
          </span>
        ))}
      </div>

      {/* Las dos columnas de la infografía */}
      <div className="hab__columnas">
        <Columna datos={backend} />
        <Columna datos={frontend} />
      </div>

      {/* Agentes de IA, a lo ancho y debajo de las columnas */}
      <div className="hab__agentes">
        <Columna datos={agentesIA} gruposEnGrid />
      </div>
    </div>
  );
};

export default HabilidadesDesarrollador;
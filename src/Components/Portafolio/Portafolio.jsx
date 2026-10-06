import "./Portafolio.css"
import controlAcceso from "../../assets/controlAcceso.webp"
import tiendaVideojuegos from "../../assets/tiendaVideojuegos.webp"
import contadorRaciones from "../../assets/contadorRaciones.webp"
import portafolioPropio from "../../assets/portafolio.webp"
import carrito from "../../assets/carrito.webp"
import propinas from "../../assets/propinas.webp"

/*
  PROYECTOS DEL PORTAFOLIO

  Para agregar uno nuevo copia un bloque y cambia los datos.

  - demolink : sitio publicado. OMITELO si el proyecto no se puede
               publicar (por ejemplo, si usa una base de datos en un
               archivo local, porque los hostings gratuitos no
               permiten escribir en disco).
  - codigo   : repositorio PUBLICO en GitHub. OMITELO si el repo es
               privado, porque el visitante veria un error.

  Con cualquiera de los dos campos, la tarjeta sigue viéndose bien:
  solo muestra los botones que corresponden.
*/

const portfolioItems = [
  {
    id: 1,
    image: controlAcceso,
    title: "Control de Acceso",
    description:
      "ReactJS, NodeJS, TailwindCss y SQLite. Funciona sin internet.",
    codigo: "https://github.com/Davidvarelasegovia/control-acceso",
  },

  {
    id: 2,
    image: tiendaVideojuegos,
    title: "Tienda de Videojuegos",
    description: "Desarrollo con ReactJS, NodeJS, TailwindCss",
    demolink: "https://gamesdevvar-2026.netlify.app",
  },

  {
    id: 3,
    image: contadorRaciones,
    title: "Contador de Raciones",
    description: "Desarrollo con ReactJS, NodeJS, TailwindCss",
    demolink: "https://contadorderaciones.netlify.app",
    /*
      Este repositorio es PRIVADO, por eso no lleva `codigo`.
      Si lo haces publico en GitHub, agrega esta linea y el boton
      "Ver codigo" aparecesolo:
      codigo: "https://github.com/Davidvarelasegovia/contador-de-raciones",
    */
  },

  {
    id: 4,
    image: portafolioPropio,
    title: "Portafolio",
    description: "Desarrollo con ReactJS, NodeJS, TailwindCss",
    demolink: "https://david-varela-portafolio.netlify.app",
    codigo: "https://github.com/Davidvarelasegovia/portafolio",
  },

  {
    id: 5,
    image: carrito,
    title: "Carrito de Compras",
    description: "Desarrollo con ReactJS, NodeJS, TailwindCss",
    demolink: "https://carrodecompras-react-david-varela.netlify.app/",
  },

  {
    id: 6,
    image: propinas,
    title: "Calculadora de Propinas",
    description:
      "Desarrollo con ReactJS, TypeScript, JavaScript, TailwindCss, NodeJS",
    demolink: "https://propinacarritodavidvarela.netlify.app/",
  },
]

const Portafolio = () => {
  return (
    <div className="portafolio" id="portafolio">
      <h1>Portafolio</h1>

      <div className="portafolio-container">
        {portfolioItems.map((item) => (
          <div className="portafolio-card" key={item.id}>
            <img src={item.image} alt={item.title} className="portafolio-image" />

            <div className="portafolio-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>

              <div className="portafolio-botones">
                {/*
                  Cada boton aparece solo si el proyecto tiene ese
                  enlace. Asi una tarjeta nunca muestra un enlace
                  que le de error a quien la visita.
                */}
                {item.demolink && (
                  <a
                    href={item.demolink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-button"
                  >
                    Ver demo Proyecto
                  </a>
                )}

                {item.codigo && (
                  <a
                    href={item.codigo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="codigo-button"
                  >
                    <i className="fa-brands fa-github"></i>
                    Ver código
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Portafolio

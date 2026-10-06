import "./Portafolio.css"
import carrito from "../../assets/carrito.webp"
import hotel from "../../assets/hotel.webp"
import propinas from "../../assets/propinas.webp"
import shop from "../../assets/shop.webp"
import tiendaVideojuegos from "../../assets/tiendaVideojuegos.webp"
import contadorRaciones from "../../assets/contadorRaciones.webp"
import portafolioPropio from "../../assets/portafolio.webp"

const portfolioItems = [
    {
        id:1,
        image: tiendaVideojuegos,
        title: "Tienda de Videojuegos",
        description: "Desarrollo con ReactJS, NodeJS, TailwindCss",
        demolink: "https://gamesdevvar-2026.netlify.app"
    },

    {
        id:2,
        image: contadorRaciones,
        title: "Contador de Raciones",
        description: "Desarrollo con ReactJS, NodeJS, TailwindCss",
        demolink: "https://contadorderaciones.netlify.app"
    },

    {
        id:3,
        image: portafolioPropio,
        title: "Portafolio",
        description: "Desarrollo con ReactJS, NodeJS, TailwindCss",
        demolink: "https://david-varela-portafolio.netlify.app"
    },

    {
        id:4,
        image: carrito,
        title: "Carrito de Compras",
        description: "Desarrollo con ReactJS, NodeJS, TailwindCss",
        demolink: "https://carrodecompras-react-david-varela.netlify.app/"
    },

    {
        id:5,
        image: propinas,
        title: "Calculadora de Propinas",
        description: "Desarrollo con ReactJS, TypeScript, JavaScript, TailwindCss, NodeJS",
        demolink: "https://propinacarritodavidvarela.netlify.app/"
    },

    {
        id:6,
        image: hotel,
        title: "Reserva de Hotel",
        description: "Desarrollo con ReactJS, TailwindCss, NodeJS",
        demolink: "https://hoteles-coral.vercel.app/"
    },

    {
        id:7,
        image: shop,
        title: "Tech Shop",
        description: "Desarrollo con ReactJS, TailwindCss, NodeJS",
        demolink: "https://tecnologia-seven.vercel.app/"
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
                 <a href={item.demolink}target="_blank" rel="noopener noreferrer" className="demo-button">
                    Ver demo Proyecto
                 </a>
                 
                </div>
          </div>
        ))}
       </div>
    </div>
  )
}

export default Portafolio
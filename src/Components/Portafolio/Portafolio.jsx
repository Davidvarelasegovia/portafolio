import "./Portafolio.css"
import carrito from "../../assets/carrito.webp"
import hotel from "../../assets/hotel.webp"
import propinas from "../../assets/propinas.webp"
import shop from "../../assets/shop.webp"

const portfolioItems = [
    {
        id:1,
        image: carrito,
        title: "Carrito de Compras",
        description: "Desarrollo con ReactJS, TailwindCss, NodeJS",
        demolink: "https://carrodecompras-react-david-varela.netlify.app/"
    },

    {
        id:2,
        image: propinas,
        title: "Calculadora de Propinas",
        description: "Desarrollo con ReactJS, TypeScript, JavaScript, TailwindCss, NodeJS",
        demolink: "https://propinacarritodavidvarela.netlify.app/"
    },

    {
        id:3,
        image: hotel,
        title: "Reserva de Hotel",
        description: "Desarrollo con ReactJS, TailwindCss, NodeJS",
        demolink: "https://hoteles-coral.vercel.app/"
    },

    {
        id:4,
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
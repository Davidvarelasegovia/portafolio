import "./Hero.css"
import foto from "../../assets/foto.webp"

const Hero = () => {
  return (
    <div className="hero" id="hero">
      <div className="text-container">
        
         
         <span>Hola Soy,</span>
         <h1>David Varela S.</h1>
         <p>Mi pasión por la programación me impulsa a crear soluciones digitales innovadoras y funcionales.
Me interesa transformar ideas y necesidades en proyectos tecnológicos útiles y eficientes.
Me caracterizo por mi capacidad de aprendizaje, creatividad y búsqueda constante de nuevas soluciones.
Disfruto enfrentar desafíos de programación y encontrar respuestas prácticas a cada problema.
Busco seguir desarrollando mis conocimientos y experiencia en nuevas tecnologías y herramientas.
Mi objetivo es crecer profesionalmente y aportar con compromiso, responsabilidad y dedicación en cada proyecto.</p>
         <a href="https://wa.me/56977477447"
         target="blank"
         className="btn"
         >Contactame</a>

      </div>

      <div className="image-container">
        {/* El círculo va dentro de este bloque para que tome el tamaño real
            de la foto, aunque esta crezca en pantallas grandes */}
        <div className="hero-foto">
          <div className="circle-bg"></div>
          <img src={foto} alt="foto" className="foto"/>
        </div>
      </div>
    </div>
  )
}

export default Hero
import "./About.css"
import foto from "../../assets/foto.webp"

const About = () => {
  return (
    <div className="about-details" id="about">
        {/* El círculo va dentro de este bloque para que siempre quede
            detrás de la foto, sin importar el tamaño de pantalla */}
        <div className="about-foto">
          <div className="circle-bg"></div>
          <img src={foto} alt="sobre mi" />
        </div>
        <div className="about-infos">
        <h1>Sobre mí</h1>
        <p className="description">
            Soy desarrollador web especializado en JavaScript, ReactJS y Node.js.
            Mi enfoque es crear souciones digitales innovadoras y funcionales,
            enfocadas en la experiencia del usuario y el rendimiento óptimo.
        </p>
             <div className="experience-section">
                 <div className="experience">
                    <i className=" fas fa-plus"></i>
                    <span>2</span>
                    <p>Años de experiencia</p>
                 </div>
            </div>
            <div className="experience-section">
                 <div className="experience">
                    <i className=" fas fa-plus"></i>
                    <span>5</span>
                    <p>Trabajos Profesionles</p>
                 </div>
            </div>
            <div className="experience-section">
                 <div className="experience">
                    <i className=" fas fa-plus"></i>
                    <span>20</span>
                    <p>Proyectos Realizados</p>
                 </div>
            </div>
        </div>
    </div>
  )
}

export default About
import "./Navbar.css"
import logo_light from "../../assets/logo_light.webp"
import ThemeToggle from "../ThemeToggle/ThemeToggle"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

const Navbar = () => {
   const [menuOpen, setMenuOpen] = useState(false)
   const location = useLocation()
   const navigate = useNavigate()

   // Marca el link activo cuando estás en la página de habilidades
   const enHabilidades = location.pathname === "/habilidades-desarrollador"

   // Si no estás en el home, primero vuelve y después hace el scroll
   const handleScoll = (e, sectionId) => {
     e.preventDefault();
     setMenuOpen(false)

     const desplazar = () => {
       document.getElementById(sectionId)
         ?.scrollIntoView({ behavior: "smooth", block: "start" })
     }

     if (location.pathname !== "/") {
       navigate("/")
       setTimeout(desplazar, 120)
     } else {
       desplazar()
     }
   }

  return (
     <nav>
        <img src={logo_light} alt="logo" className="logo" />
        <ul className={menuOpen ? "active" : ""}>
                <li>
                  <Link to="/" onClick={()=> setMenuOpen(false)}>Home</Link>
                </li>
                <li><a href="#about" onClick={(e)=> handleScoll(e, "about")}>Sobre mi</a></li>
                <li><a href="#skills" onClick={(e)=> handleScoll(e, "skills")}>Habilidades</a></li>
                <li><a href="#portafolio" onClick={(e)=> handleScoll(e, "portafolio")}>Portafolio</a></li>
                <li><a href="#contact" onClick={(e)=> handleScoll(e, "contact")}>Contacto</a></li>
                <li>
                  <Link
                    to="/habilidades-desarrollador"
                    onClick={()=> setMenuOpen(false)}
                    className={enHabilidades ? "activo" : ""}
                  >
                    Habilidades Desarrollador
                  </Link>
                </li>
                <i className="fa-solid fa-xmark"
                   onClick={()=> setMenuOpen(false)}
                ></i>
        </ul>
        <div className="nav-actions">
          {/* Botón discreto de configuración: lleva al panel de habilidades */}
          <Link
            to="/admin"
            className="nav-config"
            title="Configuración"
            aria-label="Configuración"
          >
            <i className="fa-solid fa-gear"></i>
          </Link>
          <ThemeToggle />
          <i className="fa-solid fa-bars"
             onClick={()=> setMenuOpen(true)}
             ></i>
        </div>
     </nav>
  )
}

export default Navbar
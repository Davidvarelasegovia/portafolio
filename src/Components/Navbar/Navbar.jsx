import "./Navbar.css"
import logoLight from "../../assets/logo_light.webp"
import logoOscuro from "../../assets/logo_oscuro.webp"
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
        {/*
          Dos versiones del logo. El original tiene "DAVID" en azul claro
          y "VARELA S." en azul marino casi negro, que sobre el fondo
          oscuro del navbar no se lee. La version oscura trae esas
          letras en blanco. Se muestran una u otra segun el tema.
        */}
        <img src={logoLight} alt="David Varela" className="nav-logo nav-logo--light" />
        <img src={logoOscuro} alt="David Varela" className="nav-logo nav-logo--dark" />
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
                    Progreso Desarrollador
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

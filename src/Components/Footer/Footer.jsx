import "./Footer.css"
import VisitCounter from "../VisitCounter/VisitCounter"

/*
  ⚙️  CONFIGURACIÓN DE REDES SOCIALES
  ------------------------------------------------------------------
  Para cambiar un enlace, edita solo el campo `url` de esa red.
  - `icon`  : clase de Font Awesome 7 (icono oficial de la red)
  - `color` : color oficial de la marca (se usa en el hover)
  - `url`   : enlace de tu perfil
*/
const socialLinks = [
  {
    name: "Facebook",
    icon: "fa-brands fa-facebook-f",
    color: "#1877F2",
    url: "https://www.facebook.com/share/1LgcZF4vAv/",
  },
  {
    name: "Instagram",
    icon: "fa-brands fa-instagram",
    color: "#E4405F",
    url: "https://www.instagram.com/davidvareladavid/",
  },
  {
    name: "LinkedIn",
    icon: "fa-brands fa-linkedin-in",
    color: "#0A66C2",
    url: "https://www.linkedin.com/in/david-varela-573632162",
  },
  {
    name: "WhatsApp",
    icon: "fa-brands fa-whatsapp",
    color: "#25D366",
    url: "https://wa.me/56977477447",
  },
  {
    /*
      GitHub no es una red social como las otras, pero va acá para que
      el código de los proyectos esté a un clic.

      GitHub tiene dos colores oficiales según el fondo: #181717 para
      fondo claro y #e6edf3 para fondo oscuro. Como el footer siempre
      es oscuro, se usa el segundo, que además es el que GitHub usa en
      su propio modo oscuro. Con #181717 el ícono se perdía.
    */
    name: "GitHub",
    icon: "fa-brands fa-github",
    color: "#e6edf3",
    colorHover: "#0d1117",
    url: "https://github.com/Davidvarelasegovia",
  },
]

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <hr />

      <ul className="social-icons">
        {socialLinks.map((link) => (
          <li key={link.name}>
            <a
              href={link.url}
              className="social-icon icono-marca"
              style={{
                "--color-marca": link.color,
                /* Solo GitHub lo necesita: su icono se pone oscuro
                   cuando el circulo se llena de blanco. */
                "--color-icono-hover": link.colorHover ?? undefined,
              }}
              target="_blank"
              rel="noopener noreferrer"
              title={link.name}
              aria-label={link.name}
            >
              <i className={link.icon}></i>
            </a>
          </li>
        ))}
      </ul>

      <p>Copyright {currentYear} © David Varela · Todos los derechos reservados</p>

      <VisitCounter />
    </footer>
  )
}

export default Footer
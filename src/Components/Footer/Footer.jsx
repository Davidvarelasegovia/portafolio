import "./Footer.css"
import VisitCounter from "../VisitCounter/VisitCounter"

/*
  ⚙️  CONFIGURACIÓN DE REDES SOCIALES
  ------------------------------------------------------------------
  Solo tienes que editar el campo `url` de cada objeto con tu URL real.
  - `icon`  : clase de Font Awesome 7 (icono oficial de la red)
  - `color` : color oficial de la marca (se usa en el hover)
  - `url`   : 👈 PON AQUÍ TU ENLACE
*/
const socialLinks = [
  {
    name: "Facebook",
    icon: "fa-brands fa-facebook-f",
    color: "#1877F2",
    url: "https://www.facebook.com/CAMBIAR_ESTE_USUARIO",
  },
  {
    name: "Instagram",
    icon: "fa-brands fa-instagram",
    color: "#E4405F",
    url: "https://www.instagram.com/CAMBIAR_ESTE_USUARIO",
  },
  {
    name: "LinkedIn",
    icon: "fa-brands fa-linkedin-in",
    color: "#0A66C2",
    url: "https://www.linkedin.com/in/CAMBIAR_ESTE_USUARIO/",
  },
  {
    name: "WhatsApp",
    icon: "fa-brands fa-whatsapp",
    color: "#25D366",
    url: "https://wa.me/56977477447",
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
              style={{ "--color-marca": link.color }}
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
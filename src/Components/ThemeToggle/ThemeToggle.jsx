import { useContext } from 'react'
import { ThemeContext } from '../../ThemeContext/temaContexto'
import "./ThemeToggle.css"

const ThemeToggle = () => {

    const {theme, toggleTheme} = useContext(ThemeContext)
return (
<button
 className="theme-toggle-button"
 aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
 title={theme === "light" ? "Modo oscuro" : "Modo claro"}
 onClick={toggleTheme}
>
<i className={theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun"}></i>
</button>
)
}

export default ThemeToggle
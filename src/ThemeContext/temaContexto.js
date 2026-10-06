import { createContext } from "react"

/**
 * Contexto del tema separado del componente Provider.
 *
 * React necesita que el "fast refresh" (recarga en caliente durante el
 * desarrollo) solo se aplique a archivos que exportan componentes. Por eso
 * el contexto vive aquí y el Provider en ThemeContext.jsx.
 */
export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
})

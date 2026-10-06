import { BrowserRouter as Router, Routes,Route } from "react-router-dom"
import Home from "./Home/Home"
import Navbar from "./Components/Navbar/Navbar"
import { ThemeProvider } from "./ThemeContext/ThemeContext"
import Footer from "./Components/Footer/Footer"
import HabilidadesDesarrollador from "./Pages/HabilidadesDesarrollador/HabilidadesDesarrollador"
import PanelAdmin from "./Pages/Admin/PanelAdmin"


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar/>
       <Routes>
        <Route path="/" element={ <Home/>}/>
        <Route path="/habilidades-desarrollador" element={ <HabilidadesDesarrollador/>}/>
        <Route path="/admin" element={ <PanelAdmin/>}/>
      </Routes>
      <Footer/>
      </Router>
    </ThemeProvider>
  )
}

export default App

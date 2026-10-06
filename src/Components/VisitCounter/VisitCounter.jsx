import { useEffect, useState } from "react";
import "./VisitCounter.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

const formatarNumero = (n) => new Intl.NumberFormat("es-CL").format(n);

/**
 * Contador de visitas.
 * - Envía la visita al backend (una vez por sesión de navegador).
 * - Muestra el total histórico de visitas.
 */
const VisitCounter = () => {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    let cancelado = false;

    // 1) Registra la visita (una sola vez por pestaña/sesión)
    const registrar = () => {
      const yaRegistrado = sessionStorage.getItem("visita-registrada");

      if (!yaRegistrado && API_BASE) {
        // Marca antes de enviar para no duplicar en recargas rápidas
        sessionStorage.setItem("visita-registrada", "1");

        fetch(`${API_BASE}/api/visita`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pagina: window.location.pathname }),
        }).catch(() => {
          // Si falla, permitir reintento en la próxima carga
          sessionStorage.removeItem("visita-registrada");
        });
      }
    };

    registrar();

    // 2) Obtiene el total
    // Ojo: API_BASE puede estar vacío cuando el backend está en el
    // mismo dominio (lo normal). En ese caso las rutas relativas
    // funcionan igual, así que NO se debe salir temprano aquí.
    const obtenerTotal = () => {
      fetch(`${API_BASE}/api/contador`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelado && typeof data.total === "number") {
            setTotal(data.total);
          }
        })
        .catch(() => {
          /* si el contador falla, el footer sigue funcionando */
        });
    };

    obtenerTotal();

    // Refresca el total por si llegan visitas mientras la pestaña está abierta
    const intervalo = setInterval(obtenerTotal, 60000);

    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, []);

  return (
    <p className="visit-counter">
      <i className="fa-solid fa-eye"></i>
      {total === null ? (
        <span className="visit-counter--cargando">Visitas: —</span>
      ) : (
        <span>
          Visitas: <strong>{formatarNumero(total)}</strong>
        </span>
      )}
    </p>
  );
};

export default VisitCounter;
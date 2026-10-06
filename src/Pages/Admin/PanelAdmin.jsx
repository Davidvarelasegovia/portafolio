import { useEffect, useMemo, useState } from "react";
import "./PanelAdmin.css";
import {
  cargarHabilidades,
  iniciarSesion,
  guardarHabilidades,
  leerToken,
  borrarToken,
  pedirCodigoRecuperacion,
  cambiarPassword,
} from "../../lib/habilidadesApi";
import { NIVELES, nivelDesdePorcentaje } from "../../data/habilidades";
import { limpiarNombreLogo } from "../../lib/logosUtil";

/* ---------------------------------------------------------------
   Editar una habilidad: nombre, %, logo/color y eliminar
   --------------------------------------------------------------- */
const EditorHabilidad = ({ habilidad, onChange, onEliminar }) => {
  const nivel = nivelDesdePorcentaje(Number(habilidad.porcentaje) || 0);

  return (
    <div className="editor">
      {/* Fila 1: identidad */}
      <div className="editor__fila">
        <span className="editor__punto" data-nivel={nivel}></span>

        <input
          className="editor__nombre"
          value={habilidad.nombre}
          onChange={(e) => onChange({ ...habilidad, nombre: e.target.value })}
          placeholder="Nombre"
          aria-label="Nombre de la habilidad"
        />

        <input
          className="editor__logo"
          value={
            habilidad.logo || habilidad.sigla || limpiarNombreLogo(habilidad.iconoFa)
          }
          onChange={(e) => {
            const limpio = limpiarNombreLogo(e.target.value);
            // Si son 1-3 letras, es una sigla; si no, un logo de la biblioteca
            if (/^[A-Za-z]{1,3}$/.test(limpio)) {
              onChange({
                ...habilidad,
                sigla: limpio.toUpperCase(),
                logo: undefined,
                iconoFa: undefined,
              });
            } else {
              onChange({
                ...habilidad,
                logo: limpio.toLowerCase(),
                sigla: undefined,
                iconoFa: undefined,
              });
            }
          }}
          placeholder="logo"
          aria-label="Clave del logo o iniciales"
          title="Clave del logo (revisa src/assets/logos.js) o iniciales"
        />

        <input
          className="editor__color"
          type="color"
          value={habilidad.color || "#3931e1"}
          onChange={(e) => onChange({ ...habilidad, color: e.target.value })}
          aria-label="Color"
          title="Color de la marca"
        />

        <button
          className="editor__borrar"
          onClick={onEliminar}
          aria-label={`Eliminar ${habilidad.nombre}`}
          title="Eliminar"
          type="button"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>

      {/* Fila 2: porcentaje y nivel */}
      <div className="editor__fila editor__fila--pct">
        <input
          className="editor__pct"
          type="range"
          min="0"
          max="100"
          step="1"
          value={habilidad.porcentaje}
          onChange={(e) =>
            onChange({ ...habilidad, porcentaje: Number(e.target.value) })
          }
          aria-label={`Porcentaje de ${habilidad.nombre}`}
        />

        <span className="editor__valor">{habilidad.porcentaje}%</span>

        <span className="editor__nivel" data-nivel={nivel}>
          {NIVELES[nivel].etiqueta}
        </span>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------
   Un grupo de tecnologías
   --------------------------------------------------------------- */
const EditorGrupo = ({ grupo, onChange, onEliminarGrupo, onAgregar }) => (
  <article className="grupoAdmin">
    <header className="grupoAdmin__cab">
      <input
        className="grupoAdmin__titulo"
        value={grupo.titulo}
        onChange={(e) => onChange({ ...grupo, titulo: e.target.value })}
        aria-label="Título del grupo"
      />
      <button
        className="grupoAdmin__borrar"
        onClick={onEliminarGrupo}
        type="button"
        title="Eliminar grupo completo"
      >
        <i className="fa-solid fa-folder-minus"></i>
      </button>
    </header>

    {grupo.habilidades.map((habilidad, i) => (
      <EditorHabilidad
        key={`${grupo.titulo}-${i}`}
        habilidad={habilidad}
        onChange={(nueva) => {
          const copia = [...grupo.habilidades];
          copia[i] = nueva;
          onChange({ ...grupo, habilidades: copia });
        }}
        onEliminar={() =>
          onChange({
            ...grupo,
            habilidades: grupo.habilidades.filter((_, j) => j !== i),
          })
        }
      />
    ))}

    <button className="agregar" onClick={onAgregar} type="button">
      <i className="fa-solid fa-plus"></i> Agregar tecnología
    </button>
  </article>
);

/* ---------------------------------------------------------------
   Panel completo
   --------------------------------------------------------------- */
/* ---------------------------------------------------------------
   Pantalla de acceso: email + contraseña, con opción de recuperar
   la contraseña por correo.
   --------------------------------------------------------------- */
const Login = ({ onEntrar }) => {
  const [vista, setVista] = useState("login"); // login | recuperar | codigo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const limpiar = () => {
    setError("");
    setInfo("");
  };

  return (
    <div className="login">
      <form
        className="login__caja"
        onSubmit={async (e) => {
          e.preventDefault();
          limpiar();
          setEnviando(true);

          try {
            if (vista === "login") {
              await iniciarSesion(email, password);
              onEntrar();
              return;
            }

            if (vista === "recuperar") {
              const r = await pedirCodigoRecuperacion(email);
              setInfo(r.mensaje);
              setVista("codigo");
              return;
            }

            // vista === "codigo"
            const r = await cambiarPassword(email, codigo, nuevoPassword);
            setInfo(r.mensaje);
            setVista("login");
            setPassword("");
            setCodigo("");
            setNuevoPassword("");
          } catch (err) {
            setError(err.message);
          } finally {
            setEnviando(false);
          }
        }}
      >
        <span className="login__icono">
          <i
            className={
              vista === "login" ? "fa-solid fa-lock" : "fa-solid fa-envelope"
            }
          ></i>
        </span>

        <h1>
          {vista === "login"
            ? "Panel de habilidades"
            : vista === "recuperar"
              ? "Recuperar contraseña"
              : "Ingresa el código"}
        </h1>

        <p>
          {vista === "login"
            ? "Ingresa tu email y contraseña para editar tus habilidades."
            : vista === "recuperar"
              ? "Te enviamos un código por correo para poner una contraseña nueva."
              : `Escribe el código que llegó a ${email || "tu correo"}.`}
        </p>

        {vista === "codigo" && (
          <p className="login__email">
            <i className="fa-solid fa-envelope"></i> {email}
          </p>
        )}

        {vista !== "codigo" && (
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              limpiar();
            }}
            placeholder="tu@email.com"
            autoComplete="username"
            aria-label="Email"
          />
        )}

        {vista === "login" && (
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              limpiar();
            }}
            placeholder="Contraseña"
            autoComplete="current-password"
            aria-label="Contraseña"
          />
        )}

        {vista === "codigo" && (
          <>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value.replace(/\D/g, ""));
                limpiar();
              }}
              placeholder="000000"
              className="login__codigo"
              aria-label="Código de 6 dígitos"
            />
            <input
              type="password"
              value={nuevoPassword}
              onChange={(e) => {
                setNuevoPassword(e.target.value);
                limpiar();
              }}
              placeholder="Nueva contraseña"
              autoComplete="new-password"
              aria-label="Nueva contraseña"
            />
            <p className="login__pista">
              Mínimo 8 caracteres, con al menos una letra y un número.
            </p>
          </>
        )}

        {error && <p className="login__error">{error}</p>}
        {info && <p className="login__info">{info}</p>}

        <button type="submit" disabled={enviando}>
          {enviando
            ? "Un momento…"
            : vista === "login"
              ? "Entrar"
              : vista === "recuperar"
                ? "Enviar código"
                : "Guardar contraseña"}
        </button>

        <div className="login__pie">
          {vista === "login" ? (
            <button
              type="button"
              className="login__enlace"
              onClick={() => {
                setVista("recuperar");
                limpiar();
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          ) : (
            <button
              type="button"
              className="login__enlace"
              onClick={() => {
                setVista("login");
                limpiar();
              }}
            >
              Volver al acceso
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/* ---------------------------------------------------------------
   Panel completo
   --------------------------------------------------------------- */
const PanelAdmin = () => {
  const [autenticado, setAutenticado] = useState(!!leerToken());
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const [datos, setDatos] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");

  const [seccionActiva, setSeccionActiva] = useState("backend");

  useEffect(() => {
    cargarHabilidades().then((d) => {
      setDatos({
        backend: structuredClone(d.backend),
        frontend: structuredClone(d.frontend),
        agentesIA: structuredClone(d.agentesIA),
      });
      setCargando(false);
    });
  }, []);

  const secciones = useMemo(
    () =>
      [
        { clave: "backend", etiqueta: "Back End" },
        { clave: "frontend", etiqueta: "Front End" },
        { clave: "agentesIA", etiqueta: "Agentes de IA" },
      ].map((s) => ({
        ...s,
        datos: datos?.[s.clave],
      })),
    [datos]
  );

  const totalItems = useMemo(
    () =>
      datos
        ? Object.values(datos).reduce(
            (suma, s) => suma + s.grupos.reduce((n, g) => n + g.habilidades.length, 0),
            0
          )
        : 0,
    [datos]
  );

  /* ---------- Acciones ---------- */

  const actualizarGrupo = (seccionClave, indiceGrupo, nuevoGrupo) => {
    setDatos((prev) => {
      const sec = structuredClone(prev[seccionClave]);
      sec.grupos[indiceGrupo] = nuevoGrupo;
      return { ...prev, [seccionClave]: sec };
    });
    setAviso("");
  };

  const eliminarGrupo = (seccionClave, indice) => {
    if (!confirm("¿Eliminar este grupo y todas sus tecnologías?")) return;
    setDatos((prev) => {
      const sec = structuredClone(prev[seccionClave]);
      sec.grupos.splice(indice, 1);
      return { ...prev, [seccionClave]: sec };
    });
  };

  const agregarGrupo = (seccionClave) => {
    setDatos((prev) => {
      const sec = structuredClone(prev[seccionClave]);
      sec.grupos.push({
        titulo: "Nuevo grupo",
        descripcion: "Descripción del grupo",
        icono: "fa-solid fa-code",
        habilidades: [],
      });
      return { ...prev, [seccionClave]: sec };
    });
  };

  const agregarHabilidad = (seccionClave, indiceGrupo) => {
    setDatos((prev) => {
      const sec = structuredClone(prev[seccionClave]);
      sec.grupos[indiceGrupo].habilidades.push({
        nombre: "Nueva tecnología",
        sigla: "NT",
        color: "#3931e1",
        porcentaje: 50,
      });
      return { ...prev, [seccionClave]: sec };
    });
  };

  const guardar = async () => {
    setGuardando(true);
    setError("");
    setAviso("");
    try {
      const res = await guardarHabilidades(datos);
      setAviso(`Guardado. ${res.total} tecnologías en total.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = () => {
    borrarToken();
    setAutenticado(false);
  };

  /* ---------- Pantalla de acceso ---------- */

  if (!autenticado) {
    return <Login onEntrar={() => setAutenticado(true)} />;
  }

  /* ---------- Panel ---------- */

  if (cargando || !datos) {
    return <div className="login"><p className="login__caja">Cargando…</p></div>;
  }

  const seccion = secciones.find((s) => s.clave === seccionActiva);

  return (
    <div className="admin">
      <header className="admin__cab">
        <div>
          <h1>Panel de habilidades</h1>
          <p>{totalItems} tecnologías · cambios guardados en la base de datos</p>
        </div>
        <div className="admin__acciones">
          <button
            className="admin__guardar"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
          <button className="admin__salir" onClick={cerrarSesion}>
            Salir
          </button>
        </div>
      </header>

      {error && <p className="admin__msj admin__msj--error">{error}</p>}
      {aviso && <p className="admin__msj admin__msj--ok">{aviso}</p>}

      <nav className="admin__tabs">
        {secciones.map((s) => (
          <button
            key={s.clave}
            className={s.clave === seccionActiva ? "activa" : ""}
            onClick={() => setSeccionActiva(s.clave)}
          >
            {s.etiqueta}
          </button>
        ))}
      </nav>

      {seccion && (
        <section className="admin__cuerpo">
          {seccion.datos.grupos.map((grupo, i) => (
            <EditorGrupo
              key={i}
              grupo={grupo}
              onChange={(nuevo) => actualizarGrupo(seccion.clave, i, nuevo)}
              onEliminarGrupo={() => eliminarGrupo(seccion.clave, i)}
              onAgregar={() => agregarHabilidad(seccion.clave, i)}
            />
          ))}

          <button
            className="agregar agregar--grupo"
            onClick={() => agregarGrupo(seccion.clave)}
          >
            <i className="fa-solid fa-folder-plus"></i> Agregar grupo
          </button>
        </section>
      )}
    </div>
  );
};

export default PanelAdmin;
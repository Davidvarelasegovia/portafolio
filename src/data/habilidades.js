/**
 * ============================================================
 *  HABILIDADES DEL DESARROLLADOR — datos iniciales (semilla)
 * ============================================================
 *  Estos son los valores por defecto. Cuando publicas el sitio por
 *  primera vez se copian a MongoDB y a partir de ahí se editan
 *  desde el panel (/admin), SIN tocar este archivo.
 *
 *  Para cambiar o agregar una habilidad editando el código:
 *  - `logo`       : clave del logo oficial (ver src/assets/logos.js)
 *  - `iconoFa`    : para los que NO tienen logo descargado
 *  - `sigla`      : iniciales cuando no hay logo
 *  - `color`      : color oficial de la marca
 *  - `colorIcono` : opcional, si el logo necesita otro tono
 *  - `grande`     : opcional, para logos de texto o contorno finos
 *  - `porcentaje` : número entre 1 y 100
 *  El nivel (básico / medio / avanzado) se calcula del porcentaje.
 * ============================================================
 */

export const NIVELES = {
  basico: { etiqueta: "Básico", color: "#E07A5F" },
  medio: { etiqueta: "Medio", color: "#E9C46A" },
  avanzado: { etiqueta: "Avanzado", color: "#25D366" },
};

/** Clasifica automáticamente según el porcentaje */
export const nivelDesdePorcentaje = (porcentaje) => {
  if (porcentaje >= 71) return "avanzado";
  if (porcentaje >= 41) return "medio";
  return "basico";
};

export const backend = {
  titulo: "Back End",
  subtitulo: "Handles logic, data and APIs (runs on server)",
  icono: "fa-solid fa-server",
  grupos: [
    {
      titulo: "API Technologies",
      descripcion: "Used to create and consume APIs",
      icono: "fa-solid fa-code-branch",
      habilidades: [
        {
          nombre: "REST",
          iconoFa: "fa-solid fa-arrows-rotate",
          color: "#10B981",
          porcentaje: 85,
        },
        { nombre: "GraphQL", logo: "graphql", color: "#E10098", porcentaje: 55 },
      ],
    },
    {
      titulo: "Databases",
      descripcion: "Stores and manages data",
      icono: "fa-solid fa-database",
      habilidades: [
        { nombre: "MongoDB", logo: "mongodb", color: "#47A248", porcentaje: 62 },
        { nombre: "MySQL", logo: "mysql", color: "#00758F", porcentaje: 55 },
        { nombre: "PostgreSQL", logo: "postgresql", color: "#336791", porcentaje: 40 },
      ],
    },
    {
      titulo: "Programming Languages",
      descripcion: "Used to write server-side logic",
      icono: "fa-solid fa-code",
      habilidades: [
        {
          nombre: "JavaScript",
          logo: "javascript",
          color: "#F0B429",
          // El amarillo oficial se perdería sobre su propio fondo,
          // por eso el logo se dibuja en oscuro.
          colorIcono: "#1A1A1A",
          porcentaje: 90,
        },
        { nombre: "TypeScript", logo: "typescript", color: "#3178C6", porcentaje: 68 },
        { nombre: "Python", logo: "python", color: "#3776AB", porcentaje: 45 },
        { nombre: "PHP", logo: "php", color: "#5C6090", porcentaje: 35 },
        { nombre: "Java", logo: "java", color: "#E76F00", porcentaje: 30 },
      ],
    },
    {
      titulo: "Runtimes (for JavaScript)",
      descripcion: "Execute JavaScript code on the server",
      icono: "fa-solid fa-cubes",
      habilidades: [
        { nombre: "Node.js", logo: "nodejs", color: "#4E8B3A", porcentaje: 85 },
        { nombre: "Deno", logo: "deno", color: "#3C4A5A", porcentaje: 28 },
        { nombre: "Bun", logo: "bun", color: "#B8891F", porcentaje: 22 },
      ],
    },
    {
      titulo: "Popular Backend Frameworks",
      descripcion: "Help you build applications faster",
      icono: "fa-solid fa-layer-group",
      habilidades: [
        {
          nombre: "Express.js",
          logo: "express",
          color: "#2B2B2B",
          grande: true, // el logo es un contorno fino: necesita más tamaño
          porcentaje: 80,
        },
        {
          nombre: "Django",
          logo: "django",
          color: "#2E6B4F",
          grande: true, // también es un texto
          porcentaje: 32,
        },
        { nombre: "Laravel", logo: "laravel", color: "#E02B20", porcentaje: 25 },
        { nombre: "Spring Boot", logo: "springboot", color: "#5B9E35", porcentaje: 22 },
        { nombre: "Ruby on Rails", logo: "rails", color: "#C22E2E", porcentaje: 18 },
      ],
    },
  ],
};

export const agentesIA = {
  titulo: "Agentes de IA",
  subtitulo: "AI coding agents (CLI e IDEs)",
  icono: "fa-solid fa-robot",
  grupos: [
    {
      titulo: "Agentes de Codificación",
      descripcion: "Escriben código, resuelven errores y despliegan",
      icono: "fa-solid fa-terminal",
      habilidades: [
        {
          nombre: "Claude Code",
          logo: "claude",
          color: "#D97757",
          nota: "Anthropic",
          desc: "El agente oficial de Anthropic, directo en la terminal. Alto desempeño en pruebas SWE-bench.",
          porcentaje: 92,
        },
        {
          nombre: "OpenCode",
          sigla: "OC",
          color: "#8B5CF6",
          nota: "Open source",
          desc: "Alternativa libre y local a Claude Code, con foco en privacidad.",
          porcentaje: 85,
        },
        {
          nombre: "OpenAI Codex",
          logo: "openai",
          color: "#10A37F",
          nota: "GPT-5.5",
          desc: "Agente oficial de OpenAI, por CLI o delegación en la nube.",
          porcentaje: 72,
        },
        {
          nombre: "Cursor",
          sigla: "Cu",
          color: "#3F3F46",
          nota: "IDE",
          desc: "Fork de VS Code con agente visual multi-modelo.",
          porcentaje: 80,
        },
        {
          nombre: "Devin AI",
          sigla: "Dv",
          color: "#4F46E5",
          nota: "Autónomo",
          desc: "Ingeniero de software con IA totalmente autónomo.",
          porcentaje: 45,
        },
      ],
    },
    {
      titulo: "Otras alternativas",
      descripcion: "También disponibles para terminal y VS Code",
      icono: "fa-solid fa-shapes",
      habilidades: [
        {
          nombre: "Aider",
          sigla: "Ai",
          color: "#16A34A",
          desc: "Herramienta gratuita de terminal integrada con Git.",
          porcentaje: 38,
        },
        {
          nombre: "Cline",
          sigla: "Cl",
          color: "#3B82F6",
          desc: "Agente con aprobación paso a paso en VS Code.",
          porcentaje: 42,
        },
        {
          nombre: "Windsurf",
          sigla: "Ws",
          color: "#0D9488",
          desc: "IDE con agente integrado de fábrica.",
          porcentaje: 52,
        },
      ],
    },
  ],
};

export const frontend = {
  titulo: "Front End",
  subtitulo: "Handles what users see and interact with (runs in browser)",
  icono: "fa-solid fa-window-maximize",
  grupos: [
    {
      titulo: "Core Web Technologies",
      descripcion: "The foundation of every website",
      icono: "fa-solid fa-code",
      habilidades: [
        { nombre: "HTML5", logo: "html5", color: "#E34F26", porcentaje: 90 },
        { nombre: "CSS3", logo: "css3", color: "#1572B6", porcentaje: 85 },
        {
          nombre: "JavaScript",
          logo: "javascript",
          color: "#F0B429",
          colorIcono: "#1A1A1A",
          porcentaje: 90,
        },
      ],
    },
    {
      titulo: "Libraries",
      descripcion: "Pre-built tools to make development easier",
      icono: "fa-solid fa-cubes",
      habilidades: [
        {
          nombre: "React",
          logo: "react",
          color: "#0891B2",
          nota: "UI library",
          porcentaje: 88,
        },
        {
          nombre: "jQuery",
          logo: "jquery",
          color: "#0769AD",
          nota: "Utility library",
          porcentaje: 55,
        },
      ],
    },
    {
      titulo: "Frontend Frameworks",
      descripcion: "Full structure for building large applications",
      icono: "fa-solid fa-sitemap",
      habilidades: [
        { nombre: "Vue", logo: "vue", color: "#3A9E6E", porcentaje: 50 },
        { nombre: "Angular", logo: "angular", color: "#DD0031", porcentaje: 30 },
      ],
    },
    {
      titulo: "CSS Frameworks / UI Toolkits",
      descripcion: "Help you design beautiful UIs faster",
      icono: "fa-solid fa-palette",
      habilidades: [
        { nombre: "Tailwind CSS", logo: "tailwind", color: "#0EA5C4", porcentaje: 85 },
        { nombre: "Bootstrap", logo: "bootstrap", color: "#6D42C1", porcentaje: 65 },
      ],
    },
  ],
};

/**
 * Las tres secciones juntas. Se usan como valor inicial de la página
 * y como respaldo cuando el servidor no está disponible.
 */
export const datosIniciales = {
  backend,
  frontend,
  agentesIA,
};

export default datosIniciales;

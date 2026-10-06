/**
 * Punto de entrada de la API para Vercel.
 *
 * Cada archivo en esta carpeta se publica como una función serverless en
 * la ruta /api/<nombre>. No hay lógica duplicada: cada archivo solo
 * adapta la función que ya existe en netlify/functions/.
 *
 * Estructura de Vercel:
 *   api/visita.js               -> POST /api/visita
 *   api/contador.js             -> GET  /api/contador
 *   api/diario.js               -> GET  /api/diario
 *   api/admin/login.js          -> POST /api/admin/login
 *   api/admin/habilidades.js    -> GET/PUT /api/admin/habilidades
 *   api/admin/recuperar.js      -> POST /api/admin/recuperar
 *   api/admin/cambiar-password.js -> POST /api/admin/cambiar-password
 */

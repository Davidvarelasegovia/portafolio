# Contador de visitas + resumen por correo

El footer muestra un contador de visitas en gris y, una vez al día, te llega un
correo a **davidvareladavid@gmail.com** con el detalle de todas las visitas.

---

## Cómo funciona

```
Visitante entra al sitio
        ↓
POST /api/visita      → guarda en MongoDB (IP, lugar, navegador, página, fecha)
GET  /api/contador    → devuelve el total para pintarlo en el footer

Cada día 14:00 UTC
        ↓
GET  /api/diario      → agrupa las visitas del día y envía el correo
        (GitHub Actions)
```

Archivos:

| Ruta | Qué hace |
|---|---|
| `netlify/functions/visita.js` | Registra cada visita |
| `netlify/functions/contador.js` | Devuelve el total histórico y el de hoy |
| `netlify/functions/diario.js` | Arma y envía el resumen por correo |
| `netlify/lib/db.js` | Conexión a MongoDB Atlas |
| `netlify/lib/geo.js` | Ubicación desde la IP + navegador/sistema/dispositivo |
| `netlify/lib/mailer.js` | Plantilla del correo con Nodemailer |
| `src/Components/VisitCounter/` | Contador que se ve en el footer |

---

## Configuración (4 pasos)

### 1. MongoDB Atlas

1. Crea un cluster gratuito (M0) en [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → crea un usuario y anota usuario y contraseña.
3. **Network Access** → agrega `0.0.0.0/0` con el motivo `netlify`.
   Netlify no tiene IP fija, así que hay que permitir el acceso desde
   cualquier IP. Si te preocupa, deja la IP bloqueada y avísame para
   alternative con una lista de rangos de Netlify.
4. Copia el **Connection String** (Atlas → Connect → Drivers).

### 2. App Password de Gmail

Gmail **no permite** enviar correos con tu contraseña normal. Necesitas una
"contraseña de aplicación":

1. Activa la **verificación en 2 pasos** en
   [myaccount.google.com/security](https://myaccount.google.com/security).
2. Entra a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Elige "Correo" → crea una contraseña de 16 caracteres.

> Ojo: la clave se muestra **una sola vez**. Cópiala de inmediato.

### 3. Variables de entorno

Copia `.env.example` como `.env` en local. En Netlify agrégalas en:
**Site settings → Environment variables**.

| Variable | Valor |
|---|---|
| `MONGODB_URI` | El connection string del paso 1 |
| `MONGODB_DB` | `portafolio` |
| `EMAIL_USER` | `davidvareladavid@gmail.com` |
| `EMAIL_PASS` | La app password del paso 2 |
| `EMAIL_DESTINO` | `davidvareladavid@gmail.com` |
| `CRON_SECRET` | Clave larga y aleatoria |
| `SITE_URL` | `https://tu-portafolio.netlify.app` |
| `TZ` | `America/Santiago` |
| `VITE_API_URL` | Vacío si todo va en el mismo sitio Netlify |

Genera `CRON_SECRET` con:

```bash
openssl rand -hex 20
```

> En Netlify solo las variables **sin** prefijo son invisibles para el navegador.
> `MONGODB_URI` y `EMAIL_PASS` nunca se envían al cliente.

### 4. Activar el correo diario

Netlify en plan gratuito **no tiene cron nativo**, así que el proyecto usa
GitHub Actions (gratis). Ya está en `.github/workflows/daily-report.yml`.

En tu repositorio de GitHub, en **Settings → Secrets and variables → Actions**
agrega:

- `CRON_SECRET` → el mismo valor que pusiste en Netlify
- `NETLIFY_DIARIO_URL` → la URL de tu función, así:

```
https://tu-portafolio.netlify.app/.netlify/functions/diario
```

Cada día a las **14:00 UTC** (10:00–11:00 hora de Chile según horario de verano)
llegará el correo con el total de visitas, los países distintos y el detalle
de cada una: hora, lugar, página vista, navegador, sistema, dispositivo e IP.

Puedes probarlo cuando quieras desde la pestaña **Actions → Run workflow**, sin
esperar al día siguiente.

---

## Pruebas locales

```bash
npm install netlify-cli --global
netlify dev
```

`netlify dev` levanta el frontend y las funciones juntas, así puedes probar
`/api/visita` y `/api/contador` en `localhost:8888`.

Para forzar el envío del resumen en cualquier momento:

```bash
curl -H "x-cron-secret: TU_CRON_SECRET" \
  http://localhost:8888/api/diario
```

---

## Datos que se guardan

Por cada visita se guarda en la colección `visitas`:

| Campo | Descripción |
|---|---|
| `fecha` | Fecha y hora de la visita |
| `ip` | IP del visitante |
| `ciudad`, `region`, `pais` | Ubicación aproximada |
| `latitud`, `longitud` | Coordenadas |
| `zonaHoraria` | Zona horaria del visitante |
| `navegador`, `sistema`, `dispositivo` | Nombre, SO y tipo de equipo |
| `pagina` | Sección que estaba viendo |
| `referrer` | De dónde llegó |
| `idioma`, `userAgent` | Datos del navegador |

La colección `envios` guarda un registro por día para no enviar el mismo
resumen dos veces.

### Aviso importante

La ubicación se obtiene desde la IP, así que **no es exacta**: muestra la ciudad
del proveedor de internet, no la dirección real. En redes móviles o VPN puede
mostrar la ciudad equivocada. Es la misma limitación que tiene cualquier
contador de visitas gratuito.

---

## Ajustes rápidos

**Cambiar la hora del correo** → edita el `cron` en
`.github/workflows/daily-report.yml`:

```yaml
- cron: "0 14 * * *"   # 14:00 UTC
```

**Cambiar el destinatario** → variable `EMAIL_DESTINO` en Netlify.

**Ver todas las visitas** → Atlas → Collections → `visitas`.
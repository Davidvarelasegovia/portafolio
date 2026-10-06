# Guía: conectar tu proyecto a MongoDB Atlas (desde cero)

Esta guía es para alguien que nunca ha usado Atlas. Sigue los pasos en orden.

Si algo falla, el script `npm run verificar:mongo` te dice exactamente qué pasa.

---

## Cómo está organizado (esto es lo que más confunde)

Atlas tiene **3 niveles**, uno dentro del otro:

```
Organization  (la cuenta, tú)
   └── Project  (una carpeta para agrupar cosas)
         └── Cluster  (el servidor de base de datos de verdad)
               └── Database → Collections (dentro live tu información)
```

- **Organization**: es tu cuenta. Ya la tienes. Solo sirve para separar
  empresas/personas. Si no quieres complicarte, usa la que se creó sola.
- **Project**: es una carpeta. No cuesta nada y agrupa tus bases de datos.
- **Cluster**: es el servidor. Ahí es donde creas la base de datos.

---

## Paso 1 — Entrar al Atlas

1. Ve a https://cloud.mongodb.com
2. Inicia sesión con tu cuenta de Google (o la que usaste para registrarte).

---

## Paso 2 — Crear el Project

1. En el menú de la izquierda, arriba del todo, busca el botón **Create Project**
   (o el ícono `+` junto a "Projects").
2. Ponle un nombre. Te recomiendo: **`Portafolio`**
3. Clic en **Next** y después **Create Project**.

> Es solo una carpeta virtual. No cuesta nada y puedes borrarla después.

---

## Paso 3 — Crear el Cluster (el servidor)

1. Dentro del project, busca **Create Deployment** (o **+ Create**).
2. Te mostrará varias plantillas. Elige la que dice **Shared** / **Free**
   (la que tiene el precio "$0" o "FREE").
   - Si te aparece "M0 FREE" o "Shared", es esa.
3. Clic en **Create deployment**.

Atlas tarda entre 1 y 3 minutos en crear el cluster. Cuando esté listo,
verás el botón verde **Connect**.

> **Nombre**: déjalo como `Cluster0` (el que pone por defecto).
> No importa para nada.

---

## Paso 4 — El usuario de la base de datos

> **Atlas puede hacer esto solo.** Al crear el cluster, si lo pides con el
> botón **Connect**, Atlas te muestra un modal que dice:
>
> - ✅ *Connection IP address added* (agrega tu IP actual)
> - ✅ *Database user created* (crea un usuario, te lo muestra con su
>   contraseña y te deja descargarla)
>
> Si te aparece ese modal, **el paso 4 y parte del 5 ya están hechos**.
> Anota el usuario y la contraseña que te muestre. Igual tienes que
> agregar `0.0.0.0/0` en el paso 5, porque Atlas solo agrego tu IP.

Si no te aparece y necesitas crearlo a mano:

1. Menú izquierdo → **Database Access**.
2. Clic en **Add New Database User**.
3. Completa:

| Campo | Qué poner |
|---|---|
| Authentication Method | **Password** |
| Username | `portafolio` |
| Password | una contraseña inventada por ti |
| Confirm Password | la misma |
| Database User Privileges | **Read and write to any database** |

4. Clic en **Add User**.

### 🔒 Si la contraseña aparece en pantalla

Si te la muestra el modal de Atlas (o en cualquier captura de pantalla),
**cámbiala antes de seguir**: ve a **Database Access → Edit** sobre el usuario
y pon una nueva. Una contraseña expuesta en un chat, correo o captura
permitiría que cualquiera entre a tu base de datos.

### ⚠️ Sobre la contraseña

Esta es la parte que más falla. Anótala, porque **no vuelve a mostrarse**.

Si le pones caracteres especiales (`@ : / # % !`), después hay que
"escaparlos" en la URL de conexión:

| Carácter | Se escribe |
|---|---|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `#` | `%23` |
| `%` | `%25` |

**Atajo**: usa solo letras y números en la contraseña y no tendrás ningún
problema. Por ejemplo: `Portafolio2026`.

---

## Paso 5 — Permitir que Netlify se conecte

Netlify no tiene una IP fija, así que hay que permitir el acceso desde
cualquier dirección.

> Si el modal del paso 4 agregó tu IP, **igual tienes que hacer esto**:
> Atlas solo habilitó tu computador (p.ej. `179.8.68.89`), no el servidor
> donde vive tu sitio.

1. Menú izquierdo → **Network Access**.
2. Clic en **Add IP Address**.
3. Escribe esto en el campo:

```
0.0.0.0/0
```

4. Clic en **Add**.

> Te va a salir un aviso de seguridad: dice que esto abre la base de datos
> al mundo. Es lo normal para este caso, porque Netlify no tiene IP fija.
> Tu base sigue protegida por la contraseña del paso anterior.

---

## Paso 6 — Copiar la connection string

1. Vuelve a tu **Project** → **Cluster0**.
2. Clic en el botón **Connect** (verde).
3. Selecciona **Drivers** (es el ícono que parece `</>` o un coche).
4. Clic en **Copy** en el bloque de la contraseña.

Te va a copiar algo así:

```
mongodb+srv://portfolio_Y_TU_CONTRASENA@cluster0.xxxxx.mongodb.net
```

Ese texto es tu **MONGODB_URI**.

---

## Paso 7 — Ponerlo en tu proyecto

1. En la carpeta del proyecto, copia `.env.example` y renómbralo a `.env`
   (solo `.env`, sin nada después).

2. Abre `.env` y pega:

```bash
MONGODB_URI=mongodb+srv://portfolio_Y_TU_CONTRASENA@cluster0.xxxxx.mongodb.net
MONGODB_DB=portafolio

ADMIN_EMAIL=davidvareladavid@gmail.com
ADMIN_PASSWORD=una_contrasena_que_elijas
ADMIN_TOKEN_SECRET=pega_aqui_lo_que_genere_el_paso_9
```

3. Genera el `ADMIN_TOKEN_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia lo que aparece y pégalo en esa línea.

> **Nunca subas el `.env` a Git.** Ya está en `.gitignore`.

---

## Paso 8 — Verificar la conexión

```bash
npm run verificar:mongo
```

El script te va diciendo qué encuentra:

```
✅ MONGODB_URI encontrada
✅ Conectado al servidor
   ✅ visitas    0 documentos  (contador de visitas)
   ➕ habilidades 0 documentos  (panel de habilidades)
   ✅ MongoDB quedó listo para usarse
```

Si sale ❌, el script te dice la causa exacta (contraseña mal, falta la
IP, cluster pausado, etc.).

---

## Paso 9 — Subirlo a Netlify

En Netlify: **Site settings → Environment variables → Add a variable**

Agrega estas **8**:

| Key | Value |
|---|---|
| `MONGODB_URI` | lo que copiaste en el paso 6 |
| `MONGODB_DB` | `portafolio` |
| `ADMIN_EMAIL` | `davidvareladavid@gmail.com` |
| `ADMIN_PASSWORD` | la que elegiste en el paso 4/7 |
| `ADMIN_TOKEN_SECRET` | lo generado en el paso 7 |
| `EMAIL_USER` | `davidvareladavid@gmail.com` |
| `EMAIL_PASS` | tu App Password de Gmail (ver `ANALITICAS.md`) |
| `SITE_URL` | `https://tu-sitio.netlify.app` |

Agrega también `CRON_SECRET` (genera otro con el mismo comando del paso 7).

Cuando termines, Netlify te pide **re-deployar** el sitio para que tome los
cambios.

---

## Errores frecuentes

| Síntoma | Causa |
|---|---|
| `Authentication failed` | La contraseña está mal escrita en la URL |
| `connection <monitor> not allowed` | Falta el paso 5 (0.0.0.0/0) |
| `Server selection timed out` | El cluster está pausado: reactívalo en Atlas |
| La URL tiene `<password>` | Te faltó reemplazar `<password>` |
| `MongooseServerSelectionError` en la app | `MONGODB_URI` no está en Netlify |

---

## Antes de empezar

**MongoDB Atlas tiene un plan gratuito (M0)**: 512 MB, suficiente para tu
portafolio y de sobra. No pide tarjeta de crédito.
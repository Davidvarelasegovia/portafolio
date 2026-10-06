# Panel de habilidades (`/admin`)

Permite agregar, quitar y modificar tus tecnologías **sin tocar el código**.

Puedes, por ejemplo, sacar Angular, sacar Tailwind CSS, agregar Svelte o cambiar
el porcentaje de React a 95 — todo desde el navegador.

---

## Configuración

Agrega estas variables en **Netlify → Site settings → Environment variables**
y en tu `.env` local:

```bash
# Tu email. Es el único que puede entrar al panel y el único
# que recibe los códigos para cambiar la contraseña.
ADMIN_EMAIL=davidvareladavid@gmail.com

# Contraseña INICIAL. Solo se usa la primera vez, para crear el
# administrador en la base de datos. Después puedes cambiarla desde
# el propio panel y esta variable deja de importar.
# Reglas: mínimo 8 caracteres, al menos una letra y un número.
ADMIN_PASSWORD=una_contrasena_inicial_buena

# Clave con la que se firman los tokens de sesión
# Genera una con:  openssl rand -hex 32
ADMIN_TOKEN_SECRET=clave_aleatoria_larga_para_firmar_tokens
```

Después entra en `https://tu-sitio.netlify.app/admin` con tu email y esa
contraseña.

---

## Cambiar la contraseña

No hace falta tocar nada en el servidor ni en el código:

1. En el login, pulsa **¿Olvidaste tu contraseña?**
2. Escribe tu email y pulsa **Enviar código**.
3. Recibes un correo con un código de 6 dígitos.
4. Escribes el código y la contraseña nueva.
5. Listo. La contraseña queda cambiada en la base de datos.

Reglas para la contraseña nueva: mínimo 8 caracteres, con al menos una
letra y un número.

El código:

- dura **15 minutos**
- sirve **una sola vez**
- se invalida si pides otro
- **nunca se guarda en texto plano**, solo su hash

Pedir un código no revela si ese email es el administrador: la respuesta
es siempre la misma.

> **Nota:** `ADMIN_PASSWORD` del servidor solo se usa para crear el
> administrador la primera vez. Si olvidas la contraseña y además
> perdiste el acceso al correo, tendrías que borrar el documento del
> administrador en Atlas para volver a crearlo con la contraseña inicial.

---
## Qué puedes hacer

| Acción | Cómo |
|---|---|
| Cambiar el nombre | Edita el campo de texto |
| Cambiar el porcentaje | Mueve el control deslizante |
| Cambiar el color | Selector de color |
| Cambiar el logo | Escribe la clave del logo (ver abajo) |
| Agregar tecnología | Botón **+ Agregar tecnología** |
| Eliminar tecnología | Botón 🗑 |
| Agregar grupo | Botón **+ Agregar grupo** |
| Renombrar grupo | Edita el título del grupo |
| Eliminar grupo | Botón 📁 con guion |

Al final pulsas **Guardar cambios**. El contador de arriba muestra cuántas
tecnologías hay en total.

Los porcentajes se corrigen solos a número: no es posible guardar un `85` como
texto ni un valor fuera del rango 0–100.

### Cambiar el logo de una tecnología

Escribe en el campo de logo una de estas dos cosas:

- **Una clave de logo** → se dibuja el logo oficial.
  Ejemplos: `react`, `mongodb`, `tailwindcss`, `nextdotjs`
- **Unas iniciales** (1 a 3 letras) → se dibuja un círculo con esas letras.
  Ejemplo: `OC`, `TS`

Si escribes una clave que no existe en la biblioteca, se dibujan las iniciales
del nombre automáticamente, así que el círculo nunca queda vacío.

La lista completa de logos disponibles está en **`src/assets/logos.js`**
(busca las claves de nivel superior).

---

## Cómo funciona

```
Visita la página /habilidades-desarrollador
        ↓
GET /api/admin/habilidades      (público, solo lectura)
        ↓
¿Hay datos en MongoDB?
   ├── sí  → se muestran esos
   └── no  → se copian desde src/data/habilidades.js  (una sola vez)
```

Al entrar al panel con tu contraseña, el servidor responde con un **token
firmado** que vale 8 horas. Ese token es lo que autoriza los cambios: sin él,
la API rechaza el guardado aunque alguien conozca la URL.

---

## Dónde viven los datos

Todo se guarda en la colección **`habilidades`** de MongoDB Atlas, en un solo
documento con las tres secciones (`backend`, `frontend`, `agentesIA`).

**Si el servidor no está disponible**, la página pública muestra los datos de
`src/data/habilidades.js`. Por eso el sitio nunca se queda en blanco aunque
MongoDB falle.

### Ojo con esto

`src/data/habilidades.js` es solo la **semilla inicial**: se copia a MongoDB la
primera vez que se visita la página. Después de eso, editar ese archivo **ya no
tiene efecto**, porque manda lo que está en la base de datos.

Para volver a los valores del código, borra el documento en
**Atlas → Collections → habilidades** y recarga la página.

---

## Seguridad

- La contraseña se guarda **hasheada con scrypt** y con una sal
  aleatoria propia. Nunca en texto plano, ni en el navegador, ni en
  las variables de entorno.
- El acceso es con **email + contraseña**, y el único email con permiso
  es el de `ADMIN_EMAIL`.
- Al entrar, el servidor devuelve un **token firmado** que vale 8 horas.
  Sin ese token la API rechaza el guardado.
- **Cambiar la contraseña exige el correo**: nadie puede cambiarla solo
  con acceder al panel.
- Email inexistente y contraseña incorrecta devuelven el **mismo mensaje**,
  para no revelar qué emails están registrados.
- La comparación de contraseñas y de códigos es de **tiempo constante**.
- La autorización se verifica **antes** de conectarse a la base de datos.
- Los datos se validan en el servidor: no se puede guardar un porcentaje
  inválido ni una sección mal formada.

La ruta `/admin` no está enlazada en el navbar a propósito, para que no se
vea que existe.

---
## Pruebas

```bash
npm test
```

Incluye 25 pruebas de seguridad del panel: haseo de contraseñas, reglas de
contraseña, códigos de recuperación (vencidos, usados, alterados), tokens
manipulados o de otro servidor, escritura sin permisos y validación de datos.
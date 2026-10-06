# Publicar en Vercel (además de Netlify)

El proyecto vive en **dos plataformas**:

| Plataforma | Para qué |
|---|---|
| Netlify | la principal, con el build desde GitHub |
| Vercel | respaldo, y para no quedarte sin deploys si Netlify pausa la cuenta |

## Por qué existe `api/`

Netlify y Vercel tienen formatos distintos para las funciones del backend,
pero el proyecto tiene **una sola copia de la lógica**, en
`netlify/functions/`.

La carpeta `api/` no tiene lógica: son 7 archivos de 3 líneas que adaptan
esas mismas funciones al formato de Vercel, usando
`server/adaptador-vercel.js`.

Si mañana se agrega una función nueva, hay que crear **dos** archivos
pequeños (uno en `netlify/functions/` y otro en `api/`), pero la lógica va
una sola vez.

## Por qué `vercel.json` es simple

Vercel revisa el sistema de archivos **antes** de aplicar las reescrituras.
Por eso el catch-all `/(.*) -> /index.html` no se come `/api/...`: esas
rutashits se resuelven como función serverless antes de llegar ahí.

Ojo: en `netlify.toml` sí hubo que escribir reglas exactas para `/api/admin/*`
porque Netlify no empaqueta funciones anidadas y el comodín no resolvía las
barras internas.

## Variables de entorno

En Vercel también hay que declararlas:

```
Settings → Environment Variables
```

Las mismas 12 que en Netlify. Se pueden copiar con:

```
vercel env add NOMBRE production
```

## Comandos

```
npx vercel             publica una vista previa para probar
npx vercel --prod      publica al sitio real
npx vercel whoami      con que cuenta estas conectado
```

La primera vez `vercel` pregunta el nombre del proyecto y si lo vincula con
el repositorio de GitHub. Se puede decir que no al repositorio: Vercel
despliega desde la carpeta, y para eso hay que correr `vercel --prod`
cuando haya cambios.

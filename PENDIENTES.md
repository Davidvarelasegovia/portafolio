# Pendientes

Anotado al cerrar la sesion del 6 de octubre de 2026.

## 1. Pagina web personal (para monetizar servicios)

La que ofrece servicios a la gente y sirve para buscar trabajo. Diferente
del portafolio: el portafolio muestra proyectos, esta seria la que
convence a un cliente.

Cuando se arme:
- Dominio propio (hoy es `david-varela-portafolio.netlify.app`)
- Que tenga contacto directo: formulario, WhatsApp, correo
- Productos/servicios con precios
- Queame a personas reales, no ficticias

## 2. Migrar Control de Acceso a MongoDB Atlas

Decidido en contra de la migracion rapida. Volver a mirar cuando haya
tiempo y la necessity real.

Estado actual del proyecto:
- Repositorio: https://github.com/Davidvarelasegovia/control-acceso
- Funciona offline-first con SQLite en `data/control-acceso.db`
- La base con datos NO se sube a GitHub (esta en .gitignore)
- Si se sube: va `control-acceso-vacio.db`, con la misma estructura y 0 registros

Por que NO es urgente:
- 429 llamadas a la base de datos
- 111 consultas con JOIN (en MongoDB no existen, hay que reescribirlas)
- 11 transacciones
- 12 tablas con relaciones

Contra Mongo Atlas se pierde la garantia de que funcione sin internet,
que es justo el motivo del diseno.

Herramienta para ver el tamano del trabajo:
```
node scripts/revisar-base-publica.mjs   (en la carpeta del proyecto)
```

## 3. Agregar el logo y link de GitHub al footer del portafolio

Falta el logo de GitHub con el link al repositorio del portafolio
(https://github.com/Davidvarelasegovia/portafolio).

En `src/Components/Footer/Footer.jsx` esta la lista `socialLinks`.
Ojo: GitHub no es una red social como las otras, asi que conviene
evaluar si va con las otras 4 (Facebook, Instagram, LinkedIn, WhatsApp)
o aparte en otra parte del footer.

---

## Como retomar

El proyecto queda en:
```
C:\Users\David\Desktop\Proyectos React\portafolio
```

Comandos utiles:
```
npm run dev           ver la web en el navegador
npm test              correr las pruebas
npm run lint          revisar el codigo
npx netlify deploy --prod    publicar
```

Script del navbar (revisa 11 anchos de ventana, los 2 temas):
```
node scripts/probar-navbar.mjs      -> debe dar 22/22
```

Scripts de seguridad:
```
node scripts/buscar-secretos.mjs    revisa si hay secretos por subir
node scripts/ver-alertas.mjs        alertas de GitHub
```

Probar el panel contra el sitio publicado (login real por internet):
```
node scripts/probar-panel-online.mjs
```

## Sitios en Netlify

| Sitio | Estado |
|---|---|
| david-varela-portafolio | el bueno, conectado a GitHub |
| portafolio-david-varla | vacio, se puede borrar |
| portafoliodavidvarela | version vieja, se puede borrar |

## Repositorios en GitHub

publicos:
- portafolio
- control-acceso
- tienda-videojuegos
- carrito-de-compras
- calculadora-propinas
- pro-progra

privados:
- contador-de-raciones   (aparece sin boton "Ver codigo" en el portafolio)
- agencia_viajes          (todavia no esta en el portafolio)

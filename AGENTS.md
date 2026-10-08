# AGENTS.md

## Proyecto

Sitio web educativo para el curso **Chicas Programadoras**. Audiencia: niñas de 12 a 18 años sin contexto previo de programación. Todo el código (variables, mensajes UI, comentarios) debe ser legible para una principiante; priorizar claridad sobre brevedad o "cleverness".

## Stack y restricciones (no negociables)

- **HTML semántico** — usar `<header>`, `<main>`, `<section>`, `<article>`, `<form>`, `<label>`, `<fieldset>`, `<dialog>`, etc. Nada de `<div>` para estructura que un elemento semántico cubra.
- **CSS básico** — sin frameworks (no Tailwind, no Bootstrap), sin preprocesadores. Un solo archivo `styles.css` (o pocos) con variables CSS en `:root` para que la marca sea intercambiable (ver "Marca blanca" abajo).
- **JS básico** — vanilla, sin frameworks, sin bundlers, sin npm. Un solo archivo `script.js` (o pocos) cargado con `<script defer>`.
- **Persistencia** — `localStorage` del navegador. Serializar como JSON. Incluir try/catch al leer/escribir (la cuota puede llenarse, los datos del usuario pueden estar corruptos).
- **Sin build step** — abrir `index.html` directamente debe funcionar. No asumir servidor, no asumir imports ES modules con rutas relativas si se va a abrir con `file://` (los imports fallan en `file://` por CORS).
- **Sin dependencias externas** salvo lo que el HTML cargue por CDN (y aun así, preferir nada). Sin fuentes web salvo que aporten valor real a la marca blanca.

## Marca blanca (white-label)

El sitio debe poder rebrandearse cambiando valores en **un solo lugar**:

- Colores, tipografías, espaciados, radios y sombras como **variables CSS en `:root`**.
- El nombre del producto/logo deben vivir en un solo punto del HTML (idealmente dentro de un `<header>` con un `<h1>` editable, no duplicados en `<title>`, `<footer>`, etc.).
- Evitar colores hardcodeados (`#fff`, `red`) en el CSS — siempre `var(--algo)`.
- Si se usa una imagen de marca, que sea 1 archivo SVG referenciado una sola vez.

Si un cambio de marca toca más de 2 archivos, está mal diseñado.

## Funcionalidad requerida (spec del ejercicio)

Página de "diario de recuerdos" donde la usuaria registra un **Recuerdo** y lo ve en un **Dialog**.

Formulario (dentro de un `<form>` con `<label>` por cada campo):
- **Título** — `<input type="text" required>`.
- **Descripción** — `<textarea required>`.
- **Fecha** — `<input type="date" required>`.
- **Categoría** — `<select>` con opciones definidas por la app (no input libre). Ejemplos razonables: Familia, Amigos, Escuela, Viajes, Logros, Otros.
- **Imagen** — `<input type="file" accept="image/*">`. Debe ser **ligera**: limitar tamaño (sugerido: rechazar > 1–2 MB) y almacenar como **Data URL (base64)** en `localStorage` por simplicidad. Avisar a la usuaria si la imagen excede el límite.

Visualización:
- Lista de recuerdos en `<main>` (cada uno como `<article>`).
- Al hacer click en un recuerdo, abrir un `<dialog>` HTML nativo (no librería) con todos sus campos, incluida la imagen.
- El `<dialog>` debe cerrarse con un botón visible y con la tecla `Escape` (el `<dialog>` nativo ya lo hace, pero verificar).

Persistencia:
- Cada recuerdo se guarda en `localStorage` bajo una clave estable (ej. `recuerdos:v1`). Versionar la clave si el esquema cambia.
- Al cargar la página, leer y renderizar la lista.
- Al enviar el formulario, guardar y limpiar el form.

## Convenciones de código

- **Idioma**: textos visibles en español; identificadores (variables, funciones, clases CSS) en español también, ya que las estudiantes los van a leer. Evitar inglés salvo términos universalmente conocidos (`img`, `dialog`, `localStorage`).
- **Comentarios**: este es un proyecto de enseñanza. Comentar el **por qué** y los conceptos nuevos (qué es `localStorage`, qué hace `<dialog>`, qué es un Data URL). NO comentar lo obvio (`// suma 1` sobre `x + 1`).
- **Funciones pequeñas y nombradas por intención** — sin arrow functions complejas ni callbacks anidados. Lo que una principiante puede leer en voz alta.
- **Sin números mágicos** — los límites (tamaño de imagen, número de caracteres) como constantes nombradas al inicio del JS.
- **Accesibilidad**: `alt` en toda imagen, foco visible al navegar con teclado, contraste suficiente (verificar con el inspector), `aria-label` solo cuando el HTML no se explique solo.

## Estructura sugerida (no obligatoria)

```
index.html
styles.css
script.js
```

Si crece, partir por responsabilidad (ej. `js/storage.js`, `js/dialog.js`) usando `<script defer>` en orden, no modules ES (mismo motivo de `file://`).

## Verificación manual

No hay tests automatizados. Antes de dar por hecho un cambio:

1. Abrir `index.html` en el navegador (doble click → `file://`).
2. Crear un recuerdo completo con imagen → confirmar que aparece en la lista y se ve en el `<dialog>`.
3. Recargar la página → confirmar que el recuerdo persiste.
4. Probar con imagen > 2 MB → confirmar rechazo con mensaje claro.
5. Probar con `localStorage` lleno (DevTools → Application → Local Storage → llenar) → confirmar que la app no rompe, muestra error legible.
6. Navegar todo con teclado solo (Tab/Enter/Esc) → el dialog se abre, se cierra con Esc, el foco vuelve al elemento que lo abrió.

## Lo que NO hacer

- No agregar React, Vue, Svelte, jQuery, ni nada similar.
- No agregar `package.json` ni `node_modules`.
- No usar `localStorage` para la imagen como Blob URL (se invalida al recargar) — base64 o nada.
- No crear recuerdos de ejemplo hardcodeados en el HTML que se mezclen con los del usuario — si los hay, deben ser claramente de demo y no persistir.
- No usar alertas (`alert()`) para errores de UX — usar un `<p role="alert">` en el DOM.

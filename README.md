# Mi Diario de Recuerdos

Sitio web educativo para el curso **Chicas Programadoras**. Una página sencilla donde la usuaria registra recuerdos con título, descripción, fecha, categoría e imagen, y los ve dentro de un diálogo emergente. Todo se guarda en el navegador, sin servidor ni base de datos.

## Requisitos

- Un navegador moderno (Chrome, Firefox, Safari o Edge).
- Opcional pero recomendado: **Python 3** (para servir la página con un servidor local y evitar errores de CORS).
- Nada más: no hay `npm`, no hay build step, no hay dependencias externas.

## Cómo ejecutarlo paso a paso

### Opción A: servidor local (recomendada)

Levantar un pequeño servidor web evita los errores de CORS que algunos navegadores muestran cuando el archivo se abre directamente con doble click.

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta:

   ```bash
   python3 -m http.server 8000
   ```

3. Abre `http://localhost:8000` en tu navegador.
4. Para detener el servidor, presiona `Ctrl+C` en la terminal.

> Si tu sistema usa `python` en vez de `python3`, ajustalo en el comando. Sirve cualquier puerto libre (8000, 8080, 3000…).

### Opción B: abrir directamente el archivo

1. Clona o descarga este repositorio en tu computador.
2. Abre la carpeta del proyecto.
3. Haz doble click sobre el archivo `index.html`. Se abrirá en tu navegador predeterminado.
   - Si quieres elegir otro navegador, haz click derecho sobre `index.html` → "Abrir con" y selecciona el que prefieras.

> Si tu navegador bloquea algún recurso al abrir el archivo, usa `Ctrl+O` (o `Cmd+O` en Mac) y selecciona `index.html` manualmente desde el diálogo de archivo. Si aun así ves errores de CORS en la consola, vuelve a la **Opción A**.

## Cómo verificar que todo funciona

Después de abrir la página, recorre esta lista para asegurarte de que el comportamiento es el correcto:

- [ ] Presionar el botón **+ Nuevo recuerdo** del encabezado → se abre un diálogo modal con el formulario, con un fondo oscuro detrás.
- [ ] Completar el formulario con todos los campos y presionar **Guardar recuerdo** → el diálogo se cierra y el recuerdo aparece en el feed de la página, con imagen, categoría, fecha, título y descripción.
- [ ] Presionar **Cancelar**, la **X** del encabezado del diálogo, la tecla **Esc**, o hacer click fuera del diálogo → el diálogo se cierra y el foco vuelve al botón "Nuevo recuerdo".
- [ ] Recargar la página (`F5` o `Ctrl+R` / `Cmd+R`) → los recuerdos siguen ahí, porque se guardan en `localStorage`.
- [ ] Intentar subir una imagen mayor a 2 MB → aparece un mensaje de error en rojo y la imagen no se acepta.
- [ ] Recorrer toda la página solo con el teclado (`Tab` y `Enter`) → el foco se ve siempre con un contorno azul visible.
- [ ] Abrir las DevTools del navegador (botón derecho → "Inspeccionar" o `F12`) → en la pestaña **Application** → **Local Storage** verás una clave llamada `recuerdos:v1` con los recuerdos guardados en formato JSON.

## Estructura del proyecto

```
.
├── AGENTS.md      ← reglas y convenciones para quien programa sobre el proyecto
├── README.md      ← este archivo
├── index.html     ← estructura semántica de la página
├── styles.css     ← colores, tipografía y diseño (con marca blanca en :root)
└── script.js      ← lógica: formulario, almacenamiento y diálogo
```

## Personalizar la marca (white-label)

Todos los colores del sitio viven en un solo lugar: el bloque `:root` al inicio de `styles.css`. Para rebrandear (por ejemplo, pasar de violeta a turquesa, o cambiar las tipografías), edita únicamente esos valores y todo el sitio se reestiliza automáticamente, sin tocar nada más.

## Más información

Las convenciones de código, las restricciones del proyecto y la lista completa de lo que **no** se debe hacer están en [`AGENTS.md`](./AGENTS.md).

## Desplegar en GitHub Pages

El proyecto incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`) que publica automáticamente la página en cada push a `master`. Como no hay paso de build, se sube el repo tal cual.

Para activarlo por primera vez:

1. Hacé push de los archivos a la rama `master` de tu fork/repo.
2. En GitHub, andá a **Settings → Pages**.
3. En **Source**, elegí **GitHub Actions** (no "Deploy from a branch").
4. Esperá a que termine el primer run del workflow (pestaña **Actions**).
5. La página queda disponible en `https://<usuario>.github.io/<repo>/`.

Los despliegues siguientes son automáticos: cada `git push` a `master` redeploya.

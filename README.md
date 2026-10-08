# Mi Diario de Recuerdos

Una página web donde podés guardar recuerdos: título, descripción, fecha, categoría y una foto. Todo se queda guardado en tu navegador.

## Cómo abrirla

Doble click en `index.html` y se abre en tu navegador.

Si ves errores raros en la consola, en una terminal escribí:

```bash
python3 -m http.server 8000
```

y después abrí `http://localhost:8000`.

## Qué hay en esta carpeta

- `index.html` — la estructura de la página
- `styles.css` — los colores y el diseño
- `script.js` — la lógica (formulario, guardado, feed)
- `AGENTS.md` — notas para quien programa
- `.github/workflows/deploy.yml` — para publicar en internet

## Querés publicarla en internet

Cada vez que alguien hace `git push` a la rama `master`, se publica sola en `https://<usuario>.github.io/<repo>/` (gracias a GitHub Actions).

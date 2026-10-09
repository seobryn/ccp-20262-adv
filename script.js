const CLAVE = "recuerdos:v1";
const MAX_MB = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const recuerdos = cargar();

const botonNuevo = document.getElementById("boton-nuevo");
const dialogo = document.getElementById("dialogo");
const formulario = document.getElementById("formulario");
const errorElem = document.getElementById("error");
const lista = document.getElementById("lista-recuerdos");
const vacio = document.getElementById("estado-vacio");

function cargar() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || [];
  } catch {
    return [];
  }
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(recuerdos));
    return true;
  } catch {
    return false;
  }
}

function formatearFecha(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
}

function crearTarjeta(recuerdo) {
  const art = document.createElement("article");
  art.className = "tarjeta";

  if (recuerdo.imagen) {
    const img = document.createElement("img");
    img.src = recuerdo.imagen;
    img.alt = recuerdo.titulo;
    art.appendChild(img);
  } else {
    const ph = document.createElement("div");
    ph.className = "placeholder";
    ph.textContent = "✦";
    art.appendChild(ph);
  }

  const contenido = document.createElement("div");
  contenido.className = "contenido";

  const meta = document.createElement("div");
  meta.className = "meta";

  const badge = document.createElement("span");
  badge.className = `badge ${recuerdo.categoria}`;
  badge.textContent = recuerdo.categoria;
  meta.appendChild(badge);

  const fecha = document.createElement("span");
  fecha.textContent = formatearFecha(recuerdo.fecha);
  meta.appendChild(fecha);

  contenido.appendChild(meta);

  const titulo = document.createElement("h3");
  titulo.textContent = recuerdo.titulo;
  contenido.appendChild(titulo);

  const descripcion = document.createElement("p");
  descripcion.textContent = recuerdo.descripcion;
  contenido.appendChild(descripcion);

  art.appendChild(contenido);
  return art;
}

function render() {
  lista.innerHTML = "";
  vacio.hidden = recuerdos.length > 0;
  recuerdos
    .slice()
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .forEach((r) => {
      const li = document.createElement("li");
      li.appendChild(crearTarjeta(r));
      lista.appendChild(li);
    });
}

function leerImagen(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

function descargarRecuerdos(e) {
  e.preventDefault();
  const blob = new Blob([JSON.stringify(recuerdos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mis-recuerdos.json";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("boton-descargar").addEventListener("click", descargarRecuerdos);

botonNuevo.addEventListener("click", () => {
  dialogo.showModal();
  formulario.elements.titulo.focus();
});

dialogo.addEventListener("click", (e) => {
  if (e.target.matches("[data-cerrar]") || e.target === dialogo) dialogo.close();
});

dialogo.addEventListener("close", () => formulario.reset());

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorElem.hidden = true;

  const datos = new FormData(formulario);
  const titulo = datos.get("titulo").trim();
  const descripcion = datos.get("descripcion").trim();
  const fecha = datos.get("fecha");
  const categoria = datos.get("categoria");
  const archivo = datos.get("imagen");

  if (!titulo || !descripcion || !fecha || !categoria) {
    errorElem.textContent = "Por favor completa todos los campos.";
    errorElem.hidden = false;
    return;
  }

  let imagen = null;
  if (archivo && archivo.size > 0) {
    if (archivo.size > MAX_BYTES) {
      errorElem.textContent = `La imagen es demasiado grande. El máximo es ${MAX_MB} MB.`;
      errorElem.hidden = false;
      return;
    }
    try {
      imagen = await leerImagen(archivo);
    } catch {
      errorElem.textContent = "No se pudo leer la imagen.";
      errorElem.hidden = false;
      return;
    }
  }

  recuerdos.push({
    id: Date.now() + Math.random().toString(36).slice(2, 7),
    titulo, descripcion, fecha, categoria, imagen
  });

  if (!guardar()) {
    recuerdos.pop();
    errorElem.textContent = "No hay espacio suficiente.";
    errorElem.hidden = false;
    return;
  }

  dialogo.close();
  render();
});

render();

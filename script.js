/* =============================================================
   MI DIARIO DE RECUERDOS — script.js
   Lógica para crear, guardar y mostrar recuerdos en el navegador.
   ============================================================= */

// --- Constantes -----------------------------------------------
// Las almacenamos aquí para no tener "números mágicos" sueltos.

const CLAVE_ALMACENAMIENTO = "recuerdos:v1";
const TAMAÑO_MAXIMO_IMAGEN_MB = 2;
const BYTES_POR_MB = 1024 * 1024;
const TAMAÑO_MAXIMO_IMAGEN_BYTES = TAMAÑO_MAXIMO_IMAGEN_MB * BYTES_POR_MB;

// Categorías permitidas: deben coincidir con las <option> del HTML.
const CATEGORIAS = ["Familia", "Amigos", "Escuela", "Viajes", "Logros", "Otros"];

// Formato de fecha legible para mostrar a la usuaria.
const OPCIONES_FECHA = { year: "numeric", month: "long", day: "numeric" };

// --- Estado ----------------------------------------------------
// Lista en memoria con los recuerdos de la usuaria.
let recuerdos = [];

// Guardamos aquí qué elemento tenía el foco antes de abrir un
// diálogo, para devolvérselo al cerrarlo. Importante para quien
// navega con teclado.
let elementoPrevioAlDialogo = null;

// --- Referencias al DOM ---------------------------------------
const botonNuevo = document.getElementById("boton-nuevo");
const formulario = document.getElementById("formulario-recuerdo");
const entradaTitulo = document.getElementById("titulo");
const entradaDescripcion = document.getElementById("descripcion");
const entradaFecha = document.getElementById("fecha");
const entradaCategoria = document.getElementById("categoria");
const entradaImagen = document.getElementById("imagen");
const vistaPrevia = document.getElementById("vista-previa");
const mensajeError = document.getElementById("mensaje-error");
const listaRecuerdos = document.getElementById("lista-recuerdos");
const estadoVacio = document.getElementById("estado-vacio");
const dialogoFormulario = document.getElementById("dialogo-formulario");
const dialogo = document.getElementById("dialogo-detalle");
const botonCerrar = document.getElementById("boton-cerrar");

// --- Almacenamiento en localStorage ----------------------------
// localStorage guarda texto en el navegador de la usuaria. Como
// puede fallar (cuota llena, datos corruptos), usamos try/catch.

function cargarRecuerdos() {
  try {
    const texto = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!texto) return [];
    const datos = JSON.parse(texto);
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.error("No se pudieron leer los recuerdos guardados:", error);
    return [];
  }
}

function guardarRecuerdos() {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(recuerdos));
    return true;
  } catch (error) {
    // La cuota de localStorage suele ser ~5 MB. Si la imagen
    // base64 es muy pesada, esto puede fallar.
    console.error("No se pudieron guardar los recuerdos:", error);
    mostrarError("No hay espacio suficiente para guardar el recuerdo. Intenta con una imagen más pequeña.");
    return false;
  }
}

// --- Manejo de imagen -----------------------------------------
// convertimos el archivo seleccionado a un Data URL (base64) para
// poder guardarlo dentro de localStorage. Si la imagen es muy
// pesada, la rechazamos antes de leerla.

function manejarCambioDeImagen(evento) {
  const archivo = evento.target.files[0];
  limpiarError();

  if (!archivo) {
    vistaPrevia.hidden = true;
    vistaPrevia.removeAttribute("src");
    return;
  }

  if (archivo.size > TAMAÑO_MAXIMO_IMAGEN_BYTES) {
    mostrarError(`La imagen es demasiado grande. El máximo es ${TAMAÑO_MAXIMO_IMAGEN_MB} MB.`);
    entradaImagen.value = "";
    vistaPrevia.hidden = true;
    vistaPrevia.removeAttribute("src");
    return;
  }

  const lector = new FileReader();
  lector.onload = function (evento) {
    vistaPrevia.src = evento.target.result;
    vistaPrevia.hidden = false;
  };
  lector.readAsDataURL(archivo);
}

function leerImagenComoDataURL(archivo) {
  return new Promise(function (resolver, rechazar) {
    const lector = new FileReader();
    lector.onload = function () { resolver(lector.result); };
    lector.onerror = function () { rechazar(lector.error); };
    lector.readAsDataURL(archivo);
  });
}

// --- Crear un recuerdo nuevo -----------------------------------
// Devuelve un objeto con los datos del formulario. Si falta algo
// requerido, devuelve null y muestra el mensaje correspondiente.

async function leerDatosDelFormulario() {
  const titulo = entradaTitulo.value.trim();
  const descripcion = entradaDescripcion.value.trim();
  const fecha = entradaFecha.value;
  const categoria = entradaCategoria.value;
  const archivoImagen = entradaImagen.files[0];

  if (!titulo || !descripcion || !fecha || !categoria) {
    mostrarError("Por favor completa todos los campos.");
    return null;
  }

  if (!CATEGORIAS.includes(categoria)) {
    mostrarError("La categoría seleccionada no es válida.");
    return null;
  }

  let imagenDataURL = null;
  if (archivoImagen) {
    try {
      imagenDataURL = await leerImagenComoDataURL(archivoImagen);
    } catch (error) {
      mostrarError("No se pudo leer la imagen. Intenta con otra.");
      return null;
    }
  }

  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    titulo: titulo,
    descripcion: descripcion,
    fecha: fecha,
    categoria: categoria,
    imagen: imagenDataURL
  };
}

// --- Renderizado de la lista -----------------------------------

function formatearFecha(fechaISO) {
  // fechaISO viene como "2024-03-15". La convertimos a un objeto
  // Date cuidando de no aplicar el offset de zona horaria.
  const partes = fechaISO.split("-");
  const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  return fecha.toLocaleDateString("es-ES", OPCIONES_FECHA);
}

function crearTarjeta(recuerdo) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "tarjeta-recuerdo";
  boton.setAttribute("aria-label", `Ver recuerdo: ${recuerdo.titulo}`);

  if (recuerdo.imagen) {
    const img = document.createElement("img");
    img.src = recuerdo.imagen;
    img.alt = recuerdo.titulo;
    img.className = "tarjeta-recuerdo__imagen";
    boton.appendChild(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "tarjeta-recuerdo__imagen--vacia";
    placeholder.textContent = "✦";
    placeholder.setAttribute("aria-hidden", "true");
    boton.appendChild(placeholder);
  }

  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta-categoria";
  etiqueta.dataset.categoria = recuerdo.categoria;
  etiqueta.textContent = recuerdo.categoria;
  boton.appendChild(etiqueta);

  const titulo = document.createElement("h3");
  titulo.className = "tarjeta-recuerdo__titulo";
  titulo.textContent = recuerdo.titulo;
  boton.appendChild(titulo);

  const fecha = document.createElement("p");
  fecha.className = "tarjeta-recuerdo__fecha";
  fecha.textContent = formatearFecha(recuerdo.fecha);
  boton.appendChild(fecha);

  boton.addEventListener("click", function () { abrirDialogoDetalle(recuerdo); });

  return boton;
}

function renderizarLista() {
  listaRecuerdos.innerHTML = "";

  if (recuerdos.length === 0) {
    estadoVacio.hidden = false;
    return;
  }

  estadoVacio.hidden = true;

  recuerdos
    .slice()
    .sort(function (a, b) { return b.fecha.localeCompare(a.fecha); })
    .forEach(function (recuerdo) {
      const item = document.createElement("li");
      item.appendChild(crearTarjeta(recuerdo));
      listaRecuerdos.appendChild(item);
    });
}

// --- Diálogos --------------------------------------------------
// <dialog> es un elemento HTML nativo que ya maneja el cierre
// con Escape, el foco inicial y la accesibilidad por nosotros.
// showModal() además aplica el backdrop automáticamente.

function abrirDialogoFormulario() {
  elementoPrevioAlDialogo = document.activeElement;
  dialogoFormulario.showModal();
  // Llevamos el foco al primer input del formulario para que la
  // usuaria pueda empezar a escribir de inmediato.
  entradaTitulo.focus();
}

function abrirDialogoDetalle(recuerdo) {
  elementoPrevioAlDialogo = document.activeElement;

  const imagen = document.getElementById("detalle-imagen");
  if (recuerdo.imagen) {
    imagen.src = recuerdo.imagen;
    imagen.alt = recuerdo.titulo;
    imagen.hidden = false;
  } else {
    imagen.removeAttribute("src");
    imagen.hidden = true;
  }

  const categoria = document.getElementById("detalle-categoria");
  categoria.dataset.categoria = recuerdo.categoria;
  categoria.textContent = recuerdo.categoria;

  document.getElementById("detalle-titulo").textContent = recuerdo.titulo;
  document.getElementById("detalle-fecha").textContent = formatearFecha(recuerdo.fecha);
  document.getElementById("detalle-descripcion").textContent = recuerdo.descripcion;

  dialogo.showModal();
}

// Cuando el diálogo del formulario se cierra (por cualquier vía:
// Escape, botón X, Cancelar, envío exitoso), reseteamos el
// formulario para que la próxima vez esté vacío.
function limpiarFormulario() {
  formulario.reset();
  vistaPrevia.hidden = true;
  vistaPrevia.removeAttribute("src");
  limpiarError();
}

// Devolvemos el foco al elemento que lo tenía antes de abrir el
// diálogo. Se ejecuta desde el evento "close" del <dialog>.
function restaurarFoco() {
  if (elementoPrevioAlDialogo) {
    elementoPrevioAlDialogo.focus();
    elementoPrevioAlDialogo = null;
  }
}

// --- Mensajes de error en pantalla -----------------------------
// Evitamos alert() del navegador porque rompe la experiencia.

function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.hidden = false;
}

function limpiarError() {
  mensajeError.textContent = "";
  mensajeError.hidden = true;
}

// --- Manejo del envío del formulario ---------------------------

async function manejarEnvio(evento) {
  evento.preventDefault();
  try {
    limpiarError();

    const recuerdo = await leerDatosDelFormulario();
    if (!recuerdo) return;

    recuerdos.push(recuerdo);
    if (!guardarRecuerdos()) {
      recuerdos.pop();
      return;
    }

    renderizarLista();
    // Cerramos el diálogo. El evento "close" se encargará de
    // resetear el formulario y devolver el foco al botón "Nuevo".
    dialogoFormulario.close();
  } catch (error) {
    mostrarErrorApp("Error al guardar el recuerdo: " + error.message);
  }
}

// --- Inicialización --------------------------------------------

function iniciar() {
  recuerdos = cargarRecuerdos();
  renderizarLista();

  // Abrir el diálogo del formulario
  botonNuevo.addEventListener("click", abrirDialogoFormulario);

  // Enviar el formulario
  formulario.addEventListener("submit", manejarEnvio);
  entradaImagen.addEventListener("change", manejarCambioDeImagen);

  // Cerrar el diálogo del formulario: el botón X, el botón Cancelar
  // y cualquier click en el backdrop (fuera del contenido).
  document.querySelectorAll("[data-cerrar-formulario]").forEach(function (boton) {
    boton.addEventListener("click", function () { dialogoFormulario.close(); });
  });
  dialogoFormulario.addEventListener("click", function (evento) {
    if (evento.target === dialogoFormulario) dialogoFormulario.close();
  });
  dialogoFormulario.addEventListener("close", function () {
    limpiarFormulario();
    restaurarFoco();
  });

  // Cerrar el diálogo de detalle: el botón X, el botón Cerrar del
  // pie y cualquier click en el backdrop.
  document.querySelectorAll("[data-cerrar-detalle]").forEach(function (boton) {
    boton.addEventListener("click", function () { dialogo.close(); });
  });
  botonCerrar.addEventListener("click", function () { dialogo.close(); });
  dialogo.addEventListener("click", function (evento) {
    if (evento.target === dialogo) dialogo.close();
  });
  dialogo.addEventListener("close", restaurarFoco);
}

// --- Red de seguridad ------------------------------------------
// Aunque algo falle en iniciar(), el formulario NUNCA debe
// navegar al propio index.html (eso dispara el error de CORS en
// file://). method="dialog" ya lo evita cerrando el diálogo en
// lugar de enviar, pero además frenamos cualquier submit por
// defecto del formulario.

document.addEventListener("submit", function (evento) {
  if (evento.target === formulario) evento.preventDefault();
}, true);

// Si JS falla en cualquier punto, mostramos el error en pantalla
// para que la usuaria (o quien esté revisando) sepa qué pasó.
function mostrarErrorApp(mensaje) {
  const elem = document.getElementById("error-app");
  if (elem) {
    elem.textContent = mensaje;
    elem.hidden = false;
  }
  console.error(mensaje);
}

window.addEventListener("error", function (evento) {
  mostrarErrorApp("Error en la app: " + (evento.message || "desconocido"));
});

window.addEventListener("unhandledrejection", function (evento) {
  const motivo = evento.reason && evento.reason.message
    ? evento.reason.message
    : (evento.reason || "desconocido");
  mostrarErrorApp("Error en la app: " + motivo);
});

try {
  iniciar();
} catch (error) {
  mostrarErrorApp("No se pudo iniciar la app: " + error.message);
}

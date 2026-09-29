const TEMAS = new Set(["claro", "oscuro", "sistema"]);
let tiendaActual = "";
let temaGuardado = "claro";
let temaActual = "claro";
let revision = 0;
let consultaSistema;

export function normalizarTema(tema) {
  return TEMAS.has(tema) ? tema : "claro";
}

export function resolverTema(tema, sistemaOscuro) {
  return tema === "oscuro" || (tema === "sistema" && sistemaOscuro) ? "oscuro" : "claro";
}

function aplicarTema(tema) {
  temaActual = normalizarTema(tema);
  if (!consultaSistema) {
    consultaSistema = window.matchMedia("(prefers-color-scheme: dark)");
    consultaSistema.addEventListener("change", () => aplicarTema(temaActual));
  }
  document.documentElement.dataset.tema = resolverTema(temaActual, consultaSistema.matches);
}

export function previsualizarTema(tema) {
  revision += 1;
  aplicarTema(tema);
}

export function guardarTema(tema) {
  revision += 1;
  temaGuardado = normalizarTema(tema);
  if (tiendaActual) {
    try { localStorage.setItem(`stockly:tema:${tiendaActual}`, temaGuardado); }
    catch { /* El tema también funciona cuando el navegador bloquea el almacenamiento. */ }
  }
  aplicarTema(temaGuardado);
}

export function restaurarTema() {
  revision += 1;
  aplicarTema(temaGuardado);
}

// Cada tienda tiene su preferencia; una respuesta antigua no pisa una vista previa.
export function cargarTemaTienda(tiendaId, obtenerTema) {
  tiendaActual = tiendaId || "";
  let almacenado = "claro";
  if (tiendaActual) {
    try { almacenado = localStorage.getItem(`stockly:tema:${tiendaActual}`); }
    catch { /* Usar el valor de la base de datos cuando llegue. */ }
  }
  temaGuardado = normalizarTema(almacenado);
  aplicarTema(temaGuardado);
  const solicitud = ++revision;
  let activo = true;
  if (tiendaActual) {
    Promise.resolve().then(() => obtenerTema(tiendaId)).then((tema) => {
      if (activo && solicitud === revision) guardarTema(tema);
    }).catch((error) => {
      if (activo) console.error("No se pudo cargar el tema de la tienda:", error);
    });
  }
  return () => { activo = false; };
}

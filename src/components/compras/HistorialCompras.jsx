// src/components/compras/HistorialCompras.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  PackageSearch,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  X,
} from "lucide-react";
import {
  cancelarCompra,
  obtenerDetalleCompra,
  obtenerHistorialCompras,
} from "../../services/comprasService.js";

function moneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor) || 0);
}

function fechaCompleta(valor) {
  if (!valor) return "Sin fecha";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}

function fechaParaInput(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function EstadoCompra({ estado }) {
  const cancelada = estado === "cancelada";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        cancelada
          ? "bg-red-100 text-red-700"
          : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {cancelada ? "Cancelada" : "Completada"}
    </span>
  );
}

function HistorialCompras({ onNuevaCompra }) {
  const hoy = useMemo(() => new Date(), []);
  const haceTreintaDias = useMemo(() => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30);
    return fecha;
  }, []);

  const [compras, setCompras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState(
    fechaParaInput(haceTreintaDias)
  );
  const [fechaFin, setFechaFin] = useState(fechaParaInput(hoy));
  const [estado, setEstado] = useState("todas");

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cancelandoId, setCancelandoId] = useState(null);

  const cargarCompras = useCallback(
    async (esActualizacion = false) => {
      if (esActualizacion) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      try {
        const resultado = await obtenerHistorialCompras({
          busqueda,
          fechaInicio,
          fechaFin,
          estado,
        });

        setCompras(resultado);
      } catch (err) {
        console.error(err);
        setError(
          err.message || "No fue posible cargar el historial de compras."
        );
      } finally {
        setCargando(false);
        setActualizando(false);
      }
    },
    [busqueda, fechaInicio, fechaFin, estado]
  );

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      cargarCompras();
    }, 250);

    return () => window.clearTimeout(temporizador);
  }, [cargarCompras]);

  const resumen = useMemo(() => {
    const completadas = compras.filter(
      (compra) => compra.estado !== "cancelada"
    );

    return {
      cantidad: completadas.length,
      total: completadas.reduce(
        (acumulado, compra) =>
          acumulado + Number(compra.total || 0),
        0
      ),
      unidades: completadas.reduce(
        (acumulado, compra) =>
          acumulado + Number(compra.total_unidades || 0),
        0
      ),
      canceladas: compras.filter(
        (compra) => compra.estado === "cancelada"
      ).length,
    };
  }, [compras]);

  const abrirDetalle = async (compraId) => {
    setCargandoDetalle(true);
    setError("");
    setDetalle({ id: compraId, cargando: true });

    try {
      const resultado = await obtenerDetalleCompra(compraId);
      setDetalle(resultado);
    } catch (err) {
      console.error(err);
      setDetalle(null);
      setError(
        err.message || "No fue posible consultar el detalle de la compra."
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarCancelacion = async (compra) => {
    const aceptar = window.confirm(
      `¿Cancelar la compra #${compra.folio}? ` +
        "El inventario recibido se restará automáticamente. " +
        "La operación solo será posible si todavía hay stock suficiente."
    );

    if (!aceptar) return;

    setCancelandoId(compra.id);
    setError("");
    setMensaje("");

    try {
      await cancelarCompra(compra.id);
      setMensaje(
        `La compra #${compra.folio} fue cancelada y el inventario se revirtió.`
      );

      if (detalle?.id === compra.id) {
        const actualizado = await obtenerDetalleCompra(compra.id);
        setDetalle(actualizado);
      }

      await cargarCompras(true);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "No fue posible cancelar la compra."
      );
    } finally {
      setCancelandoId(null);
    }
  };

  return (
    <section className="space-y-5 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
            Compras
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Historial de compras
          </h1>

          <p className="mt-1 text-slate-500">
            Consulta entradas de mercancía, proveedores y cancelaciones.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => cargarCompras(true)}
            disabled={actualizando}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                actualizando ? "animate-spin" : ""
              }`}
            />
            Actualizar
          </button>

          <button
            type="button"
            onClick={onNuevaCompra}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            <Truck className="h-5 w-5" />
            Nueva compra
          </button>
        </div>
      </header>

      {mensaje && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Compras completadas</p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {resumen.cantidad}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Monto invertido</p>
          <p className="mt-1 text-2xl font-black text-violet-700">
            {moneda(resumen.total)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Unidades recibidas</p>
          <p className="mt-1 text-2xl font-black text-blue-700">
            {resumen.unidades}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Compras canceladas</p>
          <p className="mt-1 text-2xl font-black text-red-700">
            {resumen.canceladas}
          </p>
        </article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_170px_170px_160px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar folio, proveedor o factura..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <label>
            <span className="sr-only">Fecha inicial</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(evento) => setFechaInicio(evento.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
            />
          </label>

          <label>
            <span className="sr-only">Fecha final</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(evento) => setFechaFin(evento.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
            />
          </label>

          <select
            value={estado}
            onChange={(evento) => setEstado(evento.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
          >
            <option value="todas">Todos los estados</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {cargando ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />
              <p className="mt-3 text-sm text-slate-500">
                Cargando compras...
              </p>
            </div>
          </div>
        ) : compras.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
            <PackageSearch className="h-10 w-10 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-600">
              No encontramos compras
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Modifica los filtros o registra una nueva compra.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[90px_1fr_160px_130px_120px_100px] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 lg:grid">
              <span>Folio</span>
              <span>Proveedor</span>
              <span>Fecha</span>
              <span className="text-right">Total</span>
              <span>Estado</span>
              <span className="text-right">Acciones</span>
            </div>

            <div className="divide-y divide-slate-100">
              {compras.map((compra) => (
                <div
                  key={compra.id}
                  className="grid gap-3 p-4 transition hover:bg-slate-50 lg:grid-cols-[90px_1fr_160px_130px_120px_100px] lg:items-center lg:gap-4"
                >
                  <div>
                    <span className="text-xs text-slate-400 lg:hidden">
                      Folio
                    </span>

                    <p className="font-black text-slate-900">
                      #{compra.folio}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">
                      {compra.proveedor || "Sin proveedor"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {compra.numero_factura
                        ? `Factura: ${compra.numero_factura}`
                        : `${compra.total_productos} productos · ${compra.total_unidades} unidades`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {fechaCompleta(compra.creado_en)}
                  </div>

                  <p className="font-black text-violet-700 lg:text-right">
                    {moneda(compra.total)}
                  </p>

                  <EstadoCompra estado={compra.estado} />

                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => abrirDetalle(compra.id)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {compra.estado !== "cancelada" && (
                      <button
                        type="button"
                        onClick={() => confirmarCancelacion(compra)}
                        disabled={cancelandoId === compra.id}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Cancelar compra"
                      >
                        {cancelandoId === compra.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => abrirDetalle(compra.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </article>

      {detalle && (
        <div className="stockly-modal fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {cargandoDetalle || detalle.cargando ? (
              <div className="flex min-h-80 items-center justify-center">
                <Loader2 className="h-9 w-9 animate-spin text-violet-600" />
              </div>
            ) : (
              <>
                <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
                      Compra #{detalle.folio}
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                      {detalle.proveedor || "Compra sin proveedor"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {fechaCompleta(detalle.creado_en)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetalle(null)}
                    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </header>

                <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Estado</p>
                    <div className="mt-2">
                      <EstadoCompra estado={detalle.estado} />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Factura</p>
                    <p className="mt-1 font-bold text-slate-800">
                      {detalle.numero_factura || "Sin factura"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-violet-50 p-3">
                    <p className="text-xs text-violet-600">Total</p>
                    <p className="mt-1 text-xl font-black text-violet-800">
                      {moneda(detalle.total)}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-900">
                    Productos recibidos
                  </h3>

                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                    <div className="hidden grid-cols-[1fr_100px_130px_130px] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:grid">
                      <span>Producto</span>
                      <span className="text-right">Cantidad</span>
                      <span className="text-right">Costo</span>
                      <span className="text-right">Subtotal</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {(detalle.productos ?? []).map((producto) => (
                        <div
                          key={producto.id}
                          className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_100px_130px_130px] sm:items-center sm:gap-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {producto.nombre_producto}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {producto.codigo_barras || "Sin código"}
                            </p>
                          </div>

                          <p className="text-sm sm:text-right">
                            <span className="text-slate-400 sm:hidden">
                              Cantidad:{" "}
                            </span>
                            {producto.cantidad}
                          </p>

                          <p className="text-sm sm:text-right">
                            <span className="text-slate-400 sm:hidden">
                              Costo:{" "}
                            </span>
                            {moneda(producto.costo_unitario)}
                          </p>

                          <p className="font-bold text-slate-800 sm:text-right">
                            <span className="font-normal text-slate-400 sm:hidden">
                              Subtotal:{" "}
                            </span>
                            {moneda(producto.subtotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {detalle.observaciones && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <FileText className="h-4 w-4" />
                        <p className="font-semibold">Observaciones</p>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {detalle.observaciones}
                      </p>
                    </div>
                  )}

                  {detalle.estado !== "cancelada" && (
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => confirmarCancelacion(detalle)}
                        disabled={cancelandoId === detalle.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        {cancelandoId === detalle.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        Cancelar compra
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default HistorialCompras;

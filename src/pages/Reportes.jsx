import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  LoaderCircle,
  PackageSearch,
  ReceiptText,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import {
  cancelarVenta,
  obtenerDetalleVenta,
  obtenerHistorialVentas,
} from "../services/ventasService";

const moneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const fechaHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

function fechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function Reportes() {
  const hoy = fechaLocal(new Date());

  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [ventaSeleccionada, setVentaSeleccionada] =
    useState(null);
  const [detalle, setDetalle] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] =
    useState(false);
  const [cancelandoId, setCancelandoId] =
    useState(null);

  useEffect(() => {
    cargarVentas();
  }, []);

  async function cargarVentas() {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerHistorialVentas({
        desde,
        hasta,
      });

      setVentas(datos);
    } catch (errorCarga) {
      console.error(errorCarga);
      setError(
        `No se pudo cargar el historial: ${errorCarga.message}`
      );
    } finally {
      setCargando(false);
    }
  }

  async function aplicarFiltros(evento) {
    evento.preventDefault();
    await cargarVentas();
  }

  async function abrirDetalle(venta) {
    try {
      setVentaSeleccionada(venta);
      setDetalle([]);
      setCargandoDetalle(true);
      setError("");

      const productos = await obtenerDetalleVenta(
        venta.id
      );

      setDetalle(productos);
    } catch (errorDetalle) {
      console.error(errorDetalle);
      setError(
        `No se pudo cargar el detalle: ${errorDetalle.message}`
      );
    } finally {
      setCargandoDetalle(false);
    }
  }

  function cerrarDetalle() {
    if (cancelandoId) {
      return;
    }

    setVentaSeleccionada(null);
    setDetalle([]);
  }

  async function manejarCancelacion(venta) {
    const confirmar = window.confirm(
      `¿Cancelar la venta #${venta.folio}? El stock será restaurado.`
    );

    if (!confirmar) {
      return;
    }

    try {
      setCancelandoId(venta.id);
      setError("");

      await cancelarVenta(venta.id);

      setVentas((actuales) =>
        actuales.map((item) =>
          item.id === venta.id
            ? { ...item, estado: "cancelada" }
            : item
        )
      );

      setVentaSeleccionada((actual) =>
        actual?.id === venta.id
          ? { ...actual, estado: "cancelada" }
          : actual
      );
    } catch (errorCancelacion) {
      console.error(errorCancelacion);
      setError(
        `No se pudo cancelar la venta: ${errorCancelacion.message}`
      );
    } finally {
      setCancelandoId(null);
    }
  }

  const ventasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return ventas;
    }

    return ventas.filter((venta) =>
      [
        venta.folio,
        venta.metodo_pago,
        venta.estado,
        venta.total,
      ]
        .join(" ")
        .toLowerCase()
        .includes(texto)
    );
  }, [ventas, busqueda]);

  const completadas = ventasFiltradas.filter(
    (venta) => venta.estado === "completada"
  );

  const totalPeriodo = completadas.reduce(
    (acumulado, venta) => acumulado + venta.total,
    0
  );

  const articulosPeriodo = completadas.reduce(
    (acumulado, venta) =>
      acumulado + venta.articulos,
    0
  );

  const utilidadDetalle = detalle.reduce(
    (acumulado, producto) =>
      acumulado + producto.utilidad,
    0
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Reportes de ventas
          </h1>
          <p className="mt-1 text-slate-500">
            Consulta ventas, productos y movimientos del inventario.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarVentas}
          disabled={cargando}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={cargando ? "animate-spin" : ""}
          />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={aplicarFiltros}
        className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[1fr_180px_180px_auto]"
      >
        <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-3">
          <Search size={19} className="text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) =>
              setBusqueda(evento.target.value)
            }
            placeholder="Buscar folio, método o estado"
            className="w-full bg-transparent py-3 outline-none"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">
            Desde
          </span>
          <input
            type="date"
            value={desde}
            onChange={(evento) =>
              setDesde(evento.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">
            Hasta
          </span>
          <input
            type="date"
            value={hasta}
            min={desde}
            onChange={(evento) =>
              setHasta(evento.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />
        </label>

        <button
          type="submit"
          disabled={cargando}
          className="self-end rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Aplicar
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <Resumen
          icono={<ReceiptText size={22} />}
          titulo="Ventas completadas"
          valor={completadas.length}
        />
        <Resumen
          icono={<CircleDollarSign size={22} />}
          titulo="Total vendido"
          valor={moneda.format(totalPeriodo)}
        />
        <Resumen
          icono={<PackageSearch size={22} />}
          titulo="Artículos vendidos"
          valor={articulosPeriodo}
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Historial
          </h2>
          <p className="text-sm text-slate-500">
            {ventasFiltradas.length} resultados
          </p>
        </div>

        {cargando ? (
          <EstadoCarga texto="Cargando ventas" />
        ) : ventasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <CalendarDays size={42} className="text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">
              No hay ventas en este periodo
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {ventasFiltradas.map((venta) => (
              <button
                key={venta.id}
                type="button"
                onClick={() => abrirDetalle(venta)}
                className="grid w-full gap-3 p-5 text-left hover:bg-slate-50 sm:grid-cols-[120px_1fr_140px_140px_30px] sm:items-center"
              >
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Folio
                  </p>
                  <p className="font-bold text-slate-900">
                    #{venta.folio}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    {fechaHora.format(new Date(venta.creado_en))}
                  </p>
                  <p className="mt-1 text-sm capitalize text-slate-500">
                    {venta.metodo_pago} · {venta.articulos} artículos
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                    venta.estado === "completada"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {venta.estado}
                </span>

                <p className="text-lg font-bold text-slate-900 sm:text-right">
                  {moneda.format(venta.total)}
                </p>

                <ChevronRight
                  size={20}
                  className="hidden text-slate-400 sm:block"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {ventaSeleccionada && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Venta #{ventaSeleccionada.folio}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {fechaHora.format(
                    new Date(ventaSeleccionada.creado_en)
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarDetalle}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <Dato titulo="Total" valor={moneda.format(ventaSeleccionada.total)} />
                <Dato titulo="Método" valor={ventaSeleccionada.metodo_pago} />
                <Dato titulo="Estado" valor={ventaSeleccionada.estado} />
              </div>

              {cargandoDetalle ? (
                <EstadoCarga texto="Cargando detalle" />
              ) : (
                <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
                  {detalle.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {producto.nombre_producto}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {producto.cantidad} × {moneda.format(producto.precio_unitario)}
                        </p>
                      </div>
                      <p className="font-bold text-slate-900">
                        {moneda.format(producto.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {!cargandoDetalle && detalle.length > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                  <span className="font-semibold text-emerald-700">
                    Utilidad estimada
                  </span>
                  <span className="text-lg font-bold text-emerald-800">
                    {moneda.format(utilidadDetalle)}
                  </span>
                </div>
              )}

              {ventaSeleccionada.estado === "completada" && (
                <button
                  type="button"
                  onClick={() => manejarCancelacion(ventaSeleccionada)}
                  disabled={cancelandoId === ventaSeleccionada.id}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  {cancelandoId === ventaSeleccionada.id ? (
                    <LoaderCircle size={19} className="animate-spin" />
                  ) : (
                    <XCircle size={19} />
                  )}
                  Cancelar venta y devolver stock
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Resumen({ icono, titulo, valor }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          {icono}
        </div>
        <div>
          <p className="text-sm text-slate-500">{titulo}</p>
          <p className="text-2xl font-bold text-slate-900">{valor}</p>
        </div>
      </div>
    </div>
  );
}

function EstadoCarga({ texto }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoaderCircle size={34} className="animate-spin text-blue-600" />
      <p className="mt-3 font-semibold text-slate-700">{texto}</p>
    </div>
  );
}

function Dato({ titulo, valor }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">
        {titulo}
      </p>
      <p className="mt-1 font-bold capitalize text-slate-900">
        {valor}
      </p>
    </div>
  );
}

export default Reportes;
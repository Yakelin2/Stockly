// src/pages/Perdidas.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Barcode,
  CalendarDays,
  CircleDollarSign,
  History,
  LoaderCircle,
  PackageSearch,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import EscanerCamara from "../components/productos/EscanerCamara";
import { obtenerProductos } from "../services/productosService.js";
import {
  cancelarPerdida,
  obtenerHistorialPerdidas,
  obtenerLotePorId,
  obtenerLotesProducto,
  registrarPerdida,
} from "../services/perdidasService.js";

const MOTIVOS = [
  { value: "caducado", label: "Caducado" },
  { value: "danado", label: "Dañado" },
  { value: "robo", label: "Robo" },
  { value: "faltante", label: "Faltante" },
  { value: "consumo_interno", label: "Consumo interno" },
  { value: "otro", label: "Otro" },
];

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

function motivoLegible(motivo) {
  return (
    MOTIVOS.find((item) => item.value === motivo)?.label ||
    motivo
  );
}

function fechaCaducidadLegible(valor) {
  if (!valor) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(new Date(`${valor}T12:00:00`));
}

function estadoLoteLegible(estado) {
  const estados = {
    caducado: "Caducado",
    caduca_hoy: "Caduca hoy",
    urgente: "Caduca pronto",
    proximo: "Próximo a caducar",
    vigente: "Vigente",
    sin_fecha: "Sin fecha",
  };

  return estados[estado] || estado;
}

function fechaParaInput(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function Perdidas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const loteDesdeDashboard = searchParams.get("lote");

  const hoy = useMemo(() => new Date(), []);
  const haceTreintaDias = useMemo(() => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30);
    return fecha;
  }, []);

  const [vista, setVista] = useState("registro");
  const [productos, setProductos] = useState([]);
  const [historial, setHistorial] = useState([]);

  const [busquedaProducto, setBusquedaProducto] =
    useState("");
  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);
  const [lotesProducto, setLotesProducto] = useState([]);
  const [loteSeleccionadoId, setLoteSeleccionadoId] =
    useState("");
  const [cargandoLotes, setCargandoLotes] =
    useState(false);
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("caducado");
  const [observaciones, setObservaciones] = useState("");

  const [busquedaHistorial, setBusquedaHistorial] =
    useState("");
  const [filtroMotivo, setFiltroMotivo] =
    useState("todos");
  const [filtroEstado, setFiltroEstado] =
    useState("todos");
  const [fechaInicio, setFechaInicio] = useState(
    fechaParaInput(haceTreintaDias)
  );
  const [fechaFin, setFechaFin] = useState(
    fechaParaInput(hoy)
  );

  const [mostrarCamara, setMostrarCamara] =
    useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cancelandoId, setCancelandoId] =
    useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarProductos = useCallback(async () => {
    const resultado = await obtenerProductos();
    setProductos(resultado);
  }, []);

  const cargarHistorial = useCallback(async () => {
    const resultado = await obtenerHistorialPerdidas({
      busqueda: busquedaHistorial,
      motivo: filtroMotivo,
      estado: filtroEstado,
      fechaInicio,
      fechaFin,
    });

    setHistorial(resultado);
  }, [
    busquedaHistorial,
    filtroMotivo,
    filtroEstado,
    fechaInicio,
    fechaFin,
  ]);

  useEffect(() => {
    async function cargarInicial() {
      try {
        setCargando(true);
        setError("");

        await Promise.all([
          cargarProductos(),
          cargarHistorial(),
        ]);
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            "No fue posible cargar el módulo de pérdidas."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarInicial();
  }, [cargarProductos, cargarHistorial]);

  useEffect(() => {
    if (
      cargando ||
      !loteDesdeDashboard ||
      productoSeleccionado
    ) {
      return;
    }

    async function prepararPerdidaCaducidad() {
      try {
        setError("");

        const lote = await obtenerLotePorId(
          loteDesdeDashboard
        );

        if (!lote) {
          setError(
            "El lote ya no está disponible o ya fue retirado."
          );
          setSearchParams({});
          return;
        }

        const producto =
          productos.find(
            (item) =>
              item.id === lote.producto_id
          ) || {
            id: lote.producto_id,
            nombre: lote.producto,
            codigo: lote.codigo_barras,
            compra: Number(lote.costo_unitario),
            stock: Number(
              lote.cantidad_disponible
            ),
            categoria: "Sin categoría",
          };

        setVista("registro");
        setMotivo("caducado");
        setObservaciones(
          `Lote caducado el ${fechaCaducidadLegible(
            lote.fecha_caducidad
          )}.`
        );

        await seleccionarProducto(
          producto,
          lote.lote_id
        );

        setCantidad(
          String(lote.cantidad_disponible)
        );
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            "No fue posible preparar la pérdida."
        );
      }
    }

    prepararPerdidaCaducidad();
  }, [
    cargando,
    loteDesdeDashboard,
    productos,
    productoSeleccionado,
    setSearchParams,
  ]);

  useEffect(() => {
    if (vista !== "historial") return undefined;

    const temporizador = window.setTimeout(() => {
      cargarHistorial().catch((err) => {
        console.error(err);
        setError(
          err.message ||
            "No fue posible actualizar el historial."
        );
      });
    }, 250);

    return () => window.clearTimeout(temporizador);
  }, [vista, cargarHistorial]);

  const productosFiltrados = useMemo(() => {
    const texto = busquedaProducto.trim().toLowerCase();

    if (!texto) return [];

    return productos
      .filter((producto) =>
        `${producto.nombre} ${producto.codigo} ${producto.categoria}`
          .toLowerCase()
          .includes(texto)
      )
      .slice(0, 8);
  }, [productos, busquedaProducto]);

  const loteSeleccionado = useMemo(
    () =>
      lotesProducto.find(
        (lote) => lote.lote_id === loteSeleccionadoId
      ) ?? null,
    [lotesProducto, loteSeleccionadoId]
  );

  const costoUnitarioPerdida = loteSeleccionado
    ? Number(loteSeleccionado.costo_unitario || 0)
    : Number(productoSeleccionado?.compra || 0);

  const costoPerdido =
    costoUnitarioPerdida * Number(cantidad || 0);

  const stockDisponiblePerdida = loteSeleccionado
    ? Number(loteSeleccionado.cantidad_disponible || 0)
    : Number(productoSeleccionado?.stock || 0);

  const resumenHistorial = useMemo(() => {
    const activas = historial.filter(
      (item) => item.estado !== "cancelada"
    );

    return {
      registros: activas.length,
      unidades: activas.reduce(
        (total, item) =>
          total + Number(item.cantidad || 0),
        0
      ),
      costo: activas.reduce(
        (total, item) =>
          total + Number(item.total_perdida || 0),
        0
      ),
      canceladas: historial.filter(
        (item) => item.estado === "cancelada"
      ).length,
    };
  }, [historial]);

  function limpiarMensajes() {
    setError("");
    setMensaje("");
  }

  async function seleccionarProducto(
    producto,
    lotePreferidoId = ""
  ) {
    setProductoSeleccionado(producto);
    setBusquedaProducto("");
    setCantidad("");
    setLoteSeleccionadoId("");
    limpiarMensajes();

    try {
      setCargandoLotes(true);

      const lotes = await obtenerLotesProducto(
        producto.id
      );

      setLotesProducto(lotes);

      const lotePreferido = lotePreferidoId
        ? lotes.find(
            (lote) =>
              lote.lote_id === lotePreferidoId
          )
        : null;

      const loteAutomatico =
        lotePreferido ||
        lotes.find(
          (lote) =>
            lote.estado_caducidad === "caducado"
        ) ||
        lotes[0] ||
        null;

      if (loteAutomatico) {
        setLoteSeleccionadoId(
          loteAutomatico.lote_id
        );

        if (
          loteAutomatico.estado_caducidad ===
          "caducado"
        ) {
          setMotivo("caducado");
          setCantidad(
            String(
              loteAutomatico.cantidad_disponible
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible cargar los lotes del producto."
      );
    } finally {
      setCargandoLotes(false);
    }
  }

  function detectarCodigo(codigo) {
    const limpio = String(codigo).trim();

    setMostrarCamara(false);

    const producto = productos.find(
      (item) =>
        String(item.codigo).trim() === limpio
    );

    if (!producto) {
      setError(
        `El código ${limpio} no pertenece a ningún producto registrado.`
      );
      return;
    }

    seleccionarProducto(producto);
  }

  async function guardarPerdida(evento) {
    evento.preventDefault();
    limpiarMensajes();

    if (!productoSeleccionado) {
      setError("Selecciona un producto.");
      return;
    }

    const cantidadNumero = Number(cantidad);

    if (
      !Number.isInteger(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      setError(
        "La cantidad debe ser un entero mayor que cero."
      );
      return;
    }

    if (
      cantidadNumero >
      stockDisponiblePerdida
    ) {
      setError(
        `Solo hay ${stockDisponiblePerdida} unidades disponibles en la selección actual.`
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Registrar una pérdida de ${cantidadNumero} unidad(es) de ${productoSeleccionado.nombre}?`
    );

    if (!confirmar) return;

    try {
      setGuardando(true);

      await registrarPerdida({
        productoId: productoSeleccionado.id,
        loteId: loteSeleccionadoId || null,
        cantidad: cantidadNumero,
        motivo,
        observaciones,
      });

      setMensaje("La pérdida se registró correctamente.");
      setProductoSeleccionado(null);
      setLotesProducto([]);
      setLoteSeleccionadoId("");
      setCantidad("");
      setMotivo("caducado");
      setObservaciones("");
      setSearchParams({});

      await Promise.all([
        cargarProductos(),
        cargarHistorial(),
      ]);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible registrar la pérdida."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCancelacion(perdida) {
    const confirmar = window.confirm(
      `¿Cancelar la pérdida de ${perdida.cantidad} unidad(es) de ${perdida.producto}? El stock será devuelto.`
    );

    if (!confirmar) return;

    try {
      setCancelandoId(perdida.id);
      limpiarMensajes();

      await cancelarPerdida(perdida.id);

      setMensaje(
        "La pérdida fue cancelada y el stock se devolvió."
      );

      await Promise.all([
        cargarProductos(),
        cargarHistorial(),
      ]);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible cancelar la pérdida."
      );
    } finally {
      setCancelandoId(null);
    }
  }

  if (cargando) {
    return (
      <section className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-red-600" />
          <p className="mt-3 text-sm text-slate-500">
            Cargando pérdidas...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 pb-10">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
            Control de inventario
          </p>

          <h1 className="mt-1 text-3xl font-black text-slate-950">
            Pérdidas y mermas
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Registra productos dañados, caducados o faltantes.
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setVista("registro")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              vista === "registro"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Registrar
          </button>

          <button
            type="button"
            onClick={() => setVista("historial")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              vista === "historial"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Historial
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
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

      {mensaje && !error && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          {mensaje}
        </div>
      )}

      {loteDesdeDashboard &&
        productoSeleccionado &&
        loteSeleccionado && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
            <p className="font-black">
              Pérdida preparada desde el Dashboard
            </p>

            <p className="mt-1 text-sm">
              Revisa físicamente el lote y confirma la cantidad. Stockly no descontará nada hasta que pulses “Registrar pérdida”.
            </p>
          </div>
        )}

      {vista === "registro" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-red-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
                  <Search className="h-5 w-5 text-slate-400" />

                  <input
                    value={busquedaProducto}
                    onChange={(evento) => {
                      setBusquedaProducto(
                        evento.target.value
                      );
                      limpiarMensajes();
                    }}
                    placeholder="Buscar por nombre o código"
                    className="w-full bg-transparent py-3.5 outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarCamara(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 font-bold text-white hover:bg-red-700"
                >
                  <Barcode className="h-5 w-5" />
                  Escanear
                </button>
              </div>
            </div>

            {busquedaProducto.trim() ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="font-black text-slate-900">
                  Resultados
                </h2>

                <div className="mt-3 space-y-2">
                  {productosFiltrados.map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() =>
                        seleccionarProducto(producto)
                      }
                      disabled={Number(producto.stock) <= 0}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3 text-left hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {producto.nombre}
                        </p>
                        <p className="text-xs text-slate-500">
                          Código: {producto.codigo}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          Stock: {producto.stock}
                        </p>
                        <p className="text-xs text-slate-500">
                          Costo: {moneda(producto.compra)}
                        </p>
                      </div>
                    </button>
                  ))}

                  {productosFiltrados.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-500">
                      No encontramos productos.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[330px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <PackageSearch className="h-12 w-12 text-slate-300" />
                <p className="mt-4 font-black text-slate-700">
                  Busca o escanea un producto
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Selecciona el artículo que deseas registrar como pérdida.
                </p>
              </div>
            )}
          </div>

          <form
            onSubmit={guardarPerdida}
            className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Registrar pérdida
                </h2>
                <p className="text-sm text-slate-500">
                  El stock se descontará automáticamente.
                </p>
              </div>
            </div>

            {productoSeleccionado ? (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">
                      {productoSeleccionado.nombre}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Stock total: {productoSeleccionado.stock}
                    </p>

                    <p className="text-sm text-slate-500">
                      Costo usado: {moneda(costoUnitarioPerdida)}
                    </p>

                    {loteSeleccionado && (
                      <p className="mt-1 text-xs font-semibold text-red-700">
                        Lote: {estadoLoteLegible(
                          loteSeleccionado.estado_caducidad
                        )} ·{" "}
                        {loteSeleccionado.fecha_caducidad
                          ? fechaCaducidadLegible(
                              loteSeleccionado.fecha_caducidad
                            )
                          : "sin fecha"}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProductoSeleccionado(null);
                      setLotesProducto([]);
                      setLoteSeleccionadoId("");
                      setCantidad("");
                      setSearchParams({});
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
                Selecciona un producto.
              </div>
            )}

            <div className="mt-5 space-y-4">
              {productoSeleccionado && (
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Lote afectado
                  </span>

                  <select
                    value={loteSeleccionadoId}
                    onChange={(evento) => {
                      setLoteSeleccionadoId(
                        evento.target.value
                      );
                      setCantidad("");
                    }}
                    disabled={cargandoLotes}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-red-500"
                  >
                    <option value="">
                      Usar selección automática FEFO
                    </option>

                    {lotesProducto.map((lote) => (
                      <option
                        key={lote.lote_id}
                        value={lote.lote_id}
                      >
                        {lote.fecha_caducidad
                          ? fechaCaducidadLegible(
                              lote.fecha_caducidad
                            )
                          : "Sin fecha"}{" "}
                        · {lote.cantidad_disponible} disponibles
                        · {estadoLoteLegible(
                          lote.estado_caducidad
                        )}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1 text-xs text-slate-500">
                    Stock disponible en esta selección:{" "}
                    {stockDisponiblePerdida}
                  </p>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Cantidad
                </span>

                <input
                  type="number"
                  min="1"
                  max={
                    productoSeleccionado
                      ? stockDisponiblePerdida
                      : undefined
                  }
                  value={cantidad}
                  placeholder="Escribe la cantidad"
                  onChange={(evento) =>
                    setCantidad(evento.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Motivo
                </span>

                <select
                  value={motivo}
                  onChange={(evento) =>
                    setMotivo(evento.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-red-500"
                >
                  {MOTIVOS.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Observaciones
                </span>

                <textarea
                  value={observaciones}
                  onChange={(evento) =>
                    setObservaciones(evento.target.value)
                  }
                  rows="3"
                  placeholder="Información adicional..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </label>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-900 p-4 text-white">
              <p className="text-sm text-slate-300">
                Costo estimado de la pérdida
              </p>
              <p className="mt-1 text-3xl font-black">
                {moneda(costoPerdido)}
              </p>
            </div>

            <button
              type="submit"
              disabled={
                !productoSeleccionado || guardando
              }
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Registrar pérdida
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Registros activos
              </p>
              <p className="mt-1 text-2xl font-black">
                {resumenHistorial.registros}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Unidades perdidas
              </p>
              <p className="mt-1 text-2xl font-black text-red-700">
                {resumenHistorial.unidades}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Costo perdido
              </p>
              <p className="mt-1 text-2xl font-black text-red-700">
                {moneda(resumenHistorial.costo)}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Canceladas
              </p>
              <p className="mt-1 text-2xl font-black text-slate-700">
                {resumenHistorial.canceladas}
              </p>
            </article>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_170px_170px_150px_150px]">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={busquedaHistorial}
                onChange={(evento) =>
                  setBusquedaHistorial(
                    evento.target.value
                  )
                }
                placeholder="Producto o código..."
                className="w-full py-2.5 outline-none"
              />
            </div>

            <input
              type="date"
              value={fechaInicio}
              onChange={(evento) =>
                setFechaInicio(evento.target.value)
              }
              className="rounded-xl border border-slate-200 px-3 py-2.5"
            />

            <input
              type="date"
              value={fechaFin}
              onChange={(evento) =>
                setFechaFin(evento.target.value)
              }
              className="rounded-xl border border-slate-200 px-3 py-2.5"
            />

            <select
              value={filtroMotivo}
              onChange={(evento) =>
                setFiltroMotivo(evento.target.value)
              }
              className="rounded-xl border border-slate-200 px-3 py-2.5"
            >
              <option value="todos">Todos los motivos</option>
              {MOTIVOS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(evento) =>
                setFiltroEstado(evento.target.value)
              }
              className="rounded-xl border border-slate-200 px-3 py-2.5"
            >
              <option value="todos">Todos los estados</option>
              <option value="registrada">Registradas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {historial.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <History className="h-10 w-10 text-slate-300" />
                <p className="mt-3 font-bold text-slate-600">
                  No hay pérdidas registradas
                </p>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[1fr_100px_130px_130px_140px_100px] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 lg:grid">
                  <span>Producto</span>
                  <span>Cantidad</span>
                  <span>Motivo</span>
                  <span>Total</span>
                  <span>Fecha</span>
                  <span>Acciones</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {historial.map((perdida) => (
                    <div
                      key={perdida.id}
                      className="grid gap-3 p-4 lg:grid-cols-[1fr_100px_130px_130px_140px_100px] lg:items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {perdida.producto}
                        </p>
                        <p className="text-xs text-slate-500">
                          {perdida.codigo_barras}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {perdida.observaciones || "Sin observaciones"}
                        </p>
                      </div>

                      <p className="font-bold">
                        {perdida.cantidad}
                      </p>

                      <span className="text-sm font-semibold text-slate-700">
                        {motivoLegible(perdida.motivo)}
                      </span>

                      <p className="font-black text-red-700">
                        {moneda(perdida.total_perdida)}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        {fechaCompleta(perdida.creado_en)}
                      </div>

                      <div>
                        {perdida.estado === "cancelada" ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                            Cancelada
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              manejarCancelacion(perdida)
                            }
                            disabled={
                              cancelandoId === perdida.id
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Cancelar pérdida"
                          >
                            {cancelandoId === perdida.id ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <EscanerCamara
        abierto={mostrarCamara}
        onCerrar={() => setMostrarCamara(false)}
        onDetectar={detectarCodigo}
      />
    </section>
  );
}

export default Perdidas;
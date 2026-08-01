import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Barcode,
  LoaderCircle,
  Minus,
  PackageSearch,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import EscanerCamara from "../components/productos/EscanerCamara";
import { obtenerProductos } from "../services/productosService";
import { registrarVenta } from "../services/ventasService.js";

function Ventas() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarCamara, setMostrarCamara] =
    useState(false);

  const [metodoPago, setMetodoPago] =
    useState("efectivo");

  const [montoRecibido, setMontoRecibido] =
    useState("");

  const [procesandoVenta, setProcesandoVenta] =
    useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    const codigoLimpio = busqueda.trim();

    if (!codigoLimpio || cargando) {
      return undefined;
    }

    const productoEncontrado = productos.find(
      (producto) =>
        String(producto.codigo).trim() ===
        codigoLimpio
    );

    if (!productoEncontrado) {
      return undefined;
    }

    const temporizador = window.setTimeout(() => {
      agregarProducto(productoEncontrado);
      setBusqueda("");
    }, 150);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [busqueda, productos, cargando]);

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      const productosGuardados =
        await obtenerProductos();

      setProductos(productosGuardados);

      setCarrito((carritoActual) =>
        carritoActual
          .map((productoCarrito) => {
            const productoActualizado =
              productosGuardados.find(
                (producto) =>
                  producto.id === productoCarrito.id
              );

            if (!productoActualizado) {
              return null;
            }

            const stockActual = Number(
              productoActualizado.stock
            );

            if (stockActual <= 0) {
              return null;
            }

            return {
              ...productoActualizado,
              cantidad: Math.min(
                Number(productoCarrito.cantidad),
                stockActual
              ),
            };
          })
          .filter(Boolean)
      );
    } catch (errorDeCarga) {
      console.error(
        "Error al cargar productos para venta:",
        errorDeCarga
      );

      setError(
        `No se pudieron cargar los productos: ${errorDeCarga.message}`
      );
    } finally {
      setCargando(false);
    }
  }

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return [];
    }

    return productos
      .filter((producto) =>
        `${producto.nombre} ${producto.codigo} ${producto.categoria}`
          .toLowerCase()
          .includes(texto)
      )
      .slice(0, 8);
  }, [busqueda, productos]);

  const cantidadArticulos = carrito.reduce(
    (totalActual, producto) =>
      totalActual + Number(producto.cantidad),
    0
  );

  const total = carrito.reduce(
    (acumulado, producto) =>
      acumulado +
      Number(producto.venta) *
        Number(producto.cantidad),
    0
  );

  const cambio =
    metodoPago === "efectivo" &&
    Number(montoRecibido) >= total
      ? Number(montoRecibido) - total
      : 0;

  function limpiarMensajes() {
    setError("");
    setMensaje("");
  }

  function agregarProducto(producto) {
    limpiarMensajes();

    const stockDisponible = Number(producto.stock);

    if (stockDisponible <= 0) {
      setError(
        `${producto.nombre} está agotado y no puede agregarse a la venta.`
      );
      return;
    }

    const productoExistente = carrito.find(
      (item) => item.id === producto.id
    );

    if (
      productoExistente &&
      Number(productoExistente.cantidad) >=
        stockDisponible
    ) {
      setError(
        `Solo hay ${stockDisponible} unidades disponibles de ${producto.nombre}.`
      );
      return;
    }

    if (productoExistente) {
      setCarrito((carritoActual) =>
        carritoActual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad:
                  Number(item.cantidad) + 1,
              }
            : item
        )
      );
    } else {
      setCarrito((carritoActual) => [
        ...carritoActual,
        {
          ...producto,
          cantidad: 1,
        },
      ]);
    }

    setMensaje(
      `${producto.nombre} se agregó al carrito.`
    );
  }

  function cambiarCantidad(id, cambio) {
    limpiarMensajes();

    const productoActual = carrito.find(
      (producto) => producto.id === id
    );

    if (!productoActual) {
      return;
    }

    const stockDisponible = Number(
      productoActual.stock
    );

    const nuevaCantidad =
      Number(productoActual.cantidad) + cambio;

    if (nuevaCantidad > stockDisponible) {
      setError(
        `Solo hay ${stockDisponible} unidades disponibles de ${productoActual.nombre}.`
      );
      return;
    }

    if (nuevaCantidad <= 0) {
      setCarrito((carritoActual) =>
        carritoActual.filter(
          (producto) => producto.id !== id
        )
      );
      return;
    }

    setCarrito((carritoActual) =>
      carritoActual.map((producto) =>
        producto.id === id
          ? {
              ...producto,
              cantidad: nuevaCantidad,
            }
          : producto
      )
    );
  }

  function eliminarProducto(id) {
    limpiarMensajes();

    setCarrito((carritoActual) =>
      carritoActual.filter(
        (producto) => producto.id !== id
      )
    );
  }

  function cancelarVenta() {
    if (carrito.length === 0) {
      return;
    }

    const confirmar = window.confirm(
      "¿Deseas cancelar la venta y vaciar el carrito?"
    );

    if (!confirmar) {
      return;
    }

    setCarrito([]);
    setBusqueda("");
    limpiarMensajes();
  }

  function abrirCamara() {
    limpiarMensajes();
    setMostrarCamara(true);
  }

  function cerrarCamara() {
    setMostrarCamara(false);
  }

  function detectarCodigoDesdeCamara(codigo) {
    const codigoLimpio = String(codigo).trim();

    setMostrarCamara(false);
    limpiarMensajes();

    const productoEncontrado = productos.find(
      (producto) =>
        String(producto.codigo).trim() ===
        codigoLimpio
    );

    if (!productoEncontrado) {
      setError(
        `El código ${codigoLimpio} no pertenece a ningún producto registrado.`
      );
      return;
    }

    agregarProducto(productoEncontrado);
    setBusqueda("");
  }

  function buscarPorCodigoConEnter(evento) {
    if (evento.key !== "Enter") {
      return;
    }

    evento.preventDefault();

    const codigoLimpio = busqueda.trim();

    if (!codigoLimpio) {
      return;
    }

    const productoEncontrado = productos.find(
      (producto) =>
        String(producto.codigo).trim() ===
        codigoLimpio
    );

    if (!productoEncontrado) {
      setError(
        `El código ${codigoLimpio} no pertenece a ningún producto registrado.`
      );
      return;
    }

    agregarProducto(productoEncontrado);
    setBusqueda("");
  }

  async function cobrarVenta() {
    limpiarMensajes();

    if (carrito.length === 0) {
      setError(
        "Agrega al menos un producto antes de cobrar."
      );
      return;
    }

    if (
      metodoPago === "efectivo" &&
      (!montoRecibido ||
        Number(montoRecibido) < total)
    ) {
      setError(
        "El monto recibido debe ser igual o mayor al total."
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmar venta por ${total.toLocaleString(
        "es-MX",
        {
          style: "currency",
          currency: "MXN",
        }
      )}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setProcesandoVenta(true);

      const ventaId = await registrarVenta({
        carrito,
        metodoPago,
        montoRecibido,
      });

      setCarrito([]);
      setBusqueda("");
      setMontoRecibido("");

      await cargarProductos();

      setMensaje(
        `Venta registrada correctamente. Folio interno: ${ventaId}`
      );
    } catch (errorDeVenta) {
      console.error(
        "Error al registrar la venta:",
        errorDeVenta
      );

      setError(
        `No se pudo registrar la venta: ${errorDeVenta.message}`
      );

      /*
       * Recargamos el inventario porque el servidor es la
       * fuente real de stock. Así evitamos que la pantalla
       * conserve cantidades desactualizadas.
       */
      await cargarProductos();
    } finally {
      setProcesandoVenta(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Punto de venta
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            Ventas
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Busca, escanea y cobra productos en una sola pantalla.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarProductos}
          disabled={cargando}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={cargando ? "animate-spin" : ""}
          />
          Actualizar inventario
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm"
        >
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      {mensaje && !error && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm"
        >
          {mensaje}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                <Search
                  size={20}
                  className="shrink-0 text-slate-400"
                />

                <input
                  type="search"
                  value={busqueda}
                  onChange={(evento) => {
                    setBusqueda(evento.target.value);
                    limpiarMensajes();
                  }}
                  onKeyDown={buscarPorCodigoConEnter}
                  placeholder="Buscar por nombre o código"
                  autoComplete="off"
                  className="w-full bg-transparent py-3.5 text-slate-800 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={abrirCamara}
                disabled={cargando}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Barcode size={20} />
                Escanear
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Con un lector USB, coloca el cursor en el buscador y escanea el producto.
            </p>
          </div>

          {busqueda.trim() ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Resultados de búsqueda
                  </h2>
                  <p className="text-sm text-slate-500">
                    Selecciona un producto para agregarlo.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {productosFiltrados.length}
                </span>
              </div>

              {cargando ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <LoaderCircle size={32} className="animate-spin text-blue-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Buscando productos...
                  </p>
                </div>
              ) : productosFiltrados.length > 0 ? (
                <div className="space-y-2">
                  {productosFiltrados.map((producto) => {
                    const agotado = Number(producto.stock) <= 0;
                    const stockBajo =
                      !agotado &&
                      Number(producto.stock) <= Number(producto.minimo);

                    return (
                      <button
                        key={producto.id}
                        type="button"
                        onClick={() => {
                          agregarProducto(producto);
                          setBusqueda("");
                        }}
                        disabled={agotado}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {producto.imagen ? (
                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <PackageSearch size={20} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {producto.nombre}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              Código: {producto.codigo}
                            </p>
                            <p
                              className={`mt-0.5 text-xs font-semibold ${
                                agotado
                                  ? "text-red-600"
                                  : stockBajo
                                    ? "text-amber-600"
                                    : "text-slate-500"
                              }`}
                            >
                              {agotado
                                ? "Producto agotado"
                                : `Stock: ${producto.stock}`}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-black text-blue-700">
                            {Number(producto.venta).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })}
                          </p>

                          <span
                            className={`mt-1 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold ${
                              agotado
                                ? "bg-slate-200 text-slate-500"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            <Plus size={14} />
                            {agotado ? "Agotado" : "Agregar"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center">
                  <PackageSearch size={36} className="text-slate-300" />
                  <p className="mt-3 font-bold text-slate-700">
                    No encontramos productos
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Prueba con otro nombre o código.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <PackageSearch size={30} />
              </div>

              <p className="mt-4 text-lg font-black text-slate-800">
                Busca o escanea un producto
              </p>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Los resultados aparecerán aquí cuando escribas un nombre,
                un código o utilices el escáner.
              </p>
            </div>
          )}
        </div>

        <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-600">
                <ShoppingCart size={22} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Carrito
                </h2>

                <p className="text-sm text-slate-500">
                  {carrito.length}{" "}
                  {carrito.length === 1 ? "producto" : "productos"} ·{" "}
                  {cantidadArticulos}{" "}
                  {cantidadArticulos === 1 ? "unidad" : "unidades"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cancelarVenta}
              disabled={carrito.length === 0 || procesandoVenta}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={16} />
              Vaciar
            </button>
          </div>

          <div className="max-h-[390px] space-y-3 overflow-y-auto bg-slate-50/70 p-4">
            {carrito.map((producto) => (
              <article
                key={producto.id}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[52px_minmax(0,1fr)_auto_auto_auto] md:items-center"
              >
                {producto.imagen ? (
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <PackageSearch size={20} />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {producto.nombre}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {Number(producto.venta).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })}{" "}
                    c/u
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Stock: {producto.stock}
                  </p>
                </div>

                <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(producto.id, -1)}
                    className="px-3 py-2.5 text-slate-600 transition hover:bg-slate-100"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={15} />
                  </button>

                  <span className="min-w-10 border-x border-slate-200 px-3 py-2 text-center font-black text-slate-900">
                    {producto.cantidad}
                  </span>

                  <button
                    type="button"
                    onClick={() => cambiarCantidad(producto.id, 1)}
                    disabled={
                      Number(producto.cantidad) >= Number(producto.stock)
                    }
                    className="px-3 py-2.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => eliminarProducto(producto.id)}
                  className="rounded-xl p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Eliminar ${producto.nombre}`}
                >
                  <Trash2 size={18} />
                </button>

                <div className="min-w-[92px] text-right">
                  <p className="text-xs text-slate-400">
                    Subtotal
                  </p>

                  <p className="text-lg font-black text-slate-950">
                    {(
                      Number(producto.venta) *
                      Number(producto.cantidad)
                    ).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })}
                  </p>
                </div>
              </article>
            ))}

            {carrito.length === 0 && (
              <div className="flex min-h-44 flex-col items-center justify-center px-4 text-center">
                <ShoppingCart size={40} className="text-slate-300" />
                <p className="mt-3 font-bold text-slate-700">
                  Carrito vacío
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Busca o escanea un producto para comenzar.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Resumen de pago
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-600">
                  Método de pago
                </span>

                <select
                  value={metodoPago}
                  onChange={(evento) => {
                    setMetodoPago(evento.target.value);
                    setMontoRecibido("");
                    limpiarMensajes();
                  }}
                  disabled={procesandoVenta}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
              </label>

              {metodoPago === "efectivo" ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-600">
                    Monto recibido
                  </span>

                  <input
                    type="number"
                    value={montoRecibido}
                    onChange={(evento) => {
                      setMontoRecibido(evento.target.value);
                      limpiarMensajes();
                    }}
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    disabled={procesandoVenta}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  />
                </label>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-700">
                  Cambio
                </p>

                <p className="mt-1 text-2xl font-black text-emerald-800">
                  {(
                    metodoPago === "efectivo" &&
                    Number(montoRecibido) >= total
                      ? cambio
                      : 0
                  ).toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-700">
                  Total a cobrar
                </p>

                <p className="mt-1 text-2xl font-black text-blue-800">
                  {total.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <button
                type="button"
                onClick={cancelarVenta}
                disabled={carrito.length === 0 || procesandoVenta}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vaciar carrito
              </button>

              <button
                type="button"
                onClick={cobrarVenta}
                disabled={
                  carrito.length === 0 ||
                  procesandoVenta ||
                  (metodoPago === "efectivo" &&
                    (!montoRecibido || Number(montoRecibido) < total))
                }
                className="rounded-xl bg-emerald-600 px-4 py-3.5 font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {procesandoVenta ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Registrando...
                  </span>
                ) : (
                  `Cobrar ${total.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}`
                )}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <EscanerCamara
        abierto={mostrarCamara}
        onCerrar={cerrarCamara}
        onDetectar={detectarCodigoDesdeCamara}
      />
    </section>
  );
}

export default Ventas;
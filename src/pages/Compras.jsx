// src/pages/Compras.jsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  CheckCircle2,
  History,
  Loader2,
  Minus,
  PackagePlus,
  Plus,
  Save,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  crearProveedor,
  obtenerProductosCompra,
  obtenerProveedores,
  registrarCompra,
} from "../services/comprasService.js";
import HistorialCompras from "../components/compras/HistorialCompras.jsx";

const PROVEEDOR_INICIAL = {
  nombre: "",
  telefono: "",
  correo: "",
  direccion: "",
  notas: "",
};

function moneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor) || 0);
}

function textoProducto(producto) {
  return [
    producto.nombre,
    producto.codigo_barras,
    producto.codigo,
    producto.marca,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function costoProducto(producto) {
  return Number(
    producto.precio_compra ??
      producto.costo ??
      producto.costo_compra ??
      0
  );
}

function imagenProducto(producto) {
  return (
    producto.imagen_url ??
    producto.imagen ??
    producto.url_imagen ??
    null
  );
}

function Compras() {
  const [vista, setVista] = useState("registro");
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [carrito, setCarrito] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalProveedor, setModalProveedor] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState(PROVEEDOR_INICIAL);
  const [guardandoProveedor, setGuardandoProveedor] = useState(false);

  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [iniciandoCamara, setIniciandoCamara] = useState(false);

  const html5QrCodeRef = useRef(null);
  const bufferUsbRef = useRef("");
  const ultimoTeclazoRef = useRef(0);
  const timeoutUsbRef = useRef(null);
  const busquedaRef = useRef(null);

  const limpiarMensajes = useCallback(() => {
    setMensaje("");
    setError("");
  }, []);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    limpiarMensajes();

    try {
      const [productosData, proveedoresData] = await Promise.all([
        obtenerProductosCompra(),
        obtenerProveedores(),
      ]);

      setProductos(productosData);
      setProveedores(proveedoresData);
    } catch (err) {
      console.error(err);
      setError(err.message || "No fue posible cargar el módulo de compras.");
    } finally {
      setCargando(false);
    }
  }, [limpiarMensajes]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return productos.slice(0, 18);

    return productos
      .filter((producto) => textoProducto(producto).includes(termino))
      .slice(0, 30);
  }, [busqueda, productos]);

  const total = useMemo(
    () =>
      carrito.reduce(
        (acumulado, item) =>
          acumulado + Number(item.cantidad) * Number(item.costoUnitario),
        0
      ),
    [carrito]
  );

  const totalUnidades = useMemo(
    () =>
      carrito.reduce(
        (acumulado, item) => acumulado + Number(item.cantidad),
        0
      ),
    [carrito]
  );

  const agregarProducto = useCallback((producto) => {
    limpiarMensajes();

    setCarrito((actual) => {
      const existente = actual.find(
        (item) => item.productoId === producto.id
      );

      if (existente) {
        return actual.map((item) =>
          item.productoId === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...actual,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          codigoBarras:
            producto.codigo_barras ?? producto.codigo ?? "",
          stockActual: Number(producto.stock) || 0,
          cantidad: 1,
          costoUnitario: costoProducto(producto),
          imagen: imagenProducto(producto),
        },
      ];
    });

    setBusqueda("");
    window.setTimeout(() => busquedaRef.current?.focus(), 0);
  }, [limpiarMensajes]);

  const procesarCodigo = useCallback(
    (codigo) => {
      const limpio = String(codigo ?? "").trim();

      if (!limpio) return false;

      const producto = productos.find(
        (item) =>
          String(item.codigo_barras ?? item.codigo ?? "").trim() === limpio
      );

      if (!producto) {
        setError(`No se encontró un producto con el código ${limpio}.`);
        setMensaje("");
        setBusqueda(limpio);
        return false;
      }

      agregarProducto(producto);
      setMensaje(`${producto.nombre} agregado a la compra.`);
      return true;
    },
    [agregarProducto, productos]
  );

  useEffect(() => {
    const manejarTeclado = (evento) => {
      const elemento = document.activeElement;
      const tipo = elemento?.tagName?.toLowerCase();
      const escribiendo =
        tipo === "input" ||
        tipo === "textarea" ||
        tipo === "select" ||
        elemento?.isContentEditable;

      if (escribiendo && elemento !== busquedaRef.current) return;

      const ahora = Date.now();
      const diferencia = ahora - ultimoTeclazoRef.current;
      ultimoTeclazoRef.current = ahora;

      if (diferencia > 100) {
        bufferUsbRef.current = "";
      }

      if (evento.key === "Enter") {
        if (bufferUsbRef.current.length >= 4) {
          evento.preventDefault();
          procesarCodigo(bufferUsbRef.current);
        }
        bufferUsbRef.current = "";
        return;
      }

      if (evento.key.length !== 1) return;

      bufferUsbRef.current += evento.key;

      window.clearTimeout(timeoutUsbRef.current);
      timeoutUsbRef.current = window.setTimeout(() => {
        const codigo = bufferUsbRef.current;
        bufferUsbRef.current = "";

        if (codigo.length >= 6) {
          procesarCodigo(codigo);
        }
      }, 90);
    };

    window.addEventListener("keydown", manejarTeclado);

    return () => {
      window.removeEventListener("keydown", manejarTeclado);
      window.clearTimeout(timeoutUsbRef.current);
    };
  }, [procesarCodigo]);

  const cambiarCantidad = (productoId, cantidad) => {
    const numero = Math.max(1, Math.trunc(Number(cantidad) || 1));

    setCarrito((actual) =>
      actual.map((item) =>
        item.productoId === productoId
          ? { ...item, cantidad: numero }
          : item
      )
    );
  };

  const cambiarCosto = (productoId, costo) => {
    const numero = Math.max(0, Number(costo) || 0);

    setCarrito((actual) =>
      actual.map((item) =>
        item.productoId === productoId
          ? { ...item, costoUnitario: numero }
          : item
      )
    );
  };

  const quitarProducto = (productoId) => {
    setCarrito((actual) =>
      actual.filter((item) => item.productoId !== productoId)
    );
  };

  const guardarProveedor = async (evento) => {
    evento.preventDefault();
    limpiarMensajes();

    if (!nuevoProveedor.nombre.trim()) {
      setError("Escribe el nombre del proveedor.");
      return;
    }

    setGuardandoProveedor(true);

    try {
      const creado = await crearProveedor(nuevoProveedor);

      setProveedores((actual) =>
        [...actual, creado].sort((a, b) =>
          a.nombre.localeCompare(b.nombre, "es")
        )
      );
      setProveedorId(creado.id);
      setNuevoProveedor(PROVEEDOR_INICIAL);
      setModalProveedor(false);
      setMensaje(`Proveedor ${creado.nombre} registrado correctamente.`);
    } catch (err) {
      console.error(err);
      setError(err.message || "No fue posible registrar el proveedor.");
    } finally {
      setGuardandoProveedor(false);
    }
  };

  const cerrarCamara = useCallback(async () => {
    const lector = html5QrCodeRef.current;

    if (lector) {
      try {
        if (lector.isScanning) {
          await lector.stop();
        }
        await lector.clear();
      } catch (err) {
        console.warn("No fue posible cerrar limpiamente la cámara:", err);
      }
    }

    html5QrCodeRef.current = null;
    setCamaraAbierta(false);
    setIniciandoCamara(false);
  }, []);

  useEffect(() => {
    return () => {
      const lector = html5QrCodeRef.current;
      if (lector?.isScanning) {
        lector.stop().catch(() => {});
      }
    };
  }, []);

  const abrirCamara = async () => {
    limpiarMensajes();
    setCamaraAbierta(true);
    setIniciandoCamara(true);

    await new Promise((resolve) => window.setTimeout(resolve, 100));

    try {
      const lector = new Html5Qrcode("lector-compras");
      html5QrCodeRef.current = lector;

      const camaras = await Html5Qrcode.getCameras();

      if (!camaras.length) {
        throw new Error("No se encontró ninguna cámara disponible.");
      }

      const camaraTrasera =
        camaras.find((camara) =>
          /back|rear|environment|trasera/i.test(camara.label)
        ) ?? camaras[camaras.length - 1];

      await lector.start(
        camaraTrasera.id,
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.777,
        },
        async (codigo) => {
          const encontrado = procesarCodigo(codigo);

          if (encontrado) {
            await cerrarCamara();
          }
        },
        () => {}
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible iniciar la cámara. Revisa los permisos del navegador."
      );
      await cerrarCamara();
    } finally {
      setIniciandoCamara(false);
    }
  };

  const guardarCompra = async () => {
    limpiarMensajes();

    if (carrito.length === 0) {
      setError("Agrega al menos un producto.");
      return;
    }

    const tieneCostoInvalido = carrito.some(
      (item) =>
        !Number.isFinite(Number(item.costoUnitario)) ||
        Number(item.costoUnitario) < 0
    );

    if (tieneCostoInvalido) {
      setError("Revisa los costos unitarios.");
      return;
    }

    setGuardando(true);

    try {
      const compraId = await registrarCompra({
        proveedorId: proveedorId || null,
        numeroFactura,
        observaciones,
        productos: carrito,
      });

      setCarrito([]);
      setProveedorId("");
      setNumeroFactura("");
      setObservaciones("");
      setBusqueda("");
      setMensaje(
        `Compra registrada correctamente. Folio interno: ${compraId}`
      );

      const productosActualizados = await obtenerProductosCompra();
      setProductos(productosActualizados);
    } catch (err) {
      console.error(err);
      setError(err.message || "No fue posible registrar la compra.");
    } finally {
      setGuardando(false);
    }
  };

  if (vista === "historial") {
    return (
      <HistorialCompras
        onNuevaCompra={() => setVista("registro")}
      />
    );
  }

  if (cargando) {
    return (
      <section className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-emerald-600" />
          <p className="mt-3 text-sm text-slate-500">
            Cargando productos y proveedores...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Inventario
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Registrar compra
          </h1>
          <p className="mt-1 text-slate-500">
            Recibe mercancía y aumenta el stock automáticamente.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setVista("historial")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <History className="h-5 w-5" />
            Ver historial
          </button>

          <button
            type="button"
            onClick={() => setModalProveedor(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            <Truck className="h-5 w-5" />
            Nuevo proveedor
          </button>
        </div>
      </header>

      {mensaje && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{mensaje}</p>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-100"
            aria-label="Cerrar error"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(380px,0.8fr)]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={busquedaRef}
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" && busqueda.trim()) {
                      const exacto = productos.find(
                        (producto) =>
                          String(
                            producto.codigo_barras ??
                              producto.codigo ??
                              ""
                          ).trim() === busqueda.trim()
                      );

                      if (exacto) {
                        evento.preventDefault();
                        agregarProducto(exacto);
                      }
                    }
                  }}
                  placeholder="Buscar por nombre o escanear código..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <button
                type="button"
                onClick={abrirCamara}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <Camera className="h-5 w-5" />
                Escanear
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              El lector USB funciona automáticamente, incluso sin presionar Enter.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {productosFiltrados.map((producto) => {
              const imagen = imagenProducto(producto);
              const codigo =
                producto.codigo_barras ?? producto.codigo ?? "Sin código";

              return (
                <button
                  type="button"
                  key={producto.id}
                  onClick={() => agregarProducto(producto)}
                  className="group flex min-h-28 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {imagen ? (
                      <img
                        src={imagen}
                        alt={producto.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PackagePlus className="h-7 w-7 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="line-clamp-2 font-semibold text-slate-800 group-hover:text-emerald-700">
                      {producto.nombre}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {codigo}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      Costo: {moneda(costoProducto(producto))}
                    </p>
                    <p className="text-xs text-slate-500">
                      Stock actual: {Number(producto.stock) || 0}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Search className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 font-medium text-slate-600">
                No encontramos productos.
              </p>
              <p className="text-sm text-slate-400">
                Revisa el nombre o el código de barras.
              </p>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-5">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-bold text-slate-900">
              Resumen de compra
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {carrito.length} productos · {totalUnidades} unidades
            </p>
          </div>

          <div className="space-y-4 p-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Proveedor
              </span>
              <select
                value={proveedorId}
                onChange={(evento) => setProveedorId(evento.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Número de factura
              </span>
              <input
                value={numeroFactura}
                onChange={(evento) => setNumeroFactura(evento.target.value)}
                placeholder="Opcional"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto border-y border-slate-100 p-5">
            {carrito.length === 0 ? (
              <div className="py-10 text-center">
                <PackagePlus className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-medium text-slate-600">
                  La compra está vacía
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Selecciona o escanea un producto.
                </p>
              </div>
            ) : (
              carrito.map((item) => (
                <article
                  key={item.productoId}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <PackagePlus className="h-5 w-5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">
                        {item.nombre}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {item.codigoBarras || "Sin código"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => quitarProducto(item.productoId)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Quitar ${item.nombre}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-[1fr_1fr] gap-3">
                    <div>
                      <span className="mb-1 block text-xs font-medium text-slate-500">
                        Cantidad
                      </span>
                      <div className="flex overflow-hidden rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            cambiarCantidad(
                              item.productoId,
                              item.cantidad - 1
                            )
                          }
                          className="px-2 hover:bg-slate-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.cantidad}
                          onChange={(evento) =>
                            cambiarCantidad(
                              item.productoId,
                              evento.target.value
                            )
                          }
                          className="min-w-0 flex-1 border-x border-slate-200 px-2 py-2 text-center outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            cambiarCantidad(
                              item.productoId,
                              item.cantidad + 1
                            )
                          }
                          className="px-2 hover:bg-slate-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <label>
                      <span className="mb-1 block text-xs font-medium text-slate-500">
                        Costo unitario
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.costoUnitario}
                        onChange={(evento) =>
                          cambiarCosto(
                            item.productoId,
                            evento.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-right outline-none focus:border-emerald-500"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-800">
                      {moneda(item.cantidad * item.costoUnitario)}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="space-y-4 p-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Observaciones
              </span>
              <textarea
                value={observaciones}
                onChange={(evento) => setObservaciones(evento.target.value)}
                rows="2"
                placeholder="Opcional"
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <div className="flex items-end justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-500">Total de compra</p>
                <p className="text-2xl font-black text-slate-900">
                  {moneda(total)}
                </p>
              </div>
              <p className="text-right text-xs text-slate-400">
                El stock aumentará
                <br />
                al confirmar
              </p>
            </div>

            <button
              type="button"
              onClick={guardarCompra}
              disabled={guardando || carrito.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {guardando ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {guardando ? "Registrando..." : "Registrar compra"}
            </button>
          </div>
        </aside>
      </div>

      {modalProveedor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={guardarProveedor}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Nuevo proveedor
                </h2>
                <p className="text-sm text-slate-500">
                  Quedará seleccionado al guardarlo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalProveedor(false)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nombre *
                </span>
                <input
                  autoFocus
                  value={nuevoProveedor.nombre}
                  onChange={(evento) =>
                    setNuevoProveedor((actual) => ({
                      ...actual,
                      nombre: evento.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Teléfono
                </span>
                <input
                  value={nuevoProveedor.telefono}
                  onChange={(evento) =>
                    setNuevoProveedor((actual) => ({
                      ...actual,
                      telefono: evento.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Correo
                </span>
                <input
                  type="email"
                  value={nuevoProveedor.correo}
                  onChange={(evento) =>
                    setNuevoProveedor((actual) => ({
                      ...actual,
                      correo: evento.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Dirección
                </span>
                <input
                  value={nuevoProveedor.direccion}
                  onChange={(evento) =>
                    setNuevoProveedor((actual) => ({
                      ...actual,
                      direccion: evento.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Notas
                </span>
                <textarea
                  rows="3"
                  value={nuevoProveedor.notas}
                  onChange={(evento) =>
                    setNuevoProveedor((actual) => ({
                      ...actual,
                      notas: evento.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
              <button
                type="button"
                onClick={() => setModalProveedor(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoProveedor}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
              >
                {guardandoProveedor && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Guardar proveedor
              </button>
            </div>
          </form>
        </div>
      )}

      {camaraAbierta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  Escanear producto
                </h2>
                <p className="text-sm text-slate-500">
                  Coloca el código dentro del recuadro.
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarCamara}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative min-h-72 bg-slate-900 p-3">
              <div id="lector-compras" className="overflow-hidden rounded-xl" />
              {iniciandoCamara && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="text-center text-white">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-3 text-sm">Iniciando cámara...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Compras;

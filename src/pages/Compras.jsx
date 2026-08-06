// src/pages/Compras.jsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Barcode,
  CalendarClock,
  ChevronDown,
  Camera,
  CheckCircle2,
  History,
  Loader2,
  Minus,
  MoreVertical,
  PackagePlus,
  ShoppingCart,
  Plus,
  Link2,
  AlertTriangle,
  Save,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  asociarCodigoProducto,
  buscarProductoPorCodigo,
  crearProveedor,
  desactivarProductoCompra,
  obtenerProductosCompra,
  obtenerProveedores,
  registrarCompra,
} from "../services/comprasService.js";
import HistorialCompras from "../components/compras/HistorialCompras.jsx";
import { crearProducto } from "../services/productosService.js";
import {
  crearCategoria,
  obtenerCategorias,
} from "../services/categoriasService.js";

const PROVEEDOR_INICIAL = {
  nombre: "",
  telefono: "",
  correo: "",
  direccion: "",
  notas: "",
};

const PRODUCTO_NUEVO_INICIAL = {
  nombre: "",
  codigo: "",
  categoria: "",
  venta: "",
  minimo: "5",
  cantidadCompra: "",
  costoCompra: "",
  fechaCaducidad: "",
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
    producto.marca,
    ...codigosProducto(producto),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function costoProducto(producto) {
  return Number(
    producto.precio_compra ??
      producto.compra ??
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

function codigosProducto(producto) {
  const alternativos = Array.isArray(producto.codigos_barras)
    ? producto.codigos_barras
    : Array.isArray(producto.codigos_barras_productos)
      ? producto.codigos_barras_productos.map((item) =>
          typeof item === "string" ? item : item.codigo_barras
        )
      : [];

  return Array.from(
    new Set(
      [
        producto.codigo_barras,
        producto.codigo,
        ...alternativos,
      ]
        .map((codigo) => String(codigo ?? "").trim())
        .filter(Boolean)
    )
  );
}

function Compras() {
  const [vista, setVista] = useState("registro");
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [carrito, setCarrito] = useState([]);

  const [categorias, setCategorias] = useState([]);
  const [modalProducto, setModalProducto] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState(
    PRODUCTO_NUEVO_INICIAL
  );
  const [guardandoProducto, setGuardandoProducto] =
    useState(false);
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] =
    useState(false);
  const [nombreNuevaCategoria, setNombreNuevaCategoria] =
    useState("");
  const [guardandoCategoria, setGuardandoCategoria] =
    useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [detallesAbiertos, setDetallesAbiertos] = useState(false);
  const [archivoImagenProducto, setArchivoImagenProducto] = useState(null);

  const [menuProductoId, setMenuProductoId] = useState(null);
  const [modalCodigo, setModalCodigo] = useState(false);
  const [codigoPendiente, setCodigoPendiente] = useState("");
  const [productoAsociacionId, setProductoAsociacionId] = useState("");
  const [busquedaAsociacion, setBusquedaAsociacion] = useState("");
  const [agregarTrasAsociar, setAgregarTrasAsociar] = useState(false);
  const [guardandoCodigo, setGuardandoCodigo] = useState(false);
  const [productoEliminar, setProductoEliminar] = useState(null);
  const [eliminandoProducto, setEliminandoProducto] = useState(false);

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
      const [
        productosData,
        proveedoresData,
        categoriasData,
      ] = await Promise.all([
        obtenerProductosCompra(),
        obtenerProveedores(),
        obtenerCategorias(),
      ]);

      setProductos(productosData);
      setProveedores(proveedoresData);
      setCategorias(categoriasData);
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

  const productosAsociacion = useMemo(() => {
    const termino = busquedaAsociacion.trim().toLowerCase();

    return productos
      .filter((producto) =>
        !termino || textoProducto(producto).includes(termino)
      )
      .slice(0, 8);
  }, [busquedaAsociacion, productos]);

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
            ? {
                ...item,
                cantidad:
                  (Number(item.cantidad) || 0) + 1,
              }
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
          cantidad: "",
          costoUnitario: "",
          fechaCaducidad: "",
          imagen: imagenProducto(producto),
        },
      ];
    });

    setBusqueda("");
    window.setTimeout(() => busquedaRef.current?.focus(), 0);
  }, [limpiarMensajes]);

  const abrirModalCodigo = useCallback(
    ({ codigo = "", productoId = "", agregar = false } = {}) => {
      limpiarMensajes();
      setCodigoPendiente(String(codigo ?? "").trim());
      setProductoAsociacionId(productoId || "");
      setBusquedaAsociacion("");
      setAgregarTrasAsociar(Boolean(agregar));
      setMenuProductoId(null);
      setModalCodigo(true);
    },
    [limpiarMensajes]
  );

  const procesarCodigo = useCallback(
    async (codigo) => {
      const limpio = String(codigo ?? "").trim();

      if (!limpio) return false;

      let producto = productos.find((item) =>
        codigosProducto(item).includes(limpio)
      );

      if (!producto) {
        try {
          producto = await buscarProductoPorCodigo(limpio);
        } catch (err) {
          console.error(err);
          setError(
            err.message ||
              "No fue posible buscar el código de barras."
          );
          return false;
        }
      }

      if (!producto) {
        abrirModalCodigo({
          codigo: limpio,
          agregar: true,
        });
        return true;
      }

      setProductos((actuales) =>
        actuales.some((item) => item.id === producto.id)
          ? actuales
          : [producto, ...actuales]
      );

      agregarProducto(producto);
      setMensaje(`${producto.nombre} agregado a la compra.`);
      return true;
    },
    [
      agregarProducto,
      abrirModalCodigo,
      productos,
    ]
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
          void procesarCodigo(bufferUsbRef.current);
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
          void procesarCodigo(codigo);
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
    const valor = String(cantidad);

    if (valor === "") {
      setCarrito((actual) =>
        actual.map((item) =>
          item.productoId === productoId
            ? { ...item, cantidad: "" }
            : item
        )
      );

      return;
    }

    const numero = Math.max(
      1,
      Math.trunc(Number(valor) || 1)
    );

    setCarrito((actual) =>
      actual.map((item) =>
        item.productoId === productoId
          ? { ...item, cantidad: numero }
          : item
      )
    );
  };

  const cambiarCosto = (productoId, costo) => {
    const valor = String(costo);

    if (valor === "") {
      setCarrito((actual) =>
        actual.map((item) =>
          item.productoId === productoId
            ? { ...item, costoUnitario: "" }
            : item
        )
      );

      return;
    }

    const numero = Math.max(0, Number(valor));

    setCarrito((actual) =>
      actual.map((item) =>
        item.productoId === productoId
          ? { ...item, costoUnitario: numero }
          : item
      )
    );
  };

  const cambiarFechaCaducidad = (
    productoId,
    fechaCaducidad
  ) => {
    setCarrito((actual) =>
      actual.map((item) =>
        item.productoId === productoId
          ? { ...item, fechaCaducidad }
          : item
      )
    );
  };

  const quitarProducto = (productoId) => {
    setCarrito((actual) =>
      actual.filter((item) => item.productoId !== productoId)
    );
  };

  function abrirModalProducto({
    nombre = "",
    codigo = "",
  } = {}) {
    limpiarMensajes();
    setNuevoProducto({
      ...PRODUCTO_NUEVO_INICIAL,
      nombre,
      codigo,
    });
    setNombreNuevaCategoria("");
    setMostrarNuevaCategoria(false);
    setArchivoImagenProducto(null);
    setModalProducto(true);
  }

  function cerrarModalProducto() {
    if (guardandoProducto || guardandoCategoria) {
      return;
    }

    setModalProducto(false);
    setNuevoProducto(PRODUCTO_NUEVO_INICIAL);
    setNombreNuevaCategoria("");
    setMostrarNuevaCategoria(false);
    setArchivoImagenProducto(null);
  }

  function cambiarNuevoProducto(evento) {
    const { name, value } = evento.target;

    setNuevoProducto((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  async function guardarCategoriaProducto(evento) {
    evento.preventDefault();

    try {
      setGuardandoCategoria(true);
      limpiarMensajes();

      const categoria = await crearCategoria(
        nombreNuevaCategoria
      );

      setCategorias((actuales) =>
        [...actuales, categoria].sort((a, b) =>
          a.nombre.localeCompare(b.nombre, "es")
        )
      );

      setNuevoProducto((actual) => ({
        ...actual,
        categoria: categoria.nombre,
      }));

      setNombreNuevaCategoria("");
      setMostrarNuevaCategoria(false);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible crear la categoría."
      );
    } finally {
      setGuardandoCategoria(false);
    }
  }

  async function guardarProductoDesdeCompra(evento) {
    evento.preventDefault();
    limpiarMensajes();

    const nombre = nuevoProducto.nombre.trim();
    const codigo = nuevoProducto.codigo.trim();
    const precioVenta = Number(nuevoProducto.venta);
    const stockMinimo = Number(nuevoProducto.minimo);
    const cantidadCompra = Number(
      nuevoProducto.cantidadCompra
    );
    const costoCompra = Number(
      nuevoProducto.costoCompra
    );

    if (!nombre) {
      setError("Escribe el nombre del producto.");
      return;
    }

    if (!codigo) {
      setError("Escribe o escanea el código de barras.");
      return;
    }

    if (!nuevoProducto.categoria) {
      setError("Selecciona una categoría.");
      return;
    }

    if (
      nuevoProducto.venta === "" ||
      !Number.isFinite(precioVenta) ||
      precioVenta < 0
    ) {
      setError("Escribe un precio de venta válido.");
      return;
    }

    if (
      !Number.isInteger(stockMinimo) ||
      stockMinimo < 0
    ) {
      setError(
        "El stock mínimo debe ser un entero igual o mayor que cero."
      );
      return;
    }

    if (
      nuevoProducto.cantidadCompra === "" ||
      !Number.isInteger(cantidadCompra) ||
      cantidadCompra <= 0
    ) {
      setError(
        "La cantidad recibida debe ser un entero mayor que cero."
      );
      return;
    }

    if (
      nuevoProducto.costoCompra === "" ||
      !Number.isFinite(costoCompra) ||
      costoCompra < 0
    ) {
      setError(
        "Escribe un costo unitario válido."
      );
      return;
    }

    if (nuevoProducto.fechaCaducidad) {
      const fecha = new Date(
        `${nuevoProducto.fechaCaducidad}T00:00:00`
      );
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (
        Number.isNaN(fecha.getTime()) ||
        fecha < hoy
      ) {
        setError(
          "La fecha de caducidad no puede estar en el pasado."
        );
        return;
      }
    }

    try {
      setGuardandoProducto(true);

      const productoCreado = await crearProducto(
        {
          nombre,
          codigo,
          categoria: nuevoProducto.categoria,
          compra: String(costoCompra),
          venta: String(precioVenta),
          stock: "0",
          minimo: String(stockMinimo),
          imagen: "",
        },
        archivoImagenProducto
      );

      setProductos((actuales) => [
        productoCreado,
        ...actuales,
      ]);

      setCarrito((actuales) => [
        ...actuales,
        {
          productoId: productoCreado.id,
          nombre: productoCreado.nombre,
          codigo:
            productoCreado.codigo ??
            productoCreado.codigo_barras ??
            "",
          cantidad: cantidadCompra,
          costoUnitario: costoCompra,
          fechaCaducidad:
            nuevoProducto.fechaCaducidad || "",
          imagen: productoCreado.imagen ?? null,
        },
      ]);

      setModalProducto(false);
      setNuevoProducto(PRODUCTO_NUEVO_INICIAL);
      setMostrarNuevaCategoria(false);
      setNombreNuevaCategoria("");
      setArchivoImagenProducto(null);

      setMensaje(
        `${productoCreado.nombre} fue creado y agregado con sus datos de compra.`
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible crear el producto."
      );
    } finally {
      setGuardandoProducto(false);
    }
  }

  function cerrarModalCodigo() {
    if (guardandoCodigo) return;

    setModalCodigo(false);
    setCodigoPendiente("");
    setProductoAsociacionId("");
    setBusquedaAsociacion("");
    setAgregarTrasAsociar(false);
  }

  async function guardarAsociacionCodigo(evento) {
    evento.preventDefault();
    limpiarMensajes();

    const codigo = codigoPendiente.trim();
    const producto = productos.find(
      (item) => item.id === productoAsociacionId
    );

    if (!codigo) {
      setError("Escribe o escanea el código de barras.");
      return;
    }

    if (!producto) {
      setError("Selecciona el producto al que pertenece el código.");
      return;
    }

    try {
      setGuardandoCodigo(true);

      await asociarCodigoProducto({
        productoId: producto.id,
        codigo,
      });

      const actualizado = {
        ...producto,
        codigos_barras: Array.from(
          new Set([...codigosProducto(producto), codigo])
        ),
      };

      setProductos((actuales) =>
        actuales.map((item) =>
          item.id === actualizado.id ? actualizado : item
        )
      );

      if (agregarTrasAsociar) {
        agregarProducto(actualizado);
      }

      setModalCodigo(false);
      setCodigoPendiente("");
      setProductoAsociacionId("");
      setBusquedaAsociacion("");
      setAgregarTrasAsociar(false);
      setMensaje(
        `${codigo} quedó asociado a ${producto.nombre}.`
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible asociar el código de barras."
      );
    } finally {
      setGuardandoCodigo(false);
    }
  }

  function crearProductoConCodigoPendiente() {
    const codigo = codigoPendiente.trim();
    cerrarModalCodigo();
    abrirModalProducto({ codigo });
  }

  async function eliminarProductoCatalogo() {
    if (!productoEliminar) return;

    try {
      setEliminandoProducto(true);
      limpiarMensajes();

      await desactivarProductoCompra(productoEliminar.id);

      setProductos((actuales) =>
        actuales.filter((item) => item.id !== productoEliminar.id)
      );
      setCarrito((actuales) =>
        actuales.filter(
          (item) => item.productoId !== productoEliminar.id
        )
      );

      setMensaje(
        `${productoEliminar.nombre} se quitó del catálogo activo. El historial se conserva.`
      );
      setProductoEliminar(null);
      setMenuProductoId(null);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible eliminar el producto."
      );
    } finally {
      setEliminandoProducto(false);
    }
  }

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
          const encontrado = await procesarCodigo(codigo);

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
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />
          <p className="mt-3 text-sm text-slate-500">
            Cargando productos y proveedores...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Inventario
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            Compras
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Registra tus compras y mantén tu inventario al día.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => abrirModalProducto()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Producto nuevo
          </button>

          <button
            type="button"
            onClick={() => setVista("historial")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <History className="h-4 w-4" />
            Historial
          </button>
        </div>
      </header>

      {mensaje && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
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

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_500px]">
        <div className="min-w-0 space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Registrar compra
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Busca productos existentes o crea uno nuevo para agregarlo a tu compra.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={busquedaRef}
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" && busqueda.trim()) {
                      evento.preventDefault();
                      void procesarCodigo(busqueda.trim());
                    }
                  }}
                  placeholder="Buscar por nombre o escanear código de barras..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white !pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                onClick={abrirCamara}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <Barcode className="h-5 w-5" />
                Escanear
              </button>

              <button
                type="button"
                onClick={() => abrirModalProducto()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Producto nuevo
              </button>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-950">
                  Productos del inventario
                </h3>
                <p className="text-xs text-slate-500">
                  {productosFiltrados.length} productos mostrados
                </p>
              </div>
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  Ver todos
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {productosFiltrados.map((producto) => {
                const imagen = imagenProducto(producto);
                const codigo =
                  producto.codigo_barras ?? producto.codigo ?? "Sin código";
                const agregado = carrito.some(
                  (item) => item.productoId === producto.id
                );

                return (
                  <article
                    key={producto.id}
                    className="relative flex min-h-[190px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="absolute right-2 top-2 z-10">
                      <button
                        type="button"
                        onClick={() =>
                          setMenuProductoId((actual) =>
                            actual === producto.id ? null : producto.id
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-400 shadow-sm transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Opciones de ${producto.nombre}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {menuProductoId === producto.id && (
                        <div className="absolute right-0 top-9 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                          <button
                            type="button"
                            onClick={() =>
                              abrirModalCodigo({
                                productoId: producto.id,
                              })
                            }
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
                          >
                            <Link2 className="h-4 w-4 text-blue-600" />
                            Asociar otro código
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProductoEliminar(producto);
                              setMenuProductoId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Quitar del catálogo
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 items-start gap-3 pr-7">
                      <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                        {imagen ? (
                          <img
                            src={imagen}
                            alt={producto.nombre}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <PackagePlus className="h-7 w-7 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-black leading-5 text-slate-900">
                          {producto.nombre}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="truncate text-xs text-slate-400">
                            {codigo}
                          </p>
                          {codigosProducto(producto).length > 1 && (
                            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
                              +{codigosProducto(producto).length - 1}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Stock actual: {Number(producto.stock) || 0}
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          Costo: {moneda(costoProducto(producto))}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => agregarProducto(producto)}
                      className={`mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-sm font-black transition ${
                        agregado
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-blue-600 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      {agregado ? "Agregar otra unidad" : "Agregar"}
                    </button>
                  </article>
                );
              })}
            </div>

            {productosFiltrados.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                <Search className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-3 font-black text-slate-700">
                  No encontramos productos
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Puedes crearlo sin salir de esta compra.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    abrirModalProducto({
                      nombre: busqueda.trim(),
                      codigo: /^\d{4,}$/.test(busqueda.trim())
                        ? busqueda.trim()
                        : "",
                    })
                  }
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-black text-white transition hover:bg-blue-700"
                >
                  <PackagePlus className="h-5 w-5" />
                  Crear producto
                </button>
              </div>
            )}
          </div>

        </div>

        <aside className="min-w-0 space-y-4 2xl:sticky 2xl:top-5 2xl:h-fit">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-black text-slate-950">
                  Resumen de compra
                </h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {carrito.length} {carrito.length === 1 ? "producto" : "productos"}
              </span>
            </div>

            <div className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto px-5">
              {carrito.length === 0 ? (
                <div className="py-16 text-center">
                  <PackagePlus className="mx-auto h-11 w-11 text-slate-200" />
                  <p className="mt-4 font-black text-slate-700">
                    La compra está vacía
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Selecciona o escanea un producto.
                  </p>
                </div>
              ) : (
                carrito.map((item) => (
                  <article key={item.productoId} className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <PackagePlus className="h-5 w-5 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-black text-slate-900">
                              {item.nombre}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Costo: {moneda(item.costoUnitario)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Subtotal</p>
                            <p className="font-black text-slate-900">
                              {moneda(item.cantidad * item.costoUnitario)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <span className="mb-1 block text-xs font-bold text-slate-500">
                              Cantidad
                            </span>
                            <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200">
                              <button
                                type="button"
                                onClick={() =>
                                  cambiarCantidad(
                                    item.productoId,
                                    Math.max(1, (Number(item.cantidad) || 1) - 1)
                                  )
                                }
                                className="flex w-10 items-center justify-center hover:bg-slate-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.cantidad}
                                placeholder="0"
                                onFocus={(evento) => evento.target.select()}
                                onChange={(evento) =>
                                  cambiarCantidad(item.productoId, evento.target.value)
                                }
                                className="min-w-0 flex-1 border-x border-slate-200 text-center text-sm font-bold outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  cambiarCantidad(
                                    item.productoId,
                                    (Number(item.cantidad) || 0) + 1
                                  )
                                }
                                className="flex w-10 items-center justify-center hover:bg-slate-50"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <label>
                            <span className="mb-1 block text-xs font-bold text-slate-500">
                              Costo unitario
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.costoUnitario}
                              placeholder="0.00"
                              onFocus={(evento) => evento.target.select()}
                              onChange={(evento) =>
                                cambiarCosto(item.productoId, evento.target.value)
                              }
                              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-right text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </label>
                        </div>

                        <label className="mt-3 block">
                          <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Fecha de caducidad
                          </span>
                          <input
                            type="date"
                            min={new Date().toISOString().slice(0, 10)}
                            value={item.fechaCaducidad}
                            onChange={(evento) =>
                              cambiarFechaCaducidad(
                                item.productoId,
                                evento.target.value
                              )
                            }
                            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => quitarProducto(item.productoId)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Quitar ${item.nombre}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <div className="border-t border-slate-100 p-4">
                <button
                  type="button"
                  onClick={() => setCarrito([])}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm font-black text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Vaciar lista
                </button>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setDetallesAbiertos((actual) => !actual)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <span className="flex items-center gap-2 font-black text-slate-900">
                <Truck className="h-5 w-5 text-blue-600" />
                Detalles opcionales
              </span>
              <ChevronDown
                className={`h-5 w-5 text-slate-400 transition ${detallesAbiertos ? "rotate-180" : ""}`}
              />
            </button>

            {detallesAbiertos && (
              <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-xs font-black text-slate-600">
                    Proveedor
                  </span>
                  <select
                    value={proveedorId}
                    onChange={(evento) => setProveedorId(evento.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Sin proveedor</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setModalProveedor(true)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar proveedor
                  </button>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-black text-slate-600">
                    Número de factura
                  </span>
                  <input
                    value={numeroFactura}
                    onChange={(evento) => setNumeroFactura(evento.target.value)}
                    placeholder="Opcional"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-black text-slate-600">
                    Observaciones
                  </span>
                  <textarea
                    value={observaciones}
                    onChange={(evento) => setObservaciones(evento.target.value)}
                    rows="3"
                    placeholder="Opcional"
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div>
                <p className="text-slate-500">Total de productos</p>
                <p className="mt-1 font-black text-slate-900">{carrito.length}</p>
              </div>
              <div>
                <p className="text-slate-500">Total de unidades</p>
                <p className="mt-1 font-black text-slate-900">{totalUnidades}</p>
              </div>
              <div className="col-span-2 flex items-end justify-between border-t border-slate-200 pt-3">
                <p className="font-black text-slate-700">Total de compra</p>
                <p className="text-3xl font-black tracking-tight text-slate-950">
                  {moneda(total)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={guardarCompra}
              disabled={guardando || carrito.length === 0}
              className="mt-4 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {guardando ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {guardando ? "Registrando..." : "Registrar compra"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              El stock se actualizará al confirmar la compra.
            </p>
          </div>
        </aside>
      </div>

      {modalProducto && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={guardarProductoDesdeCompra}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Catálogo
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Nuevo producto
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Registra el producto y los datos de esta compra en una sola ventana.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalProducto}
                disabled={
                  guardandoProducto ||
                  guardandoCategoria
                }
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Nombre del producto *
                </span>

                <input
                  autoFocus
                  name="nombre"
                  value={nuevoProducto.nombre}
                  onChange={cambiarNuevoProducto}
                  maxLength="120"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Código de barras *
                </span>

                <div className="relative">
                  <Barcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    name="codigo"
                    value={nuevoProducto.codigo}
                    onChange={cambiarNuevoProducto}
                    inputMode="numeric"
                    maxLength="50"
                    required
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </label>


              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Imagen del producto
                </span>
                <span className="mb-2 block text-xs text-slate-400">
                  JPG, PNG o WEBP. Máximo recomendado: 5 MB.
                </span>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  {archivoImagenProducto ? (
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src={URL.createObjectURL(archivoImagenProducto)}
                        alt="Vista previa"
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div className="text-left">
                        <p className="max-w-xs truncate text-sm font-black text-slate-700">
                          {archivoImagenProducto.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => setArchivoImagenProducto(null)}
                          className="mt-2 text-xs font-black text-red-600"
                        >
                          Quitar imagen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <PackagePlus className="mx-auto h-8 w-8 text-blue-500" />
                      <span className="mt-2 block font-black text-slate-800">
                        Seleccionar imagen
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        Haz clic para elegir una foto del producto.
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(evento) =>
                          setArchivoImagenProducto(evento.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                  )}
                </div>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Precio de venta *
                </span>

                <input
                  type="number"
                  name="venta"
                  value={nuevoProducto.venta}
                  onChange={cambiarNuevoProducto}
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div>
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Categoría *
                </span>

                <select
                  name="categoria"
                  value={nuevoProducto.categoria}
                  onChange={cambiarNuevoProducto}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Selecciona una categoría
                  </option>

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.id}
                      value={categoria.nombre}
                    >
                      {categoria.nombre}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarNuevaCategoria(true)
                  }
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  Nueva categoría
                </button>
              </div>

              <label>
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Stock mínimo *
                </span>

                <input
                  type="number"
                  name="minimo"
                  value={nuevoProducto.minimo}
                  onChange={cambiarNuevoProducto}
                  min="0"
                  step="1"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="sm:col-span-2">
                <div className="my-1 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    Datos de esta compra
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              </div>

              <label>
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Cantidad recibida *
                </span>

                <input
                  type="number"
                  name="cantidadCompra"
                  value={nuevoProducto.cantidadCompra}
                  onChange={cambiarNuevoProducto}
                  min="1"
                  step="1"
                  placeholder="Ej. 27"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Costo unitario *
                </span>

                <input
                  type="number"
                  name="costoCompra"
                  value={nuevoProducto.costoCompra}
                  onChange={cambiarNuevoProducto}
                  min="0"
                  step="0.01"
                  placeholder="Ej. 27.00"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Fecha de caducidad
                </span>

                <input
                  type="date"
                  name="fechaCaducidad"
                  value={nuevoProducto.fechaCaducidad}
                  onChange={cambiarNuevoProducto}
                  min={new Date()
                    .toISOString()
                    .slice(0, 10)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Déjalo vacío si el producto no caduca.
                </p>
              </label>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:col-span-2">
                <p className="font-bold text-blue-900">
                  Se agregará listo al resumen
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  Al guardar, el producto aparecerá con cantidad, costo y caducidad ya capturados.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cerrarModalProducto}
                disabled={
                  guardandoProducto ||
                  guardandoCategoria
                }
                className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  guardandoProducto ||
                  guardandoCategoria
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {guardandoProducto ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <PackagePlus className="h-5 w-5" />
                )}

                {guardandoProducto
                  ? "Creando..."
                  : "Crear y agregar a la compra"}
              </button>
            </div>
          </form>
        </div>
      )}

      {mostrarNuevaCategoria && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={guardarCategoriaProducto}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
          >
            <h3 className="text-xl font-black text-slate-950">
              Nueva categoría
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Quedará seleccionada en el producto.
            </p>

            <input
              autoFocus
              value={nombreNuevaCategoria}
              onChange={(evento) =>
                setNombreNuevaCategoria(
                  evento.target.value
                )
              }
              placeholder="Nombre de la categoría"
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!guardandoCategoria) {
                    setMostrarNuevaCategoria(false);
                    setNombreNuevaCategoria("");
                  }
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardandoCategoria}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {guardandoCategoria && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Crear categoría
              </button>
            </div>
          </form>
        </div>
      )}

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
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
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
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
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
      {modalCodigo && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Códigos de barras
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  {productoAsociacionId
                    ? "Asociar otro código"
                    : "Código no registrado"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Vincula el código a un producto existente o crea uno nuevo.
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModalCodigo}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={guardarAsociacionCodigo} className="space-y-5 p-5">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Código de barras
                </span>
                <div className="relative mt-2">
                  <Barcode className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={codigoPendiente}
                    onChange={(evento) =>
                      setCodigoPendiente(evento.target.value)
                    }
                    autoFocus={!codigoPendiente}
                    className="h-12 w-full rounded-xl border border-slate-200 !pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Escanea o escribe el código"
                  />
                </div>
              </label>

              {!productoAsociacionId && (
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Buscar producto existente
                  </span>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={busquedaAsociacion}
                      onChange={(evento) =>
                        setBusquedaAsociacion(evento.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 !pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Ej. Coca-Cola 600 ml"
                    />
                  </div>
                </label>
              )}

              <div className="max-h-72 space-y-2 overflow-y-auto">
                {(productoAsociacionId
                  ? productos.filter((item) => item.id === productoAsociacionId)
                  : productosAsociacion
                ).map((producto) => (
                  <label
                    key={producto.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${
                      productoAsociacionId === producto.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="producto-asociacion"
                      checked={productoAsociacionId === producto.id}
                      onChange={() =>
                        setProductoAsociacionId(producto.id)
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-slate-900">
                        {producto.nombre}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {codigosProducto(producto).join(" · ") || "Sin código"}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      Stock {Number(producto.stock) || 0}
                    </span>
                  </label>
                ))}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>
                    Asocia el código solo si corresponde exactamente al mismo producto, presentación y tamaño.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={crearProductoConCodigoPendiente}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 font-black text-blue-700 hover:bg-blue-50"
                >
                  <PackagePlus className="h-5 w-5" />
                  Crear producto nuevo
                </button>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={cerrarModalCodigo}
                    className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={
                      guardandoCodigo ||
                      !codigoPendiente.trim() ||
                      !productoAsociacionId
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {guardandoCodigo ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Link2 className="h-5 w-5" />
                    )}
                    Asociar código
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {productoEliminar && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-950">
              ¿Quitar producto?
            </h2>
            <p className="mt-2 text-slate-500">
              <strong className="text-slate-800">
                {productoEliminar.nombre}
              </strong>{" "}
              dejará de aparecer en el catálogo y en las búsquedas. Las compras, ventas y lotes anteriores se conservarán.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setProductoEliminar(null)}
                disabled={eliminandoProducto}
                className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={eliminarProductoCatalogo}
                disabled={eliminandoProducto}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-black text-white hover:bg-red-700 disabled:opacity-50"
              >
                {eliminandoProducto ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
                Quitar del catálogo
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

export default Compras;
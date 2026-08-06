// src/pages/Compras.jsx
import ComprasHeader from "../components/compras/ComprasHeader.jsx";
import BuscadorCompra from "../components/compras/BuscadorCompra.jsx";
import ListaProductosCompra from "../components/compras/ListaProductosCompra.jsx";
import DetallesOpcionalesCompra from "../components/compras/DetallesOpcionalesCompra.jsx";
import ResumenCompra from "../components/compras/ResumenCompra.jsx";
import ModalProductoNuevo from "../components/compras/modals/ModalProductoNuevo.jsx";
import ModalProveedor from "../components/compras/modals/ModalProveedor.jsx";
import ModalEscaner from "../components/compras/modals/ModalEscaner.jsx";
import ModalAsociarCodigo from "../components/compras/modals/ModalAsociarCodigo.jsx";
import ModalEliminarProducto from "../components/compras/modals/ModalEliminarProducto.jsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, Loader2, X } from "lucide-react";
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

  setCarrito((actual) => [
    ...actual,
    {
      lineaId: crypto.randomUUID(),
      productoId: producto.id,
      nombre: producto.nombre,
      codigoBarras:
        producto.codigo_barras ??
        producto.codigo ??
        "",
      stockActual: Number(producto.stock) || 0,
      cantidad: "",
      costoUnitario: "",
      fechaCaducidad: "",
      imagen: imagenProducto(producto),
    },
  ]);

  setBusqueda("");

  window.setTimeout(
    () => busquedaRef.current?.focus(),
    0
  );
}, [limpiarMensajes]);

const abrirModalCodigo = useCallback(
  ({
    codigo = "",
    productoId = "",
    agregar = false,
  } = {}) => {
    limpiarMensajes();

    setCodigoPendiente(
      String(codigo ?? "").trim()
    );

    setProductoAsociacionId(
      productoId || ""
    );

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

  const cambiarCantidad = (lineaId, cantidad) => {
  const valor = String(cantidad);

  if (valor === "") {
    setCarrito((actual) =>
      actual.map((item) =>
        (item.lineaId ?? item.productoId) === lineaId
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
      (item.lineaId ?? item.productoId) === lineaId
        ? { ...item, cantidad: numero }
        : item
    )
  );
};

const cambiarCosto = (lineaId, costo) => {
  const valor = String(costo);

  if (valor === "") {
    setCarrito((actual) =>
      actual.map((item) =>
        (item.lineaId ?? item.productoId) === lineaId
          ? { ...item, costoUnitario: "" }
          : item
      )
    );

    return;
  }

  const numero = Math.max(0, Number(valor));

  setCarrito((actual) =>
    actual.map((item) =>
      (item.lineaId ?? item.productoId) === lineaId
        ? { ...item, costoUnitario: numero }
        : item
    )
  );
};

const cambiarFechaCaducidad = (
  lineaId,
  fechaCaducidad
) => {
  setCarrito((actual) =>
    actual.map((item) =>
      (item.lineaId ?? item.productoId) === lineaId
        ? { ...item, fechaCaducidad }
        : item
    )
  );
};

const quitarProducto = (lineaId) => {
  setCarrito((actual) =>
    actual.filter(
      (item) =>
        (item.lineaId ?? item.productoId) !== lineaId
    )
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
      lineaId: crypto.randomUUID(),
      productoId: productoCreado.id,
      nombre: productoCreado.nombre,
      codigoBarras:
      productoCreado.codigo_barras ??
      productoCreado.codigo ??
      codigo,
      stockActual: Number(productoCreado.stock) || 0,
      cantidad: cantidadCompra,
      costoUnitario: costoCompra,
      fechaCaducidad:
      nuevoProducto.fechaCaducidad || "",
      imagen:
      productoCreado.imagen ??
      productoCreado.imagen_url ??
      null,
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
    setDetallesAbiertos(false);
    setMenuProductoId(null);

    const productosActualizados =
      await obtenerProductosCompra();

    setProductos(productosActualizados);

    setMensaje(
      `Compra registrada correctamente. Folio interno: ${compraId}`
    );

    window.setTimeout(() => {
      busquedaRef.current?.focus();
    }, 0);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "No fue posible registrar la compra."
    );
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
      <ComprasHeader
  onNuevoProducto={() => abrirModalProducto()}
  onAbrirHistorial={() => setVista("historial")}
/>
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
          <BuscadorCompra
  busqueda={busqueda}
  busquedaRef={busquedaRef}
  onCambiarBusqueda={setBusqueda}
  onProcesarCodigo={procesarCodigo}
  onAbrirCamara={abrirCamara}
          />

          <ListaProductosCompra
  productos={productosFiltrados}
  busqueda={busqueda}
  carrito={carrito}
  menuProductoId={menuProductoId}
  obtenerImagen={imagenProducto}
  obtenerCodigo={(producto) =>
    producto.codigo_barras ??
    producto.codigo ??
    "Sin código"
  }
  obtenerCosto={(producto) =>
    moneda(costoProducto(producto))
  }
  contarCodigos={(producto) =>
    codigosProducto(producto).length
  }
  onLimpiarBusqueda={() =>
    setBusqueda("")
  }
  onAgregarProducto={agregarProducto}
  onAlternarMenu={(productoId) =>
    setMenuProductoId((actual) =>
      actual === productoId
        ? null
        : productoId
    )
  }
  onAsociarCodigo={(productoId) =>
    abrirModalCodigo({
      productoId,
    })
  }
  onEliminarProducto={(producto) => {
    setProductoEliminar(producto);
    setMenuProductoId(null);
  }}
  onCrearProducto={() => {
    const termino = busqueda.trim();
    const esCodigo = /^\d{4,}$/.test(termino);

    abrirModalProducto({
      nombre: esCodigo ? "" : termino,
      codigo: esCodigo ? termino : "",
    });
  }}
/>
          </div>

        <aside className="min-w-0 space-y-4 2xl:sticky 2xl:top-5 2xl:h-fit">
          <ResumenCompra
          carrito={carrito}
          total={total}
          totalUnidades={totalUnidades}
          guardando={guardando}
          onCambiarCantidad={cambiarCantidad}
          onCambiarCosto={cambiarCosto}
          onCambiarFecha={cambiarFechaCaducidad}
          onQuitarLinea={quitarProducto}
          onVaciar={() => setCarrito([])}
          onRegistrarCompra={guardarCompra}
          />

         <DetallesOpcionalesCompra
          abierto={detallesAbiertos}
          proveedores={proveedores}
          proveedorId={proveedorId}
          numeroFactura={numeroFactura}
          observaciones={observaciones}
          onAlternar={() =>
          setDetallesAbiertos((actual) => !actual)
          }
          onCambiarProveedor={setProveedorId}
          onCambiarFactura={setNumeroFactura}
          onCambiarObservaciones={setObservaciones}
          onAgregarProveedor={() =>
         setModalProveedor(true)
        }
        />
        </aside>
      </div>

      <ModalProductoNuevo
        abierto={modalProducto}
        nuevoProducto={nuevoProducto}
        categorias={categorias}
        archivoImagen={archivoImagenProducto}
        guardandoProducto={guardandoProducto}
        guardandoCategoria={guardandoCategoria}
        mostrarNuevaCategoria={mostrarNuevaCategoria}
        nombreNuevaCategoria={nombreNuevaCategoria}
        onGuardarProducto={guardarProductoDesdeCompra}
        onCerrar={cerrarModalProducto}
        onCambiarProducto={cambiarNuevoProducto}
        onCambiarImagen={setArchivoImagenProducto}
        onMostrarNuevaCategoria={() => setMostrarNuevaCategoria(true)}
        onGuardarCategoria={guardarCategoriaProducto}
        onCambiarNombreCategoria={setNombreNuevaCategoria}
        onCerrarCategoria={() => {
          if (!guardandoCategoria) {
            setMostrarNuevaCategoria(false);
            setNombreNuevaCategoria("");
          }
        }}
      />

      <ModalProveedor
        abierto={modalProveedor}
        proveedor={nuevoProveedor}
        guardando={guardandoProveedor}
        onGuardar={guardarProveedor}
        onCerrar={() => setModalProveedor(false)}
        onCambiar={setNuevoProveedor}
      />

      <ModalEscaner
        abierto={camaraAbierta}
        iniciando={iniciandoCamara}
        onCerrar={cerrarCamara}
      />

      <ModalAsociarCodigo
        abierto={modalCodigo}
        codigo={codigoPendiente}
        productoAsociacionId={productoAsociacionId}
        busqueda={busquedaAsociacion}
        productos={productos}
        productosAsociacion={productosAsociacion}
        guardando={guardandoCodigo}
        obtenerCodigos={codigosProducto}
        onCambiarCodigo={setCodigoPendiente}
        onCambiarBusqueda={setBusquedaAsociacion}
        onSeleccionarProducto={setProductoAsociacionId}
        onGuardar={guardarAsociacionCodigo}
        onCrearProducto={crearProductoConCodigoPendiente}
        onCerrar={cerrarModalCodigo}
      />

      <ModalEliminarProducto
        producto={productoEliminar}
        eliminando={eliminandoProducto}
        onConfirmar={eliminarProductoCatalogo}
        onCerrar={() => setProductoEliminar(null)}
      />

    </section>
  );
}

export default Compras;
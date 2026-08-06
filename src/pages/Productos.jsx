import { useEffect, useMemo, useState } from "react";
import {
  Barcode,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";

import FormularioProducto from "../components/productos/FormularioProducto";
import EscanerCamara from "../components/productos/EscanerCamara";
import TablaProductos from "../components/productos/TablaProductos";
import TarjetaResumen from "../components/productos/TarjetaResumen";

import {
  actualizarProducto,
  crearProducto,
  eliminarProductoPorId,
  obtenerProductos,
} from "../services/productosService";

const productoVacio = {
  nombre: "",
  codigo: "",
  categoria: "",
  compra: "",
  venta: "",
  stock: "",
  minimo: "5",
  imagen: "",
};


function codigosProducto(producto) {
  return Array.from(
    new Set(
      [producto.codigo, ...(producto.codigos ?? [])]
        .map((codigo) => String(codigo ?? "").trim())
        .filter(Boolean)
    )
  );
}

function Productos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [formulario, setFormulario] =
    useState(productoVacio);

  const [productoEditandoId, setProductoEditandoId] =
    useState(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [eliminandoId, setEliminandoId] =
    useState(null);

  const [error, setError] = useState("");

  const [mostrarEscaner, setMostrarEscaner] =
    useState(false);

  const [mostrarCamara, setMostrarCamara] =
  useState(false);

  const [codigoEscaneado, setCodigoEscaneado] =
    useState("");

  const [errorEscaner, setErrorEscaner] =
    useState("");

    const [
  codigoDesdeEscaner,
  setCodigoDesdeEscaner,
  ] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      const productosGuardados =
        await obtenerProductos();

      setProductos(productosGuardados);
    } catch (errorDeCarga) {
      console.error(
        "Error al cargar productos:",
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
    const texto = busqueda.toLowerCase().trim();

    if (!texto) {
      return productos;
    }

    return productos.filter((producto) =>
      `${producto.nombre} ${codigosProducto(producto).join(" ")} ${producto.categoria}`
        .toLowerCase()
        .includes(texto)
    );
  }, [busqueda, productos]);

  const valorInventario = productos.reduce(
    (total, producto) =>
      total +
      Number(producto.compra) *
        Number(producto.stock),
    0
  );

  const stockBajo = productos.filter(
    (producto) =>
      Number(producto.stock) > 0 &&
      Number(producto.stock) <=
        Number(producto.minimo)
  ).length;

  const agotados = productos.filter(
    (producto) => Number(producto.stock) === 0
  ).length;

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function abrirFormularioNuevo() {
    setProductoEditandoId(null);

    setCodigoDesdeEscaner(false);

    setFormulario({
      ...productoVacio,
    });

    setError("");
    setMostrarFormulario(true);
  }

  function abrirFormularioEdicion(producto) {
    setProductoEditandoId(producto.id);

    setCodigoDesdeEscaner(false);

    setFormulario({
      nombre: producto.nombre,
      codigo: producto.codigo,
      categoria: producto.categoria,
      compra: String(producto.compra),
      venta: String(producto.venta),
      stock: String(producto.stock),
      minimo: String(producto.minimo),
      imagen: producto.imagen ?? "",
    });

    setError("");
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    if (guardando) {
      return;
    }

    setProductoEditandoId(null);

    setCodigoDesdeEscaner(false);

    setFormulario({
      ...productoVacio,
    });

    setMostrarFormulario(false);
  }

  function abrirEscaner() {
    setCodigoEscaneado("");
    setErrorEscaner("");
    setMostrarEscaner(true);
  }

  function cerrarEscaner() {
    setCodigoEscaneado("");
    setErrorEscaner("");
    setMostrarEscaner(false);
  }

  function abrirCamara() {
  setMostrarCamara(true);
 }

function cerrarCamara() {
  setMostrarCamara(false);
 }

function detectarCodigoDesdeCamara(codigo) {
  setCodigoEscaneado(codigo);
  setMostrarCamara(false);
 }

  function buscarProductoPorCodigo(evento) {
  evento.preventDefault();

  const codigoLimpio = codigoEscaneado.trim();

  setErrorEscaner("");

  if (!codigoLimpio) {
    setErrorEscaner(
      "Escribe o escanea un código de barras."
    );
    return;
  }

  const productoEncontrado = productos.find(
    (producto) =>
      codigosProducto(producto).includes(codigoLimpio)
  );

  if (productoEncontrado) {
    setBusqueda(productoEncontrado.codigo);
    cerrarEscaner();
    return;
  }

  const confirmarRegistro = window.confirm(
    "Este código de barras no está registrado. ¿Deseas crear un producto nuevo con este código?"
  );

  if (!confirmarRegistro) {
    setErrorEscaner(
      "El código no está registrado."
    );
    return;
  }

  setProductoEditandoId(null);

  setCodigoDesdeEscaner(true);

  setFormulario({
    ...productoVacio,
    codigo: codigoLimpio,
  });

  setMostrarEscaner(false);
  setCodigoEscaneado("");
  setErrorEscaner("");
  setError("");
  setMostrarFormulario(true);
 }

  async function guardarProducto(
    evento,
    archivoImagen
  ) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (productoEditandoId) {
        const productoActualizado =
          await actualizarProducto(
            productoEditandoId,
            formulario,
            archivoImagen,
            formulario.imagen
          );

        setProductos((actuales) =>
          actuales.map((producto) =>
            producto.id === productoEditandoId
              ? productoActualizado
              : producto
          )
        );
      } else {
        const productoGuardado =
          await crearProducto(
            formulario,
            archivoImagen
          );

        setProductos((actuales) => [
          productoGuardado,
          ...actuales,
        ]);
      }

      setProductoEditandoId(null);

      setFormulario({
        ...productoVacio,
      });

      setMostrarFormulario(false);
    } catch (errorAlGuardar) {
      console.error(
        "Error al guardar producto:",
        errorAlGuardar
      );

      setError(errorAlGuardar.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarProducto(id) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este producto?"
    );

    if (!confirmar) {
      return;
    }

    const productoAEliminar = productos.find(
      (producto) => producto.id === id
    );

    try {
      setEliminandoId(id);
      setError("");

      await eliminarProductoPorId(
        id,
        productoAEliminar?.imagen ?? ""
      );

      setProductos((actuales) =>
        actuales.filter(
          (producto) => producto.id !== id
        )
      );
    } catch (errorAlEliminar) {
      console.error(
        "Error al eliminar producto:",
        errorAlEliminar
      );

      setError(
        `No se pudo eliminar el producto: ${errorAlEliminar.message}`
      );
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Productos
          </h1>

          <p className="mt-1 text-slate-500">
            Administra los productos y existencias de tu
            tienda.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={abrirEscaner}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            <Barcode size={20} />
            Escanear código
          </button>

          <button
            type="button"
            onClick={abrirFormularioNuevo}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Nuevo producto
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded p-1 hover:bg-red-100"
            aria-label="Cerrar mensaje de error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen
          titulo="Productos registrados"
          valor={productos.length}
          icono={<Package size={22} />}
        />

        <TarjetaResumen
          titulo="Valor del inventario"
          valor={valorInventario.toLocaleString(
            "es-MX",
            {
              style: "currency",
              currency: "MXN",
            }
          )}
        />

        <TarjetaResumen
          titulo="Productos con stock bajo"
          valor={stockBajo}
        />

        <TarjetaResumen
          titulo="Productos agotados"
          valor={agotados}
        />
      </div>

      <TablaProductos
        productos={productosFiltrados}
        busqueda={busqueda}
        cargando={cargando}
        eliminandoId={eliminandoId}
        onBusquedaChange={setBusqueda}
        onEditar={abrirFormularioEdicion}
        onEliminar={eliminarProducto}
      />

      <FormularioProducto
        mostrar={mostrarFormulario}
        formulario={formulario}
        productoEditandoId={productoEditandoId}
        guardando={guardando}
        codigoDesdeEscaner={codigoDesdeEscaner}
        onChange={manejarCambio}
        onSubmit={guardarProducto}
        onClose={cerrarFormulario}
      />

      {mostrarEscaner && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Buscar por código
                </h2>

                <p className="text-sm text-slate-500">
                  Escanea o escribe el código de barras.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarEscaner}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar buscador por código"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={buscarProductoPorCodigo}
              className="space-y-5 p-5"
            >
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 p-4 text-blue-600">
                  <Barcode size={34} />
                </div>
              </div>

              <button
                type="button"
                onClick={abrirCamara}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <Barcode size={20} />
                Escanear con cámara
              </button>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Código de barras
                </span>

                <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <Barcode
                    size={20}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    type="text"
                    value={codigoEscaneado}
                    onChange={(evento) => {
                      setCodigoEscaneado(
                        evento.target.value
                      );

                      setErrorEscaner("");
                    }}
                    placeholder="Ejemplo: 7501234567890"
                    inputMode="numeric"
                    autoComplete="off"
                    autoFocus
                    className="w-full bg-transparent py-3 text-slate-800 outline-none"
                  />
                </div>
              </label>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Si usas un lector USB, coloca el cursor en
                el campo y escanea el producto. La mayoría
                de los lectores presionan Enter
                automáticamente.
              </div>

              {errorEscaner && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorEscaner}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarEscaner}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!codigoEscaneado.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search size={19} />
                  Buscar producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EscanerCamara
      abierto={mostrarCamara}
      onCerrar={cerrarCamara}
      onDetectar={detectarCodigoDesdeCamara}
    />      
    </section>
  );
}

export default Productos;

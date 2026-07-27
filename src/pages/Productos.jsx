import { useEffect, useMemo, useState } from "react";
import {
  Barcode,
  Edit,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
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
};

function Productos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(productoVacio);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      const productosGuardados = await obtenerProductos();
      setProductos(productosGuardados);
    } catch (errorDeCarga) {
      console.error("Error al cargar productos:", errorDeCarga);

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
      `${producto.nombre} ${producto.codigo} ${producto.categoria}`
        .toLowerCase()
        .includes(texto)
    );
  }, [busqueda, productos]);

  const valorInventario = productos.reduce(
    (total, producto) =>
      total + Number(producto.compra) * Number(producto.stock),
    0
  );

  const stockBajo = productos.filter(
    (producto) =>
      Number(producto.stock) > 0 &&
      Number(producto.stock) <= Number(producto.minimo)
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

  function abrirFormulario() {
    setFormulario(productoVacio);
    setError("");
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    if (guardando) {
      return;
    }

    setFormulario(productoVacio);
    setMostrarFormulario(false);
  }

  async function guardarProducto(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const productoGuardado = await crearProducto(formulario);

      setProductos((actuales) => [
        productoGuardado,
        ...actuales,
      ]);

      setFormulario(productoVacio);
      setMostrarFormulario(false);
    } catch (errorAlGuardar) {
      console.error("Error al guardar producto:", errorAlGuardar);
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

    try {
      setEliminandoId(id);
      setError("");

      await eliminarProductoPorId(id);

      setProductos((actuales) =>
        actuales.filter((producto) => producto.id !== id)
      );
    } catch (errorAlEliminar) {
      console.error("Error al eliminar producto:", errorAlEliminar);

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
            Administra los productos y existencias de tu tienda.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirFormulario}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo producto
        </button>
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
          valor={valorInventario.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
          })}
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Lista de productos
            </h2>

            <p className="text-sm text-slate-500">
              Consulta, edita o elimina productos registrados.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={18} className="text-slate-400" />

            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar producto..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-500">
                <th className="px-5 py-4 font-semibold">
                  Producto
                </th>

                <th className="px-5 py-4 font-semibold">
                  Código
                </th>

                <th className="px-5 py-4 font-semibold">
                  Categoría
                </th>

                <th className="px-5 py-4 font-semibold">
                  Compra
                </th>

                <th className="px-5 py-4 font-semibold">
                  Venta
                </th>

                <th className="px-5 py-4 font-semibold">
                  Stock
                </th>

                <th className="px-5 py-4 font-semibold">
                  Estado
                </th>

                <th className="px-5 py-4 text-right font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {cargando && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Cargando productos...
                  </td>
                </tr>
              )}

              {!cargando &&
                productosFiltrados.map((producto) => {
                  const estaAgotado =
                    Number(producto.stock) === 0;

                  const estaBajo =
                    Number(producto.stock) > 0 &&
                    Number(producto.stock) <=
                      Number(producto.minimo);

                  const seEstaEliminando =
                    eliminandoId === producto.id;

                  return (
                    <tr
                      key={producto.id}
                      className="text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                            <Package size={20} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {producto.nombre}
                            </p>

                            <p className="text-xs text-slate-400">
                              Stock mínimo: {producto.minimo}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Barcode
                            size={17}
                            className="text-slate-400"
                          />

                          {producto.codigo}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {producto.categoria}
                      </td>

                      <td className="px-5 py-4">
                        {Number(
                          producto.compra
                        ).toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {Number(
                          producto.venta
                        ).toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {producto.stock}
                      </td>

                      <td className="px-5 py-4">
                        <EstadoProducto
                          agotado={estaAgotado}
                          bajo={estaBajo}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                            aria-label={`Editar ${producto.nombre}`}
                            title="La edición se agregará después"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              eliminarProducto(producto.id)
                            }
                            disabled={seEstaEliminando}
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Eliminar ${producto.nombre}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!cargando &&
                productosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      {busqueda.trim()
                        ? "No se encontraron productos con esa búsqueda."
                        : "Todavía no hay productos registrados."}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Nuevo producto
                </h2>

                <p className="text-sm text-slate-500">
                  Registra un producto en el inventario.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarFormulario}
                disabled={guardando}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Cerrar formulario"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={guardarProducto}
              className="grid gap-4 p-5 sm:grid-cols-2"
            >
              <Campo
                etiqueta="Nombre del producto"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                required
              />

              <Campo
                etiqueta="Código de barras"
                name="codigo"
                value={formulario.codigo}
                onChange={manejarCambio}
                inputMode="numeric"
                required
              />

              <Campo
                etiqueta="Categoría"
                name="categoria"
                value={formulario.categoria}
                onChange={manejarCambio}
                required
              />

              <Campo
                etiqueta="Precio de compra"
                name="compra"
                type="number"
                min="0"
                step="0.01"
                value={formulario.compra}
                onChange={manejarCambio}
                required
              />

              <Campo
                etiqueta="Precio de venta"
                name="venta"
                type="number"
                min="0"
                step="0.01"
                value={formulario.venta}
                onChange={manejarCambio}
                required
              />

              <Campo
                etiqueta="Stock inicial"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formulario.stock}
                onChange={manejarCambio}
                required
              />

              <Campo
                etiqueta="Stock mínimo"
                name="minimo"
                type="number"
                min="0"
                step="1"
                value={formulario.minimo}
                onChange={manejarCambio}
                required
              />

              <div className="flex flex-col-reverse gap-3 pt-3 sm:col-span-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {guardando
                    ? "Guardando..."
                    : "Guardar producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function TarjetaResumen({ titulo, valor, icono }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {valor}
        </p>

        {icono && (
          <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
            {icono}
          </div>
        )}
      </div>
    </article>
  );
}

function Campo({
  etiqueta,
  name,
  type = "text",
  value,
  onChange,
  ...propiedades
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {etiqueta}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...propiedades}
      />
    </label>
  );
}

function EstadoProducto({ agotado, bajo }) {
  if (agotado) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Agotado
      </span>
    );
  }

  if (bajo) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        Stock bajo
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      Disponible
    </span>
  );
}

export default Productos;
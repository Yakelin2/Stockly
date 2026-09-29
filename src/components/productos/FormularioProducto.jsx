import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Barcode,
  Plus,
  X,
} from "lucide-react";

import {
  crearCategoria,
  obtenerCategorias,
} from "../../services/categoriasService";

import Campo from "./Campo";
import SubirImagen from "./SubirImagen";

function FormularioProducto({
  mostrar,
  formulario,
  productoEditandoId,
  guardando,
  codigoDesdeEscaner = false,
  onChange,
  onSubmit,
  onClose,
}) {
  const [categorias, setCategorias] = useState([]);

  const [cargandoCategorias, setCargandoCategorias] =
    useState(false);

  const [
    mostrarNuevaCategoria,
    setMostrarNuevaCategoria,
  ] = useState(false);

  const [nombreCategoria, setNombreCategoria] =
    useState("");

  const [
    guardandoCategoria,
    setGuardandoCategoria,
  ] = useState(false);

  const [errorCategoria, setErrorCategoria] =
    useState("");

  const [errorFormulario, setErrorFormulario] =
    useState("");

  const [archivoImagen, setArchivoImagen] =
    useState(null);

  const codigoBloqueado =
    codigoDesdeEscaner && !productoEditandoId;

  useEffect(() => {
    if (!mostrar) {
      setArchivoImagen(null);
      setMostrarNuevaCategoria(false);
      setNombreCategoria("");
      setErrorCategoria("");
      setErrorFormulario("");
      return;
    }

    cargarCategorias();
    setErrorFormulario("");
    setArchivoImagen(null);

    const temporizadorEnfoque = window.setTimeout(
      () => {
        const campoNombre = document.querySelector(
          'input[name="nombre"]'
        );

        campoNombre?.focus();
      },
      100
    );

    return () => {
      window.clearTimeout(temporizadorEnfoque);
    };
  }, [mostrar]);

  const advertencias = useMemo(() => {
    const mensajes = [];

    const precioCompra = Number(formulario.compra);
    const precioVenta = Number(formulario.venta);
    const stock = Number(formulario.stock);
    const stockMinimo = Number(formulario.minimo);

    if (
      formulario.compra !== "" &&
      formulario.venta !== "" &&
      precioVenta < precioCompra
    ) {
      mensajes.push(
        "El precio de venta es menor que el precio de compra. Este producto generará una pérdida."
      );
    }

    if (
      formulario.stock !== "" &&
      formulario.minimo !== "" &&
      stockMinimo > stock
    ) {
      mensajes.push(
        "El stock mínimo es mayor que las existencias actuales. El producto aparecerá inmediatamente con stock bajo."
      );
    }

    if (
      formulario.compra !== "" &&
      formulario.venta !== "" &&
      precioCompra > 0 &&
      precioVenta === precioCompra
    ) {
      mensajes.push(
        "El precio de venta es igual al precio de compra. No habrá margen de ganancia."
      );
    }

    return mensajes;
  }, [
    formulario.compra,
    formulario.venta,
    formulario.stock,
    formulario.minimo,
  ]);

  const margenGanancia = useMemo(() => {
    const precioCompra = Number(formulario.compra);
    const precioVenta = Number(formulario.venta);

    if (
      formulario.compra === "" ||
      formulario.venta === "" ||
      Number.isNaN(precioCompra) ||
      Number.isNaN(precioVenta)
    ) {
      return null;
    }

    const ganancia = precioVenta - precioCompra;

    const porcentaje =
      precioCompra > 0
        ? (ganancia / precioCompra) * 100
        : null;

    return {
      ganancia,
      porcentaje,
    };
  }, [formulario.compra, formulario.venta]);

  async function cargarCategorias() {
  try {
    setCargandoCategorias(true);
    setErrorCategoria("");

    const categoriasGuardadas =
      await obtenerCategorias();

    setCategorias(categoriasGuardadas);
  } catch (errorDeCarga) {
    console.error(
      "Error al cargar categorías:",
      errorDeCarga
    );

    setErrorCategoria(
      `No se pudieron cargar las categorías: ${errorDeCarga.message}`
    );
  } finally {
    setCargandoCategorias(false);
  }
}

function cerrarNuevaCategoria() {
  if (guardandoCategoria) {
    return;
  }

  setNombreCategoria("");
  setErrorCategoria("");
  setMostrarNuevaCategoria(false);
}

async function guardarNuevaCategoria(evento) {
  evento.preventDefault();

  try {
    setGuardandoCategoria(true);
    setErrorCategoria("");

    const nuevaCategoria =
      await crearCategoria(nombreCategoria);

    setCategorias((actuales) =>
      [...actuales, nuevaCategoria].sort(
        (categoriaA, categoriaB) =>
          categoriaA.nombre.localeCompare(
            categoriaB.nombre,
            "es"
          )
      )
    );

    onChange({
      target: {
        name: "categoria",
        value: nuevaCategoria.nombre,
      },
    });

    setNombreCategoria("");
    setMostrarNuevaCategoria(false);
  } catch (errorAlGuardar) {
    console.error(
      "Error al guardar categoría:",
      errorAlGuardar
    );

    setErrorCategoria(errorAlGuardar.message);
  } finally {
    setGuardandoCategoria(false);
  }
}

function validarFormulario() {
  const nombre = formulario.nombre.trim();
  const codigo = formulario.codigo.trim();

  const precioCompra = Number(formulario.compra);
  const precioVenta = Number(formulario.venta);
  const stock = Number(formulario.stock);
  const stockMinimo = Number(formulario.minimo);

  if (!nombre) {
    return "Escribe el nombre del producto.";
  }

  if (!codigo) {
    return "Escribe el código de barras.";
  }

  if (!formulario.categoria) {
    return "Selecciona una categoría.";
  }

  if (
    formulario.compra === "" ||
    Number.isNaN(precioCompra) ||
    precioCompra < 0
  ) {
    return "Escribe un precio de compra válido.";
  }

  if (
    formulario.venta === "" ||
    Number.isNaN(precioVenta) ||
    precioVenta < 0
  ) {
    return "Escribe un precio de venta válido.";
  }

  if (
    formulario.stock === "" ||
    Number.isNaN(stock) ||
    stock < 0 ||
    !Number.isInteger(stock)
  ) {
    return "El stock debe ser un número entero igual o mayor que cero.";
  }

  if (
    formulario.minimo === "" ||
    Number.isNaN(stockMinimo) ||
    stockMinimo < 0 ||
    !Number.isInteger(stockMinimo)
  ) {
    return "El stock mínimo debe ser un número entero igual o mayor que cero.";
  }

  return "";
}

function manejarEnvio(evento) {
  evento.preventDefault();
  setErrorFormulario("");

  const mensajeValidacion = validarFormulario();

  if (mensajeValidacion) {
    setErrorFormulario(mensajeValidacion);
    return;
  }

  const precioCompra = Number(formulario.compra);
  const precioVenta = Number(formulario.venta);

  if (precioVenta < precioCompra) {
    const confirmar = window.confirm(
      "El precio de venta es menor que el precio de compra. El producto se venderá con pérdida. ¿Deseas guardarlo de todas formas?"
    );

    if (!confirmar) {
      return;
    }
  }

  onSubmit(evento, archivoImagen);
}

function cerrarFormularioCompleto() {
  if (guardando || guardandoCategoria) {
    return;
  }

  setArchivoImagen(null);
  setMostrarNuevaCategoria(false);
  setNombreCategoria("");
  setErrorCategoria("");
  setErrorFormulario("");

  onClose();
}

if (!mostrar) {
  return null;
}

return (
  <>
    <div className="stockly-modal fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {productoEditandoId
                ? "Editar producto"
                : "Nuevo producto"}
            </h2>

            <p className="text-sm text-slate-500">
              {productoEditandoId
                ? "Modifica la información del producto."
                : codigoBloqueado
                  ? "Se detectó un código nuevo. Completa la información para registrarlo en el inventario."
                  : "Registra un producto en el inventario."}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrarFormularioCompleto}
            disabled={
              guardando || guardandoCategoria
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar formulario"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={manejarEnvio}
          className="grid gap-6 p-8 sm:grid-cols-2"
        >
          {codigoBloqueado && (
            <div className="flex items-start gap-4 rounded-xl border border-blue-200 bg-blue-50 px-6 py-5 sm:col-span-2">
              <div className="mt-0.5 shrink-0 rounded-xl bg-blue-100 p-2.5 text-blue-700">
                <Barcode size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-blue-950">
                  Código escaneado
                </p>

                <div className="mt-2 inline-flex max-w-full items-center rounded-lg border border-blue-200 bg-white px-3 py-1.5 shadow-sm">
                  <span className="break-all font-mono text-lg font-bold tracking-widest text-blue-700">
                    {formulario.codigo}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-blue-700">
                  Completa los datos para registrar este
                  producto en el inventario.
                </p>
              </div>
            </div>
          )}

          <Campo
            etiqueta="Nombre del producto"
            name="nombre"
            value={formulario.nombre}
            onChange={onChange}
            maxLength={120}
            required
          />

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Código de barras
            </span>

            <div className="relative">
              <Barcode
                size={19}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                name="codigo"
                value={formulario.codigo}
                onChange={onChange}
                inputMode="numeric"
                maxLength={50}
                readOnly={codigoBloqueado}
                required
                className={`w-full rounded-xl border px-3 py-2.5 pl-10 outline-none transition ${
                  codigoBloqueado
                    ? "cursor-not-allowed border-blue-200 bg-blue-50 font-mono font-semibold text-blue-800"
                    : "border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>

            {codigoBloqueado && (
              <p className="text-xs leading-relaxed text-slate-500">
                El código está bloqueado porque fue
                obtenido mediante el escáner.
              </p>
            )}
          </label>


                      <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Categoría
            </span>

            <select
              name="categoria"
              value={formulario.categoria}
              onChange={onChange}
              disabled={cargandoCategorias}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {cargandoCategorias
                  ? "Cargando categorías..."
                  : "Selecciona una categoría"}
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
              onClick={() => {
                setErrorCategoria("");
                setMostrarNuevaCategoria(true);
              }}
              disabled={cargandoCategorias}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={17} />
              Nueva categoría
            </button>
          </div>

          <SubirImagen
            imagenActual={formulario.imagen}
            archivoImagen={archivoImagen}
            onArchivoChange={setArchivoImagen}
            onImagenChange={(value) => onChange({ target: { name: "imagen", value } })}
            disabled={guardando}
          />

          <Campo
            etiqueta="Precio de compra"
            name="compra"
            type="number"
            min="0"
            step="0.01"
            value={formulario.compra}
            onChange={onChange}
            required
          />

          <Campo
            etiqueta="Precio de venta"
            name="venta"
            type="number"
            min="0"
            step="0.01"
            value={formulario.venta}
            onChange={onChange}
            required
          />

          <Campo
            etiqueta={
              productoEditandoId
                ? "Stock actual"
                : "Stock inicial"
            }
            name="stock"
            type="number"
            min="0"
            step="1"
            value={formulario.stock}
            onChange={onChange}
            required
          />

          <Campo
            etiqueta="Stock mínimo"
            name="minimo"
            type="number"
            min="0"
            step="1"
            value={formulario.minimo}
            onChange={onChange}
            required
          />

                      {margenGanancia && (
            <div className="rounded-xl bg-emerald-50 p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-emerald-800">
                Margen de ganancia
              </p>

              <p className="mt-1 text-lg font-bold text-emerald-700">
                ${margenGanancia.ganancia.toFixed(2)}

                {margenGanancia.porcentaje !== null && (
                  <span className="ml-2 text-sm font-medium">
                    ({margenGanancia.porcentaje.toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>
          )}

          {advertencias.length > 0 && (
            <div className="space-y-2 sm:col-span-2">
              {advertencias.map((mensaje) => (
                <div
                  key={mensaje}
                  className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4"
                >
                  <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-sm text-amber-900">
                    {mensaje}
                  </p>
                </div>
              ))}
            </div>
          )}

          {errorFormulario && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 sm:col-span-2">
              <p className="text-sm text-red-700">
                {errorFormulario}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
  <button
    type="button"
    onClick={cerrarFormularioCompleto}
    disabled={guardando}
    className="w-full rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
  >
    Cancelar
  </button>

  <button
    type="submit"
    disabled={guardando}
    className="w-full rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
  >
    {guardando
      ? "Guardando..."
      : productoEditandoId
        ? "Guardar cambios"
        : codigoBloqueado
          ? "Registrar producto"
          : "Guardar producto"}
      </button>
        </div>
        </form>
      </div>
    </div>

    {mostrarNuevaCategoria && (
      <div className="stockly-modal fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900">
            Nueva categoría
          </h3>

          <form
            onSubmit={guardarNuevaCategoria}
            className="mt-4 space-y-4"
          >
            <input
              type="text"
              value={nombreCategoria}
              onChange={(e) =>
                setNombreCategoria(e.target.value)
              }
              placeholder="Nombre de la categoría"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />

            {errorCategoria && (
              <p className="text-sm text-red-600">
                {errorCategoria}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarNuevaCategoria}
                className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardandoCategoria}
                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {guardandoCategoria
                  ? "Guardando..."
                  : "Crear categoría"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);
}
export default FormularioProducto;

import {
  Barcode,
  Edit,
  Package,
  Search,
  Trash2,
} from "lucide-react";

import EstadoProducto from "./EstadoProducto";

function TablaProductos({
  productos,
  busqueda,
  cargando,
  eliminandoId,
  onBusquedaChange,
  onEditar,
  onEliminar,
}) {
  return (
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
            onChange={(evento) =>
              onBusquedaChange(evento.target.value)
            }
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
              productos.map((producto) => {
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
                        {producto.imagen ? (
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            <img
                              src={producto.imagen}
                              alt={`Imagen de ${producto.nombre}`}
                              loading="lazy"
                              className="h-full w-full object-cover"
                              onError={(evento) => {
                                evento.currentTarget.style.display =
                                  "none";

                                const contenedor =
                                  evento.currentTarget.parentElement;

                                const respaldo =
                                  contenedor?.querySelector(
                                    "[data-respaldo-imagen]"
                                  );

                                if (respaldo) {
                                  respaldo.classList.remove(
                                    "hidden"
                                  );
                                }
                              }}
                            />

                            <div
                              data-respaldo-imagen
                              className="hidden h-full w-full items-center justify-center text-slate-400"
                            >
                              <Package size={20} />
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <Package size={20} />
                          </div>
                        )}

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
                          onClick={() => onEditar(producto)}
                          disabled={seEstaEliminando}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Editar ${producto.nombre}`}
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onEliminar(producto.id)
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

            {!cargando && productos.length === 0 && (
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
  );
}

export default TablaProductos;

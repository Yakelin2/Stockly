import {
  PackagePlus,
  Search,
} from "lucide-react";

import TarjetaProductoCompra from "./TarjetaProductoCompra.jsx";

function ListaProductosCompra({
  productos,
  busqueda,
  carrito,
  menuProductoId,
  obtenerImagen,
  obtenerCodigo,
  obtenerCosto,
  contarCodigos,
  onLimpiarBusqueda,
  onAgregarProducto,
  onAlternarMenu,
  onAsociarCodigo,
  onEliminarProducto,
  onCrearProducto,
}) {
  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Catálogo disponible
          </p>

          <h3 className="mt-1 text-xl font-black text-slate-950">
            Productos del inventario
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {productos.length}{" "}
            {productos.length === 1
              ? "producto mostrado"
              : "productos mostrados"}
          </p>
        </div>

        {busqueda && (
          <button
            type="button"
            onClick={onLimpiarBusqueda}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            Ver todos
          </button>
        )}
      </div>

      {productos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {productos.map((producto) => {
            const agregado = carrito.some(
              (item) =>
                item.productoId === producto.id
            );

            return (
              <TarjetaProductoCompra
                key={producto.id}
                producto={producto}
                imagen={obtenerImagen(producto)}
                codigo={obtenerCodigo(producto)}
                costo={obtenerCosto(producto)}
                codigosTotales={contarCodigos(producto)}
                agregado={agregado}
                menuAbierto={
                  menuProductoId === producto.id
                }
                onAgregar={() =>
                  onAgregarProducto(producto)
                }
                onAlternarMenu={() =>
                  onAlternarMenu(producto.id)
                }
                onAsociarCodigo={() =>
                  onAsociarCodigo(producto.id)
                }
                onEliminar={() =>
                  onEliminarProducto(producto)
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-blue-200 bg-gradient-to-br from-white to-blue-50/70 px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Search className="h-7 w-7" />
          </div>

          <h4 className="mt-4 text-lg font-black text-slate-900">
            No encontramos productos
          </h4>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Revisa la búsqueda o crea un producto nuevo
            sin salir de esta compra.
          </p>

          <button
            type="button"
            onClick={onCrearProducto}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <PackagePlus className="h-5 w-5" />
            Crear producto
          </button>
        </div>
      )}
    </section>
  );
}

export default ListaProductosCompra;
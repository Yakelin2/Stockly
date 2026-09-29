import SubirImagen from "../../productos/SubirImagen";
import { Barcode, Loader2, PackagePlus, Plus, X } from "lucide-react";

function ModalProductoNuevo({
  abierto,
  nuevoProducto,
  categorias,
  archivoImagen,
  guardandoProducto,
  guardandoCategoria,
  mostrarNuevaCategoria,
  nombreNuevaCategoria,
  onGuardarProducto,
  onCerrar,
  onCambiarProducto,
  onCambiarImagen,
  onMostrarNuevaCategoria,
  onGuardarCategoria,
  onCambiarNombreCategoria,
  onCerrarCategoria,
}) {
  if (!abierto) return null;

  const bloqueado = guardandoProducto || guardandoCategoria;

  return (
    <>
      <div className="stockly-modal fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
        <form
          onSubmit={onGuardarProducto}
          className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Catálogo</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Nuevo producto</h2>
              <p className="mt-1 text-sm text-slate-500">
                Registra el producto y los datos de esta compra en una sola ventana.
              </p>
            </div>
            <button type="button" onClick={onCerrar} disabled={bloqueado} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Nombre del producto *</span>
              <input autoFocus name="nombre" value={nuevoProducto.nombre} onChange={onCambiarProducto} maxLength="120" required className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Código de barras *</span>
              <div className="relative">
                <Barcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input name="codigo" value={nuevoProducto.codigo} onChange={onCambiarProducto} inputMode="numeric" maxLength="50" required className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </div>
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Precio de venta *</span>
              <input type="number" name="venta" value={nuevoProducto.venta} onChange={onCambiarProducto} min="0" step="0.01" required className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>

            <SubirImagen
              imagenActual={nuevoProducto.imagen || ""}
              archivoImagen={archivoImagen}
              onArchivoChange={onCambiarImagen}
              onImagenChange={(value) => onCambiarProducto({ target: { name: "imagen", value } })}
              disabled={bloqueado}
            />
            <div>
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Categoría *</span>
              <select name="categoria" value={nuevoProducto.categoria} onChange={onCambiarProducto} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-blue-500">
                <option value="">Selecciona una categoría</option>
                {categorias.map((categoria) => <option key={categoria.id} value={categoria.nombre}>{categoria.nombre}</option>)}
              </select>
              <button type="button" onClick={onMostrarNuevaCategoria} className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800">
                <Plus className="h-4 w-4" /> Nueva categoría
              </button>
            </div>

            <label>
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Stock mínimo *</span>
              <input type="number" name="minimo" value={nuevoProducto.minimo} onChange={onCambiarProducto} min="0" step="1" required className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>

            <div className="sm:col-span-2"><div className="my-1 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Datos de esta compra</span><div className="h-px flex-1 bg-slate-200" /></div></div>

            <label>
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Cantidad recibida *</span>
              <input type="number" name="cantidadCompra" value={nuevoProducto.cantidadCompra} onChange={onCambiarProducto} min="1" step="1" placeholder="Ej. 27" required className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Costo unitario *</span>
              <input type="number" name="costoCompra" value={nuevoProducto.costoCompra} onChange={onCambiarProducto} min="0" step="0.01" placeholder="Ej. 27.00" required className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Fecha de caducidad</span>
              <input type="date" name="fechaCaducidad" value={nuevoProducto.fechaCaducidad} onChange={onCambiarProducto} min={new Date().toISOString().slice(0, 10)} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              <p className="mt-1 text-xs text-slate-400">Déjalo vacío si el producto no caduca.</p>
            </label>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:col-span-2">
              <p className="font-bold text-blue-900">Se agregará listo al resumen</p>
              <p className="mt-1 text-sm leading-6 text-blue-700">Al guardar, el producto aparecerá con cantidad, costo y caducidad ya capturados.</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCerrar} disabled={bloqueado} className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={bloqueado} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-50">
              {guardandoProducto ? <Loader2 className="h-5 w-5 animate-spin" /> : <PackagePlus className="h-5 w-5" />}
              {guardandoProducto ? "Creando..." : "Crear y agregar a la compra"}
            </button>
          </div>
        </form>
      </div>

      {mostrarNuevaCategoria && (
        <div className="stockly-modal fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <form onSubmit={onGuardarCategoria} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-xl font-black text-slate-950">Nueva categoría</h3>
            <p className="mt-1 text-sm text-slate-500">Quedará seleccionada en el producto.</p>
            <input autoFocus value={nombreNuevaCategoria} onChange={(evento) => onCambiarNombreCategoria(evento.target.value)} placeholder="Nombre de la categoría" className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={onCerrarCategoria} className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={guardandoCategoria} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                {guardandoCategoria && <Loader2 className="h-4 w-4 animate-spin" />} Crear categoría
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default ModalProductoNuevo;

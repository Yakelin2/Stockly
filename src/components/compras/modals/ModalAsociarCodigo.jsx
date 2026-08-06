import { AlertTriangle, Barcode, Link2, Loader2, PackagePlus, Search, X } from "lucide-react";
function ModalAsociarCodigo({ abierto, codigo, productoAsociacionId, busqueda, productos, productosAsociacion, guardando, obtenerCodigos, onCambiarCodigo, onCambiarBusqueda, onSeleccionarProducto, onGuardar, onCrearProducto, onCerrar }) {
  if (!abierto) return null;
  const visibles = productoAsociacionId ? productos.filter((item) => item.id === productoAsociacionId) : productosAsociacion;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Códigos de barras</p><h2 className="mt-1 text-2xl font-black text-slate-950">{productoAsociacionId ? "Asociar otro código" : "Código no registrado"}</h2><p className="mt-1 text-sm text-slate-500">Vincula el código a un producto existente o crea uno nuevo.</p></div>
          <button type="button" onClick={onCerrar} disabled={guardando} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={onGuardar} className="space-y-5 p-5">
          <label className="block"><span className="text-sm font-bold text-slate-700">Código de barras</span><div className="relative mt-2"><Barcode className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={codigo} onChange={(e) => onCambiarCodigo(e.target.value)} autoFocus={!codigo} className="h-12 w-full rounded-xl border border-slate-200 !pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Escanea o escribe el código" /></div></label>
          {!productoAsociacionId && <label className="block"><span className="text-sm font-bold text-slate-700">Buscar producto existente</span><div className="relative mt-2"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={busqueda} onChange={(e) => onCambiarBusqueda(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 !pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Ej. Coca-Cola 600 ml" /></div></label>}
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {visibles.map((producto) => <label key={producto.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${productoAsociacionId === producto.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"}`}><input type="radio" name="producto-asociacion" checked={productoAsociacionId === producto.id} onChange={() => onSeleccionarProducto(producto.id)} /><div className="min-w-0 flex-1"><p className="truncate font-black text-slate-900">{producto.nombre}</p><p className="truncate text-xs text-slate-500">{obtenerCodigos(producto).join(" · ") || "Sin código"}</p></div><span className="text-xs font-bold text-slate-500">Stock {Number(producto.stock) || 0}</span></label>)}
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><div className="flex gap-2"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p>Asocia el código solo si corresponde exactamente al mismo producto, presentación y tamaño.</p></div></div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={onCrearProducto} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 font-black text-blue-700 hover:bg-blue-50"><PackagePlus className="h-5 w-5" />Crear producto nuevo</button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row"><button type="button" onClick={onCerrar} disabled={guardando} className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar</button><button type="submit" disabled={guardando || !codigo.trim() || !productoAsociacionId} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-50">{guardando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Link2 className="h-5 w-5" />}Asociar código</button></div>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ModalAsociarCodigo;

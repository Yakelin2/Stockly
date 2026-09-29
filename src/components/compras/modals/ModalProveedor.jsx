import { Loader2, X } from "lucide-react";

function ModalProveedor({ abierto, proveedor, guardando, onGuardar, onCerrar, onCambiar }) {
  if (!abierto) return null;
  const cambiar = (campo) => (evento) => onCambiar((actual) => ({ ...actual, [campo]: evento.target.value }));
  return (
    <div className="stockly-modal fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <form onSubmit={onGuardar} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div><h2 className="text-xl font-bold text-slate-900">Nuevo proveedor</h2><p className="text-sm text-slate-500">Quedará seleccionado al guardarlo.</p></div>
          <button type="button" onClick={onCerrar} disabled={guardando} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Nombre *</span><input autoFocus value={proveedor.nombre} onChange={cambiar('nombre')} required className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Teléfono</span><input value={proveedor.telefono} onChange={cambiar('telefono')} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500" /></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Correo</span><input type="email" value={proveedor.correo} onChange={cambiar('correo')} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500" /></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Dirección</span><input value={proveedor.direccion} onChange={cambiar('direccion')} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500" /></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Notas</span><textarea rows="3" value={proveedor.notas} onChange={cambiar('notas')} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500" /></label>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
          <button type="button" onClick={onCerrar} disabled={guardando} className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
          <button type="submit" disabled={guardando} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400">{guardando && <Loader2 className="h-4 w-4 animate-spin" />}Guardar proveedor</button>
        </div>
      </form>
    </div>
  );
}
export default ModalProveedor;

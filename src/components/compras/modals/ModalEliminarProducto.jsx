import { Loader2, Trash2 } from "lucide-react";
function ModalEliminarProducto({ producto, eliminando, onConfirmar, onCerrar }) {
  if (!producto) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><Trash2 className="h-7 w-7" /></div>
        <h2 className="mt-5 text-2xl font-black text-slate-950">¿Quitar producto?</h2>
        <p className="mt-2 text-slate-500"><strong className="text-slate-800">{producto.nombre}</strong>{" "}dejará de aparecer en el catálogo y en las búsquedas. Las compras, ventas y lotes anteriores se conservarán.</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCerrar} disabled={eliminando} className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
          <button type="button" onClick={onConfirmar} disabled={eliminando} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-black text-white hover:bg-red-700 disabled:opacity-50">{eliminando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}Quitar del catálogo</button>
        </div>
      </div>
    </div>
  );
}
export default ModalEliminarProducto;

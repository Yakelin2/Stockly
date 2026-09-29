import { Loader2, X } from "lucide-react";
function ModalEscaner({ abierto, iniciando, onCerrar }) {
  if (!abierto) return null;
  return (
    <div className="stockly-modal fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div><h2 className="font-bold text-slate-900">Escanear producto</h2><p className="text-sm text-slate-500">Coloca el código dentro del recuadro.</p></div>
          <button type="button" onClick={onCerrar} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="relative min-h-72 bg-slate-900 p-3">
          <div id="lector-compras" className="overflow-hidden rounded-xl" />
          {iniciando && <div className="absolute inset-0 flex items-center justify-center bg-slate-900"><div className="text-center text-white"><Loader2 className="mx-auto h-8 w-8 animate-spin" /><p className="mt-3 text-sm">Iniciando cámara...</p></div></div>}
        </div>
      </div>
    </div>
  );
}
export default ModalEscaner;

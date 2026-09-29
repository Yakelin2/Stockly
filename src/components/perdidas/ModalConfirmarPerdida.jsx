import { useEffect, useRef } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

export default function ModalConfirmarPerdida({ confirmacion, procesando, error, onCerrar, onConfirmar }) {
  const dialogo = useRef(null);
  const volver = useRef(null);
  const esRegistro = confirmacion.tipo === "registro";
  const titulo = esRegistro ? "Registrar pérdida" : "Cancelar pérdida";

  useEffect(() => {
    const elemento = dialogo.current;
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    elemento.showModal();
    volver.current.focus();
    document.body.style.overflow = "hidden";
    return () => {
      elemento.close();
      document.body.style.overflow = overflowAnterior;
      if (focoAnterior?.isConnected) focoAnterior.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="titulo-confirmar-perdida"
      aria-describedby="descripcion-confirmar-perdida"
      aria-busy={procesando}
      onCancel={(evento) => {
        evento.preventDefault();
        if (!procesando) onCerrar();
      }}
      className="stockly-modal fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent open:flex backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm"
    >
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
        <header className="flex items-start justify-between gap-3 rounded-t-3xl border-b border-red-100 bg-red-50 p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-2xl bg-red-100 p-3 text-red-600"><AlertTriangle size={24} aria-hidden="true" /></div>
            <h2 id="titulo-confirmar-perdida" className="text-xl font-bold">{titulo}</h2>
          </div>
          <button type="button" onClick={onCerrar} disabled={procesando} aria-label="Cerrar confirmación"
            className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-red-100 disabled:opacity-50"><X size={20} aria-hidden="true" /></button>
        </header>
        <div className="space-y-5 p-5 sm:p-6">
          <p id="descripcion-confirmar-perdida" className="text-sm leading-6 text-slate-600">
            {esRegistro ? "Se descontarán estas unidades del inventario al registrar la pérdida." : "Se cancelará esta pérdida y las unidades se devolverán al inventario."}
          </p>
          <dl className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div><dt className="text-slate-500">Producto</dt><dd className="break-words font-bold">{confirmacion.producto}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Cantidad</dt><dd className="font-semibold">{confirmacion.cantidad} unidad(es)</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Motivo</dt><dd className="text-right font-semibold">{confirmacion.motivo}</dd></div>
            <div className="flex justify-between gap-3 border-t border-slate-200 pt-3"><dt className="text-slate-500">{esRegistro ? "Costo estimado" : "Costo de la pérdida"}</dt><dd className="font-bold text-red-700">{confirmacion.costo}</dd></div>
          </dl>
          {error && <p role="alert" className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button ref={volver} type="button" onClick={onCerrar} disabled={procesando}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Volver</button>
            <button type="button" onClick={onConfirmar} disabled={procesando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {procesando && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
              {procesando ? "Procesando…" : titulo}
            </button>
          </div>
        </div>
      </section>
    </dialog>
  );
}

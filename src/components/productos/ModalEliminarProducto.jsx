import { useEffect, useRef } from "react";
import { Loader2, Trash2, X } from "lucide-react";

export default function ModalEliminarProducto({
  producto,
  eliminando,
  error,
  onCancelar,
  onConfirmar,
}) {
  const dialogo = useRef(null);
  const cancelar = useRef(null);

  useEffect(() => {
    const elemento = dialogo.current;
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    elemento.showModal();
    cancelar.current.focus();
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
      aria-labelledby="titulo-eliminar-producto"
      aria-describedby="descripcion-eliminar-producto"
      aria-busy={eliminando}
      onCancel={(evento) => {
        evento.preventDefault();
        if (!eliminando) onCancelar();
      }}
      className="stockly-modal fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent open:flex backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm"
    >
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
        <header className="flex items-start justify-between gap-4 rounded-t-3xl border-b border-red-100 bg-red-50 p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-2xl bg-red-100 p-3 text-red-600">
              <Trash2 size={24} aria-hidden="true" />
            </div>
            <h2 id="titulo-eliminar-producto" className="text-xl font-bold">
              Eliminar producto
            </h2>
          </div>
          <button type="button" onClick={onCancelar} disabled={eliminando}
            aria-label="Cerrar confirmación"
            className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-red-100 disabled:opacity-50">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="space-y-5 p-5 sm:p-6">
          <p id="descripcion-eliminar-producto" className="break-words text-sm leading-6 text-slate-600">
            ¿Deseas eliminar <strong className="text-slate-900">{producto.nombre}</strong>?
            {" "}El producto dejará de aparecer en el inventario activo.
          </p>
          {error && <p role="alert" className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button ref={cancelar} type="button" onClick={onCancelar} disabled={eliminando}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              Cancelar
            </button>
            <button type="button" onClick={onConfirmar} disabled={eliminando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {eliminando ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Trash2 size={18} aria-hidden="true" />}
              {eliminando ? "Eliminando…" : "Eliminar producto"}
            </button>
          </div>
        </div>
      </section>
    </dialog>
  );
}

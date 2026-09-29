import { ShoppingCart, Trash2, X } from "lucide-react";

function ModalVaciarCarrito({
  abierto,
  cantidadProductos,
  cantidadArticulos,
  onCancelar,
  onConfirmar,
}) {
  if (!abierto) return null;

  return (
    <div className="stockly-modal fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-vaciar-carrito"
        className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-red-100 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                Acción irreversible
              </p>
              <h2 id="titulo-vaciar-carrito" className="mt-1 text-xl font-black text-slate-950">
                Vaciar carrito
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancelar}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-800"
            aria-label="Cerrar confirmación"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm leading-6 text-slate-600">
            Se eliminarán del carrito <strong>{cantidadProductos}</strong>{" "}
            {cantidadProductos === 1 ? "producto" : "productos"}, con un total de{" "}
            <strong>{cantidadArticulos}</strong>{" "}
            {cantidadArticulos === 1 ? "unidad" : "unidades"}.
          </p>

          <p className="mt-3 text-sm font-bold text-slate-800">
            Esta acción no registra ninguna venta ni modifica el inventario.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancelar}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-black text-slate-700 transition hover:bg-slate-50"
            >
              Conservar
            </button>

            <button
              type="button"
              onClick={onConfirmar}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-black text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              <Trash2 className="h-5 w-5" />
              Vaciar carrito
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ModalVaciarCarrito;

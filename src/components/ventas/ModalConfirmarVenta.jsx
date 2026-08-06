import {
  Banknote,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  ReceiptText,
  X,
} from "lucide-react";

function dinero(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor) || 0);
}

const nombresMetodo = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
};

function ModalConfirmarVenta({
  abierto,
  total,
  metodoPago,
  montoRecibido,
  cambio,
  cantidadArticulos,
  procesando,
  onCancelar,
  onConfirmar,
}) {
  if (!abierto) return null;

  const esEfectivo = metodoPago === "efectivo";

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmar-venta"
        className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl"
      >
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 pb-7 pt-6 text-white">
          <button
            type="button"
            onClick={onCancelar}
            disabled={procesando}
            className="absolute right-4 top-4 rounded-xl p-2 text-white/80 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar confirmación"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <ReceiptText className="h-7 w-7" />
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
            Revisión final
          </p>
          <h2 id="titulo-confirmar-venta" className="mt-1 text-2xl font-black">
            Confirmar venta
          </h2>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            Verifica el cobro antes de registrar la operación.
          </p>
        </div>

        <div className="p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <span className="text-sm font-bold text-slate-500">Artículos</span>
              <span className="font-black text-slate-900">{cantidadArticulos}</span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                {esEfectivo ? (
                  <Banknote className="h-4 w-4 text-emerald-600" />
                ) : (
                  <CreditCard className="h-4 w-4 text-blue-600" />
                )}
                Método
              </span>
              <span className="font-black capitalize text-slate-900">
                {nombresMetodo[metodoPago] || metodoPago}
              </span>
            </div>

            {esEfectivo && (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3">
                  <span className="text-sm font-bold text-slate-500">Recibido</span>
                  <span className="font-black text-slate-900">
                    {dinero(montoRecibido)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 pt-3">
                  <span className="text-sm font-bold text-emerald-700">Cambio</span>
                  <span className="text-lg font-black text-emerald-700">
                    {dinero(cambio)}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Total a cobrar
              </p>
              <p className="mt-1 text-sm text-blue-700">La venta se guardará al confirmar.</p>
            </div>
            <p className="shrink-0 text-3xl font-black tracking-tight text-blue-800">
              {dinero(total)}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancelar}
              disabled={procesando}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirmar}
              disabled={procesando}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {procesando ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Confirmar venta
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ModalConfirmarVenta;

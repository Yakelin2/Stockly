import {
  CalendarClock,
  Loader2,
  Minus,
  PackagePlus,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

function moneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor) || 0);
}

function ResumenCompra({
  carrito,
  total,
  totalUnidades,
  guardando,
  onCambiarCantidad,
  onCambiarCosto,
  onCambiarFecha,
  onQuitarLinea,
  onVaciar,
  onRegistrarCompra,
}) {
  const productosUnicos = new Set(
    carrito.map((item) => item.productoId)
  ).size;

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <header className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20">
              <ShoppingCart className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Compra actual
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Captura cada lote por separado.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-black text-blue-700 shadow-sm">
            {carrito.length}{" "}
            {carrito.length === 1 ? "lote" : "lotes"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-blue-100 bg-white/90 p-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Productos
            </p>

            <p className="mt-1 text-xl font-black text-blue-700">
              {productosUnicos}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Unidades
            </p>

            <p className="mt-1 text-xl font-black text-emerald-700">
              {totalUnidades}
            </p>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white/90 p-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Total
            </p>

            <p className="mt-1 truncate text-xl font-black text-violet-700">
              {moneda(total)}
            </p>
          </div>
        </div>
      </header>

      <div className="max-h-[620px] space-y-4 overflow-y-auto bg-slate-50/50 p-4">
        {carrito.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
              <PackagePlus className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-lg font-black text-slate-700">
              La compra está vacía
            </h3>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-400">
              Selecciona un producto o escanea un código
              para registrar su primer lote.
            </p>
          </div>
        ) : (
          carrito.map((item, indice) => {
            const lineaId =
              item.lineaId ?? item.productoId;

            const cantidad =
              Number(item.cantidad) || 0;

            const costoUnitario =
              Number(item.costoUnitario) || 0;

            const subtotal =
              cantidad * costoUnitario;

            return (
              <article
                key={lineaId}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <PackagePlus className="h-6 w-6 text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase text-blue-700">
                          Lote {indice + 1}
                        </span>

                        {item.codigoBarras && (
                          <span className="max-w-[150px] truncate text-[11px] text-slate-400">
                            {item.codigoBarras}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 font-black leading-5 text-slate-950">
                        {item.nombre}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onQuitarLinea(lineaId)
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Quitar lote de ${item.nombre}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="mb-1.5 block text-xs font-black text-slate-600">
                      Cantidad
                    </span>

                    <div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          onCambiarCantidad(
                            lineaId,
                            Math.max(1, cantidad - 1)
                          )
                        }
                        className="flex w-11 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.cantidad}
                        onFocus={(evento) =>
                          evento.target.select()
                        }
                        onChange={(evento) =>
                          onCambiarCantidad(
                            lineaId,
                            evento.target.value
                          )
                        }
                        className="min-w-0 flex-1 border-x border-slate-200 text-center text-sm font-black outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          onCambiarCantidad(
                            lineaId,
                            cantidad + 1
                          )
                        }
                        className="flex w-11 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <label>
                    <span className="mb-1.5 block text-xs font-black text-slate-600">
                      Costo unitario
                    </span>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                        $
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.costoUnitario}
                        onFocus={(evento) =>
                          evento.target.select()
                        }
                        onChange={(evento) =>
                          onCambiarCosto(
                            lineaId,
                            evento.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 !pl-7 pr-3 text-right text-sm font-black outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </label>
                </div>

                <label className="mt-3 block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-slate-600">
                    <CalendarClock className="h-4 w-4 text-blue-600" />
                    Fecha de caducidad
                  </span>

                  <input
                    type="date"
                    min={new Date()
                      .toISOString()
                      .slice(0, 10)}
                    value={item.fechaCaducidad ?? ""}
                    onChange={(evento) =>
                      onCambiarFecha(
                        lineaId,
                        evento.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                  <span className="text-xs font-black text-slate-500">
                    Subtotal del lote
                  </span>

                  <span className="text-lg font-black text-slate-950">
                    {moneda(subtotal)}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>

      {carrito.length > 0 && (
        <footer className="border-t border-slate-100 bg-white p-5">
          <button
            type="button"
            onClick={onVaciar}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-black text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Vaciar compra
          </button>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Total de compra
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {totalUnidades} unidades en{" "}
                  {carrito.length}{" "}
                  {carrito.length === 1
                    ? "lote"
                    : "lotes"}
                </p>
              </div>

              <p className="text-3xl font-black tracking-tight text-slate-950">
                {moneda(total)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRegistrarCompra}
            disabled={
              guardando || carrito.length === 0
            }
            className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            {guardando ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}

            {guardando
              ? "Registrando compra..."
              : "Registrar compra"}
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            El stock se actualizará al confirmar.
          </p>
        </footer>
      )}
    </section>
  );
}

export default ResumenCompra;
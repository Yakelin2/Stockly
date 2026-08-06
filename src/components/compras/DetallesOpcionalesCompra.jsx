import {
  ChevronDown,
  FileText,
  Plus,
  Truck,
} from "lucide-react";

function DetallesOpcionalesCompra({
  abierto,
  proveedores,
  proveedorId,
  numeroFactura,
  observaciones,
  onAlternar,
  onCambiarProveedor,
  onCambiarFactura,
  onCambiarObservaciones,
  onAgregarProveedor,
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onAlternar}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50/80"
        aria-expanded={abierto}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-blue-600 ring-1 ring-blue-100">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="font-black text-slate-950">
              Detalles opcionales
            </h2>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              Proveedor, factura y observaciones
            </p>
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          abierto
            ? "grid-rows-[1fr] border-t border-slate-100"
            : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-slate-600">
                <Truck className="h-4 w-4 text-blue-600" />
                Proveedor
              </span>

              <select
                value={proveedorId}
                onChange={(evento) =>
                  onCambiarProveedor(evento.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">
                  Sin proveedor
                </option>

                {proveedores.map((proveedor) => (
                  <option
                    key={proveedor.id}
                    value={proveedor.id}
                  >
                    {proveedor.nombre}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onAgregarProveedor}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-blue-600 transition hover:text-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar proveedor
              </button>
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-black text-slate-600">
                Número de factura
              </span>

              <input
                value={numeroFactura}
                onChange={(evento) =>
                  onCambiarFactura(evento.target.value)
                }
                placeholder="Opcional"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-black text-slate-600">
                Observaciones
              </span>

              <textarea
                value={observaciones}
                onChange={(evento) =>
                  onCambiarObservaciones(
                    evento.target.value
                  )
                }
                rows="3"
                placeholder="Notas relacionadas con esta compra..."
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3 sm:col-span-2">
              <p className="text-xs leading-5 text-blue-700">
                Estos datos ayudan a localizar facturas y
                compras anteriores, pero no son obligatorios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DetallesOpcionalesCompra;
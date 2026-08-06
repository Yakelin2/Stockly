import {
  History,
  Plus,
  ShoppingCart,
} from "lucide-react";

function ComprasHeader({
  onNuevoProducto,
  onAbrirHistorial,
}) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-blue-600 ring-1 ring-blue-100">
          <ShoppingCart className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Inventario
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            Compras
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Registra tus compras y mantén tu inventario al día.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onAbrirHistorial}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
        >
          <History className="h-4 w-4" />
          Historial de compras
        </button>

        <button
          type="button"
          onClick={onNuevoProducto}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25"
        >
          <Plus className="h-4 w-4" />
          Producto nuevo
        </button>
      </div>
    </header>
  );
}

export default ComprasHeader;
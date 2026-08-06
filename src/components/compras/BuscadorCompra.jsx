import {
  Barcode,
  Search,
} from "lucide-react";

function BuscadorCompra({
  busqueda,
  busquedaRef,
  onCambiarBusqueda,
  onProcesarCodigo,
  onAbrirCamara,
}) {
  function manejarEnter(evento) {
    if (
      evento.key === "Enter" &&
      busqueda.trim()
    ) {
      evento.preventDefault();
      onProcesarCodigo(busqueda.trim());
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            ref={busquedaRef}
            value={busqueda}
            onChange={(evento) =>
              onCambiarBusqueda(
                evento.target.value
              )
            }
            onKeyDown={manejarEnter}
            placeholder="Buscar por nombre o escanear código de barras..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white !pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={onAbrirCamara}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
        >
          <Barcode className="h-5 w-5" />
          Escanear
        </button>
      </div>
    </section>
  );
}

export default BuscadorCompra;
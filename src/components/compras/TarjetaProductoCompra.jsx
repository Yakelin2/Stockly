import {
  Barcode,
  CheckCircle2,
  Link2,
  MoreVertical,
  PackagePlus,
  Plus,
  Trash2,
} from "lucide-react";

function TarjetaProductoCompra({
  producto,
  imagen,
  codigo,
  costo,
  codigosTotales = 1,
  agregado = false,
  menuAbierto = false,
  onAgregar,
  onAlternarMenu,
  onAsociarCodigo,
  onEliminar,
}) {
  const stock = Number(producto.stock) || 0;

  const estadoStock =
    stock <= 0
      ? {
          texto: "Agotado",
          clases:
            "border-red-200 bg-red-50 text-red-700",
          punto: "bg-red-500",
        }
      : stock <= 5
        ? {
            texto: `Stock bajo: ${stock}`,
            clases:
              "border-amber-200 bg-amber-50 text-amber-700",
            punto: "bg-amber-500",
          }
        : {
            texto: `Stock: ${stock}`,
            clases:
              "border-emerald-200 bg-emerald-50 text-emerald-700",
            punto: "bg-emerald-500",
          };

  return (
    <article
      className={`group relative flex min-h-[280px] flex-col overflow-visible rounded-[26px] border p-4 transition-all duration-200 ${
        agregado
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-lg shadow-emerald-100/70"
          : "border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/40 shadow-sm hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/70"
      }`}
    >
      {agregado && (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5" />
          En compra
        </div>
      )}

      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-inner">
          {imagen ? (
            <img
              src={imagen}
              alt={producto.nombre}
              className="h-full w-full object-contain p-2 transition duration-200 group-hover:scale-105"
            />
          ) : (
            <PackagePlus className="h-8 w-8 text-slate-300" />
          )}
        </div>

        <div
          className={`min-w-0 flex-1 ${
            agregado ? "pr-20" : ""
          }`}
        >
          <p className="line-clamp-2 min-h-10 text-[15px] font-black leading-5 text-slate-950">
            {producto.nombre}
          </p>

          <div className="mt-2 flex min-w-0 items-center gap-2">
            <Barcode className="h-4 w-4 shrink-0 text-slate-400" />

            <p className="truncate text-xs text-slate-500">
              {codigo}
            </p>

            {codigosTotales > 1 && (
              <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
                +{codigosTotales - 1}
              </span>
            )}
          </div>

          <span
            className={`mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-black ${estadoStock.clases}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${estadoStock.punto}`}
            />
            {estadoStock.texto}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black text-slate-500">
            Último costo registrado
          </span>

          <span className="text-base font-black text-slate-950">
            {costo}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onAgregar}
          className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-black transition-all duration-200 ${
            agregado
              ? "border-emerald-300 bg-emerald-100 text-emerald-800 hover:-translate-y-0.5 hover:bg-emerald-200 hover:shadow-md"
              : "border-blue-200 bg-white text-blue-700 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
          }`}
        >
          <Plus className="h-4 w-4" />

          {agregado
            ? "Agregar otro lote"
            : "Agregar a compra"}
        </button>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-400">
            Registro por lote
          </p>

          <div className="relative">
            <button
              type="button"
              onClick={onAlternarMenu}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-white hover:text-slate-700 hover:shadow-sm"
              aria-label={`Opciones de ${producto.nombre}`}
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {menuAbierto && (
              <div className="absolute bottom-12 right-0 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-2xl">
                <button
                  type="button"
                  onClick={onAsociarCodigo}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <Link2 className="h-4 w-4 text-blue-600" />
                  Asociar otro código
                </button>

                <button
                  type="button"
                  onClick={onEliminar}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar del catálogo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default TarjetaProductoCompra;
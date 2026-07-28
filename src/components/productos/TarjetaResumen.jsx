function TarjetaResumen({ titulo, valor, icono }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {valor}
        </p>

        {icono && (
          <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
            {icono}
          </div>
        )}
      </div>
    </article>
  );
}

export default TarjetaResumen;

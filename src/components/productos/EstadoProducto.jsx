function EstadoProducto({ agotado, bajo }) {
  if (agotado) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Agotado
      </span>
    );
  }

  if (bajo) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        Stock bajo
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      Disponible
    </span>
  );
}

export default EstadoProducto;

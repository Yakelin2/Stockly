function Campo({
  etiqueta,
  name,
  type = "text",
  value,
  onChange,
  ...propiedades
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {etiqueta}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...propiedades}
      />
    </label>
  );
}

export default Campo;

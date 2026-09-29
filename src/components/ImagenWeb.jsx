import { useId, useState } from "react";
import { Link, Loader2 } from "lucide-react";
import { validarUrlImagen } from "../utils/imagenWeb.js";

export default function ImagenWeb({ onSeleccionar, disabled = false }) {
  const id = useId();
  const [enlace, setEnlace] = useState("");
  const [candidata, setCandidata] = useState(null);
  const [cargada, setCargada] = useState(null);
  const [error, setError] = useState("");
  const [seleccionada, setSeleccionada] = useState(false);

  function comprobar() {
    if (disabled) return;
    setError("");
    setSeleccionada(false);
    setCargada(null);
    setCandidata(null);
    try {
      const url = validarUrlImagen(enlace);
      if (!url) throw new Error("Pega el enlace directo de una imagen.");
      setCandidata({ url, intento: Date.now() });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <details className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-blue-700">Usar imagen de internet</summary>
      <div className="mt-3 space-y-3">
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">Enlace de la imagen</label>
        <input id={id} type="text" inputMode="url" value={enlace} disabled={disabled}
          placeholder="https://ejemplo.com/producto.jpg" autoComplete="off"
          onChange={(evento) => {
            setEnlace(evento.target.value);
            setCandidata(null);
            setCargada(null);
            setError("");
            setSeleccionada(false);
          }}
          onKeyDown={(evento) => { if (evento.key === "Enter") { evento.preventDefault(); comprobar(); } }}
          className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50" />
        <p className="text-xs leading-5 text-slate-500">Copia la dirección de la imagen, no la página donde aparece. Debe ser pública y seguir disponible en su sitio de origen.</p>
        <button type="button" onClick={comprobar} disabled={disabled || !enlace.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 disabled:opacity-50">
          <Link size={16} aria-hidden="true" />Ver imagen
        </button>
        {candidata && !error && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
            <img key={candidata.intento} src={candidata.url} referrerPolicy="no-referrer" alt="Vista previa de la imagen de internet"
              className="mx-auto h-36 max-w-full rounded-lg object-contain"
              onLoad={() => setCargada(candidata)}
              onError={() => { setCargada(null); setError("No se pudo cargar la imagen. Revisa el enlace o prueba otra imagen pública."); }} />
            {cargada !== candidata && <p role="status" className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Cargando vista previa…</p>}
            <button type="button" disabled={disabled || cargada !== candidata || seleccionada}
              onClick={() => { onSeleccionar(candidata.url); setSeleccionada(true); }}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {seleccionada ? "Imagen seleccionada" : "Usar esta imagen"}
            </button>
            {seleccionada && <p role="status" className="text-xs text-emerald-700">Lista. Guarda el formulario para aplicar el cambio.</p>}
          </div>
        )}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>
    </details>
  );
}

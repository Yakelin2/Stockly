import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { actualizarContrasena } from "../services/authService.js";

function RestablecerContrasena() {
  const navigate = useNavigate();
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function enviar(evento) {
    evento.preventDefault();
    if (contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (contrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      setCargando(true);
      await actualizarContrasena(contrasena);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] p-5">
      <form onSubmit={enviar} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-slate-950">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-slate-500">Elige una contraseña segura para tu cuenta.</p>
        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <label className="mt-6 block text-sm font-bold text-slate-700">Contraseña
          <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3" required />
        </label>
        <label className="mt-4 block text-sm font-bold text-slate-700">Confirmar contraseña
          <input type="password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3" required />
        </label>
        <button disabled={cargando} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-50">
          {cargando && <Loader2 className="h-5 w-5 animate-spin" />}
          Guardar contraseña
        </button>
      </form>
    </main>
  );
}

export default RestablecerContrasena;

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { recuperarContrasena } from "../services/authService.js";

function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function enviar(evento) {
    evento.preventDefault();
    try {
      setCargando(true);
      setError("");
      await recuperarContrasena(correo);
      setMensaje("Te enviamos un enlace para restablecer tu contraseña.");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] p-5">
      <form onSubmit={enviar} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900">
          <ArrowLeft size={18} /> Volver
        </Link>
        <h1 className="mt-6 text-3xl font-black text-slate-950">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-slate-500">Recibirás un enlace seguro en tu correo.</p>
        {mensaje && <div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{mensaje}</div>}
        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <label className="mt-6 block">
          <span className="text-sm font-bold text-slate-700">Correo electrónico</span>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-3 outline-none focus:border-blue-500" />
          </div>
        </label>
        <button disabled={cargando} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-50">
          {cargando && <Loader2 className="h-5 w-5 animate-spin" />}
          Enviar enlace
        </button>
      </form>
    </main>
  );
}

export default RecuperarContrasena;

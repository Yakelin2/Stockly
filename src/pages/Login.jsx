import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Store,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext.jsx";

function Login() {
  const {
    autenticado,
    cargando: cargandoAuth,
    iniciarSesion,
  } = useAuth();
  const location = useLocation();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  if (autenticado && !cargandoAuth) {
    return (
      <Navigate
        to={location.state?.desde || "/"}
        replace
      />
    );
  }

  async function enviar(evento) {
    evento.preventDefault();
    try {
      setCargando(true);
      setError("");
      await iniciarSesion(correo, contrasena);
    } catch (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : err.message
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <section className="hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Store className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Stockly</h1>
            <p className="text-sm text-blue-100">Control inteligente</p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-200">
            Inventario, ventas y decisiones
          </p>
          <h2 className="mt-5 text-5xl font-black leading-tight">
            Todo tu negocio bajo control.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-blue-100">
            Administra productos, compras, ventas, pérdidas, lotes,
            caducidades y reportes desde una sola plataforma.
          </p>
        </div>

        <p className="text-sm text-blue-200">
          Stockly © 2026
        </p>
      </section>

      <section className="flex items-center justify-center bg-[#f4f7fb] p-5 sm:p-10">
        <form
          onSubmit={enviar}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-900/10 sm:p-9"
        >
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-950">Stockly</p>
              <p className="text-xs text-slate-500">Control inteligente</p>
            </div>
          </div>

          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Bienvenido
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Ingresa con la cuenta asignada a tu tienda.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="mt-6 block">
            <span className="text-sm font-bold text-slate-700">Correo electrónico</span>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="administrador@tienda.com"
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Contraseña</span>
            <div className="relative mt-2">
              <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={mostrar ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-11 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrar((actual) => !actual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {mostrar ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          <div className="mt-4 text-right">
            <Link
              to="/recuperar-contrasena"
              className="text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
          >
            {cargando && <Loader2 className="h-5 w-5 animate-spin" />}
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;

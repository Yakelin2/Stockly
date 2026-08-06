import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
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
  const [contrasena, setContrasena] =
    useState("");
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  if (autenticado && !cargandoAuth) {
    const rutaAnterior = location.state?.desde;

    const destinoSeguro =
      rutaAnterior &&
      rutaAnterior !== "/sin-acceso" &&
      rutaAnterior !== "/login"
        ? rutaAnterior
        : "/";

    return (
      <Navigate
        to={destinoSeguro}
        replace
      />
    );
  }

  async function enviar(evento) {
    evento.preventDefault();

    try {
      setCargando(true);
      setError("");

      await iniciarSesion(
        correo.trim(),
        contrasena
      );
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

  const procesando = cargando || cargandoAuth;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef4ff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_30%)]" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[#07111f] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(37,99,235,0.28),_transparent_28%),radial-gradient(circle_at_80%_80%,_rgba(14,165,233,0.18),_transparent_26%)]" />

          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-4 top-36 h-44 w-44 rounded-full border border-white/10" />
          <div className="absolute bottom-16 left-16 h-28 w-28 rounded-3xl border border-white/10 bg-white/5 backdrop-blur" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/40">
              <Store className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Stockly
              </h1>

              <p className="text-sm text-slate-400">
                Control inteligente
              </p>
            </div>
          </div>

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              <Sparkles className="h-4 w-4" />
              Inventario, ventas y decisiones
            </div>

            <h2 className="mt-6 max-w-xl text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
              Todo tu negocio,
              <span className="block text-blue-400">
                bajo control.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Administra productos, compras, ventas,
              pérdidas, lotes, caducidades y reportes
              desde una sola plataforma.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                "Inventario ordenado",
                "Ventas más rápidas",
                "Decisiones claras",
              ].map((beneficio) => (
                <div
                  key={beneficio}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-slate-200 backdrop-blur"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {beneficio}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-between text-sm text-slate-400">
            <p>Stockly © 2026</p>

            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Acceso protegido
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-10 xl:px-16">
          <div className="w-full max-w-[500px]">
            <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Store className="h-7 w-7" />
              </div>

              <div>
                <p className="text-2xl font-black tracking-tight text-slate-950">
                  Stockly
                </p>

                <p className="text-sm text-slate-500">
                  Control inteligente
                </p>
              </div>
            </div>

            <form
              onSubmit={enviar}
              className="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur sm:p-9"
            >
              <div className="text-center sm:text-left">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                  Bienvenido de nuevo
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Iniciar sesión
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Ingresa con la cuenta asignada a tu
                  tienda.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="mt-7 space-y-5">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Correo electrónico
                  </span>

                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-center">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>

                    <input
                      type="email"
                      value={correo}
                      onChange={(evento) =>
                        setCorreo(evento.target.value)
                      }
                      required
                      autoComplete="email"
                      autoFocus
                      disabled={procesando}
                      className="h-14 w-full rounded-2xl border border-slate-300 bg-white !pl-16 pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                      placeholder="administrador@tienda.com"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Contraseña
                  </span>

                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-center">
                      <LockKeyhole className="h-5 w-5 text-slate-400" />
                    </div>

                    <input
                      type={
                        mostrar
                          ? "text"
                          : "password"
                      }
                      value={contrasena}
                      onChange={(evento) =>
                        setContrasena(
                          evento.target.value
                        )
                      }
                      required
                      autoComplete="current-password"
                      disabled={procesando}
                      className="h-14 w-full rounded-2xl border border-slate-300 bg-white !pl-16 pr-14 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                      placeholder="Escribe tu contraseña"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrar(
                          (actual) => !actual
                        )
                      }
                      disabled={procesando}
                      className="absolute inset-y-0 right-0 flex w-14 items-center justify-center rounded-r-2xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 disabled:opacity-50"
                      aria-label={
                        mostrar
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {mostrar ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </label>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  to="/recuperar-contrasena"
                  className="text-sm font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={
                  procesando ||
                  !correo.trim() ||
                  !contrasena
                }
                className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 font-black text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
              >
                {procesando ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Preparando Stockly...
                  </>
                ) : (
                  <>
                    Entrar al sistema
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4" />
                Tu sesión está protegida por
                Supabase Auth
              </div>
            </form>

            <p className="mt-5 text-center text-xs text-slate-400">
              Acceso exclusivo para usuarios autorizados.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;

import {
  ArrowRight,
  LogOut,
  ShieldX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext.jsx";

function SinAcceso() {
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();

  async function salir() {
    await cerrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl shadow-slate-900/10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <ShieldX className="h-9 w-9" />
        </div>

        <h1 className="mt-5 text-3xl font-black text-slate-950">
          Acceso restringido
        </h1>

        <p className="mt-2 text-slate-500">
          Tu rol no tiene permiso para abrir este módulo.
        </p>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/", { replace: true })
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-black text-white hover:bg-blue-700"
          >
            Ir a mi página principal
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={salir}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  );
}

export default SinAcceso;

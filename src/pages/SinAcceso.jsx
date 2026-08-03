import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

function SinAcceso() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
      <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <ShieldX className="mx-auto h-14 w-14 text-red-500" />
        <h1 className="mt-4 text-3xl font-black text-slate-950">Acceso restringido</h1>
        <p className="mt-2 text-slate-500">Tu rol no tiene permiso para abrir este módulo.</p>
        <Link to="/" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-black text-white">Volver al inicio</Link>
      </div>
    </main>
  );
}

export default SinAcceso;

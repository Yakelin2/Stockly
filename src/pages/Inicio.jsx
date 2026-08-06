import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "../contexts/AuthContext.jsx";

const DESTINOS = [
  { permiso: "dashboard.ver", ruta: "/dashboard" },
  { permiso: "ventas.ver", ruta: "/ventas" },
  { permiso: "productos.ver", ruta: "/productos" },
  { permiso: "compras.ver", ruta: "/compras" },
  { permiso: "perdidas.ver", ruta: "/perdidas" },
  { permiso: "reportes.ver", ruta: "/reportes" },
  { permiso: "configuracion.ver", ruta: "/configuracion" },
];

function Inicio() {
  const {
    perfil,
    autenticado,
    cargando,
    tienePermiso,
  } = useAuth();

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-3 font-semibold text-slate-500">
            Preparando tu espacio de trabajo...
          </p>
        </div>
      </main>
    );
  }

  if (!autenticado || !perfil) {
    return <Navigate to="/login" replace />;
  }

  const destino = DESTINOS.find(
    ({ permiso }) => tienePermiso(permiso)
  );

  if (!destino) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return <Navigate to={destino.ruta} replace />;
}

export default Inicio;

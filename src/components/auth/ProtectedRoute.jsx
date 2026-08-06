import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext.jsx";

function ProtectedRoute({ permiso, children }) {
  const {
    sesion,
    perfil,
    autenticado,
    cargando,
    tienePermiso,
  } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-3 font-semibold text-slate-500">
            Preparando Stockly...
          </p>
        </div>
      </div>
    );
  }

  if (!sesion) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ desde: location.pathname }}
      />
    );
  }

  if (!perfil || !autenticado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-3 font-semibold text-slate-500">
            Cargando perfil y permisos...
          </p>
        </div>
      </div>
    );
  }

  if (permiso && !tienePermiso(permiso)) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return children;
}

export default ProtectedRoute;

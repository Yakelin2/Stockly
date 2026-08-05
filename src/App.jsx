import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import MainLayout from "./layouts/MainLayout";
import Compras from "./pages/Compras";
import Configuracion from "./pages/Configuracion";
import Dashboard from "./pages/Dashboard";
import Inicio from "./pages/Inicio.jsx";
import Login from "./pages/Login.jsx";
import Perdidas from "./pages/Perdidas";
import Productos from "./pages/Productos";
import RecuperarContrasena from "./pages/RecuperarContrasena.jsx";
import Reportes from "./pages/Reportes";
import RestablecerContrasena from "./pages/RestablecerContrasena.jsx";
import SinAcceso from "./pages/SinAcceso.jsx";
import Ventas from "./pages/Ventas";

function Ruta({ permiso, children }) {
  return (
    <ProtectedRoute permiso={permiso}>
      {children}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/recuperar-contrasena"
            element={<RecuperarContrasena />}
          />

          <Route
            path="/restablecer-contrasena"
            element={<RestablecerContrasena />}
          />

          <Route
            path="/sin-acceso"
            element={<SinAcceso />}
          />

          <Route
            path="/"
            element={
              <Ruta>
                <Inicio />
              </Ruta>
            }
          />

          <Route
            element={
              <Ruta>
                <MainLayout />
              </Ruta>
            }
          >
            <Route
              path="/dashboard"
              element={
                <Ruta permiso="dashboard.ver">
                  <Dashboard />
                </Ruta>
              }
            />

            <Route
              path="/productos"
              element={
                <Ruta permiso="productos.ver">
                  <Productos />
                </Ruta>
              }
            />

            <Route
              path="/ventas"
              element={
                <Ruta permiso="ventas.ver">
                  <Ventas />
                </Ruta>
              }
            />

            <Route
              path="/compras"
              element={
                <Ruta permiso="compras.ver">
                  <Compras />
                </Ruta>
              }
            />

            <Route
              path="/perdidas"
              element={
                <Ruta permiso="perdidas.ver">
                  <Perdidas />
                </Ruta>
              }
            />

            <Route
              path="/reportes"
              element={
                <Ruta permiso="reportes.ver">
                  <Reportes />
                </Ruta>
              }
            />

            <Route
              path="/configuracion"
              element={
                <Ruta permiso="configuracion.ver">
                  <Configuracion />
                </Ruta>
              }
            />
          </Route>

          <Route path="*" element={<Inicio />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

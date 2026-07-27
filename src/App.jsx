import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Compras from "./pages/Compras";
import Configuracion from "./pages/Configuracion";
import Dashboard from "./pages/Dashboard";
import Perdidas from "./pages/Perdidas";
import Productos from "./pages/Productos";
import Reportes from "./pages/Reportes";
import Ventas from "./pages/Ventas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/perdidas" element={<Perdidas />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route
            path="/configuracion"
            element={<Configuracion />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

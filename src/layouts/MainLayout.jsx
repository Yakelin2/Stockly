import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  const [menuAbierto, setMenuAbierto] =
    useState(false);

  function abrirMenu() {
    setMenuAbierto(true);
  }

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar
        abierto={menuAbierto}
        onCerrar={cerrarMenu}
      />

      <div className="min-w-0 flex-1">
        <Header onAbrirMenu={abrirMenu} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
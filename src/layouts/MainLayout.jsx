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
    <div className="min-h-screen bg-[#f4f7fb] lg:flex">
      <Sidebar
        abierto={menuAbierto}
        onCerrar={cerrarMenu}
      />

      <div className="min-w-0 flex-1">
        <Header onAbrirMenu={abrirMenu} />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-7 xl:p-8">
          <Outlet />
        </main>

        <footer className="px-4 pb-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          Stockly © 2026 · Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;

import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  TrendingDown,
  Truck,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Inicio", path: "/", icon: LayoutDashboard },
  { name: "Productos", path: "/productos", icon: Package },
  { name: "Ventas", path: "/ventas", icon: ShoppingCart },
  { name: "Compras", path: "/compras", icon: Truck },
  { name: "Pérdidas", path: "/perdidas", icon: TrendingDown },
  { name: "Reportes", path: "/reportes", icon: BarChart3 },
  { name: "Configuración", path: "/configuracion", icon: Settings },
];

function Sidebar({
  abierto = false,
  onCerrar = () => {},
}) {
  return (
    <>
      {abierto && (
        <button
          type="button"
          onClick={onCerrar}
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex min-h-screen w-64 flex-col bg-[#07111f] text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
          abierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/30">
              <Store size={23} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                Stockly
              </h1>

              <p className="text-xs text-slate-400">
                Control inteligente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onCerrar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-bold">
              Mi tienda
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Plan inicial
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  TrendingDown,
  BarChart3,
  Settings,
  Store,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Inicio",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Productos",
    path: "/productos",
    icon: Package,
  },
  {
    name: "Ventas",
    path: "/ventas",
    icon: ShoppingCart,
  },
  {
    name: "Compras",
    path: "/compras",
    icon: Truck,
  },
  {
    name: "Pérdidas",
    path: "/perdidas",
    icon: TrendingDown,
  },
  {
    name: "Reportes",
    path: "/reportes",
    icon: BarChart3,
  },
  {
    name: "Configuración",
    path: "/configuracion",
    icon: Settings,
  },
];

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 flex-col bg-slate-950 text-white lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
          <Store size={24} />
        </div>

        <div>
          <h1 className="text-xl font-bold">Stockly</h1>
          <p className="text-xs text-slate-400">Control inteligente</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-900 p-4">
          <p className="text-sm font-semibold">Mi tienda</p>
          <p className="mt-1 text-xs text-slate-400">
            Plan inicial
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
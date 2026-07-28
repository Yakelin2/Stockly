import {
  Bell,
  Menu,
  Search,
  UserRound,
} from "lucide-react";

function Header({ onAbrirMenu }) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAbrirMenu}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Panel de control
          </h2>

          <p className="hidden text-sm text-slate-500 sm:block">
            Resumen general de tu negocio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="search"
            placeholder="Buscar..."
            className="w-48 bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>

        <button
          type="button"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
          aria-label="Notificaciones"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <UserRound size={18} />
          </div>

          <span className="hidden text-sm font-semibold sm:block">
            Administrador
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;
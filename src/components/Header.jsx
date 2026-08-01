import {
  Bell,
  Menu,
  Search,
  UserRound,
} from "lucide-react";

function Header({ onAbrirMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAbrirMenu}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950">
            Panel de control
          </h2>

          <p className="hidden text-sm text-slate-500 sm:block">
            Resumen general de tu negocio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:flex">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="search"
            placeholder="Buscar..."
            className="w-52 bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>

        <button
          type="button"
          className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
          aria-label="Notificaciones"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <UserRound size={18} />
          </div>

          <span className="hidden text-sm font-bold sm:block">
            Administrador
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;

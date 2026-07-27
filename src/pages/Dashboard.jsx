import {
  AlertTriangle,
  CircleDollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

const cards = [
  {
    title: "Ventas del día",
    value: "$0.00",
    description: "0 ventas registradas",
    icon: ShoppingCart,
  },
  {
    title: "Ganancia estimada",
    value: "$0.00",
    description: "Calculada según las ventas",
    icon: TrendingUp,
  },
  {
    title: "Dinero invertido",
    value: "$0.00",
    description: "Valor actual del inventario",
    icon: CircleDollarSign,
  },
  {
    title: "Productos registrados",
    value: "0",
    description: "0 con inventario bajo",
    icon: Package,
  },
];

function Dashboard() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Buenos días
        </h1>

        <p className="mt-1 text-slate-500">
          Aquí podrás revisar cómo va tu tienda.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <Icon size={22} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {card.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Ventas recientes
              </h2>

              <p className="text-sm text-slate-500">
                Las últimas operaciones aparecerán aquí.
              </p>
            </div>
          </div>

          <div className="mt-8 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
            <ShoppingCart size={38} className="text-slate-300" />

            <p className="mt-3 font-semibold text-slate-600">
              Todavía no hay ventas
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Cuando registres una venta se mostrará en esta sección.
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Inventario bajo
              </h2>

              <p className="text-sm text-slate-500">
                Productos por reabastecer
              </p>
            </div>
          </div>

          <div className="mt-8 flex min-h-48 flex-col items-center justify-center text-center">
            <Package size={38} className="text-slate-300" />

            <p className="mt-3 font-semibold text-slate-600">
              Todo está en orden
            </p>

            <p className="mt-1 text-sm text-slate-400">
              No existen productos con inventario bajo.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;
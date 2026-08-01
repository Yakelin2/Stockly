// src/pages/Dashboard.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Clock3,
  Loader2,
  Package,
  PackagePlus,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import { obtenerDashboard } from "../services/dashboardService.js";

const ESTADO_INICIAL = {
  ventas_dia: 0,
  cantidad_ventas_dia: 0,
  compras_dia: 0,
  cantidad_compras_dia: 0,
  ganancia_dia: 0,
  valor_inventario: 0,
  productos_registrados: 0,
  productos_stock_bajo: 0,
  productos_agotados: 0,
  ventas_recientes: [],
  compras_recientes: [],
  inventario_bajo: [],
  ventas_ultimos_7_dias: [],
  productos_mas_vendidos: [],
  productos_por_caducar: 0,
  productos_caducados: 0,
  valor_caducado: 0,
  caducidades_proximas: [],
};

function moneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor) || 0);
}

function fechaCorta(valor) {
  if (!valor) return "Sin fecha";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function nombreDia(fecha) {
  if (!fecha) return "";

  const texto = String(fecha);
  const valor = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(texto)
      ? `${texto}T12:00:00`
      : texto
  );

  if (Number.isNaN(valor.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
  })
    .format(valor)
    .replace(".", "");
}

function TarjetaMetrica({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  tono = "blue",
}) {
  const tonos = {
    green: {
      icono: "bg-emerald-50 text-emerald-600",
      acento: "border-t-emerald-500",
    },
    violet: {
      icono: "bg-violet-50 text-violet-600",
      acento: "border-t-violet-500",
    },
    amber: {
      icono: "bg-amber-50 text-amber-600",
      acento: "border-t-amber-500",
    },
    blue: {
      icono: "bg-blue-50 text-blue-600",
      acento: "border-t-blue-500",
    },
  };

  const estilo = tonos[tono] ?? tonos.blue;

  return (
    <article
      className={`rounded-2xl border border-slate-200 border-t-4 bg-white p-4 shadow-sm ${estilo.acento}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {titulo}
          </p>

          <p className="mt-1 truncate text-2xl font-black text-slate-950">
            {valor}
          </p>
        </div>

        <div className={`rounded-xl p-2.5 ${estilo.icono}`}>
          <Icono className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {descripcion}
      </p>
    </article>
  );
}

function AccesoRapido({
  to,
  titulo,
  descripcion,
  icono: Icono,
  color = "blue",
}) {
  const estilos = {
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className={`rounded-lg p-2.5 ${estilos[color]}`}>
        <Icono className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">
          {titulo}
        </p>

        <p className="truncate text-xs text-slate-500">
          {descripcion}
        </p>
      </div>
    </Link>
  );
}

function Dashboard() {
  const [datos, setDatos] = useState(ESTADO_INICIAL);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarDashboard = useCallback(async (esActualizacion = false) => {
    if (esActualizacion) {
      setActualizando(true);
    } else {
      setCargando(true);
    }

    setError("");

    try {
      const resultado = await obtenerDashboard();
      setDatos({ ...ESTADO_INICIAL, ...resultado });
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible cargar el panel de control."
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const maxVentaSemanal = useMemo(() => {
    return Math.max(
      ...datos.ventas_ultimos_7_dias.map((item) =>
        Number(item.total)
      ),
      1
    );
  }, [datos.ventas_ultimos_7_dias]);

  const maxProductoVendido = useMemo(() => {
    return Math.max(
      ...datos.productos_mas_vendidos.map((item) =>
        Number(item.unidades)
      ),
      1
    );
  }, [datos.productos_mas_vendidos]);

  const diferenciaDia =
    Number(datos.ventas_dia) - Number(datos.compras_dia);

  if (cargando) {
    return (
      <section className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Cargando información de la tienda...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 pb-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Resumen general
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            Buenos días
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Este es el estado actual de tu tienda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => cargarDashboard(true)}
          disabled={actualizando}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              actualizando ? "animate-spin" : ""
            }`}
          />

          Actualizar
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaMetrica
          titulo="Ventas del día"
          valor={moneda(datos.ventas_dia)}
          descripcion={`${datos.cantidad_ventas_dia} ${
            Number(datos.cantidad_ventas_dia) === 1
              ? "venta registrada"
              : "ventas registradas"
          }`}
          icono={ShoppingCart}
          tono="green"
        />

        <TarjetaMetrica
          titulo="Ganancia estimada"
          valor={moneda(datos.ganancia_dia)}
          descripcion="Ingresos menos costo estimado de ventas"
          icono={TrendingUp}
          tono="violet"
        />

        <TarjetaMetrica
          titulo="Dinero invertido"
          valor={moneda(datos.valor_inventario)}
          descripcion="Valor actual del inventario a costo"
          icono={CircleDollarSign}
          tono="amber"
        />

        <TarjetaMetrica
          titulo="Productos registrados"
          valor={String(datos.productos_registrados)}
          descripcion={`${datos.productos_stock_bajo} bajos y ${datos.productos_agotados} agotados`}
          icono={Package}
          tono="blue"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AccesoRapido
          to="/ventas"
          titulo="Nueva venta"
          descripcion="Registrar una salida"
          icono={ShoppingCart}
          color="green"
        />

        <AccesoRapido
          to="/compras"
          titulo="Nueva compra"
          descripcion="Recibir mercancía"
          icono={Truck}
          color="violet"
        />

        <AccesoRapido
          to="/productos"
          titulo="Nuevo producto"
          descripcion="Agregar al catálogo"
          icono={PackagePlus}
          color="blue"
        />

        <AccesoRapido
          to="/reportes"
          titulo="Ver reportes"
          descripcion="Consultar operaciones"
          icono={BarChart3}
          color="amber"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Ventas de los últimos 7 días
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Comparación diaria de ingresos.
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 grid h-52 grid-cols-7 items-end gap-2 sm:gap-3">
            {datos.ventas_ultimos_7_dias.map((item) => {
              const porcentaje =
                (Number(item.total) / maxVentaSemanal) * 100;

              const esMaximo =
                Number(item.total) === maxVentaSemanal &&
                Number(item.total) > 0;

              return (
                <div
                  key={item.fecha}
                  className="flex h-full min-w-0 flex-col justify-end"
                >
                  <p className="mb-2 hidden truncate text-center text-xs font-semibold text-slate-600 sm:block">
                    {moneda(item.total)}
                  </p>

                  <div className="flex h-32 items-end justify-center rounded-xl bg-slate-50 px-1">
                    <div
                      title={`${item.fecha}: ${moneda(item.total)}`}
                      className={`w-full max-w-10 rounded-t-lg transition-all duration-500 ${
                        esMaximo
                          ? "bg-blue-600"
                          : "bg-blue-300"
                      }`}
                      style={{
                        height: `${Math.max(
                          porcentaje,
                          item.total > 0 ? 8 : 2
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 truncate text-center text-xs font-bold capitalize text-slate-500">
                    {nombreDia(item.fecha)}
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">
            Balance de hoy
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Entradas y salidas de dinero.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  Ventas
                </p>

                <p className="mt-1 text-xl font-black text-emerald-950">
                  {moneda(datos.ventas_dia)}
                </p>
              </div>

              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-violet-50 p-3">
              <div>
                <p className="text-xs font-semibold text-violet-700">
                  Compras
                </p>

                <p className="mt-1 text-xl font-black text-violet-950">
                  {moneda(datos.compras_dia)}
                </p>
              </div>

              <ArrowDownLeft className="h-5 w-5 text-violet-600" />
            </div>

            <div
              className={`flex items-center justify-between rounded-xl p-3 ${
                diferenciaDia >= 0
                  ? "bg-blue-50"
                  : "bg-red-50"
              }`}
            >
              <div>
                <p
                  className={`text-xs font-semibold ${
                    diferenciaDia >= 0
                      ? "text-blue-700"
                      : "text-red-700"
                  }`}
                >
                  Diferencia
                </p>

                <p
                  className={`mt-1 text-xl font-black ${
                    diferenciaDia >= 0
                      ? "text-blue-950"
                      : "text-red-950"
                  }`}
                >
                  {moneda(diferenciaDia)}
                </p>
              </div>

              {diferenciaDia >= 0 ? (
                <TrendingUp className="h-5 w-5 text-blue-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Ventas recientes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Últimas operaciones completadas.
            </p>
          </div>

          {datos.ventas_recientes.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-400">
              Todavía no hay ventas registradas.
            </div>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {datos.ventas_recientes.map((venta, indice) => (
                <div
                  key={venta.id || indice}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        Venta {venta.folio ? `#${venta.folio}` : ""}
                      </p>

                      <p className="text-xs text-slate-500">
                        {fechaCorta(venta.creado_en)}
                        {venta.metodo_pago
                          ? ` · ${venta.metodo_pago}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-black text-emerald-700">
                    {moneda(venta.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950">
                Inventario bajo
              </h2>

              <p className="text-sm text-slate-500">
                Productos por reabastecer.
              </p>
            </div>
          </div>

          {datos.inventario_bajo.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-400">
              Todo está en orden.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {datos.inventario_bajo.map((producto, indice) => {
                const agotado = Number(producto.stock) <= 0;

                return (
                  <div
                    key={producto.id || indice}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                      agotado
                        ? "border-red-100 bg-red-50"
                        : "border-amber-100 bg-amber-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {producto.nombre}
                      </p>

                      <p className="text-xs text-slate-500">
                        Mínimo: {producto.stock_minimo}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-black shadow-sm ${
                        agotado
                          ? "text-red-700"
                          : "text-amber-700"
                      }`}
                    >
                      {producto.stock} disponibles
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Compras recientes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Últimas entradas de mercancía.
            </p>
          </div>

          {datos.compras_recientes.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-400">
              Todavía no hay compras registradas.
            </div>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {datos.compras_recientes.map((compra, indice) => (
                <div
                  key={compra.id || indice}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {compra.proveedor || "Compra sin proveedor"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {fechaCorta(compra.creado_en)}
                        {compra.numero_factura
                          ? ` · Factura ${compra.numero_factura}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-black text-violet-700">
                    {moneda(compra.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Productos más vendidos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ranking según unidades vendidas.
            </p>
          </div>

          {datos.productos_mas_vendidos.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-400">
              Aún no hay información suficiente.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {datos.productos_mas_vendidos.map((producto, indice) => {
                const porcentaje =
                  (Number(producto.unidades) /
                    maxProductoVendido) *
                  100;

                return (
                  <div
                    key={producto.producto_id || indice}
                    className="rounded-xl border border-slate-100 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${
                          indice === 0
                            ? "bg-amber-500"
                            : indice === 1
                              ? "bg-slate-400"
                              : indice === 2
                                ? "bg-orange-500"
                                : "bg-slate-800"
                        }`}
                      >
                        {indice + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {producto.nombre}
                            </p>

                            <p className="text-xs text-slate-500">
                              {producto.unidades} unidades vendidas
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-black text-slate-800">
                            {moneda(producto.importe)}
                          </p>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${Math.max(
                                porcentaje,
                                4
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>


      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950">
                Próximos a caducar
              </h2>

              <p className="text-sm text-slate-500">
                Stock que vence en los próximos 14 días.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-700">
              {datos.productos_por_caducar} próximos
            </span>

            <span className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700">
              {datos.productos_caducados} caducados
            </span>
          </div>
        </div>

        {datos.caducidades_proximas.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-400">
            No hay productos próximos a caducar.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {datos.caducidades_proximas.map((lote) => {
              const caducado = Number(lote.dias_restantes) < 0;
              const urgente =
                !caducado &&
                Number(lote.dias_restantes) <= 7;

              return (
                <div
                  key={lote.lote_id}
                  className={`rounded-xl border p-3 ${
                    caducado
                      ? "border-red-200 bg-red-50"
                      : urgente
                        ? "border-orange-200 bg-orange-50"
                        : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {lote.nombre}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {lote.cantidad} unidades · Caduca{" "}
                        {new Intl.DateTimeFormat("es-MX", {
                          dateStyle: "medium",
                        }).format(
                          new Date(
                            `${lote.fecha_caducidad}T12:00:00`
                          )
                        )}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-black shadow-sm ${
                        caducado
                          ? "text-red-700"
                          : urgente
                            ? "text-orange-700"
                            : "text-amber-700"
                      }`}
                    >
                      {caducado
                        ? `Venció hace ${Math.abs(
                            Number(lote.dias_restantes)
                          )} días`
                        : Number(lote.dias_restantes) === 0
                          ? "Caduca hoy"
                          : `${lote.dias_restantes} días`}
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Riesgo estimado: {moneda(lote.costo_estimado)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">
          Estado del inventario
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Resumen general de existencias.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-700">
              Registrados
            </p>

            <p className="mt-1 text-2xl font-black text-blue-950">
              {datos.productos_registrados}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-700">
              Stock bajo
            </p>

            <p className="mt-1 text-2xl font-black text-amber-950">
              {datos.productos_stock_bajo}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-3">
            <p className="text-xs font-semibold text-red-700">
              Agotados
            </p>

            <p className="mt-1 text-2xl font-black text-red-950">
              {datos.productos_agotados}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default Dashboard;
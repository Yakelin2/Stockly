// src/pages/Reportes.jsx

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import { obtenerReportes } from "../services/reportesService.js";

function fechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function moneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor) || 0);
}

function fechaLegible(valor) {
  if (!valor) return "Sin fecha";

  const fecha = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(String(valor))
      ? `${valor}T12:00:00`
      : valor
  );

  if (Number.isNaN(fecha.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(fecha);
}

const COLORES_DONA = [
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#64748b",
];

function rangoInicial() {
  const hasta = new Date();
  const desde = new Date();

  desde.setDate(hasta.getDate() - 29);

  return {
    desde: fechaLocal(desde),
    hasta: fechaLocal(hasta),
  };
}

function Reportes() {
  const inicial = useMemo(rangoInicial, []);

  const [desde, setDesde] = useState(inicial.desde);
  const [hasta, setHasta] = useState(inicial.hasta);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState("");
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const resultado = await obtenerReportes({
        desde,
        hasta,
      });

      setDatos(resultado);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "No fue posible cargar los reportes."
      );
    } finally {
      setCargando(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function aplicarPeriodo(tipo) {
    const fin = new Date();
    const inicio = new Date();

    if (tipo === "hoy") {
      setDesde(fechaLocal(fin));
      setHasta(fechaLocal(fin));
      return;
    }

    if (tipo === "semana") {
      inicio.setDate(fin.getDate() - 6);
    }

    if (tipo === "mes") {
      inicio.setDate(fin.getDate() - 29);
    }

    if (tipo === "anio") {
      inicio.setMonth(fin.getMonth() - 11);
      inicio.setDate(1);
    }

    setDesde(fechaLocal(inicio));
    setHasta(fechaLocal(fin));
  }

  function exportarExcel() {
    if (!datos) return;

    try {
      setExportando("excel");

      const libro = XLSX.utils.book_new();

      const resumen = [
        ["REPORTE STOCKLY"],
        ["Tienda", datos.periodo.tienda],
        ["Desde", datos.periodo.desde],
        ["Hasta", datos.periodo.hasta],
        [],
        ["Indicador", "Valor"],
        ["Ventas", Number(datos.kpis.ventas)],
        ["Compras", Number(datos.kpis.compras)],
        ["Ganancia", Number(datos.kpis.ganancia)],
        [
          "Valor inventario",
          Number(datos.kpis.valor_inventario),
        ],
        ["Pérdidas", Number(datos.kpis.perdidas)],
      ];

      XLSX.utils.book_append_sheet(
        libro,
        XLSX.utils.aoa_to_sheet(resumen),
        "Resumen"
      );

      XLSX.utils.book_append_sheet(
        libro,
        XLSX.utils.json_to_sheet(
          datos.ventas_diarias.map((item) => ({
            Fecha: item.fecha,
            Ventas: Number(item.total),
          }))
        ),
        "Ventas diarias"
      );

      XLSX.utils.book_append_sheet(
        libro,
        XLSX.utils.json_to_sheet(
          datos.productos_mas_vendidos.map((item) => ({
            Producto: item.producto,
            Unidades: Number(item.unidades),
            Ventas: Number(item.ventas),
            Utilidad: Number(item.utilidad),
          }))
        ),
        "Más vendidos"
      );

      XLSX.utils.book_append_sheet(
        libro,
        XLSX.utils.json_to_sheet(
          datos.productos_mas_perdidas.map((item) => ({
            Producto: item.producto,
            Unidades: Number(item.unidades),
            Costo: Number(item.costo),
          }))
        ),
        "Pérdidas"
      );

      XLSX.utils.book_append_sheet(
        libro,
        XLSX.utils.json_to_sheet(
          datos.proximos_caducar.map((item) => ({
            Producto: item.producto,
            Fecha_caducidad: item.fecha_caducidad,
            Dias_restantes: Number(item.dias_restantes),
            Stock: Number(item.stock),
            Costo_riesgo: Number(item.costo_riesgo),
          }))
        ),
        "Caducidades"
      );

      XLSX.writeFile(
        libro,
        `stockly-reporte-${desde}-${hasta}.xlsx`
      );
    } finally {
      setExportando("");
    }
  }

  function exportarPDF() {
    if (!datos) return;

    try {
      setExportando("pdf");

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Reporte Stockly", 14, 18);

      doc.setFontSize(10);
      doc.text(
        `${datos.periodo.tienda} · ${fechaLegible(
          datos.periodo.desde
        )} - ${fechaLegible(datos.periodo.hasta)}`,
        14,
        26
      );

      autoTable(doc, {
        startY: 34,
        head: [["Indicador", "Valor"]],
        body: [
          ["Ventas", moneda(datos.kpis.ventas)],
          ["Compras", moneda(datos.kpis.compras)],
          ["Ganancia", moneda(datos.kpis.ganancia)],
          [
            "Valor del inventario",
            moneda(datos.kpis.valor_inventario),
          ],
          ["Pérdidas", moneda(datos.kpis.perdidas)],
        ],
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [["Producto", "Unidades", "Ventas"]],
        body: datos.productos_mas_vendidos.map(
          (item) => [
            item.producto,
            item.unidades,
            moneda(item.ventas),
          ]
        ),
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [
          ["Próximo a caducar", "Vence", "Stock"],
        ],
        body: datos.proximos_caducar.map(
          (item) => [
            item.producto,
            fechaLegible(item.fecha_caducidad),
            item.stock,
          ]
        ),
      });

      doc.save(
        `stockly-reporte-${desde}-${hasta}.pdf`
      );
    } finally {
      setExportando("");
    }
  }

  if (cargando && !datos) {
    return (
      <section className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-3 font-semibold text-slate-500">
            Preparando reportes...
          </p>
        </div>
      </section>
    );
  }

  const kpis = datos?.kpis ?? {};
  const inventario = datos?.inventario ?? {};
  const periodo = datos?.periodo ?? {};

  return (
    <section className="space-y-5 pb-10">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Inteligencia del negocio
          </p>

          <h1 className="mt-1 text-3xl font-black text-slate-950">
            Reportes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Analiza el rendimiento de tu negocio.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <CalendarDays className="h-4 w-4 text-slate-400" />

            <input
              type="date"
              value={desde}
              onChange={(evento) =>
                setDesde(evento.target.value)
              }
              className="bg-transparent text-sm outline-none"
            />

            <span className="text-slate-300">—</span>

            <input
              type="date"
              value={hasta}
              min={desde}
              onChange={(evento) =>
                setHasta(evento.target.value)
              }
              className="bg-transparent text-sm outline-none"
            />
          </div>

          <button
            type="button"
            onClick={cargar}
            disabled={cargando}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                cargando ? "animate-spin" : ""
              }`}
            />
            Actualizar
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {[
          ["hoy", "Hoy"],
          ["semana", "7 días"],
          ["mes", "30 días"],
          ["anio", "12 meses"],
        ].map(([valor, etiqueta]) => (
          <button
            key={valor}
            type="button"
            onClick={() => aplicarPeriodo(valor)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          titulo="Ventas totales"
          valor={moneda(kpis.ventas)}
          cambio={kpis.ventas_cambio}
          icono={CircleDollarSign}
          tono="green"
        />

        <Kpi
          titulo="Compras totales"
          valor={moneda(kpis.compras)}
          cambio={kpis.compras_cambio}
          icono={ShoppingCart}
          tono="violet"
        />

        <Kpi
          titulo="Ganancia bruta"
          valor={moneda(kpis.ganancia)}
          cambio={kpis.ganancia_cambio}
          icono={TrendingUp}
          tono="green"
        />

        <Kpi
          titulo="Valor de inventario"
          valor={moneda(kpis.valor_inventario)}
          icono={Package}
          tono="amber"
        />

        <Kpi
          titulo="Pérdidas del periodo"
          valor={moneda(kpis.perdidas)}
          cambio={kpis.perdidas_cambio}
          icono={AlertTriangle}
          tono="red"
          invertirCambio
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.8fr_0.8fr]">
        <Panel titulo="Ventas del periodo" icono={BarChart3}>
          <GraficaLinea datos={datos?.ventas_diarias ?? []} />
        </Panel>

        <Panel titulo="Ventas por categoría">
          <Dona
            datos={datos?.ventas_categoria ?? []}
            etiqueta="categoria"
          />
        </Panel>

        <Panel titulo="Métodos de pago">
          <Dona
            datos={datos?.metodos_pago ?? []}
            etiqueta="metodo"
          />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <TablaRanking
          titulo="Productos más vendidos"
          datos={datos?.productos_mas_vendidos ?? []}
          columnas={[
            ["producto", "Producto"],
            ["unidades", "Unidades"],
            ["ventas", "Ventas", moneda],
          ]}
        />

        <TablaRanking
          titulo="Productos menos vendidos"
          datos={datos?.productos_menos_vendidos ?? []}
          columnas={[
            ["producto", "Producto"],
            ["unidades", "Unidades"],
            ["ventas", "Ventas", moneda],
          ]}
        />

        <TablaRanking
          titulo="Productos con más pérdidas"
          datos={datos?.productos_mas_perdidas ?? []}
          columnas={[
            ["producto", "Producto"],
            ["unidades", "Pérdidas"],
            ["costo", "Costo", moneda],
          ]}
          peligro
        />

        <TablaCaducidades
          datos={datos?.proximos_caducar ?? []}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
        <Panel titulo="Inventario valorizado" icono={Package}>
          <div className="grid gap-4 sm:grid-cols-3">
            <DatoGrande
              titulo="Total de productos"
              valor={inventario.total_productos}
              detalle="SKUs registrados"
            />

            <DatoGrande
              titulo="Valor del inventario"
              valor={moneda(inventario.valor_inventario)}
              detalle="Calculado a costo"
            />

            <DatoGrande
              titulo="Stock bajo"
              valor={inventario.stock_bajo}
              detalle={`${inventario.agotados} agotados`}
              peligro
            />
          </div>
        </Panel>

        <Panel titulo="Exportar reportes" icono={Download}>
          <p className="text-sm text-slate-500">
            Genera archivos listos para impresión o análisis.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <BotonExportar
              titulo="Exportar a PDF"
              descripcion="Documento listo para imprimir"
              icono={FileText}
              onClick={exportarPDF}
              cargando={exportando === "pdf"}
              tono="red"
            />

            <BotonExportar
              titulo="Exportar a Excel"
              descripcion="Archivo para análisis"
              icono={FileSpreadsheet}
              onClick={exportarExcel}
              cargando={exportando === "excel"}
              tono="green"
            />
          </div>
        </Panel>

        <Panel titulo="Información del periodo">
          <dl className="space-y-3 text-sm">
            <FilaInfo
              titulo="Periodo"
              valor={`${fechaLegible(
                periodo.desde
              )} - ${fechaLegible(periodo.hasta)}`}
            />
            <FilaInfo
              titulo="Días"
              valor={periodo.dias}
            />
            <FilaInfo
              titulo="Tienda"
              valor={periodo.tienda}
            />
            <FilaInfo
              titulo="Generado"
              valor={fechaLegible(periodo.generado_en)}
            />
          </dl>
        </Panel>
      </div>
    </section>
  );
}

function Kpi({
  titulo,
  valor,
  cambio,
  icono: Icono,
  tono,
  invertirCambio = false,
}) {
  const estilos = {
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  const numeroCambio = Number(cambio);
  const positivoVisual = invertirCambio
    ? numeroCambio <= 0
    : numeroCambio >= 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`rounded-xl p-3 ${estilos[tono]}`}>
          <Icono className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-slate-500">
            {titulo}
          </p>

          <p className="mt-2 truncate text-2xl font-black text-slate-950">
            {valor}
          </p>

          {cambio !== undefined && (
            <p
              className={`mt-2 text-xs font-bold ${
                positivoVisual
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {numeroCambio >= 0 ? "↗" : "↘"}{" "}
              {Math.abs(numeroCambio)}% vs periodo anterior
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function Panel({ titulo, icono: Icono, children }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {Icono && (
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Icono className="h-4 w-4" />
          </div>
        )}

        <h2 className="font-black text-slate-950">
          {titulo}
        </h2>
      </div>

      <div className="mt-4">{children}</div>
    </article>
  );
}

function GraficaLinea({ datos }) {
  const ancho = 700;
  const alto = 220;
  const padding = 28;

  const valores = datos.map((item) =>
    Number(item.total)
  );

  const maximo = Math.max(...valores, 1);

  const puntos = datos.map((item, indice) => {
    const x =
      datos.length <= 1
        ? ancho / 2
        : padding +
          (indice / (datos.length - 1)) *
            (ancho - padding * 2);

    const y =
      alto -
      padding -
      (Number(item.total) / maximo) *
        (alto - padding * 2);

    return {
      x,
      y,
      item,
    };
  });

  const linea = puntos
    .map((punto) => `${punto.x},${punto.y}`)
    .join(" ");

  return (
    <div>
      <div className="h-64 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${ancho} ${alto}`}
          className="h-full w-full"
          role="img"
          aria-label="Gráfica de ventas"
        >
          {[0, 1, 2, 3].map((lineaGuia) => {
            const y =
              padding +
              (lineaGuia / 3) *
                (alto - padding * 2);

            return (
              <line
                key={lineaGuia}
                x1={padding}
                y1={y}
                x2={ancho - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}

          <polyline
            points={linea}
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {puntos.map((punto) => (
            <circle
              key={punto.item.fecha}
              cx={punto.x}
              cy={punto.y}
              r="4"
              fill="#2563eb"
            >
              <title>
                {punto.item.fecha}:{" "}
                {moneda(punto.item.total)}
              </title>
            </circle>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{fechaLegible(datos[0]?.fecha)}</span>
        <span>
          {fechaLegible(datos.at(-1)?.fecha)}
        </span>
      </div>
    </div>
  );
}

function Dona({ datos, etiqueta }) {
  const total = datos.reduce(
    (suma, item) => suma + Number(item.total),
    0
  );

  let acumulado = 0;

  const segmentos = datos.map((item, indice) => {
    const inicio =
      total > 0 ? (acumulado / total) * 360 : 0;

    acumulado += Number(item.total);

    const fin =
      total > 0 ? (acumulado / total) * 360 : 0;

    return `${COLORES_DONA[indice % COLORES_DONA.length]} ${inicio}deg ${fin}deg`;
  });

  return (
    <div>
      <div
        className="mx-auto h-36 w-36 rounded-full"
        style={{
          background:
            total > 0
              ? `conic-gradient(${segmentos.join(",")})`
              : "#e2e8f0",
          boxShadow:
            "inset 0 0 0 34px white",
        }}
      />

      <div className="mt-5 space-y-2">
        {datos.slice(0, 6).map((item, indice) => (
          <div
            key={item[etiqueta]}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  background:
                    COLORES_DONA[
                      indice % COLORES_DONA.length
                    ],
                }}
              />

              <span className="truncate text-slate-600 capitalize">
                {item[etiqueta]}
              </span>
            </div>

            <span className="font-black text-slate-800">
              {total > 0
                ? `${Math.round(
                    (Number(item.total) / total) *
                      100
                  )}%`
                : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TablaRanking({
  titulo,
  datos,
  columnas,
  peligro = false,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <h2 className="font-black text-slate-950">
          {titulo}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase text-slate-400">
              {columnas.map((columna) => (
                <th
                  key={columna[0]}
                  className="px-4 py-3"
                >
                  {columna[1]}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {datos.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Sin datos en este periodo.
                </td>
              </tr>
            ) : (
              datos.map((item, indice) => (
                <tr
                  key={
                    item.producto_id ||
                    `${item.producto}-${indice}`
                  }
                >
                  {columnas.map(
                    ([campo, , formato], colIndice) => (
                      <td
                        key={campo}
                        className={`px-4 py-3 ${
                          colIndice === 0
                            ? "font-semibold text-slate-800"
                            : peligro
                              ? "font-black text-red-600"
                              : "font-semibold text-slate-600"
                        }`}
                      >
                        {formato
                          ? formato(item[campo])
                          : item[campo]}
                      </td>
                    )
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function TablaCaducidades({ datos }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <h2 className="font-black text-slate-950">
          Próximos a caducar
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {datos.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            No hay alertas de caducidad.
          </p>
        ) : (
          datos.slice(0, 5).map((item) => {
            const vencido =
              Number(item.dias_restantes) < 0;

            return (
              <div
                key={item.lote_id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {item.producto}
                  </p>

                  <p className="text-xs text-slate-500">
                    {fechaLegible(
                      item.fecha_caducidad
                    )} · {item.stock} unidades
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-lg px-2 py-1 text-xs font-black ${
                    vencido
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {vencido
                    ? "Vencido"
                    : `${item.dias_restantes} días`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}

function DatoGrande({
  titulo,
  valor,
  detalle,
  peligro = false,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <p className="text-sm text-slate-500">
        {titulo}
      </p>

      <p
        className={`mt-2 text-2xl font-black ${
          peligro
            ? "text-red-600"
            : "text-slate-950"
        }`}
      >
        {valor}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {detalle}
      </p>
    </div>
  );
}

function BotonExportar({
  titulo,
  descripcion,
  icono: Icono,
  onClick,
  cargando,
  tono,
}) {
  const estilos = {
    red: "bg-red-50 text-red-700",
    green: "bg-emerald-50 text-emerald-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={cargando}
      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
    >
      <div className={`rounded-lg p-2 ${estilos[tono]}`}>
        {cargando ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Icono className="h-5 w-5" />
        )}
      </div>

      <div>
        <p className="text-sm font-black text-slate-800">
          {titulo}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {descripcion}
        </p>
      </div>
    </button>
  );
}

function FilaInfo({ titulo, valor }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">{titulo}</dt>
      <dd className="text-right font-bold text-slate-800">
        {valor}
      </dd>
    </div>
  );
}

export default Reportes;

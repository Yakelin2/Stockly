// src/services/reportesService.js

import { supabase, TIENDA_ID } from "./supabase.js";

const REPORTE_VACIO = {
  kpis: {
    ventas: 0,
    compras: 0,
    ganancia: 0,
    valor_inventario: 0,
    perdidas: 0,
    ventas_cambio: 0,
    compras_cambio: 0,
    ganancia_cambio: 0,
    perdidas_cambio: 0,
  },
  ventas_diarias: [],
  ventas_categoria: [],
  metodos_pago: [],
  productos_mas_vendidos: [],
  productos_menos_vendidos: [],
  productos_mas_perdidas: [],
  proximos_caducar: [],
  inventario: {
    total_productos: 0,
    valor_inventario: 0,
    stock_bajo: 0,
    agotados: 0,
  },
  periodo: {
    desde: "",
    hasta: "",
    dias: 0,
    generado_en: null,
    tienda: "Mi tienda",
  },
};

export async function obtenerReportes({
  desde,
  hasta,
}) {
  if (!TIENDA_ID) {
    throw new Error(
      "No se encontró VITE_TIENDA_ID en .env.local."
    );
  }

  const { data, error } = await supabase.rpc(
    "obtener_reportes_stockly",
    {
      p_tienda_id: TIENDA_ID,
      p_desde: desde,
      p_hasta: hasta,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...REPORTE_VACIO,
    ...(data ?? {}),
    kpis: {
      ...REPORTE_VACIO.kpis,
      ...(data?.kpis ?? {}),
    },
    inventario: {
      ...REPORTE_VACIO.inventario,
      ...(data?.inventario ?? {}),
    },
    periodo: {
      ...REPORTE_VACIO.periodo,
      ...(data?.periodo ?? {}),
    },
  };
}

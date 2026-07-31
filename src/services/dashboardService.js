// src/services/dashboardService.js

import { supabase, TIENDA_ID } from "./supabase.js";

const DASHBOARD_VACIO = {
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
};

export async function obtenerDashboard() {
  if (!TIENDA_ID) {
    throw new Error("No se encontró VITE_TIENDA_ID en .env.local.");
  }

  const { data, error } = await supabase.rpc("obtener_dashboard_stockly", {
    p_tienda_id: TIENDA_ID,
  });

  if (error) throw error;

  return {
    ...DASHBOARD_VACIO,
    ...(data ?? {}),
  };
}

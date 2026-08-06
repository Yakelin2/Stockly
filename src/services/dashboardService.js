// src/services/dashboardService.js

import { supabase, obtenerTiendaActiva } from "./supabase.js";

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
  productos_por_caducar: 0,
  productos_caducados: 0,
  valor_caducado: 0,
  caducidades_proximas: [],
};

export async function obtenerDashboard() {
  const tiendaId = obtenerTiendaActiva();

  const { data: configuracion, error: configuracionError } =
    await supabase
      .from("configuracion_tienda")
      .select("dias_alerta_caducidad")
      .eq("tienda_id", tiendaId)
      .maybeSingle();

  if (configuracionError) throw configuracionError;

  const diasAlerta = Math.max(
    1,
    Number(configuracion?.dias_alerta_caducidad) || 14
  );

  const [
    { data: dashboard, error: dashboardError },
    { data: caducidades, error: caducidadesError },
  ] = await Promise.all([
    supabase.rpc("obtener_dashboard_stockly", {
      p_tienda_id: tiendaId,
    }),
    supabase.rpc("obtener_alertas_caducidad", {
      p_tienda_id: tiendaId,
      p_dias_alerta: diasAlerta,
      p_limite: 20,
    }),
  ]);

  if (dashboardError) throw dashboardError;
  if (caducidadesError) throw caducidadesError;

  return {
    ...DASHBOARD_VACIO,
    ...(dashboard ?? {}),
    ...(caducidades ?? {}),
  };
}

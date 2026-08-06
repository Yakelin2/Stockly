import { supabase, obtenerTiendaActiva } from "./supabase.js";

export async function sincronizarNotificaciones(dias = 14) {
  const { error } = await supabase.rpc("sincronizar_notificaciones_stockly", {
    p_tienda_id: obtenerTiendaActiva(),
    p_dias_caducidad: Number(dias) || 14,
  });
  if (error) throw new Error(error.message);
}

export async function obtenerNotificaciones({ limite = 40 } = {}) {
  const { data, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("tienda_id", obtenerTiendaActiva())
    .eq("archivada", false)
    .order("creado_en", { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function marcarNotificacionLeida(id) {
  const { error } = await supabase.from("notificaciones").update({
    leida: true,
    leida_en: new Date().toISOString(),
  }).eq("id", id).eq("tienda_id", obtenerTiendaActiva());
  if (error) throw new Error(error.message);
}

export async function marcarTodasLeidas() {
  const { error } = await supabase.from("notificaciones").update({
    leida: true,
    leida_en: new Date().toISOString(),
  }).eq("tienda_id", obtenerTiendaActiva()).eq("leida", false);
  if (error) throw new Error(error.message);
}

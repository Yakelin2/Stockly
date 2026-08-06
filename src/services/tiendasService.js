import { supabase } from "./supabase.js";

export async function cambiarTiendaActiva(tiendaId) {
  const { error } = await supabase.rpc("cambiar_tienda_activa", {
    p_tienda_id: tiendaId,
  });
  if (error) throw new Error(error.message);
}

export async function crearEmpresa({ nombre, telefono, direccion, moneda = "MXN" }) {
  const { data, error } = await supabase.functions.invoke("administrar-usuarios", {
    body: { accion: "crear_tienda", nombre, telefono, direccion, moneda },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

import { supabase, obtenerTiendaActiva } from "./supabase.js";

export async function obtenerConfiguracionCompleta() {
  const tiendaId = obtenerTiendaActiva();

  const { data, error } = await supabase.rpc(
    "obtener_configuracion_stockly",
    { p_tienda_id: tiendaId }
  );

  if (error) throw new Error(error.message);
  return data;
}

export async function guardarDatosTienda(datos) {
  const tiendaId = obtenerTiendaActiva();
  const { data, error } = await supabase
    .from("tiendas")
    .update({
      nombre: datos.nombre.trim(),
      telefono: datos.telefono.trim() || null,
      direccion: datos.direccion.trim() || null,
      moneda: datos.moneda,
    })
    .eq("id", tiendaId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function guardarPreferencias(preferencias) {
  const tiendaId = obtenerTiendaActiva();
  const { data, error } = await supabase
    .from("configuracion_tienda")
    .upsert(
      {
        tienda_id: tiendaId,
        ...preferencias,
        actualizado_en: new Date().toISOString(),
      },
      { onConflict: "tienda_id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerUsuariosTienda() {
  const tiendaId = obtenerTiendaActiva();
  const { data, error } = await supabase.rpc(
    "obtener_usuarios_tienda",
    { p_tienda_id: tiendaId }
  );

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function obtenerRolesTienda() {
  const tiendaId = obtenerTiendaActiva();
  const { data, error } = await supabase.rpc(
    "obtener_roles_tienda",
    { p_tienda_id: tiendaId }
  );

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function obtenerPermisos() {
  const { data, error } = await supabase
    .from("permisos")
    .select("id,codigo,nombre,modulo,descripcion")
    .eq("activo", true)
    .order("modulo")
    .order("nombre");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function guardarRol({
  id = null,
  nombre,
  descripcion,
  permisos,
}) {
  const tiendaId = obtenerTiendaActiva();
  const { data, error } = await supabase.rpc(
    "guardar_rol_con_permisos",
    {
      p_tienda_id: tiendaId,
      p_rol_id: id,
      p_nombre: nombre,
      p_descripcion: descripcion || null,
      p_permisos: permisos,
    }
  );

  if (error) throw new Error(error.message);
  return data;
}

export async function invitarUsuario({
  nombre,
  correo,
  contrasena,
  rolId,
}) {
  const tiendaId = obtenerTiendaActiva();
  const { data, error } = await supabase.functions.invoke(
    "administrar-usuarios",
    {
      body: {
        accion: "crear",
        tiendaId,
        nombre,
        correo,
        contrasena,
        rolId,
      },
    }
  );

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function cambiarRolUsuario(usuarioId, rolId) {
  const tiendaId = obtenerTiendaActiva();
  const { error } = await supabase
    .from("perfiles")
    .update({ rol_id: rolId, actualizado_en: new Date().toISOString() })
    .eq("id", usuarioId)
    .eq("tienda_id", tiendaId);

  if (error) throw new Error(error.message);
}

export async function cambiarEstadoUsuario(usuarioId, activo) {
  const tiendaId = obtenerTiendaActiva();
  const { error } = await supabase
    .from("perfiles")
    .update({ activo, actualizado_en: new Date().toISOString() })
    .eq("id", usuarioId)
    .eq("tienda_id", tiendaId);

  if (error) throw new Error(error.message);
}

import { supabase, obtenerTiendaActiva } from "./supabase.js";

const BUCKET_LOGOS = "tienda-logos";

function tiendaId() {
  return obtenerTiendaActiva();
}

export async function obtenerConfiguracionCompleta() {
  const { data, error } = await supabase.rpc(
    "obtener_configuracion_stockly",
    { p_tienda_id: tiendaId() }
  );

  if (error) throw new Error(error.message);
  return data;
}

export async function guardarDatosTienda(datos) {
  const { data, error } = await supabase
    .from("tiendas")
    .update({
      nombre: datos.nombre.trim(),
      telefono: datos.telefono?.trim() || null,
      direccion: datos.direccion?.trim() || null,
      moneda: datos.moneda,
    })
    .eq("id", tiendaId())
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function guardarPreferencias(preferencias) {
  const { data, error } = await supabase
    .from("configuracion_tienda")
    .upsert(
      {
        tienda_id: tiendaId(),
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

export async function subirLogoTienda(archivo, logoAnterior = "") {
  if (!archivo) return logoAnterior;
  if (archivo.size > 2 * 1024 * 1024) {
    throw new Error("El logo no puede pesar más de 2 MB.");
  }

  const extension = archivo.name.split(".").pop()?.toLowerCase() || "png";
  const ruta = `${tiendaId()}/logo-${Date.now()}.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET_LOGOS)
    .upload(ruta, archivo, {
      cacheControl: "3600",
      upsert: false,
      contentType: archivo.type,
    });

  if (errorSubida) throw new Error(errorSubida.message);

  const { data } = supabase.storage
    .from(BUCKET_LOGOS)
    .getPublicUrl(ruta);

  if (!data?.publicUrl) {
    throw new Error("No fue posible obtener la URL del logo.");
  }

  if (logoAnterior?.includes(`/object/public/${BUCKET_LOGOS}/`)) {
    const anterior = decodeURIComponent(
      logoAnterior.split(`/object/public/${BUCKET_LOGOS}/`)[1] || ""
    );
    if (anterior) {
      await supabase.storage.from(BUCKET_LOGOS).remove([anterior]);
    }
  }

  return data.publicUrl;
}

export async function obtenerUsuariosTienda() {
  const { data, error } = await supabase.rpc(
    "obtener_usuarios_tienda",
    { p_tienda_id: tiendaId() }
  );
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function obtenerRolesTienda() {
  const { data, error } = await supabase.rpc(
    "obtener_roles_tienda",
    { p_tienda_id: tiendaId() }
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

export async function guardarRol({ id = null, nombre, descripcion, permisos }) {
  const { data, error } = await supabase.rpc(
    "guardar_rol_con_permisos",
    {
      p_tienda_id: tiendaId(),
      p_rol_id: id,
      p_nombre: nombre,
      p_descripcion: descripcion || null,
      p_permisos: permisos,
    }
  );
  if (error) throw new Error(error.message);
  return data;
}

export async function invitarUsuario({ nombre, correo, contrasena, rolId }) {
  const { data, error } = await supabase.functions.invoke(
    "administrar-usuarios",
    {
      body: {
        accion: "crear",
        tiendaId: tiendaId(),
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
  const { error } = await supabase
    .from("perfiles")
    .update({ rol_id: rolId, actualizado_en: new Date().toISOString() })
    .eq("id", usuarioId)
    .eq("tienda_id", tiendaId());
  if (error) throw new Error(error.message);
}

export async function cambiarEstadoUsuario(usuarioId, activo) {
  const { error } = await supabase
    .from("perfiles")
    .update({ activo, actualizado_en: new Date().toISOString() })
    .eq("id", usuarioId)
    .eq("tienda_id", tiendaId());
  if (error) throw new Error(error.message);
}

export async function obtenerResumenSistema() {
  const { data, error } = await supabase.rpc(
    "obtener_resumen_sistema_stockly",
    { p_tienda_id: tiendaId() }
  );
  if (error) throw new Error(error.message);
  return data ?? {};
}

export async function crearRespaldoJSON() {
  const id = tiendaId();
  const tablas = [
    "tiendas",
    "configuracion_tienda",
    "productos",
    "categorias",
    "proveedores",
    "ventas",
    "detalle_ventas",
    "compras",
    "detalle_compras",
    "lotes_productos",
    "perdidas",
    "perdidas_lotes",
    "roles",
    "rol_permisos",
    "perfiles",
  ];

  const resultado = {};

  for (const tabla of tablas) {
    let consulta = supabase.from(tabla).select("*");

    if (!["detalle_ventas", "detalle_compras", "rol_permisos"].includes(tabla)) {
      const campo = tabla === "tiendas" ? "id" : "tienda_id";
      consulta = consulta.eq(campo, id);
    }

    const { data, error } = await consulta;
    if (error) {
      resultado[tabla] = {
        error: error.message,
        registros: [],
      };
    } else {
      resultado[tabla] = { registros: data ?? [] };
    }
  }

  const respaldo = {
    formato: "stockly-backup",
    version: "2.0.0",
    tienda_id: id,
    generado_en: new Date().toISOString(),
    datos: resultado,
  };

  await supabase
    .from("configuracion_tienda")
    .update({ ultima_exportacion: new Date().toISOString() })
    .eq("tienda_id", id);

  return respaldo;
}

export function descargarJSON(datos, nombre) {
  const blob = new Blob([JSON.stringify(datos, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

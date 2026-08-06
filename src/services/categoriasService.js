import { supabase, obtenerTiendaActiva } from "./supabase";

function transformarCategoria(categoria) {
  return {
    id: categoria.id,
    nombre: categoria.nombre,
  };
}

export async function obtenerCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select(`
      id,
      nombre
    `)
    .eq("tienda_id", obtenerTiendaActiva())
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(transformarCategoria);
}

export async function crearCategoria(nombre) {
  const nombreLimpio = nombre.trim();

  if (!nombreLimpio) {
    throw new Error("Escribe un nombre para la categoría.");
  }

  const { data, error } = await supabase
    .from("categorias")
    .insert({
      tienda_id: obtenerTiendaActiva(),
      nombre: nombreLimpio,
    })
    .select(`
      id,
      nombre
    `)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Esa categoría ya existe.");
    }

    throw new Error(error.message);
  }

  return transformarCategoria(data);
}

export async function actualizarCategoria(id, nombre) {
  const nombreLimpio = nombre.trim();

  if (!nombreLimpio) {
    throw new Error("Escribe un nombre para la categoría.");
  }

  const { data, error } = await supabase
    .from("categorias")
    .update({
      nombre: nombreLimpio,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tienda_id", obtenerTiendaActiva())
    .select(`
      id,
      nombre
    `)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Esa categoría ya existe.");
    }

    throw new Error(error.message);
  }

  return transformarCategoria(data);
}

export async function eliminarCategoriaPorId(id) {
  const { error } = await supabase
    .from("categorias")
    .update({
      activo: false,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tienda_id", obtenerTiendaActiva());

  if (error) {
    throw new Error(error.message);
  }
}
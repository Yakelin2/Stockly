import { supabase, TIENDA_ID } from "./supabase";

function transformarProducto(producto) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    codigo: producto.codigo_barras,
    categoria: producto.categoria ?? "Sin categoría",
    compra: Number(producto.precio_compra),
    venta: Number(producto.precio_venta),
    stock: Number(producto.stock),
    minimo: Number(producto.stock_minimo),
  };
}

export async function obtenerProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      id,
      nombre,
      codigo_barras,
      categoria,
      precio_compra,
      precio_venta,
      stock,
      stock_minimo
    `)
    .eq("tienda_id", TIENDA_ID)
    .order("creado_en", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(transformarProducto);
}

export async function crearProducto(formulario) {
  const nuevoRegistro = {
    tienda_id: TIENDA_ID,
    nombre: formulario.nombre.trim(),
    codigo_barras: formulario.codigo.trim(),
    categoria:
      formulario.categoria.trim() || "Sin categoría",
    precio_compra: Number(formulario.compra),
    precio_venta: Number(formulario.venta),
    stock: Number(formulario.stock),
    stock_minimo: Number(formulario.minimo),
  };

  const { data, error } = await supabase
    .from("productos")
    .insert(nuevoRegistro)
    .select(`
      id,
      nombre,
      codigo_barras,
      categoria,
      precio_compra,
      precio_venta,
      stock,
      stock_minimo
    `)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Ya existe un producto con ese código de barras."
      );
    }

    throw new Error(error.message);
  }

  return transformarProducto(data);
}

export async function eliminarProductoPorId(id) {
  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", id)
    .eq("tienda_id", TIENDA_ID);

  if (error) {
    throw new Error(error.message);
  }
}
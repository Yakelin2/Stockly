import { supabase, obtenerTiendaActiva } from "./supabase";

const BUCKET_PRODUCTOS = "productos";

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
    imagen: producto.imagen ?? "",
    activo: producto.activo !== false,
    codigos: (producto.codigos_barras_productos ?? [])
      .map((item) => item.codigo_barras)
      .filter(Boolean),
  };
}

function obtenerExtensionArchivo(archivo) {
  const partes = archivo.name.split(".");

  if (partes.length < 2) {
    return "jpg";
  }

  return partes.at(-1).toLowerCase();
}

function limpiarNombreArchivo(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function crearNombreImagen(archivo) {
  const extension = obtenerExtensionArchivo(archivo);

  const nombreOriginal = limpiarNombreArchivo(
    archivo.name.replace(/\.[^/.]+$/, "")
  );

  const identificador =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

  const nombreBase =
    nombreOriginal || "producto";

  return `${obtenerTiendaActiva()}/${nombreBase}-${identificador}.${extension}`;
}

function obtenerRutaDesdeUrl(urlImagen) {
  if (!urlImagen) {
    return "";
  }

  const marcador =
    `/storage/v1/object/public/${BUCKET_PRODUCTOS}/`;

  const posicion = urlImagen.indexOf(marcador);

  if (posicion === -1) {
    return "";
  }

  return decodeURIComponent(
    urlImagen.slice(posicion + marcador.length)
  );
}

async function subirImagenProducto(archivo) {
  if (!archivo) {
    return null;
  }

  const ruta = crearNombreImagen(archivo);

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET_PRODUCTOS)
    .upload(ruta, archivo, {
      cacheControl: "3600",
      upsert: false,
      contentType: archivo.type,
    });

  if (errorSubida) {
    throw new Error(
      `No se pudo subir la imagen: ${errorSubida.message}`
    );
  }

  const { data } = supabase.storage
    .from(BUCKET_PRODUCTOS)
    .getPublicUrl(ruta);

  if (!data?.publicUrl) {
    await eliminarImagenPorRuta(ruta);

    throw new Error(
      "No se pudo obtener la dirección pública de la imagen."
    );
  }

  return {
    ruta,
    url: data.publicUrl,
  };
}

async function eliminarImagenPorRuta(ruta) {
  if (!ruta) {
    return;
  }

  const { error } = await supabase.storage
    .from(BUCKET_PRODUCTOS)
    .remove([ruta]);

  if (error) {
    throw new Error(
      `No se pudo eliminar la imagen: ${error.message}`
    );
  }
}

async function eliminarImagenPorUrl(urlImagen) {
  const ruta = obtenerRutaDesdeUrl(urlImagen);

  if (!ruta) {
    return;
  }

  await eliminarImagenPorRuta(ruta);
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
      stock_minimo,
      imagen,
      activo,
      codigos_barras_productos (
        codigo_barras,
        principal
      )
    `)
    .eq("tienda_id", obtenerTiendaActiva())
    .eq("activo", true)
    .order("creado_en", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(transformarProducto);
}

export async function crearProducto(
  formulario,
  archivoImagen
) {
  let imagenSubida = null;

  try {
    if (archivoImagen) {
      imagenSubida =
        await subirImagenProducto(archivoImagen);
    }

    const nuevoRegistro = {
      tienda_id: obtenerTiendaActiva(),
      nombre: formulario.nombre.trim(),
      codigo_barras: formulario.codigo.trim(),
      categoria:
        formulario.categoria.trim() ||
        "Sin categoría",
      precio_compra: Number(formulario.compra),
      precio_venta: Number(formulario.venta),
      stock: Number(formulario.stock),
      stock_minimo: Number(formulario.minimo),
      imagen: imagenSubida?.url ?? null,
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
        stock_minimo,
        imagen
      `)
      .single();

    if (error) {
      if (imagenSubida?.ruta) {
        await eliminarImagenPorRuta(
          imagenSubida.ruta
        );
      }

      if (error.code === "23505") {
        throw new Error(
          "Ya existe un producto con ese código de barras."
        );
      }

      throw new Error(error.message);
    }

    return transformarProducto(data);
  } catch (error) {
    if (
      imagenSubida?.ruta &&
      !error.message.includes(
        "Ya existe un producto"
      )
    ) {
      try {
        await eliminarImagenPorRuta(
          imagenSubida.ruta
        );
      } catch (errorLimpieza) {
        console.error(
          "No se pudo limpiar la imagen:",
          errorLimpieza
        );
      }
    }

    throw error;
  }
}

export async function actualizarProducto(
  id,
  formulario,
  archivoImagen,
  imagenAnterior
) {
  let imagenSubida = null;

  try {
    if (archivoImagen) {
      imagenSubida =
        await subirImagenProducto(archivoImagen);
    }

    const cambios = {
      nombre: formulario.nombre.trim(),
      codigo_barras: formulario.codigo.trim(),
      categoria:
        formulario.categoria.trim() ||
        "Sin categoría",
      precio_compra: Number(formulario.compra),
      precio_venta: Number(formulario.venta),
      stock: Number(formulario.stock),
      stock_minimo: Number(formulario.minimo),
      imagen:
        imagenSubida?.url ??
        formulario.imagen ??
        null,
      actualizado_en: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("productos")
      .update(cambios)
      .eq("id", id)
      .eq("tienda_id", obtenerTiendaActiva())
      .select(`
        id,
        nombre,
        codigo_barras,
        categoria,
        precio_compra,
        precio_venta,
        stock,
        stock_minimo,
        imagen
      `)
      .single();

    if (error) {
      if (imagenSubida?.ruta) {
        await eliminarImagenPorRuta(
          imagenSubida.ruta
        );
      }

      if (error.code === "23505") {
        throw new Error(
          "Ya existe otro producto con ese código de barras."
        );
      }

      throw new Error(error.message);
    }

    if (
      imagenSubida &&
      imagenAnterior &&
      imagenAnterior !== imagenSubida.url
    ) {
      try {
        await eliminarImagenPorUrl(
          imagenAnterior
        );
      } catch (errorAlEliminarImagen) {
        console.error(
          "No se pudo eliminar la imagen anterior:",
          errorAlEliminarImagen
        );
      }
    }

    return transformarProducto(data);
  } catch (error) {
    throw error;
  }
}

export async function eliminarProductoPorId(
  id,
  _imagenProducto = ""
) {
  const { error } = await supabase.rpc(
    "desactivar_producto_seguro",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_producto_id: id,
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

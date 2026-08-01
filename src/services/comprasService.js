// src/services/comprasService.js

import { supabase, TIENDA_ID } from "./supabase.js";

function validarTienda() {
  if (!TIENDA_ID) {
    throw new Error("No se encontró VITE_TIENDA_ID en .env.local.");
  }
}

function limpiarTexto(valor) {
  const texto = String(valor ?? "").trim();
  return texto || null;
}

export async function obtenerProductosCompra() {
  validarTienda();

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("tienda_id", TIENDA_ID)
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function obtenerProveedores() {
  validarTienda();

  const { data, error } = await supabase.rpc(
    "obtener_proveedores_compra",
    {
      p_tienda_id: TIENDA_ID,
    }
  );

  if (error) throw error;
  return data ?? [];
}

export async function crearProveedor(proveedor) {
  validarTienda();

  const nombre = String(proveedor?.nombre ?? "").trim();

  if (!nombre) {
    throw new Error("El nombre del proveedor es obligatorio.");
  }

  const { data, error } = await supabase.rpc(
    "crear_proveedor_compra",
    {
      p_tienda_id: TIENDA_ID,
      p_nombre: nombre,
      p_telefono: limpiarTexto(proveedor.telefono),
      p_correo: limpiarTexto(proveedor.correo),
      p_direccion: limpiarTexto(proveedor.direccion),
      p_notas: limpiarTexto(proveedor.notas),
    }
  );

  if (error) throw error;

  if (!data) {
    throw new Error("Supabase no devolvió el proveedor creado.");
  }

  return data;
}

export async function registrarCompra({
  proveedorId = null,
  numeroFactura = null,
  observaciones = null,
  productos,
}) {
  validarTienda();

  if (!Array.isArray(productos) || productos.length === 0) {
    throw new Error("Agrega al menos un producto a la compra.");
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const productosRpc = productos.map((item) => {
    const cantidad = Number(item.cantidad);
    const costoUnitario = Number(item.costoUnitario);
    const fechaCaducidad =
      String(item.fechaCaducidad ?? "").trim() || null;

    if (!item.productoId) {
      throw new Error("Hay un producto sin identificador.");
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error(
        "Todas las cantidades deben ser enteros mayores que cero."
      );
    }

    if (!Number.isFinite(costoUnitario) || costoUnitario < 0) {
      throw new Error("Todos los costos deben ser números válidos.");
    }

    if (fechaCaducidad) {
      const fecha = new Date(`${fechaCaducidad}T00:00:00`);

      if (
        Number.isNaN(fecha.getTime()) ||
        fecha < hoy
      ) {
        throw new Error(
          `La fecha de caducidad de ${item.nombre} no es válida.`
        );
      }
    }

    return {
      producto_id: item.productoId,
      cantidad,
      costo_unitario: Number(costoUnitario.toFixed(2)),
      fecha_caducidad: fechaCaducidad,
    };
  });

  const { data, error } = await supabase.rpc("registrar_compra", {
    p_tienda_id: TIENDA_ID,
    p_proveedor_id: proveedorId || null,
    p_productos: productosRpc,
    p_numero_factura: limpiarTexto(numeroFactura),
    p_observaciones: limpiarTexto(observaciones),
  });

  if (error) throw error;
  return data;
}

export async function obtenerHistorialCompras({
  busqueda = "",
  fechaInicio = null,
  fechaFin = null,
  estado = "todas",
  limite = 100,
} = {}) {
  validarTienda();

  const { data, error } = await supabase.rpc(
    "obtener_historial_compras",
    {
      p_tienda_id: TIENDA_ID,
      p_busqueda: limpiarTexto(busqueda),
      p_fecha_inicio: fechaInicio || null,
      p_fecha_fin: fechaFin || null,
      p_estado: estado === "todas" ? null : estado,
      p_limite: limite,
    }
  );

  if (error) throw error;
  return data ?? [];
}

export async function obtenerDetalleCompra(compraId) {
  validarTienda();

  if (!compraId) {
    throw new Error("La compra es obligatoria.");
  }

  const { data, error } = await supabase.rpc(
    "obtener_detalle_compra",
    {
      p_tienda_id: TIENDA_ID,
      p_compra_id: compraId,
    }
  );

  if (error) throw error;
  return data ?? null;
}

export async function cancelarCompra(compraId) {
  validarTienda();

  if (!compraId) {
    throw new Error("La compra es obligatoria.");
  }

  const { error } = await supabase.rpc("cancelar_compra", {
    p_tienda_id: TIENDA_ID,
    p_compra_id: compraId,
  });

  if (error) throw error;
}

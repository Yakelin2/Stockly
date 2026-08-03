import {
  supabase,
  obtenerTiendaActiva,
} from "./supabase";

export async function registrarVenta({
  carrito,
  metodoPago,
  montoRecibido,
  observaciones = "",
}) {
  if (
    !Array.isArray(carrito) ||
    carrito.length === 0
  ) {
    throw new Error(
      "La venta debe contener al menos un producto."
    );
  }

  const productos = carrito.map(
    (producto) => ({
      producto_id: producto.id,
      cantidad: Number(producto.cantidad),
    })
  );

  const monto =
    metodoPago === "efectivo"
      ? Number(montoRecibido)
      : null;

  const { data, error } = await supabase.rpc(
    "registrar_venta",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_metodo_pago: metodoPago,
      p_productos: productos,
      p_monto_recibido: monto,
      p_observaciones:
        observaciones.trim() || null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function obtenerHistorialVentas({
  desde = null,
  hasta = null,
} = {}) {
  const { data, error } = await supabase.rpc(
    "obtener_historial_ventas",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_desde: desde || null,
      p_hasta: hasta || null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((venta) => ({
    ...venta,
    total: Number(venta.total),
    monto_recibido:
      venta.monto_recibido === null
        ? null
        : Number(venta.monto_recibido),
    cambio: Number(venta.cambio),
    articulos: Number(venta.articulos),
  }));
}

export async function obtenerDetalleVenta(
  ventaId
) {
  const { data, error } = await supabase.rpc(
    "obtener_detalle_venta",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_venta_id: ventaId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((detalle) => ({
    ...detalle,
    cantidad: Number(detalle.cantidad),
    precio_unitario: Number(
      detalle.precio_unitario
    ),
    costo_unitario: Number(
      detalle.costo_unitario
    ),
    subtotal: Number(detalle.subtotal),
    utilidad: Number(detalle.utilidad),
  }));
}

export async function cancelarVenta(
  ventaId
) {
  const { error } = await supabase.rpc(
    "cancelar_venta_segura",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_venta_id: ventaId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

import {
  supabase,
  TIENDA_ID,
} from "./supabase";

export async function registrarVenta({
  carrito,
  metodoPago,
  montoRecibido,
  observaciones = "",
}) {
  if (!Array.isArray(carrito) || carrito.length === 0) {
    throw new Error(
      "La venta debe contener al menos un producto."
    );
  }

  const productos = carrito.map((producto) => ({
    producto_id: producto.id,
    cantidad: Number(producto.cantidad),
  }));

  const monto =
    metodoPago === "efectivo"
      ? Number(montoRecibido)
      : null;

  const { data, error } = await supabase.rpc(
    "registrar_venta",
    {
      p_tienda_id: TIENDA_ID,
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
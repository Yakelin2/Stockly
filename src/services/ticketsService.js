import { obtenerDetalleVenta, obtenerHistorialVentas } from "./ventasService.js";
import { obtenerConfiguracionCompleta } from "./configuracionService.js";

export async function obtenerTicketVenta(ventaId) {
  const [detalle, configuracion, historial] = await Promise.all([
    obtenerDetalleVenta(ventaId),
    obtenerConfiguracionCompleta(),
    obtenerHistorialVentas(),
  ]);
  const venta = historial.find((item) => item.id === ventaId);
  if (!venta) throw new Error("No se encontró la venta solicitada.");
  return { venta, detalle, configuracion };
}

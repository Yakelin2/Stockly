// Recibe el catálogo normalizado de productosService, igual que Productos.
export function resumirInventario(productos) {
  const activos = productos.filter((producto) => producto.activo === true);
  const bajos = activos.filter((producto) =>
    Number(producto.stock) > 0 && Number(producto.stock) <= Number(producto.minimo)
  );
  const agotados = activos.filter((producto) => Number(producto.stock) === 0);

  return {
    productos_registrados: activos.length,
    valor_inventario: activos.reduce((total, producto) =>
      total + Number(producto.compra) * Number(producto.stock), 0),
    productos_stock_bajo: bajos.length,
    productos_agotados: agotados.length,
    inventario_bajo: [...agotados, ...bajos]
      .sort((a, b) => Number(a.stock) - Number(b.stock) || a.nombre.localeCompare(b.nombre))
      .map((producto) => ({
        id: producto.id,
        nombre: producto.nombre,
        stock: Number(producto.stock),
        stock_minimo: Number(producto.minimo),
      })),
  };
}

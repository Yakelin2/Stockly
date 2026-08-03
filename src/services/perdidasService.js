// src/services/perdidasService.js

import { supabase, obtenerTiendaActiva } from "./supabase.js";

function validarTienda() {
  return obtenerTiendaActiva();
}

function limpiarTexto(valor) {
  const texto = String(valor ?? "").trim();
  return texto || null;
}

export async function registrarPerdida({
  productoId,
  loteId = null,
  cantidad,
  motivo,
  observaciones,
}) {
  validarTienda();

  const cantidadNumero = Number(cantidad);

  if (!productoId) {
    throw new Error("Selecciona un producto.");
  }

  if (
    !Number.isInteger(cantidadNumero) ||
    cantidadNumero <= 0
  ) {
    throw new Error(
      "La cantidad debe ser un entero mayor que cero."
    );
  }

  if (!motivo) {
    throw new Error("Selecciona el motivo de la pérdida.");
  }

  const { data, error } = await supabase.rpc(
    "registrar_perdida_lote",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_producto_id: productoId,
      p_lote_id: loteId || null,
      p_cantidad: cantidadNumero,
      p_motivo: motivo,
      p_observaciones: limpiarTexto(observaciones),
    }
  );

  if (error) throw error;
  return data;
}

export async function obtenerLotesProducto(productoId) {
  validarTienda();

  if (!productoId) return [];

  const { data, error } = await supabase.rpc(
    "obtener_lotes_producto_perdida",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_producto_id: productoId,
    }
  );

  if (error) throw error;
  return data ?? [];
}

export async function obtenerLotePorId(loteId) {
  validarTienda();

  if (!loteId) return null;

  const { data, error } = await supabase.rpc(
    "obtener_lote_para_perdida",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_lote_id: loteId,
    }
  );

  if (error) throw error;
  return data ?? null;
}

export async function obtenerHistorialPerdidas({
  busqueda = "",
  motivo = "todos",
  estado = "todos",
  fechaInicio = null,
  fechaFin = null,
  limite = 100,
} = {}) {
  validarTienda();

  const { data, error } = await supabase.rpc(
    "obtener_historial_perdidas",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_busqueda: limpiarTexto(busqueda),
      p_motivo: motivo === "todos" ? null : motivo,
      p_estado: estado === "todos" ? null : estado,
      p_fecha_inicio: fechaInicio || null,
      p_fecha_fin: fechaFin || null,
      p_limite: limite,
    }
  );

  if (error) throw error;
  return data ?? [];
}

export async function cancelarPerdida(perdidaId) {
  validarTienda();

  if (!perdidaId) {
    throw new Error("La pérdida es obligatoria.");
  }

  const { error } = await supabase.rpc(
    "cancelar_perdida",
    {
      p_tienda_id: obtenerTiendaActiva(),
      p_perdida_id: perdidaId,
    }
  );

  if (error) throw error;
}

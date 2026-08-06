import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Faltan las credenciales públicas de Supabase en .env.local."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

let tiendaActivaId = "";

export function establecerTiendaActiva(tiendaId) {
  tiendaActivaId = String(tiendaId || "").trim();
}

export function limpiarTiendaActiva() {
  tiendaActivaId = "";
}

export function obtenerTiendaActiva() {
  if (!tiendaActivaId) {
    throw new Error(
      "No hay una tienda activa. Cierra sesión y vuelve a iniciar."
    );
  }

  return tiendaActivaId;
}

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

// Mantiene compatibilidad con los servicios existentes. El valor se
// actualiza cuando AuthContext carga el perfil del usuario.
export let TIENDA_ID =
  import.meta.env.VITE_TIENDA_ID || "";

export function establecerTiendaActiva(tiendaId) {
  TIENDA_ID = tiendaId || "";
}

export function obtenerTiendaActiva() {
  if (!TIENDA_ID) {
    throw new Error(
      "No hay una tienda activa para el usuario actual."
    );
  }

  return TIENDA_ID;
}

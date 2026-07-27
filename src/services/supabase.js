import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const TIENDA_ID = import.meta.env.VITE_TIENDA_ID;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Faltan las credenciales públicas de Supabase en .env.local."
  );
}

if (!TIENDA_ID) {
  throw new Error(
    "Falta VITE_TIENDA_ID en el archivo .env.local."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
import {
  establecerTiendaActiva,
  supabase,
} from "./supabase.js";

export async function iniciarSesion(correo, contrasena) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo.trim(),
    password: contrasena,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  establecerTiendaActiva("");
  if (error) throw new Error(error.message);
}

export async function recuperarContrasena(correo) {
  const redirectTo = `${window.location.origin}/restablecer-contrasena`;
  const { error } = await supabase.auth.resetPasswordForEmail(
    correo.trim(),
    { redirectTo }
  );

  if (error) throw new Error(error.message);
}

export async function actualizarContrasena(contrasena) {
  const { error } = await supabase.auth.updateUser({
    password: contrasena,
  });

  if (error) throw new Error(error.message);
}

export async function obtenerPerfilActual(usuarioId) {
  const { data, error } = await supabase.rpc(
    "obtener_contexto_usuario",
    { p_usuario_id: usuarioId }
  );

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error(
      "El usuario no tiene un perfil activo en Stockly."
    );
  }

  return data;
}

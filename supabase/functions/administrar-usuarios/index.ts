import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authorization = req.headers.get("Authorization") ?? "";

    const clienteUsuario = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: authData } = await clienteUsuario.auth.getUser();
    if (!authData.user) throw new Error("Sesión no válida.");

    const { data: autorizado } = await clienteUsuario.rpc("tiene_permiso", {
      p_codigo: "usuarios.crear",
    });
    if (!autorizado) throw new Error("No tienes permiso para crear usuarios.");

    const { accion, tiendaId, nombre, correo, contrasena, rolId } = await req.json();
    if (accion !== "crear") throw new Error("Acción no soportada.");
    if (!nombre || !correo || !contrasena || !rolId) throw new Error("Completa todos los campos.");
    if (contrasena.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");

    const { data: perfilSolicitante } = await admin
      .from("perfiles")
      .select("tienda_id")
      .eq("id", authData.user.id)
      .single();
    if (perfilSolicitante?.tienda_id !== tiendaId) throw new Error("Tienda no autorizada.");

    const { data: nuevo, error: errorUsuario } = await admin.auth.admin.createUser({
      email: correo.trim().toLowerCase(),
      password: contrasena,
      email_confirm: true,
      user_metadata: { nombre },
    });
    if (errorUsuario) throw errorUsuario;

    const { error: errorPerfil } = await admin.from("perfiles").insert({
      id: nuevo.user.id,
      tienda_id: tiendaId,
      rol_id: rolId,
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      activo: true,
    });

    if (errorPerfil) {
      await admin.auth.admin.deleteUser(nuevo.user.id);
      throw errorPerfil;
    }

    return new Response(JSON.stringify({ ok: true, usuarioId: nuevo.user.id }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
  }
});

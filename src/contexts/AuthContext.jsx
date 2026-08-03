import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  cerrarSesion as cerrarSesionServicio,
  iniciarSesion as iniciarSesionServicio,
  obtenerPerfilActual,
} from "../services/authService.js";
import {
  establecerTiendaActiva,
  supabase,
} from "../services/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPerfil = useCallback(async (usuario) => {
    if (!usuario) {
      setPerfil(null);
      establecerTiendaActiva("");
      return null;
    }

    const contexto = await obtenerPerfilActual(usuario.id);
    setPerfil(contexto);
    establecerTiendaActiva(contexto.tienda_id);
    return contexto;
  }, []);

  useEffect(() => {
    let activo = true;

    async function inicializar() {
      try {
        const { data, error: errorSesion } =
          await supabase.auth.getSession();

        if (errorSesion) throw errorSesion;
        if (!activo) return;

        setSesion(data.session);
        if (data.session?.user) {
          await cargarPerfil(data.session.user);
        }
      } catch (err) {
        console.error(err);
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    inicializar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_evento, nuevaSesion) => {
        setSesion(nuevaSesion);

        try {
          if (nuevaSesion?.user) {
            await cargarPerfil(nuevaSesion.user);
          } else {
            setPerfil(null);
            establecerTiendaActiva("");
          }
        } catch (err) {
          console.error(err);
          setError(err.message);
        } finally {
          setCargando(false);
        }
      }
    );

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, [cargarPerfil]);

  async function iniciarSesion(correo, contrasena) {
    setError("");
    const resultado = await iniciarSesionServicio(
      correo,
      contrasena
    );
    setSesion(resultado.session);
    await cargarPerfil(resultado.user);
  }

  async function cerrarSesion() {
    await cerrarSesionServicio();
    setSesion(null);
    setPerfil(null);
  }

  function tienePermiso(codigo) {
    if (!perfil) return false;
    if (perfil.es_superadmin) return true;
    return (perfil.permisos ?? []).includes(codigo);
  }

  const valor = useMemo(
    () => ({
      sesion,
      usuario: sesion?.user ?? null,
      perfil,
      cargando,
      error,
      iniciarSesion,
      cerrarSesion,
      recargarPerfil: () =>
        sesion?.user
          ? cargarPerfil(sesion.user)
          : Promise.resolve(null),
      tienePermiso,
    }),
    [sesion, perfil, cargando, error, cargarPerfil]
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }
  return contexto;
}

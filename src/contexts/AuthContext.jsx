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

    async function aplicarSesion(nuevaSesion) {
      if (!activo) return;

      setCargando(true);
      setError("");
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

        if (activo) {
          setPerfil(null);
          establecerTiendaActiva("");
          setError(
            err.message ||
              "No fue posible cargar el perfil del usuario."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    async function inicializar() {
      try {
        const { data, error: errorSesion } =
          await supabase.auth.getSession();

        if (errorSesion) throw errorSesion;

        await aplicarSesion(data.session);
      } catch (err) {
        console.error(err);

        if (activo) {
          setSesion(null);
          setPerfil(null);
          establecerTiendaActiva("");
          setError(err.message);
          setCargando(false);
        }
      }
    }

    inicializar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_evento, nuevaSesion) => {
        aplicarSesion(nuevaSesion);
      }
    );

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, [cargarPerfil]);

  async function iniciarSesion(correo, contrasena) {
    setCargando(true);
    setError("");

    try {
      const resultado = await iniciarSesionServicio(
        correo,
        contrasena
      );

      /*
       * Cargamos aquí el perfil antes de permitir que Login
       * redirija. El listener de Supabase puede dispararse al
       * mismo tiempo, pero ambos dejarán el mismo estado final.
       */
      setSesion(resultado.session);
      await cargarPerfil(resultado.user);

      return resultado;
    } catch (err) {
      setSesion(null);
      setPerfil(null);
      establecerTiendaActiva("");
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }

  async function cerrarSesion() {
    setCargando(true);

    try {
      await cerrarSesionServicio();
    } finally {
      setSesion(null);
      setPerfil(null);
      establecerTiendaActiva("");
      setCargando(false);
    }
  }

  function tienePermiso(codigo) {
    if (!perfil) return false;
    if (perfil.es_superadmin) return true;

    return (perfil.permisos ?? []).includes(codigo);
  }

  const autenticado =
    Boolean(sesion?.user) && Boolean(perfil);

  const valor = useMemo(
    () => ({
      sesion,
      usuario: sesion?.user ?? null,
      perfil,
      autenticado,
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
    [
      sesion,
      perfil,
      autenticado,
      cargando,
      error,
      cargarPerfil,
    ]
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

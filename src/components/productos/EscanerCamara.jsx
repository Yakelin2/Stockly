import { useEffect, useId, useRef, useState } from "react";
import { Camera, RotateCcw, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

function EscanerCamara({
  abierto,
  onCerrar,
  onDetectar,
}) {
  const idBase = useId();
  const idEscaner = `escaner-${idBase.replace(/:/g, "")}`;

  const escanerRef = useRef(null);
  const procesandoRef = useRef(false);

  const [iniciando, setIniciando] = useState(false);
  const [errorCamara, setErrorCamara] = useState("");

  useEffect(() => {
    if (!abierto) {
      detenerCamara();
      return;
    }

    iniciarCamara();

    return () => {
      detenerCamara();
    };
  }, [abierto]);

  async function iniciarCamara() {
    if (escanerRef.current || iniciando) {
      return;
    }

    try {
      setIniciando(true);
      setErrorCamara("");
      procesandoRef.current = false;

      const escaner = new Html5Qrcode(idEscaner);
      escanerRef.current = escaner;

      await escaner.start(
        {
          facingMode:  "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 280,
            height: 150,
          },
          aspectRatio: 1.777778,
        },
        async (codigoDetectado) => {
          if (procesandoRef.current) {
            return;
          }

          procesandoRef.current = true;

          const codigoLimpio =
            String(codigoDetectado).trim();

          await detenerCamara();

          onDetectar(codigoLimpio);
        },
        () => {
          // Los errores de lectura cuadro por cuadro
          // son normales mientras busca un código.
        }
      );
    } catch (error) {
      console.error(
        "Error al iniciar la cámara:",
        error
      );

      escanerRef.current = null;

      setErrorCamara(
        obtenerMensajeErrorCamara(error)
      );
    } finally {
      setIniciando(false);
    }
  }

  async function detenerCamara() {
    const escaner = escanerRef.current;

    if (!escaner) {
      return;
    }

    escanerRef.current = null;

    try {
      const estado = escaner.getState();

      if (estado === 2 || estado === 3) {
        await escaner.stop();
      }

      await escaner.clear();
    } catch (error) {
      console.warn(
        "No se pudo detener completamente la cámara:",
        error
      );
    }
  }

  async function cerrarCamara() {
    await detenerCamara();
    onCerrar();
  }

  function obtenerMensajeErrorCamara(error) {
    const mensaje = String(
      error?.message ?? error ?? ""
    ).toLowerCase();

    if (
      mensaje.includes("permission") ||
      mensaje.includes("notallowed")
    ) {
      return "No se concedió permiso para usar la cámara. Habilítalo en la configuración del navegador.";
    }

    if (
      mensaje.includes("notfound") ||
      mensaje.includes("device")
    ) {
      return "No se encontró una cámara disponible en este dispositivo.";
    }

    if (
      mensaje.includes("secure") ||
      mensaje.includes("https")
    ) {
      return "La cámara requiere una conexión segura HTTPS o ejecutar la aplicación en localhost.";
    }

    return "No se pudo iniciar la cámara. Revisa los permisos del navegador e inténtalo nuevamente.";
  }

  if (!abierto) {
    return null;
  }

  return (
    <div className="stockly-modal fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Escanear con cámara
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Coloca el código de barras dentro del recuadro.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrarCamara}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Cerrar cámara"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <div
              id={idEscaner}
              className="min-h-72 w-full"
            />
          </div>

          {iniciando && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              <Camera
                size={18}
                className="animate-pulse"
              />
              Iniciando cámara...
            </div>
          )}

          {errorCamara && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorCamara}
            </div>
          )}

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800">
            Usa la cámara trasera y mantén el código enfocado
            y con buena iluminación.
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cerrarCamara}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>

            {errorCamara && (
              <button
                type="button"
                onClick={iniciarCamara}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <RotateCcw size={18} />
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EscanerCamara;
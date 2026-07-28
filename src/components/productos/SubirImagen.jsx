import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TAMANO_MAXIMO = 5 * 1024 * 1024;

const FORMATOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function SubirImagen({
  imagenActual = "",
  archivoImagen,
  onArchivoChange,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const [vistaPrevia, setVistaPrevia] =
    useState(imagenActual);

  const [errorImagen, setErrorImagen] =
    useState("");

  useEffect(() => {
    if (!archivoImagen) {
      setVistaPrevia(imagenActual || "");
    }
  }, [imagenActual, archivoImagen]);

  useEffect(() => {
    if (!archivoImagen) {
      return undefined;
    }

    const urlTemporal =
      URL.createObjectURL(archivoImagen);

    setVistaPrevia(urlTemporal);

    return () => {
      URL.revokeObjectURL(urlTemporal);
    };
  }, [archivoImagen]);

  function abrirSelector() {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  }

  function manejarSeleccion(evento) {
    const archivo =
      evento.target.files?.[0] ?? null;

    setErrorImagen("");

    if (!archivo) {
      return;
    }

    if (
      !FORMATOS_PERMITIDOS.includes(
        archivo.type
      )
    ) {
      setErrorImagen(
        "Selecciona una imagen JPG, PNG o WEBP."
      );

      evento.target.value = "";
      return;
    }

    if (archivo.size > TAMANO_MAXIMO) {
      setErrorImagen(
        "La imagen no puede pesar más de 5 MB."
      );

      evento.target.value = "";
      return;
    }

    onArchivoChange(archivo);
  }

  function quitarImagen() {
    if (disabled) {
      return;
    }

    setErrorImagen("");
    setVistaPrevia("");
    onArchivoChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div>
        <p className="text-sm font-semibold text-slate-700">
          Imagen del producto
        </p>

        <p className="text-xs text-slate-500">
          Formatos permitidos: JPG, PNG y WEBP.
          Máximo 5 MB.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={manejarSeleccion}
        disabled={disabled}
        className="hidden"
      />

      {vistaPrevia ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
          <div className="h-36 w-full overflow-hidden rounded-xl border border-slate-200 bg-white sm:h-32 sm:w-32">
            <img
              src={vistaPrevia}
              alt="Vista previa del producto"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <div>
              <p className="font-semibold text-slate-800">
                Vista previa
              </p>

              <p className="text-sm text-slate-500">
                Esta imagen se mostrará en la lista de
                productos.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={abrirSelector}
                disabled={disabled}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={17} />
                Cambiar imagen
              </button>

              <button
                type="button"
                onClick={quitarImagen}
                disabled={disabled}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={17} />
                Quitar imagen
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={abrirSelector}
          disabled={disabled}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="rounded-full bg-blue-100 p-3 text-blue-600">
            <ImagePlus size={25} />
          </div>

          <div>
            <p className="font-semibold text-slate-800">
              Seleccionar imagen
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Haz clic para elegir una foto del producto.
            </p>
          </div>
        </button>
      )}

      {errorImagen && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorImagen}
        </div>
      )}
    </div>
  );
}

export default SubirImagen;
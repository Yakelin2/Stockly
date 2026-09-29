export function validarUrlImagen(valor) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "";
  let url;
  try {
    url = new URL(texto);
  } catch {
    throw new Error("Pega un enlace completo que comience con https://.");
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Usa un enlace público de imagen que comience con https://.");
  }
  return url.href;
}

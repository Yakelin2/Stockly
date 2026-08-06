import { useEffect, useState } from "react";
import { Loader2, Printer, X } from "lucide-react";
import { obtenerHistorialVentas } from "../../services/ventasService.js";

export default function HistorialTickets({ abierto, onCerrar, onTicket }) {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!abierto) return;
    setCargando(true); setError("");
    obtenerHistorialVentas().then(setVentas).catch(e=>setError(e.message)).finally(()=>setCargando(false));
  }, [abierto]);
  if (!abierto) return null;
  return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b p-5"><div><h2 className="text-2xl font-black">Historial y tickets</h2><p className="text-sm text-slate-500">Reimprime comprobantes de ventas completadas.</p></div><button onClick={onCerrar} className="rounded-xl p-2 hover:bg-slate-100"><X/></button></div>
      <div className="max-h-[68vh] overflow-y-auto p-4">{cargando?<Loader2 className="mx-auto my-14 animate-spin text-blue-600"/>:error?<p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>:ventas.map(v=><article key={v.id} className="mb-2 flex items-center justify-between gap-3 rounded-2xl border p-4"><div><p className="font-black">Venta #{v.folio}</p><p className="text-sm text-slate-500">{new Date(v.creado_en).toLocaleString("es-MX")} · {v.metodo_pago} · {v.articulos} artículos</p><p className="font-black text-emerald-700">${Number(v.total).toFixed(2)}</p></div><button onClick={()=>onTicket(v.id)} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 font-bold text-blue-700"><Printer size={17}/>Ticket</button></article>)}</div>
    </div>
  </div>;
}

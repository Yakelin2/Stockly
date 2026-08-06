import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { marcarNotificacionLeida, marcarTodasLeidas, obtenerNotificaciones, sincronizarNotificaciones } from "../../services/notificacionesService.js";

export default function CentroNotificaciones() {
  const [abierto,setAbierto]=useState(false), [items,setItems]=useState([]), [cargando,setCargando]=useState(false);
  const navigate=useNavigate();
  async function cargar(){try{setCargando(true);await sincronizarNotificaciones();setItems(await obtenerNotificaciones())}catch(e){console.error(e)}finally{setCargando(false)}}
  useEffect(()=>{cargar(); const id=setInterval(cargar,120000); return()=>clearInterval(id)},[]);
  const noLeidas=useMemo(()=>items.filter(i=>!i.leida).length,[items]);
  async function abrirItem(i){if(!i.leida){await marcarNotificacionLeida(i.id);setItems(a=>a.map(x=>x.id===i.id?{...x,leida:true}:x))}setAbierto(false);if(i.ruta)navigate(i.ruta)}
  return <div className="relative">
    <button onClick={()=>setAbierto(v=>!v)} className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Notificaciones"><Bell size={20}/>{noLeidas>0&&<span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-[11px] font-black text-white">{Math.min(noLeidas,99)}</span>}</button>
    {abierto&&<div className="fixed inset-x-3 top-20 z-[100] max-h-[76vh] overflow-hidden rounded-3xl border bg-white shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-14 sm:w-[420px]">
      <div className="flex items-center justify-between border-b p-4"><div><h3 className="font-black">Notificaciones</h3><p className="text-xs text-slate-500">{noLeidas} sin leer</p></div><div className="flex gap-1"><button onClick={async()=>{await marcarTodasLeidas();setItems(a=>a.map(x=>({...x,leida:true})))}} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Marcar todas"><CheckCheck size={19}/></button><button onClick={()=>setAbierto(false)} className="rounded-lg p-2 hover:bg-slate-100"><X size={19}/></button></div></div>
      <div className="max-h-[62vh] overflow-y-auto p-2">{cargando&&items.length===0?<Loader2 className="mx-auto my-12 animate-spin text-blue-600"/>:items.length===0?<p className="p-10 text-center text-sm text-slate-400">No hay alertas pendientes.</p>:items.map(i=><button key={i.id} onClick={()=>abrirItem(i)} className={`mb-1 w-full rounded-2xl p-3 text-left ${i.leida?'bg-white':'bg-blue-50'}`}><div className="flex items-start gap-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${i.prioridad==='critica'?'bg-red-500':i.prioridad==='alta'?'bg-amber-500':'bg-blue-500'}`}/><div><p className="font-black text-slate-900">{i.titulo}</p><p className="mt-1 text-sm text-slate-600">{i.mensaje}</p><p className="mt-1 text-xs text-slate-400">{new Date(i.creado_en).toLocaleString('es-MX')}</p></div></div></button>)}</div>
    </div>}
  </div>;
}

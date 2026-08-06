import { Building2, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function SelectorTienda() {
  const { perfil, cambiarTienda } = useAuth();
  const [cambiando,setCambiando]=useState(false);
  const tiendas=perfil?.tiendas??[];
  if(tiendas.length<=1) return null;
  return <label className="hidden items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2 md:flex"><Building2 size={17} className="text-blue-600"/>{cambiando?<Loader2 size={17} className="animate-spin"/>:<select value={perfil.tienda_id} onChange={async e=>{setCambiando(true);try{await cambiarTienda(e.target.value)}finally{setCambiando(false)}}} className="max-w-44 bg-transparent text-sm font-bold outline-none">{tiendas.map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}</select>}<ChevronDown size={14}/></label>;
}

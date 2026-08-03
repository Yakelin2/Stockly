import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bell,
  Check,
  KeyRound,
  Loader2,
  Package,
  Plus,
  ReceiptText,
  Save,
  Settings,
  ShieldCheck,
  Store,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext.jsx";
import {
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  guardarDatosTienda,
  guardarPreferencias,
  guardarRol,
  invitarUsuario,
  obtenerConfiguracionCompleta,
  obtenerPermisos,
  obtenerRolesTienda,
  obtenerUsuariosTienda,
} from "../services/configuracionService.js";
import { actualizarContrasena } from "../services/authService.js";

const PREFERENCIAS_INICIALES = {
  iva: 0,
  zona_horaria: "America/Monterrey",
  formato_fecha: "DD/MM/YYYY",
  stock_minimo_predeterminado: 5,
  dias_alerta_caducidad: 14,
  usar_fefo: true,
  permitir_stock_negativo: false,
  actualizar_costo_compra: true,
  alertas_stock_bajo: true,
  alertas_caducidad: true,
  metodo_efectivo: true,
  metodo_tarjeta: true,
  metodo_transferencia: true,
  metodo_otro: true,
  solicitar_monto_efectivo: true,
  mostrar_cambio: true,
  confirmar_cancelaciones: true,
  ticket_mensaje: "Gracias por su compra",
  ticket_mostrar_logo: true,
  ticket_mostrar_direccion: true,
  ticket_mostrar_telefono: true,
  tema: "claro",
};

const SECCIONES = [
  ["tienda", "Mi tienda", Store],
  ["inventario", "Inventario", Package],
  ["ventas", "Ventas y ticket", WalletCards],
  ["alertas", "Alertas", Bell],
  ["usuarios", "Usuarios", Users],
  ["roles", "Roles y permisos", ShieldCheck],
  ["seguridad", "Seguridad", KeyRound],
];

function Configuracion() {
  const { perfil, recargarPerfil, tienePermiso } = useAuth();
  const [seccion, setSeccion] = useState("tienda");
  const [datos, setDatos] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalRol, setModalRol] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rolId: "",
  });
  const [rolEditando, setRolEditando] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    permisos: [],
  });
  const [contrasena, setContrasena] = useState({
    nueva: "",
    confirmar: "",
  });

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      const [configuracion, usuariosData, rolesData, permisosData] =
        await Promise.all([
          obtenerConfiguracionCompleta(),
          obtenerUsuariosTienda(),
          obtenerRolesTienda(),
          obtenerPermisos(),
        ]);

      setDatos({
        tienda: configuracion.tienda,
        preferencias: {
          ...PREFERENCIAS_INICIALES,
          ...(configuracion.preferencias ?? {}),
        },
      });
      setUsuarios(usuariosData);
      setRoles(rolesData);
      setPermisos(permisosData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function avisar(texto) {
    setMensaje(texto);
    setError("");
    window.setTimeout(() => setMensaje(""), 3500);
  }

  async function guardarTienda(evento) {
    evento.preventDefault();
    try {
      setGuardando(true);
      const tienda = await guardarDatosTienda(datos.tienda);
      setDatos((actual) => ({ ...actual, tienda }));
      await recargarPerfil();
      avisar("Datos de la tienda guardados.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarConfig(evento) {
    evento.preventDefault();
    try {
      setGuardando(true);
      const preferencias = await guardarPreferencias(
        datos.preferencias
      );
      setDatos((actual) => ({ ...actual, preferencias }));
      avisar("Preferencias guardadas correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function crearUsuario(evento) {
    evento.preventDefault();
    try {
      setGuardando(true);
      await invitarUsuario(nuevoUsuario);
      setModalUsuario(false);
      setNuevoUsuario({ nombre: "", correo: "", contrasena: "", rolId: "" });
      setUsuarios(await obtenerUsuariosTienda());
      avisar("Usuario creado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarRolActual(evento) {
    evento.preventDefault();
    try {
      setGuardando(true);
      await guardarRol(rolEditando);
      setRoles(await obtenerRolesTienda());
      setModalRol(false);
      avisar("Rol y permisos guardados.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarNuevaContrasena(evento) {
    evento.preventDefault();
    if (contrasena.nueva.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (contrasena.nueva !== contrasena.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      setGuardando(true);
      await actualizarContrasena(contrasena.nueva);
      setContrasena({ nueva: "", confirmar: "" });
      avisar("Contraseña actualizada.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const permisosPorModulo = useMemo(() => {
    return permisos.reduce((grupos, permiso) => {
      grupos[permiso.modulo] ??= [];
      grupos[permiso.modulo].push(permiso);
      return grupos;
    }, {});
  }, [permisos]);

  if (cargando || !datos) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <section className="space-y-5 pb-10">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Administración
        </p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">
          Personaliza Stockly, administra usuarios y controla permisos.
        </p>
      </header>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      {mensaje && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{mensaje}</div>}

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          {SECCIONES.filter(([codigo]) => {
            if (["usuarios", "roles"].includes(codigo)) {
              return tienePermiso("usuarios.ver");
            }
            return true;
          }).map(([codigo, nombre, Icono]) => (
            <button
              key={codigo}
              type="button"
              onClick={() => setSeccion(codigo)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
                seccion === codigo
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icono size={19} /> {nombre}
            </button>
          ))}
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {seccion === "tienda" && (
            <form onSubmit={guardarTienda} className="space-y-5">
              <Titulo icono={Store} titulo="Datos de la tienda" descripcion="Información que se mostrará en Stockly y en tus comprobantes." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Nombre de la tienda" value={datos.tienda.nombre} onChange={(valor) => setDatos((a) => ({ ...a, tienda: { ...a.tienda, nombre: valor } }))} required />
                <Campo label="Teléfono" value={datos.tienda.telefono ?? ""} onChange={(valor) => setDatos((a) => ({ ...a, tienda: { ...a.tienda, telefono: valor } }))} />
                <Campo label="Dirección" value={datos.tienda.direccion ?? ""} onChange={(valor) => setDatos((a) => ({ ...a, tienda: { ...a.tienda, direccion: valor } }))} className="sm:col-span-2" />
                <Select label="Moneda" value={datos.tienda.moneda} onChange={(valor) => setDatos((a) => ({ ...a, tienda: { ...a.tienda, moneda: valor } }))} opciones={[['MXN','Peso mexicano (MXN)'],['USD','Dólar (USD)'],['EUR','Euro (EUR)']]} />
              </div>
              <BotonGuardar guardando={guardando} />
            </form>
          )}

          {seccion === "inventario" && (
            <form onSubmit={guardarConfig} className="space-y-5">
              <Titulo icono={Package} titulo="Inventario" descripcion="Define cómo se controla y repone la mercancía." />
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoNumero label="Stock mínimo predeterminado" value={datos.preferencias.stock_minimo_predeterminado} onChange={(valor) => setDatos((a) => ({...a, preferencias:{...a.preferencias,stock_minimo_predeterminado:Number(valor)}}))} min="0" />
                <CampoNumero label="IVA (%)" value={datos.preferencias.iva} onChange={(valor) => setDatos((a) => ({...a, preferencias:{...a.preferencias,iva:Number(valor)}}))} min="0" step="0.01" />
              </div>
              <Interruptor label="Usar FEFO" descripcion="Descontar primero los lotes que caducan antes." checked={datos.preferencias.usar_fefo} onChange={(valor) => actualizarPreferencia(setDatos,'usar_fefo',valor)} />
              <Interruptor label="Bloquear stock negativo" descripcion="Impide vender más unidades de las disponibles." checked={!datos.preferencias.permitir_stock_negativo} onChange={(valor) => actualizarPreferencia(setDatos,'permitir_stock_negativo',!valor)} />
              <Interruptor label="Actualizar costo con cada compra" descripcion="Usa el costo más reciente del proveedor." checked={datos.preferencias.actualizar_costo_compra} onChange={(valor) => actualizarPreferencia(setDatos,'actualizar_costo_compra',valor)} />
              <BotonGuardar guardando={guardando} />
            </form>
          )}

          {seccion === "ventas" && (
            <form onSubmit={guardarConfig} className="space-y-5">
              <Titulo icono={ReceiptText} titulo="Ventas y ticket" descripcion="Configura métodos de pago y comprobantes." />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['metodo_efectivo','Efectivo'],['metodo_tarjeta','Tarjeta'],['metodo_transferencia','Transferencia'],['metodo_otro','Otro']
                ].map(([campo,nombre]) => <Interruptor key={campo} label={nombre} checked={datos.preferencias[campo]} onChange={(valor)=>actualizarPreferencia(setDatos,campo,valor)} />)}
              </div>
              <Interruptor label="Solicitar monto recibido" checked={datos.preferencias.solicitar_monto_efectivo} onChange={(valor)=>actualizarPreferencia(setDatos,'solicitar_monto_efectivo',valor)} />
              <Interruptor label="Mostrar cambio" checked={datos.preferencias.mostrar_cambio} onChange={(valor)=>actualizarPreferencia(setDatos,'mostrar_cambio',valor)} />
              <Interruptor label="Confirmar cancelaciones" checked={datos.preferencias.confirmar_cancelaciones} onChange={(valor)=>actualizarPreferencia(setDatos,'confirmar_cancelaciones',valor)} />
              <Campo label="Mensaje del ticket" value={datos.preferencias.ticket_mensaje} onChange={(valor)=>actualizarPreferencia(setDatos,'ticket_mensaje',valor)} />
              <BotonGuardar guardando={guardando} />
            </form>
          )}

          {seccion === "alertas" && (
            <form onSubmit={guardarConfig} className="space-y-5">
              <Titulo icono={Bell} titulo="Alertas" descripcion="Decide qué avisos debe mostrar el sistema." />
              <CampoNumero label="Avisar antes de caducar (días)" value={datos.preferencias.dias_alerta_caducidad} onChange={(valor)=>actualizarPreferencia(setDatos,'dias_alerta_caducidad',Number(valor))} min="1" />
              <Interruptor label="Alertas de stock bajo" checked={datos.preferencias.alertas_stock_bajo} onChange={(valor)=>actualizarPreferencia(setDatos,'alertas_stock_bajo',valor)} />
              <Interruptor label="Alertas de caducidad" checked={datos.preferencias.alertas_caducidad} onChange={(valor)=>actualizarPreferencia(setDatos,'alertas_caducidad',valor)} />
              <BotonGuardar guardando={guardando} />
            </form>
          )}

          {seccion === "usuarios" && (
            <div className="space-y-5">
              <Titulo icono={Users} titulo="Usuarios" descripcion="Administra quién puede entrar a esta tienda." accion={<button onClick={()=>setModalUsuario(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-black text-white"><Plus size={18}/>Nuevo usuario</button>} />
              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                {usuarios.map((usuario)=><div key={usuario.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_220px_120px] sm:items-center">
                  <div><p className="font-black text-slate-900">{usuario.nombre}</p><p className="text-sm text-slate-500">{usuario.correo}</p></div>
                  <select value={usuario.rol_id ?? ''} onChange={async(e)=>{await cambiarRolUsuario(usuario.id,e.target.value);setUsuarios(await obtenerUsuariosTienda());}} className="rounded-xl border border-slate-300 px-3 py-2.5">{roles.map((rol)=><option key={rol.id} value={rol.id}>{rol.nombre}</option>)}</select>
                  <button onClick={async()=>{await cambiarEstadoUsuario(usuario.id,!usuario.activo);setUsuarios(await obtenerUsuariosTienda());}} className={`rounded-xl px-3 py-2 text-sm font-black ${usuario.activo?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500'}`}>{usuario.activo?'Activo':'Inactivo'}</button>
                </div>)}
              </div>
            </div>
          )}

          {seccion === "roles" && (
            <div className="space-y-5">
              <Titulo icono={ShieldCheck} titulo="Roles y permisos" descripcion="Crea funciones personalizadas para tu equipo." accion={<button onClick={()=>{setRolEditando({id:null,nombre:'',descripcion:'',permisos:[]});setModalRol(true)}} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-black text-white"><Plus size={18}/>Nuevo rol</button>} />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{roles.map((rol)=><button key={rol.id} onClick={()=>{setRolEditando({id:rol.id,nombre:rol.nombre,descripcion:rol.descripcion??'',permisos:rol.permisos??[]});setModalRol(true)}} className="rounded-2xl border border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50"><p className="font-black text-slate-900">{rol.nombre}</p><p className="mt-1 text-sm text-slate-500">{rol.descripcion||'Sin descripción'}</p><p className="mt-3 text-xs font-bold text-blue-600">{rol.permisos?.length??0} permisos</p></button>)}</div>
            </div>
          )}

          {seccion === "seguridad" && (
            <form onSubmit={guardarNuevaContrasena} className="space-y-5">
              <Titulo icono={KeyRound} titulo="Seguridad" descripcion={`Sesión actual: ${perfil?.correo ?? ''}`} />
              <Campo label="Nueva contraseña" type="password" value={contrasena.nueva} onChange={(valor)=>setContrasena((a)=>({...a,nueva:valor}))} />
              <Campo label="Confirmar contraseña" type="password" value={contrasena.confirmar} onChange={(valor)=>setContrasena((a)=>({...a,confirmar:valor}))} />
              <BotonGuardar guardando={guardando} texto="Cambiar contraseña" />
            </form>
          )}
        </div>
      </div>

      {modalUsuario && <Modal titulo="Nuevo usuario" onCerrar={()=>setModalUsuario(false)}><form onSubmit={crearUsuario} className="space-y-4"><Campo label="Nombre" value={nuevoUsuario.nombre} onChange={(valor)=>setNuevoUsuario((a)=>({...a,nombre:valor}))} required/><Campo label="Correo" type="email" value={nuevoUsuario.correo} onChange={(valor)=>setNuevoUsuario((a)=>({...a,correo:valor}))} required/><Campo label="Contraseña temporal" type="password" value={nuevoUsuario.contrasena} onChange={(valor)=>setNuevoUsuario((a)=>({...a,contrasena:valor}))} required/><Select label="Rol" value={nuevoUsuario.rolId} onChange={(valor)=>setNuevoUsuario((a)=>({...a,rolId:valor}))} opciones={roles.map((r)=>[r.id,r.nombre])}/><BotonGuardar guardando={guardando} texto="Crear usuario"/></form></Modal>}

      {modalRol && <Modal titulo={rolEditando.id?'Editar rol':'Nuevo rol'} onCerrar={()=>setModalRol(false)} ancho="max-w-3xl"><form onSubmit={guardarRolActual} className="space-y-5"><Campo label="Nombre" value={rolEditando.nombre} onChange={(valor)=>setRolEditando((a)=>({...a,nombre:valor}))} required/><Campo label="Descripción" value={rolEditando.descripcion} onChange={(valor)=>setRolEditando((a)=>({...a,descripcion:valor}))}/>{Object.entries(permisosPorModulo).map(([modulo,items])=><div key={modulo} className="rounded-2xl border border-slate-200 p-4"><p className="font-black capitalize text-slate-900">{modulo}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{items.map((p)=><label key={p.codigo} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"><input type="checkbox" checked={rolEditando.permisos.includes(p.codigo)} onChange={(e)=>setRolEditando((a)=>({...a,permisos:e.target.checked?[...a.permisos,p.codigo]:a.permisos.filter((x)=>x!==p.codigo)}))} className="mt-1"/><span><span className="block text-sm font-bold text-slate-800">{p.nombre}</span><span className="text-xs text-slate-500">{p.descripcion}</span></span></label>)}</div></div>)}<BotonGuardar guardando={guardando} texto="Guardar rol"/></form></Modal>}
    </section>
  );
}

function actualizarPreferencia(setDatos, campo, valor) { setDatos((a)=>({...a,preferencias:{...a.preferencias,[campo]:valor}})); }
function Titulo({icono:Icono,titulo,descripcion,accion}){return <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icono size={22}/></div><div><h2 className="text-xl font-black text-slate-950">{titulo}</h2><p className="mt-1 text-sm text-slate-500">{descripcion}</p></div></div>{accion}</div>}
function Campo({label,value,onChange,type='text',required=false,className=''}){return <label className={`block ${className}`}><span className="text-sm font-bold text-slate-700">{label}</span><input type={type} value={value} onChange={(e)=>onChange(e.target.value)} required={required} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/></label>}
function CampoNumero(props){return <Campo {...props} type="number"/>}
function Select({label,value,onChange,opciones}){return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="">Selecciona</option>{opciones.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>}
function Interruptor({label,descripcion,checked,onChange}){return <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"><span><span className="block font-bold text-slate-800">{label}</span>{descripcion&&<span className="mt-1 block text-sm text-slate-500">{descripcion}</span>}</span><button type="button" onClick={()=>onChange(!checked)} className={`relative h-7 w-12 rounded-full transition ${checked?'bg-blue-600':'bg-slate-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked?'left-6':'left-1'}`}/></button></label>}
function BotonGuardar({guardando,texto='Guardar cambios'}){return <button disabled={guardando} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-50">{guardando?<Loader2 className="h-5 w-5 animate-spin"/>:<Save className="h-5 w-5"/>}{texto}</button>}
function Modal({titulo,onCerrar,children,ancho='max-w-lg'}){return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className={`max-h-[92vh] w-full ${ancho} overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl`}><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-black text-slate-950">{titulo}</h2><button onClick={onCerrar} className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100">Cerrar</button></div>{children}</div></div>}

export default Configuracion;

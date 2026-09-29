import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Database,
  Download,
  Eye,
  Image,
  KeyRound,
  Loader2,
  MonitorCog,
  Package,
  Palette,
  Plus,
  ReceiptText,
  Save,
  ShieldCheck,
  Store,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext.jsx";
import ImagenWeb from "../components/ImagenWeb.jsx";
import RestaurarRespaldo from "../components/respaldos/RestaurarRespaldo.jsx";
import { actualizarContrasena } from "../services/authService.js";
import {
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  crearRespaldoJSON,
  descargarJSON,
  guardarDatosTienda,
  guardarPreferencias,
  guardarRol,
  invitarUsuario,
  obtenerConfiguracionCompleta,
  obtenerPermisos,
  obtenerResumenSistema,
  obtenerRolesTienda,
  obtenerUsuariosTienda,
  subirLogoTienda,
} from "../services/configuracionService.js";

const DEFAULTS = {
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
  mostrar_impuestos_ticket: true,
  permitir_descuentos: false,
  descuento_maximo: 0,
  folio_ticket_prefijo: "V",
  nombre_ticket: "",
  tema: "claro",
  logo_url: "",
  color_primario: "#2563eb",
  color_secundario: "#10b981",
  correo_reportes: "",
  resumen_diario: false,
  hora_resumen: "20:00",
  respaldo_automatico: false,
  frecuencia_respaldo: "semanal",
  ultima_exportacion: null,
};

const TABS = [
  ["tienda", "Mi tienda", Store],
  ["inventario", "Inventario", Package],
  ["ventas", "Ventas y ticket", ReceiptText],
  ["alertas", "Alertas", Bell],
  ["usuarios", "Usuarios", Users],
  ["roles", "Roles y permisos", ShieldCheck],
  ["apariencia", "Apariencia", Palette],
  ["respaldos", "Respaldos", Database],
  ["seguridad", "Seguridad", KeyRound],
  ["sistema", "Sistema", MonitorCog],
];

function Configuracion() {
  const { perfil, recargarPerfil, tienePermiso } = useAuth();
  const [tab, setTab] = useState("tienda");
  const [datos, setDatos] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [sistema, setSistema] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalRol, setModalRol] = useState(false);
  const [archivoLogo, setArchivoLogo] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "", correo: "", contrasena: "", rolId: "",
  });
  const [rolEditando, setRolEditando] = useState({
    id: null, nombre: "", descripcion: "", permisos: [],
  });
  const [contrasena, setContrasena] = useState({ nueva: "", confirmar: "" });

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      const [configuracion, usuariosData, rolesData, permisosData, sistemaData] =
        await Promise.all([
          obtenerConfiguracionCompleta(),
          obtenerUsuariosTienda(),
          obtenerRolesTienda(),
          obtenerPermisos(),
          obtenerResumenSistema(),
        ]);
      setDatos({
        tienda: configuracion.tienda,
        preferencias: { ...DEFAULTS, ...(configuracion.preferencias ?? {}) },
      });
      setUsuarios(usuariosData);
      setRoles(rolesData);
      setPermisos(permisosData);
      setSistema(sistemaData);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function avisar(texto) {
    setMensaje(texto);
    setError("");
    window.setTimeout(() => setMensaje(""), 3500);
  }

  function preferencia(campo, valor) {
    setDatos((actual) => ({
      ...actual,
      preferencias: { ...actual.preferencias, [campo]: valor },
    }));
  }

  async function guardarTienda(e) {
    e.preventDefault();
    try {
      setGuardando(true);
      const tienda = await guardarDatosTienda(datos.tienda);
      setDatos((a) => ({ ...a, tienda }));
      await recargarPerfil();
      avisar("Datos de la tienda guardados.");
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  }

  async function guardarConfig(e) {
    e?.preventDefault();
    try {
      setGuardando(true);
      let preferencias = { ...datos.preferencias };
      if (archivoLogo) {
        preferencias.logo_url = await subirLogoTienda(
          archivoLogo,
          preferencias.logo_url
        );
      }
      const guardadas = await guardarPreferencias(preferencias);
      setDatos((a) => ({ ...a, preferencias: { ...DEFAULTS, ...guardadas } }));
      setArchivoLogo(null);
      await recargarPerfil();
      avisar("Configuración guardada correctamente.");
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  }

  async function crearUsuario(e) {
    e.preventDefault();
    try {
      setGuardando(true);
      await invitarUsuario(nuevoUsuario);
      setUsuarios(await obtenerUsuariosTienda());
      setNuevoUsuario({ nombre: "", correo: "", contrasena: "", rolId: "" });
      setModalUsuario(false);
      avisar("Usuario creado correctamente.");
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  }

  async function guardarRolActual(e) {
    e.preventDefault();
    try {
      setGuardando(true);
      await guardarRol(rolEditando);
      setRoles(await obtenerRolesTienda());
      setModalRol(false);
      avisar("Rol y permisos guardados.");
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  }

  async function cambiarPassword(e) {
    e.preventDefault();
    if (contrasena.nueva.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (contrasena.nueva !== contrasena.confirmar) return setError("Las contraseñas no coinciden.");
    try {
      setGuardando(true);
      await actualizarContrasena(contrasena.nueva);
      setContrasena({ nueva: "", confirmar: "" });
      avisar("Contraseña actualizada.");
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  }

  async function exportar() {
    try {
      setGuardando(true);
      const respaldo = await crearRespaldoJSON();
      descargarJSON(
        respaldo,
        `stockly-respaldo-${new Date().toISOString().slice(0,10)}.json`
      );
      preferencia("ultima_exportacion", new Date().toISOString());
      avisar("Respaldo descargado.");
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  }

  const permisosPorModulo = useMemo(() => permisos.reduce((acc, item) => {
    (acc[item.modulo] ??= []).push(item);
    return acc;
  }, {}), [permisos]);

  if (cargando || !datos) {
    return <div className="flex min-h-[520px] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;
  }

  const p = datos.preferencias;
  const tabsVisibles = TABS.filter(([codigo]) =>
    !["usuarios", "roles"].includes(codigo) || tienePermiso("usuarios.ver")
  );

  return (
    <section className="space-y-5 pb-10">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Centro administrativo</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Configuración profesional</h1>
          <p className="mt-1 text-sm text-slate-500">Administra tu tienda, equipo, seguridad y preferencias desde un solo lugar.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Sesión actual</p>
          <p className="font-black text-slate-900">{perfil?.nombre}</p>
          <p className="text-xs text-slate-500">{perfil?.rol_nombre}</p>
        </div>
      </header>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="ok" texto={mensaje} />}

      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-24">
          <div className="mb-3 rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs text-slate-400">Configurando</p>
            <p className="mt-1 font-black">{datos.tienda.nombre}</p>
          </div>
          <nav className="space-y-1">
            {tabsVisibles.map(([codigo, nombre, Icono]) => (
              <button key={codigo} type="button" onClick={() => setTab(codigo)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold transition ${tab === codigo ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
                <span className="flex items-center gap-3"><Icono size={18}/>{nombre}</span><ChevronRight size={16}/>
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {tab === "tienda" && <form onSubmit={guardarTienda} className="space-y-6">
            <Titulo icono={Store} titulo="Información de la tienda" descripcion="Datos legales y de contacto que aparecerán en Stockly y comprobantes." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre de la tienda" value={datos.tienda.nombre} onChange={v=>setDatos(a=>({...a,tienda:{...a.tienda,nombre:v}}))} required />
              <Campo label="Teléfono" value={datos.tienda.telefono??""} onChange={v=>setDatos(a=>({...a,tienda:{...a.tienda,telefono:v}}))} />
              <Campo label="Dirección" value={datos.tienda.direccion??""} onChange={v=>setDatos(a=>({...a,tienda:{...a.tienda,direccion:v}}))} className="sm:col-span-2" />
              <Select label="Moneda" value={datos.tienda.moneda} onChange={v=>setDatos(a=>({...a,tienda:{...a.tienda,moneda:v}}))} opciones={[["MXN","Peso mexicano"],["USD","Dólar estadounidense"],["EUR","Euro"]]} />
              <Select label="Zona horaria" value={p.zona_horaria} onChange={v=>preferencia("zona_horaria",v)} opciones={[["America/Monterrey","Monterrey"],["America/Mexico_City","Ciudad de México"],["America/Tijuana","Tijuana"]]} />
            </div>
            <BotonGuardar guardando={guardando}/>
          </form>}

          {tab === "inventario" && <form onSubmit={guardarConfig} className="space-y-6">
            <Titulo icono={Package} titulo="Inventario" descripcion="Reglas globales para costos, existencias y lotes." />
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoNumero label="Stock mínimo predeterminado" value={p.stock_minimo_predeterminado} onChange={v=>preferencia("stock_minimo_predeterminado",Number(v))} min="0" />
              <CampoNumero label="IVA (%)" value={p.iva} onChange={v=>preferencia("iva",Number(v))} min="0" max="100" step="0.01" />
            </div>
            <Interruptor label="Usar FEFO" descripcion="Descuenta primero los lotes que caducan antes." checked={p.usar_fefo} onChange={v=>preferencia("usar_fefo",v)} />
            <Interruptor label="Bloquear stock negativo" descripcion="Impide vender más unidades de las disponibles." checked={!p.permitir_stock_negativo} onChange={v=>preferencia("permitir_stock_negativo",!v)} />
            <Interruptor label="Actualizar costo con cada compra" descripcion="Usa el costo más reciente del proveedor." checked={p.actualizar_costo_compra} onChange={v=>preferencia("actualizar_costo_compra",v)} />
            <BotonGuardar guardando={guardando}/>
          </form>}

          {tab === "ventas" && <form onSubmit={guardarConfig} className="space-y-6">
            <Titulo icono={WalletCards} titulo="Ventas y tickets" descripcion="Métodos de cobro, descuentos y contenido del comprobante." />
            <h3 className="font-black text-slate-900">Métodos de pago habilitados</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[["metodo_efectivo","Efectivo"],["metodo_tarjeta","Tarjeta"],["metodo_transferencia","Transferencia"],["metodo_otro","Otro"]].map(([c,n])=><Interruptor key={c} label={n} checked={p[c]} onChange={v=>preferencia(c,v)} />)}
            </div>
            <Interruptor label="Solicitar monto recibido" checked={p.solicitar_monto_efectivo} onChange={v=>preferencia("solicitar_monto_efectivo",v)} />
            <Interruptor label="Mostrar cambio" checked={p.mostrar_cambio} onChange={v=>preferencia("mostrar_cambio",v)} />
            <Interruptor label="Confirmar cancelaciones" checked={p.confirmar_cancelaciones} onChange={v=>preferencia("confirmar_cancelaciones",v)} />
            <Interruptor label="Permitir descuentos" checked={p.permitir_descuentos} onChange={v=>preferencia("permitir_descuentos",v)} />
            {p.permitir_descuentos && <CampoNumero label="Descuento máximo (%)" value={p.descuento_maximo} onChange={v=>preferencia("descuento_maximo",Number(v))} min="0" max="100" step="0.01" />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre en el ticket" value={p.nombre_ticket} onChange={v=>preferencia("nombre_ticket",v)} placeholder={datos.tienda.nombre}/>
              <Campo label="Prefijo de folio" value={p.folio_ticket_prefijo} onChange={v=>preferencia("folio_ticket_prefijo",v.toUpperCase().slice(0,5))}/>
              <Campo label="Mensaje final" value={p.ticket_mensaje} onChange={v=>preferencia("ticket_mensaje",v)} className="sm:col-span-2"/>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Interruptor label="Mostrar logo" checked={p.ticket_mostrar_logo} onChange={v=>preferencia("ticket_mostrar_logo",v)} />
              <Interruptor label="Mostrar dirección" checked={p.ticket_mostrar_direccion} onChange={v=>preferencia("ticket_mostrar_direccion",v)} />
              <Interruptor label="Mostrar teléfono" checked={p.ticket_mostrar_telefono} onChange={v=>preferencia("ticket_mostrar_telefono",v)} />
              <Interruptor label="Mostrar impuestos" checked={p.mostrar_impuestos_ticket} onChange={v=>preferencia("mostrar_impuestos_ticket",v)} />
            </div>
            <BotonGuardar guardando={guardando}/>
          </form>}

          {tab === "alertas" && <form onSubmit={guardarConfig} className="space-y-6">
            <Titulo icono={Bell} titulo="Alertas y reportes" descripcion="Decide cuándo y cómo debe avisarte Stockly." />
            <CampoNumero label="Avisar antes de caducar (días)" value={p.dias_alerta_caducidad} onChange={v=>preferencia("dias_alerta_caducidad",Number(v))} min="1" max="365" />
            <Interruptor label="Alertas de stock bajo" checked={p.alertas_stock_bajo} onChange={v=>preferencia("alertas_stock_bajo",v)} />
            <Interruptor label="Alertas de caducidad" checked={p.alertas_caducidad} onChange={v=>preferencia("alertas_caducidad",v)} />
            <Interruptor label="Resumen diario" descripcion="Prepara la configuración para enviar un resumen del negocio." checked={p.resumen_diario} onChange={v=>preferencia("resumen_diario",v)} />
            {p.resumen_diario && <div className="grid gap-4 sm:grid-cols-2"><Campo label="Correo para reportes" type="email" value={p.correo_reportes} onChange={v=>preferencia("correo_reportes",v)} /><Campo label="Hora del resumen" type="time" value={p.hora_resumen} onChange={v=>preferencia("hora_resumen",v)} /></div>}
            <BotonGuardar guardando={guardando}/>
          </form>}

          {tab === "usuarios" && <div className="space-y-6">
            <Titulo icono={Users} titulo="Usuarios" descripcion="Administra las cuentas que pueden entrar a esta tienda." accion={<button onClick={()=>setModalUsuario(true)} className="boton-primario"><Plus size={18}/>Nuevo usuario</button>} />
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {usuarios.map(u=><div key={u.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-0 sm:grid-cols-[1fr_220px_120px] sm:items-center">
                <div><p className="font-black text-slate-900">{u.nombre}</p><p className="text-sm text-slate-500">{u.correo}</p><p className="mt-1 text-xs text-slate-400">Último acceso: {u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString("es-MX") : "Sin acceso registrado"}</p></div>
                <select value={u.rol_id??""} onChange={async e=>{try{await cambiarRolUsuario(u.id,e.target.value);setUsuarios(await obtenerUsuariosTienda());avisar("Rol actualizado.")}catch(err){setError(err.message)}}} className="input-base">{roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</select>
                <button onClick={async()=>{try{await cambiarEstadoUsuario(u.id,!u.activo);setUsuarios(await obtenerUsuariosTienda())}catch(err){setError(err.message)}}} className={`rounded-xl px-3 py-2 text-sm font-black ${u.activo?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{u.activo?"Activo":"Inactivo"}</button>
              </div>)}
            </div>
          </div>}

          {tab === "roles" && <div className="space-y-6">
            <Titulo icono={ShieldCheck} titulo="Roles y permisos" descripcion="Crea niveles de acceso específicos para cada función." accion={<button onClick={()=>{setRolEditando({id:null,nombre:"",descripcion:"",permisos:[]});setModalRol(true)}} className="boton-primario"><Plus size={18}/>Nuevo rol</button>} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{roles.map(r=><button key={r.id} onClick={()=>{setRolEditando({id:r.id,nombre:r.nombre,descripcion:r.descripcion??"",permisos:r.permisos??[]});setModalRol(true)}} className="rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"><div className="flex items-start justify-between"><ShieldCheck className="text-blue-600"/><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{r.es_sistema?"Sistema":"Personalizado"}</span></div><p className="mt-4 font-black text-slate-900">{r.nombre}</p><p className="mt-1 min-h-10 text-sm text-slate-500">{r.descripcion||"Sin descripción"}</p><p className="mt-3 text-xs font-bold text-blue-600">{r.permisos?.length??0} permisos</p></button>)}</div>
          </div>}

          {tab === "apariencia" && <form onSubmit={guardarConfig} className="space-y-6">
            <Titulo icono={Palette} titulo="Apariencia" descripcion="Logo, colores y estilo visual de tu tienda." />
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-slate-100">
                  {archivoLogo ? <img src={URL.createObjectURL(archivoLogo)} className="h-full w-full object-cover"/> : p.logo_url ? <img src={p.logo_url} className="h-full w-full object-cover"/> : <Image className="h-10 w-10 text-slate-300"/>}
                </div>
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"><Image size={17}/>Seleccionar logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={e=>setArchivoLogo(e.target.files?.[0]??null)}/></label>
                <p className="mt-2 text-xs text-slate-400">PNG, JPG, WEBP o SVG · Máximo 2 MB</p>
                <div className="mt-4 text-left">
                  <ImagenWeb
                    key={archivoLogo ? archivoLogo.name : p.logo_url}
                    disabled={guardando}
                    onSeleccionar={(url) => {
                      setArchivoLogo(null);
                      preferencia("logo_url", url);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Select label="Tema" value={p.tema} onChange={v=>preferencia("tema",v)} opciones={[["claro","Claro"],["oscuro","Oscuro"],["sistema","Usar configuración del dispositivo"]]} />
                <div className="grid gap-4 sm:grid-cols-2"><Color label="Color principal" value={p.color_primario} onChange={v=>preferencia("color_primario",v)}/><Color label="Color secundario" value={p.color_secundario} onChange={v=>preferencia("color_secundario",v)}/></div>
                <div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase text-slate-400">Vista previa</p><div className="mt-3 flex items-center gap-3"><div className="h-12 w-12 rounded-2xl" style={{background:p.color_primario}}/><div><p className="font-black text-slate-900">{datos.tienda.nombre}</p><p className="text-sm" style={{color:p.color_secundario}}>Control inteligente</p></div></div></div>
              </div>
            </div>
            <BotonGuardar guardando={guardando}/>
          </form>}

          {tab === "respaldos" && <div className="space-y-6">
            <Titulo icono={Database} titulo="Respaldos" descripcion="Descarga una copia de seguridad legible de los datos de tu tienda." />
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6"><Database className="h-9 w-9 text-blue-600"/><h3 className="mt-4 text-xl font-black text-slate-950">Respaldo manual en JSON</h3><p className="mt-2 max-w-2xl text-sm text-slate-600">Incluye productos, ventas, compras, lotes, pérdidas, proveedores, usuarios, roles y configuración. La restauración se realiza con asistencia administrativa para evitar sobrescribir movimientos accidentalmente.</p><button type="button" onClick={exportar} disabled={guardando} className="boton-primario mt-5"><Download size={18}/>{guardando?"Preparando...":"Descargar respaldo"}</button></div>
            <Interruptor label="Respaldo automático" descripcion="Guarda la preferencia para automatizarlo al desplegar tareas programadas." checked={p.respaldo_automatico} onChange={v=>preferencia("respaldo_automatico",v)} />
            {p.respaldo_automatico && <Select label="Frecuencia" value={p.frecuencia_respaldo} onChange={v=>preferencia("frecuencia_respaldo",v)} opciones={[["diario","Diario"],["semanal","Semanal"],["mensual","Mensual"]]} />}
            <p className="text-sm text-slate-500">Última exportación: {p.ultima_exportacion ? new Date(p.ultima_exportacion).toLocaleString("es-MX") : "Aún no se ha creado una"}</p>
            <RestaurarRespaldo />
            <BotonGuardar guardando={guardando} onClick={guardarConfig}/>
          </div>}

          {tab === "seguridad" && <form onSubmit={cambiarPassword} className="space-y-6"><Titulo icono={KeyRound} titulo="Seguridad de la cuenta" descripcion={`Cuenta actual: ${perfil?.correo??""}`} /><Campo label="Nueva contraseña" type="password" value={contrasena.nueva} onChange={v=>setContrasena(a=>({...a,nueva:v}))}/><Campo label="Confirmar contraseña" type="password" value={contrasena.confirmar} onChange={v=>setContrasena(a=>({...a,confirmar:v}))}/><BotonGuardar guardando={guardando} texto="Cambiar contraseña"/></form>}

          {tab === "sistema" && <div className="space-y-6"><Titulo icono={MonitorCog} titulo="Información del sistema" descripcion="Estado general de esta instalación de Stockly." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Productos",sistema.productos],["Ventas",sistema.ventas],["Compras",sistema.compras],["Pérdidas",sistema.perdidas],["Usuarios activos",sistema.usuarios_activos],["Roles",sistema.roles],["Lotes activos",sistema.lotes_activos],["Versión",sistema.version]].map(([n,v])=><div key={n} className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{n}</p><p className="mt-2 text-2xl font-black text-slate-950">{v??0}</p></div>)}</div><div className="rounded-2xl border border-slate-200 p-5"><p className="font-black text-slate-900">Infraestructura</p><p className="mt-2 text-sm text-slate-500">Frontend: React + Vite</p><p className="text-sm text-slate-500">Base de datos: {sistema.base_datos||"Supabase PostgreSQL"}</p><p className="text-sm text-slate-500">Seguridad: Supabase Auth + RLS + permisos por rol</p></div></div>}
        </main>
      </div>

      {modalUsuario && <Modal titulo="Crear usuario" onCerrar={()=>setModalUsuario(false)}><form onSubmit={crearUsuario} className="space-y-4"><Campo label="Nombre" value={nuevoUsuario.nombre} onChange={v=>setNuevoUsuario(a=>({...a,nombre:v}))} required/><Campo label="Correo" type="email" value={nuevoUsuario.correo} onChange={v=>setNuevoUsuario(a=>({...a,correo:v}))} required/><Campo label="Contraseña temporal" type="password" value={nuevoUsuario.contrasena} onChange={v=>setNuevoUsuario(a=>({...a,contrasena:v}))} required/><Select label="Rol" value={nuevoUsuario.rolId} onChange={v=>setNuevoUsuario(a=>({...a,rolId:v}))} opciones={roles.map(r=>[r.id,r.nombre])}/><BotonGuardar guardando={guardando} texto="Crear usuario"/></form></Modal>}

      {modalRol && <Modal titulo={rolEditando.id?"Editar rol":"Nuevo rol"} onCerrar={()=>setModalRol(false)} ancho="max-w-4xl"><form onSubmit={guardarRolActual} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Campo label="Nombre" value={rolEditando.nombre} onChange={v=>setRolEditando(a=>({...a,nombre:v}))} required/><Campo label="Descripción" value={rolEditando.descripcion} onChange={v=>setRolEditando(a=>({...a,descripcion:v}))}/></div><div className="grid gap-4 md:grid-cols-2">{Object.entries(permisosPorModulo).map(([modulo,lista])=><div key={modulo} className="rounded-2xl border border-slate-200 p-4"><p className="mb-3 font-black capitalize text-slate-900">{modulo}</p><div className="space-y-2">{lista.map(pm=><label key={pm.id} className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-slate-50"><input type="checkbox" checked={rolEditando.permisos.includes(pm.codigo)} onChange={e=>setRolEditando(a=>({...a,permisos:e.target.checked?[...a.permisos,pm.codigo]:a.permisos.filter(c=>c!==pm.codigo)}))} className="mt-1"/><span><span className="block text-sm font-bold text-slate-800">{pm.nombre}</span><span className="text-xs text-slate-500">{pm.descripcion}</span></span></label>)}</div></div>)}</div><BotonGuardar guardando={guardando} texto="Guardar rol"/></form></Modal>}
    </section>
  );
}

function Aviso({tipo,texto}){return <div className={`rounded-2xl border p-4 ${tipo==="ok"?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-red-200 bg-red-50 text-red-700"}`}>{texto}</div>}
function Titulo({icono:Icono,titulo,descripcion,accion}){return <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icono size={22}/></div><div><h2 className="text-xl font-black text-slate-950">{titulo}</h2><p className="mt-1 text-sm text-slate-500">{descripcion}</p></div></div>{accion}</div>}
function Campo({label,value,onChange,type="text",required=false,className="",placeholder=""}){return <label className={`block ${className}`}><span className="text-sm font-bold text-slate-700">{label}</span><input type={type} value={value??""} onChange={e=>onChange(e.target.value)} required={required} placeholder={placeholder} className="input-base mt-2"/></label>}
function CampoNumero(props){return <Campo {...props} type="number"/>}
function Select({label,value,onChange,opciones}){return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><select value={value??""} onChange={e=>onChange(e.target.value)} className="input-base mt-2">{opciones.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>}
function Color({label,value,onChange}){return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 p-2"><input type="color" value={value} onChange={e=>onChange(e.target.value)} className="h-10 w-12 cursor-pointer border-0 bg-transparent"/><input value={value} onChange={e=>onChange(e.target.value)} className="min-w-0 flex-1 outline-none"/></div></label>}
function Interruptor({label,descripcion,checked,onChange}){return <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"><span><span className="block font-bold text-slate-800">{label}</span>{descripcion&&<span className="mt-1 block text-sm text-slate-500">{descripcion}</span>}</span><button type="button" onClick={()=>onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked?"bg-blue-600":"bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked?"left-6":"left-1"}`}/></button></label>}
function BotonGuardar({guardando,texto="Guardar cambios",onClick}){return <button type={onClick?"button":"submit"} onClick={onClick} disabled={guardando} className="boton-primario"><>{guardando?<Loader2 className="h-5 w-5 animate-spin"/>:<Save className="h-5 w-5"/>}{texto}</></button>}
function Modal({titulo,onCerrar,children,ancho="max-w-lg"}){return <div className="stockly-modal fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className={`max-h-[92vh] w-full ${ancho} overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl`}><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-black text-slate-950">{titulo}</h2><button onClick={onCerrar} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X/></button></div>{children}</div></div>}

export default Configuracion;

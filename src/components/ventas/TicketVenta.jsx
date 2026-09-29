import { Printer, X } from "lucide-react";

function dinero(v) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(v) || 0);
}

export default function TicketVenta({ abierto, datos, onCerrar }) {
  if (!abierto || !datos) return null;
  const { venta, detalle, configuracion } = datos;
  const tienda = configuracion?.tienda ?? {};
  const p = configuracion?.preferencias ?? {};

  function imprimir() {
    window.print();
  }

  return <div className="stockly-modal fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
    <div className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
      <div className="no-print flex items-center justify-between border-b p-4">
        <h2 className="text-xl font-black">Ticket de venta</h2>
        <button onClick={onCerrar} className="rounded-xl p-2 hover:bg-slate-100"><X/></button>
      </div>
      <article id="ticket-stockly" className="mx-auto w-[80mm] max-w-full bg-white p-5 font-mono text-[12px] text-black">
        <header className="text-center">
          {p.ticket_mostrar_logo && p.logo_url && <img src={p.logo_url} className="mx-auto mb-2 h-16 w-16 object-contain"/>}
          <h1 className="text-lg font-black">{p.nombre_ticket || tienda.nombre || "Stockly"}</h1>
          {p.ticket_mostrar_direccion && tienda.direccion && <p>{tienda.direccion}</p>}
          {p.ticket_mostrar_telefono && tienda.telefono && <p>Tel. {tienda.telefono}</p>}
        </header>
        <div className="my-3 border-y border-dashed border-black py-2">
          <p>Folio: {p.folio_ticket_prefijo || "V"}-{venta.folio}</p>
          <p>Fecha: {new Date(venta.creado_en).toLocaleString("es-MX")}</p>
          <p>Cajero: {venta.cajero || "Usuario Stockly"}</p>
          <p>Pago: {venta.metodo_pago}</p>
        </div>
        <table className="w-full"><thead><tr className="border-b border-dashed"><th className="text-left">Producto</th><th>Cant.</th><th className="text-right">Importe</th></tr></thead>
          <tbody>{detalle.map(d=><tr key={d.id || `${d.producto_id}-${d.nombre_producto}`}><td className="py-1">{d.nombre_producto}<div className="text-[10px]">{dinero(d.precio_unitario)} c/u</div></td><td className="text-center">{d.cantidad}</td><td className="text-right">{dinero(d.subtotal)}</td></tr>)}</tbody>
        </table>
        <div className="mt-3 border-t border-dashed pt-2 text-right">
          <p className="text-base font-black">TOTAL {dinero(venta.total)}</p>
          {venta.monto_recibido !== null && <p>Recibido {dinero(venta.monto_recibido)}</p>}
          {Number(venta.cambio) > 0 && <p>Cambio {dinero(venta.cambio)}</p>}
        </div>
        <footer className="mt-5 text-center"><p>{p.ticket_mensaje || "Gracias por su compra"}</p><p className="mt-2 text-[10px]">Stockly · Control inteligente</p></footer>
      </article>
      <div className="no-print grid grid-cols-2 gap-3 border-t p-4">
        <button onClick={onCerrar} className="rounded-xl border px-4 py-3 font-bold">Cerrar</button>
        <button onClick={imprimir} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-black text-white"><Printer size={18}/>Imprimir</button>
      </div>
    </div>
  </div>;
}

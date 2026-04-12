import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { ArrowLeftRight, Search, FileText, ArrowRight, CornerDownRight } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function MovimientosAsesor() {
  await getServerSession(authOptions);

  // ── Database Queries ──────────────────────────────────────────────────
  const movimientos = await prisma.movimiento.findMany({
    orderBy: { fecha: "desc" },
    include: {
      cuenta_movimiento_id_cuenta_origenTocuenta: { select: { numero_cuenta: true, cliente: { select: { nombres: true, apellidos: true, numero_documento: true } } } },
      cuenta_movimiento_id_cuenta_destinoTocuenta: { select: { numero_cuenta: true, cliente: { select: { nombres: true, apellidos: true, numero_documento: true } } } },
      punto_atencion: { select: { nombre: true, tipo: true } }
    },
    take: 50,
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 relative z-10 w-full max-w-7xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <ArrowLeftRight className="w-8 h-8 text-emerald-600" />
          Auditoría Transaccional
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Inspecciona y rastrea transferencias, depósitos y retiros en toda la red de cuentas.</p>
      </div>

      <AnimatedCard className="flex flex-col bg-white/70">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-[450px]">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar ID de referencia, documento o número de cuenta..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all shadow-sm text-slate-700" 
            />
          </div>
          <button className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
            <FileText className="w-4 h-4" />
            Generar Reporte Excel
          </button>
        </div>

        <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Detalles / Ref</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Flujo de Fondos (Origen → Destino)</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Monto</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-500">
                    <p className="font-semibold text-lg">Sin movimientos registrados recientemente.</p>
                  </td>
                </tr>
              ) : (
                movimientos.map((m) => {
                  const origen = m.cuenta_movimiento_id_cuenta_origenTocuenta;
                  const destino = m.cuenta_movimiento_id_cuenta_destinoTocuenta;
                  
                  return (
                    <tr key={Number(m.id_movimiento)} className="hover:bg-slate-50/60 transition-colors">
                       {/* Detalles Base */}
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                           <div className={`px-2 py-1 rounded border text-[10px] uppercase font-black tracking-widest ${
                               m.tipo === "DEPOSITO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                               m.tipo === "RETIRO" ? "bg-rose-50 text-rose-700 border-rose-200" :
                               m.tipo === "PAGO" ? "bg-amber-50 text-amber-700 border-amber-200" :
                               "bg-sky-50 text-sky-700 border-sky-200"
                           }`}>
                             {m.tipo}
                           </div>
                         </div>
                         <p className="text-xs font-mono text-slate-500 mt-2 font-bold">REF:{m.referencia_externa ?? String(m.id_movimiento)}</p>
                         <p className="text-[10px] text-slate-400 mt-0.5">{new Date(m.fecha).toLocaleString()}</p>
                       </td>

                       {/* Trazabilidad Nodos */}
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-4 text-xs font-medium">
                           {/* Nodo Origen */}
                           <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 max-w-[180px]">
                             <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Sale de:</p>
                             {origen ? (
                               <>
                                 <p className="font-bold text-slate-700 truncate">{origen.cliente?.nombres} {origen.cliente?.apellidos}</p>
                                 <p className="text-slate-500 font-mono">****{origen.numero_cuenta.slice(-4)}</p>
                               </>
                             ) : (
                               <>
                                 <p className="font-bold text-slate-700 uppercase">{m.punto_atencion?.tipo ?? "Efectivo"}</p>
                                 <p className="text-slate-500 truncate">{m.punto_atencion?.nombre ?? "Fuente Externa"}</p>
                               </>
                             )}
                           </div>
                           
                           <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />
                           
                           {/* Nodo Destino */}
                           <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 max-w-[180px]">
                             <p className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                                <CornerDownRight className="w-3 h-3 text-emerald-500" /> Ingresa a:
                             </p>
                             {destino ? (
                               <>
                                 <p className="font-bold text-slate-700 truncate">{destino.cliente?.nombres} {destino.cliente?.apellidos}</p>
                                 <p className="text-slate-500 font-mono">****{destino.numero_cuenta.slice(-4)}</p>
                               </>
                             ) : (
                               <>
                                 <p className="font-bold text-slate-700 uppercase">{m.punto_atencion?.tipo ?? "Retiro / Pago"}</p>
                                 <p className="text-slate-500 truncate">{m.punto_atencion?.nombre ?? "Destino Externo"}</p>
                               </>
                             )}
                           </div>
                         </div>
                       </td>

                       <td className="px-6 py-4 whitespace-nowrap text-right">
                         <p className="font-black text-slate-900 text-lg tracking-tight">
                           {formatCurrency(Number(m.monto))}
                         </p>
                         {m.descripcion && (
                           <p className="text-[10px] text-slate-400 truncate max-w-[120px] ml-auto block" title={m.descripcion}>
                             MSG: {m.descripcion}
                           </p>
                         )}
                       </td>

                       <td className="px-6 py-4 whitespace-nowrap text-center">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold capitalize shadow-sm ${
                           m.estado === "CONFIRMADO" ? "bg-emerald-600 text-white" :
                           m.estado === "PENDIENTE" ? "bg-amber-100 text-amber-700" :
                           "bg-rose-100 text-rose-700"
                         }`}>
                           {m.estado?.toLowerCase() ?? "desconocido"}
                         </span>
                       </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </div>
  );
}

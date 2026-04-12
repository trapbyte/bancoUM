import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Search, FileText } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function MisMovimientosCliente() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "0", 10);

  // ── Database Queries ──────────────────────────────────────────────────
  const misCuentas = await prisma.cuenta.findMany({
    where: { id_cliente: userId },
    select: { id_cuenta: true, numero_cuenta: true, tipo_cuenta: { select: { tipo: true } } },
  });
  const misCuentasIds = misCuentas.map((c) => c.id_cuenta);

  let movimientos: any[] = [];
  if (misCuentasIds.length > 0) {
    movimientos = await prisma.movimiento.findMany({
      where: {
        OR: [
          { id_cuenta_origen: { in: misCuentasIds } },
          { id_cuenta_destino: { in: misCuentasIds } }
        ]
      },
      include: {
        cuenta_movimiento_id_cuenta_origenTocuenta: { select: { numero_cuenta: true } },
        cuenta_movimiento_id_cuenta_destinoTocuenta: { select: { numero_cuenta: true } }
      },
      orderBy: { fecha: "desc" },
      take: 25, // Limitar a los 25 más recientes por desempeño
    });
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      {/* Encabezado */}
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <ArrowLeftRight className="w-8 h-8 text-emerald-600" />
          Historial de Movimientos
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Consulta, filtra y rastrea tus transacciones bancarias recientes.</p>
      </div>

      <AnimatedCard className="flex flex-col bg-white/70">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por referencia, descripción o cuenta..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all shadow-sm text-slate-700" 
            />
          </div>
          <button className="w-full sm:w-auto px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
            <FileText className="w-4 h-4" />
            Exportar Extracto
          </button>
        </div>

        <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Fecha / Ref</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Tipo Operación</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Detalles</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Monto</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                       <ArrowLeftRight className="w-10 h-10 text-slate-300" />
                       <p className="font-semibold text-lg text-slate-600">No hay movimientos recientes</p>
                    </div>
                  </td>
                </tr>
              ) : (
                movimientos.map((m) => {
                  const esIngreso = misCuentasIds.includes(m.id_cuenta_destino ?? -1);
                  const Icon = esIngreso ? ArrowDownLeft : ArrowUpRight;
                  const colorColor = esIngreso ? "text-emerald-600" : "text-slate-800";
                  const bgColor = esIngreso ? "bg-emerald-100" : "bg-slate-100";
                  const signo = esIngreso ? "+" : "-";
                  const montoRaw = Number(m.monto);

                  return (
                    <tr key={Number(m.id_movimiento)} className="hover:bg-slate-50/60 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <p className="font-bold text-slate-800">{new Date(m.fecha).toLocaleDateString()}</p>
                         <p className="text-xs text-slate-400 font-mono mt-0.5">REF: {m.referencia_externa ?? String(m.id_movimiento)}</p>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                             <Icon className={`w-4 h-4 ${colorColor}`} />
                           </div>
                           <div>
                             <p className="font-bold text-slate-800 capitalize">{m.tipo.toLowerCase().replace("_", " ")}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <p className="font-medium text-slate-700 truncate max-w-xs">{m.descripcion || "Transferencia digital"}</p>
                         <p className="text-xs text-slate-400 mt-0.5">
                           Origen: {m.cuenta_movimiento_id_cuenta_origenTocuenta?.numero_cuenta ? `****${m.cuenta_movimiento_id_cuenta_origenTocuenta.numero_cuenta.slice(-4)}` : "Externa"} 
                           <span className="mx-1">→</span>
                           Destino: {m.cuenta_movimiento_id_cuenta_destinoTocuenta?.numero_cuenta ? `****${m.cuenta_movimiento_id_cuenta_destinoTocuenta.numero_cuenta.slice(-4)}` : "Externa"}
                         </p>
                       </td>
                       <td className={`px-6 py-4 whitespace-nowrap text-right font-black ${montoRaw > 1000000 ? "text-lg" : "text-base"} ${colorColor}`}>
                         {signo}{formatCurrency(montoRaw)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                           m.estado === "CONFIRMADO" ? "bg-emerald-100 text-emerald-700" :
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

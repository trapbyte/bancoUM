import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, FileText } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { ExportDataBtn } from "@/components/dashboard/ExportDataBtn";
import { MovimientosSearchBox } from "@/components/dashboard/SearchInput";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function MisMovimientosCliente({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : "";
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "0", 10);

  const misCuentas = await prisma.cuenta.findMany({
    where: { id_cliente: userId },
    select: { id_cuenta: true, numero_cuenta: true, tipo_cuenta: { select: { tipo: true } } },
  });
  const misCuentasIds = misCuentas.map((c) => c.id_cuenta);

  const clienteData = await prisma.cliente.findUnique({
    where: { id_cliente: userId },
    include: {
      barrio: { include: { comuna: { include: { municipio: { include: { departamento: true } } } } } }
    }
  });

  let movimientos: any[] = [];
  if (misCuentasIds.length > 0) {
    let searchFilter: any = {};
    if (q) {
       const isNum = !isNaN(Number(q)) && q.trim() !== "";
       searchFilter = {
         OR: [
           { referencia_externa: { contains: q, mode: 'insensitive' } },
           { descripcion: { contains: q, mode: 'insensitive' } },
           ...(isNum ? [{ id_movimiento: BigInt(q) }] : [])
         ]
       };
    }

    movimientos = await prisma.movimiento.findMany({
      where: {
        AND: [
          { OR: [
            { id_cuenta_origen: { in: misCuentasIds } },
            { id_cuenta_destino: { in: misCuentasIds } }
          ]},
          q ? searchFilter : {}
        ]
      },
      include: {
        cuenta_movimiento_id_cuenta_origenTocuenta: { select: { numero_cuenta: true } },
        cuenta_movimiento_id_cuenta_destinoTocuenta: { select: { numero_cuenta: true } }
      },
      orderBy: { fecha: "desc" },
      take: q ? 100 : 25, // Si está buscando, ampliamos la cantidad de resultados
    });
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      {/* Encabezado */}
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <ArrowLeftRight className="w-8 h-8 text-violet-600" />
          Historial de Movimientos
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Consulta, filtra y rastrea tus transacciones bancarias recientes.</p>
      </div>

      <AnimatedCard className="flex flex-col bg-white/70">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <MovimientosSearchBox defaultValue={q} />
          <ExportDataBtn 
            title="Extracto Bancario - Mis Movimientos"
            filename="BancoUM_Extracto_Movimientos"
            columns={["Fecha", "Referencia", "Operación", "Concepto", "Monto", "Estado"]}
            data={movimientos.map((m) => ({
               fecha: m.fecha ? new Date(m.fecha).toLocaleString() : "N/A",
               ref: m.referencia_externa || m.id_movimiento.toString(),
               tipo: m.tipo.replace("_", " "),
               desc: m.descripcion || "Sin Detalles",
               monto: Number(m.monto),
               estado: m.estado
            }))}
          />
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
                       <p className="font-semibold text-lg text-slate-600">
                         {q ? `Ningún elemento coincide con la búsqueda "${q}"` : "No hay movimientos recientes"}
                       </p>
                    </div>
                  </td>
                </tr>
              ) : (
                movimientos.map((m) => {
                  const esRechazado = m.estado === "RECHAZADO";
                  const esIngreso = misCuentasIds.includes(m.id_cuenta_destino ?? -1) && !esRechazado;
                  const Icon = esIngreso ? ArrowDownLeft : ArrowUpRight;
                  const colorColor = esRechazado ? "text-rose-500 opacity-60" : esIngreso ? "text-emerald-600" : "text-rose-600";
                  const bgColor = esRechazado ? "bg-rose-100" : esIngreso ? "bg-emerald-100" : "bg-rose-50";
                  const signo = esRechazado ? "✗" : esIngreso ? "+" : "-";
                  const montoRaw = Number(m.monto);

                  return (
                    <tr key={Number(m.id_movimiento)} className={`transition-colors ${esRechazado ? 'bg-rose-50/30' : 'hover:bg-slate-50/60'}`}>
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
                         <p className="font-medium text-slate-700 truncate max-w-xs">{m.descripcion || "Transacción electrónica"}</p>
                         <p className="text-xs text-slate-400 mt-0.5">
                           O: {m.cuenta_movimiento_id_cuenta_origenTocuenta?.numero_cuenta ? `****${m.cuenta_movimiento_id_cuenta_origenTocuenta.numero_cuenta.slice(-4)}` : "Banco "} 
                           <span className="mx-1">→</span>
                           D: {m.cuenta_movimiento_id_cuenta_destinoTocuenta?.numero_cuenta ? `****${m.cuenta_movimiento_id_cuenta_destinoTocuenta.numero_cuenta.slice(-4)}` : "Banco"}
                         </p>
                       </td>
                       <td className={`px-6 py-4 whitespace-nowrap text-right font-black ${montoRaw > 1000000 ? "text-lg" : "text-base"} ${colorColor}`}>
                         {esRechazado ? <span className="line-through mr-1 opacity-70">{formatCurrency(montoRaw)}</span> : `${signo}${formatCurrency(montoRaw)}`}
                         {esRechazado && <span className="text-xs text-rose-500 ml-1">FAIL</span>}
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

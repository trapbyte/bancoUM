import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { ShieldCheck, Users, BarChart3, AlertTriangle, Terminal, Activity } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { SimpleBarChart } from "@/components/dashboard/Charts";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function DashboardAdmin() {
  const session = await getServerSession(authOptions);
  const nombre = session?.user?.name?.split(" ")[0] ?? "Admin";

  // ── Consultas Base ──────────────────────────────────────────────────
  const [totalAuditoria, clientesTotales, empleadosTotales, empleadosActivos] = await Promise.all([
    prisma.auditoria_movimiento.count(),
    prisma.cliente.count(),
    prisma.empleado.count(),
    prisma.empleado.count({ where: { activo: true } })
  ]);

  const ultimasAuditorias = await prisma.auditoria_movimiento.findMany({
    orderBy: { fecha: "desc" },
    take: 8,
  });

  const stats = [
    { label: "Registros Auditoría", value: totalAuditoria.toString(), icon: <ShieldCheck className="w-5 h-5 text-white" />, color: "from-rose-500 to-pink-600" },
    { label: "Clientes Totales", value: clientesTotales.toString(), icon: <Users className="w-5 h-5 text-white" />, color: "from-violet-500 to-indigo-600" },
    { label: "Empleados Totales", value: empleadosTotales.toString(), icon: <BarChart3 className="w-5 h-5 text-white" />, color: "from-sky-500 to-blue-600" },
    { label: "Personal Activo", value: empleadosActivos.toString(), icon: <Activity className="w-5 h-5 text-white" />, color: "from-amber-400 to-orange-500" },
  ];

  // Top 6 Empleados con más movimientos procesados
  const topEmpleadosRaw = await prisma.movimiento.groupBy({
    by: ['id_empleado'],
    _count: { id_movimiento: true },
    where: { id_empleado: { not: null } },
    orderBy: { _count: { id_movimiento: 'desc' } },
    take: 6
  });

  const empIds = topEmpleadosRaw.map(r => r.id_empleado).filter(id => id !== null) as number[];
  const empleadosInfo = await prisma.empleado.findMany({
    where: { id_empleado: { in: empIds } },
    select: { id_empleado: true, nombres: true }
  });

  const chartData = topEmpleadosRaw.map(r => {
    const e = empleadosInfo.find(em => em.id_empleado === r.id_empleado);
    return { name: e ? e.nombres.split(' ')[0] : 'System', Transacciones: r._count.id_movimiento };
  });

  return (
    <div className="space-y-8 relative z-10 w-full max-w-7xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className}`}>
          SYSADMIN — {nombre}
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Centro de control global y consola de logs en tiempo real.</p>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 bg-sky-50 border border-sky-200 shadow-sm rounded-2xl text-sky-800 text-sm font-semibold">
        <ShieldCheck className="w-6 h-6 shrink-0 text-sky-600" />
        Tienes acceso a las configuraciones globales. Recuerda que tus acciones impactan a los usuarios.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((card, i) => (
          <AnimatedCard key={card.label} delay={i * 0.08}>
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5 shadow-sm`}>
                {card.icon}
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{card.value}</p>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Terminal Auditoria */}
        <AnimatedCard delay={0.3} className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-lg font-bold text-slate-800 flex items-center gap-2 ${outfit.className}`}>
              <Terminal className="w-5 h-5 text-emerald-600" /> Log de Auditoría en Tiempo Real
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              CONECTADO
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto rounded-xl bg-slate-800 border border-slate-700 shadow-inner">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl font-semibold">FECHA (UTC)</th>
                  <th className="px-4 py-3 font-semibold">USUARIO BD</th>
                  <th className="px-4 py-3 font-semibold">OPERACIÓN</th>
                  <th className="px-4 py-3 rounded-tr-xl font-semibold">REFERENCIA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {ultimasAuditorias.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-500">Sin logs recientes.</td></tr>
                ) : (
                  ultimasAuditorias.map((log) => (
                    <tr key={String(log.id_auditoria)} className="hover:bg-slate-700/30 transition-colors">
                       <td className="px-4 py-3 text-emerald-400/80">
                         {log.fecha ? new Date(log.fecha).toISOString().slice(11, 19) : "unknown"}
                       </td>
                       <td className="px-4 py-3 font-bold text-sky-400">{log.usuario_bd ?? "system"}</td>
                       <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                           log.accion === 'INSERT' ? 'bg-emerald-500/20 text-emerald-300' :
                           log.accion === 'DELETE' ? 'bg-rose-500/20 text-rose-300' :
                           log.accion === 'UPDATE' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
                         }`}>
                           {log.accion}
                         </span>
                       </td>
                       <td className="px-4 py-3 text-slate-400 font-medium">MOV_ID:{String(log.id_movimiento ?? "N/A")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
        
        <div className="space-y-5">
          {/* Gráfico Actividad Server */}
          <AnimatedCard delay={0.4} className="h-48 flex flex-col">
            <h2 className={`text-lg font-bold text-slate-800 flex items-center gap-2 ${outfit.className}`}>
              <Activity className="w-5 h-5 text-rose-500" /> Rendimiento de Personal (Txs Procesadas)
            </h2>
            <div className="flex-1 -mx-2 -mb-2">
               <SimpleBarChart data={chartData} xKey="name" yKey="Transacciones" color="#f43f5e" />
            </div>
          </AnimatedCard>
          
          <AnimatedCard delay={0.5} className="flex-1 flex flex-col items-center justify-center text-center p-8">
             <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
             </div>
             <p className="text-xl font-bold text-slate-800 mb-1">Sistema Estable</p>
             <p className="text-sm font-medium text-slate-500">No hay brechas de seguridad ni cuellos de botella detectados en la red.</p>
          </AnimatedCard>
        </div>

      </div>
    </div>
  );
}

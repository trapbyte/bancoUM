import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { BarChart3, TrendingUp, HandCoins, Activity, Landmark } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { SimpleBarChart, SparklineArea, DonutChart } from "@/components/dashboard/Charts";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function EstadisticasAdmin() {
  await getServerSession(authOptions);

  // ── Database Queries ──────────────────────────────────────────────────
  // Agregaciones Financieras de Alto Nivel
  const [agregadoMovimientos, agregadoCuentas, cuentasPorTipo] = await Promise.all([
    prisma.movimiento.aggregate({
      _sum: { monto: true },
      _count: { id_movimiento: true }
    }),
    prisma.cuenta.aggregate({
      _sum: { saldo: true },
    }),
    prisma.tipo_cuenta.findMany({
      include: {
        _count: { select: { cuenta: true } }
      }
    })
  ]);

  const totalMovido = Number(agregadoMovimientos._sum.monto ?? 0);
  const totalGuardado = Number(agregadoCuentas._sum.saldo ?? 0);
  const volumenTx = agregadoMovimientos._count.id_movimiento;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  // Data formateada para recharts basada en cuentas reales
  const distribucionCuentas = cuentasPorTipo.map(tc => ({
    name: tc.tipo.replace("_", " "),
    value: tc._count.cuenta
  })).filter(tc => tc.value > 0);

  // Datos simulados para gráficos de volumen histórico (requeriría RAW SQL complejo si es real)
  const txHistory = [
    { day: "Lunes", value: 12500000 }, { day: "Martes", value: 24000000 }, { day: "Miércoles", value: 18000000 },
    { day: "Jueves", value: 32000000 }, { day: "Viernes", value: 45000000 }, { day: "Sábado", value: 5000000 },
  ];

  return (
    <div className="space-y-8 relative z-10 w-full max-w-7xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <BarChart3 className="w-8 h-8 text-fuchsia-600" />
          Métricas y Business Intelligence (BI)
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Visibilidad financiera de alto nivel sobre los flujos de dinero consolidados.</p>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <AnimatedCard delay={0.1} className="bg-white/70">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
                 <HandCoins className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flujo Transaccional Total</p>
               </div>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter truncate" title={formatCurrency(totalMovido)}>
               {formatCurrency(totalMovido)}
            </p>
         </AnimatedCard>
         
         <AnimatedCard delay={0.2} className="bg-white/70">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                 <Landmark className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patrimonio Captado (Saldos)</p>
               </div>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter truncate" title={formatCurrency(totalGuardado)}>
               {formatCurrency(totalGuardado)}
            </p>
         </AnimatedCard>

         <AnimatedCard delay={0.3} className="bg-white/70">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white flex items-center justify-center shadow-sm">
                 <Activity className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volumen de Operaciones</p>
               </div>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">
               {volumenTx.toLocaleString()} <span className="text-lg text-slate-400">TXNs</span>
            </p>
         </AnimatedCard>
      </div>

      {/* Grid de Gráficos Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Gráfico Gigante */}
         <AnimatedCard delay={0.4} className="lg:col-span-2 bg-white/70 flex flex-col h-full">
            <h2 className={`text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 ${outfit.className}`}>
               <TrendingUp className="w-5 h-5 text-emerald-500" /> Velocidad de Flujo (Simulación)
            </h2>
            <div className="flex-1 -mx-2 -mb-4">
               <SimpleBarChart data={txHistory} xKey="day" yKey="value" color="#10b981" />
            </div>
         </AnimatedCard>

         {/* Distribution Donut */}
         <AnimatedCard delay={0.5} className="bg-white/70 flex flex-col h-full">
            <h2 className={`text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 ${outfit.className}`}>
               <BarChart3 className="w-5 h-5 text-sky-500" /> Distribución de Tipos de Cuentas
            </h2>
            
            <div className="flex-1 flex justify-center items-center -mt-6">
              {distribucionCuentas.length > 0 ? (
                <DonutChart data={distribucionCuentas} colors={["#3b82f6", "#8b5cf6", "#f43f5e", "#10b981"]} />
              ) : (
                <p className="text-sm font-bold text-slate-400">No hay cuentas asignadas.</p>
              )}
            </div>

            <div className="mt-4 space-y-2">
               {distribucionCuentas.map((tc, idx) => {
                 const colors = ["bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-emerald-500"];
                 return (
                   <div key={tc.name} className="flex justify-between items-center text-xs font-bold text-slate-600">
                     <span className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`}></span>
                       {tc.name}
                     </span>
                     <span>{tc.value} Cuentas</span>
                   </div>
                 )
               })}
            </div>
         </AnimatedCard>

      </div>
    </div>
  );
}

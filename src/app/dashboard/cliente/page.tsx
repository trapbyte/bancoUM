import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { CreditCard, ArrowLeftRight, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, PieChart as PieChartIcon } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { SimpleBarChart, DonutChart } from "@/components/dashboard/Charts";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function DashboardCliente() {
  const session = await getServerSession(authOptions);
  const nombre = session?.user?.name?.split(" ")[0] ?? "Usuario";
  const userId = parseInt(session?.user?.id ?? "0", 10);

  // ── Stats Principales ──────────────────────────────────────────────────
  const saldoQuery = await prisma.cuenta.aggregate({
    _sum: { saldo: true },
    where: { id_cliente: userId, estado: "ACTIVA" },
  });
  const saldoTotal = saldoQuery._sum.saldo ? Number(saldoQuery._sum.saldo) : 0;

  const cuentasActivas = await prisma.cuenta.count({
    where: { id_cliente: userId, estado: "ACTIVA" },
  });

  const cuentas = await prisma.cuenta.findMany({
    where: { id_cliente: userId },
    include: { tipo_cuenta: true },
  });
  const cuentaIds = cuentas.map((c) => c.id_cuenta);

  let movimientosMes = 0;
  let ultimosMovimientos: any[] = [];
  let ingresosMes = 0;
  let egresosMes = 0;
  let chartData: { name: string, ingresos: number }[] = [];

  if (cuentaIds.length > 0) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const allMovimientos = await prisma.movimiento.findMany({
      where: {
        OR: [{ id_cuenta_origen: { in: cuentaIds } }, { id_cuenta_destino: { in: cuentaIds } }],
      },
      orderBy: { fecha: "desc" },
      take: 100, // Tomamos suficiente data reciente
    });

    // Mapeo mensual
    allMovimientos.forEach(m => {
      if (m.estado === "RECHAZADO") return;
      if (m.fecha >= startOfMonth) {
         movimientosMes++;
         if (cuentaIds.includes(m.id_cuenta_destino ?? -1)) {
            ingresosMes += Number(m.monto);
         } else {
            egresosMes += Number(m.monto);
         }
      }
    });

    ultimosMovimientos = allMovimientos.slice(0, 5);

    // Mapeo Diario para BarChart
    const daysName = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    for(let i=6; i>=0; i--) {
       const d = new Date();
       d.setDate(d.getDate() - i);
       let totalDay = 0;
       allMovimientos.forEach(m => {
          if (m.estado !== "RECHAZADO" && cuentaIds.includes(m.id_cuenta_destino ?? -1) && m.fecha.getDate() === d.getDate() && m.fecha.getMonth() === d.getMonth()) {
             totalDay += Number(m.monto);
          }
       });
       chartData.push({ name: daysName[d.getDay()], ingresos: totalDay });
    }
  }

  // Formatting helpers
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  const stats = [
    { label: "Saldo Total", value: formatCurrency(saldoTotal), icon: <Wallet className="w-5 h-5 text-white" />, color: "from-violet-600 to-indigo-600" },
    { label: "Cuentas Activas", value: cuentasActivas.toString(), icon: <CreditCard className="w-5 h-5 text-white" />, color: "from-sky-500 to-blue-600" },
    { label: "Movimientos (Mes)", value: movimientosMes.toString(), icon: <ArrowLeftRight className="w-5 h-5 text-white" />, color: "from-emerald-500 to-teal-600" },
    { label: "Rendimiento Mensual", value: "+4.2%", icon: <TrendingUp className="w-5 h-5 text-white" />, color: "from-fuchsia-500 to-pink-600" },
  ];

  return (
    <div className="space-y-8 relative z-10 w-full max-w-7xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className}`}>
          Bienvenido/a, {nombre} 
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Aquí tienes un resumen actualizado de tus finanzas.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((card, i) => (
          <AnimatedCard key={card.label} delay={i * 0.08}>
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5 shadow-sm`}>
                {card.icon}
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight truncate">{card.value}</p>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna Izquierda: Mis Productos + Distribución Menusal */}
        <div className="flex flex-col gap-5">
          <AnimatedCard delay={0.3} className="flex flex-col">
            <h2 className={`text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 ${outfit.className}`}>
              <Wallet className="w-5 h-5 text-violet-600" /> Mis Productos
            </h2>
            <div className="flex-1 flex flex-col gap-3">
              {cuentas.length === 0 ? (
                <p className="text-sm font-medium text-slate-500 my-auto text-center py-4">No posees productos activos.</p>
              ) : (
                cuentas.map((c) => (
                  <div key={c.id_cuenta} className="p-4 rounded-xl border border-slate-100 bg-white/60 shadow-sm flex items-center justify-between group-hover:border-violet-100 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{c.tipo_cuenta.tipo.replace("_", " ")}</p>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">**** {c.numero_cuenta.slice(-4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{formatCurrency(Number(c.saldo))}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.35} className="flex flex-col flex-1 h-full min-h-[300px]">
            <h2 className={`text-lg font-bold text-slate-800 mb-2 flex items-center gap-2 ${outfit.className}`}>
              <PieChartIcon className="w-5 h-5 text-indigo-500" /> Flujo del Mes
            </h2>
            {ingresosMes === 0 && egresosMes === 0 ? (
               <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-bold opacity-60 flex-col">
                 <PieChartIcon className="w-10 h-10 mb-2 opacity-50" />
                 Sin flujo registrado este mes
               </div>
            ) : (
               <>
                 <div className="flex-1 relative flex items-center justify-center min-h-[160px] -mt-2">
                    <DonutChart data={[{ name: "Ingresos", value: ingresosMes || 0.1 }, { name: "Egresos", value: egresosMes || 0.1 }]} colors={["#10b981", "#f43f5e"]} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Flujo Neto</p>
                      <p className={`text-lg font-black tracking-tight ${ingresosMes - egresosMes >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                         {ingresosMes - egresosMes > 0 ? "+" : ""}{formatCurrency(ingresosMes - egresosMes)}
                      </p>
                    </div>
                 </div>
                 <div className="flex justify-between mt-0 px-2 pt-2 border-t border-slate-100">
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Ingresos Totales</p>
                      <p className="text-emerald-600 font-black text-base">+ {formatCurrency(ingresosMes)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Gastos Totales</p>
                      <p className="text-rose-600 font-black text-base">- {formatCurrency(egresosMes)}</p>
                    </div>
                 </div>
               </>
            )}
          </AnimatedCard>
        </div>
        
        {/* Gráfico y Movimientos */}
        <div className="lg:col-span-2 space-y-5">
          {/* Gráfico Balance */}
          <AnimatedCard delay={0.4} className="h-64 flex flex-col">
            <h2 className={`text-lg font-bold text-slate-800 mb-2 flex items-center gap-2 ${outfit.className}`}>
              <TrendingUp className="w-5 h-5 text-sky-500" /> Ingresos de la Semana
            </h2>
            <div className="flex-1">
               <SimpleBarChart data={chartData} xKey="name" yKey="ingresos" color="#8b5cf6" />
            </div>
          </AnimatedCard>

          {/* Últimos Movimientos Lista */}
          <AnimatedCard delay={0.5} className="flex flex-col">
            <h2 className={`text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 ${outfit.className}`}>
              <ArrowLeftRight className="w-5 h-5 text-emerald-500" /> Últimos Movimientos
            </h2>
            <div className="flex-1 flex flex-col gap-2">
              {ultimosMovimientos.length === 0 ? (
                 <p className="text-sm font-medium text-slate-500 my-auto text-center py-6">No hay transacciones recientes.</p>
              ) : (
                ultimosMovimientos.map((m) => {
                  const esRechazado = m.estado === "RECHAZADO";
                  const esIngreso = cuentaIds.includes(m.id_cuenta_destino ?? -1) && !esRechazado;
                  const Icon = esIngreso ? ArrowDownLeft : ArrowUpRight;
                  const colorColor = esRechazado ? "text-rose-500 opacity-60" : esIngreso ? "text-emerald-600" : "text-rose-600";
                  const bgColor = esRechazado ? "bg-rose-100" : esIngreso ? "bg-emerald-100" : "bg-rose-50";
                  const signo = esRechazado ? "✗" : esIngreso ? "+" : "-";

                  return (
                    <div key={Number(m.id_movimiento)} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                        <Icon className={`w-5 h-5 ${colorColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate capitalize">{m.tipo.toLowerCase()}</p>
                        <p className="text-xs text-slate-500 truncate">{new Date(m.fecha).toLocaleDateString()} • Ref: {String(m.id_movimiento).slice(-4)}</p>
                      </div>
                      <div className={`text-right font-black ${colorColor}`}>
                        {signo}{formatCurrency(Number(m.monto))}
                        {esRechazado && <p className="text-[10px] text-rose-500 block leading-none mt-1">RECHAZADO</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Users, CreditCard, UserPlus, AlertCircle, ArrowUpRight, Search } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { SparklineArea } from "@/components/dashboard/Charts";
import Link from "next/link";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function DashboardAsesor() {
  const session = await getServerSession(authOptions);
  const nombre = session?.user?.name?.split(" ")[0] ?? "Asesor";

  // ── Consultas Base ──────────────────────────────────────────────────
  const [clientesRegistrados, cuentasActivas, cuentasBloqueadas] = await Promise.all([
    prisma.cliente.count(),
    prisma.cuenta.count({ where: { estado: "ACTIVA" } }),
    prisma.cuenta.count({ where: { estado: "BLOQUEADA" } }),
  ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const nuevosClientes = await prisma.cliente.count({
    where: { fecha_registro: { gte: startOfMonth } },
  });

  const ultimosClientes = await prisma.cliente.findMany({
    orderBy: { fecha_registro: "desc" },
    take: 5,
  });

  const cuentasAlertadas = await prisma.cuenta.findMany({
    where: { estado: "BLOQUEADA" },
    include: { cliente: true, tipo_cuenta: true },
    orderBy: { fecha_apertura: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Clientes Totales", value: clientesRegistrados.toString(), icon: <Users className="w-5 h-5 text-white" />, color: "from-sky-500 to-blue-600" },
    { label: "Cuentas Activas", value: cuentasActivas.toString(), icon: <CreditCard className="w-5 h-5 text-white" />, color: "from-violet-600 to-indigo-600" },
    { label: "Nuevos (Mes)", value: nuevosClientes.toString(), icon: <UserPlus className="w-5 h-5 text-white" />, color: "from-emerald-500 to-teal-600" },
    { label: "Alertas Activas", value: cuentasBloqueadas.toString(), icon: <AlertCircle className="w-5 h-5 text-white" />, color: "from-rose-500 to-red-600" },
  ];

  const chartData = [
    { day: "L", value: 12 }, { day: "M", value: 19 }, { day: "X", value: 15 },
    { day: "J", value: 25 }, { day: "V", value: 22 }, { day: "S", value: 30 }, { day: "D", value: 38 },
  ];

  return (
    <div className="space-y-8 relative z-10 w-full max-w-7xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className}`}>
          Panel del Asesor — {nombre}
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Gestiona tu cartera de clientes y atiende cuentes con alertas prioritarias.</p>
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
        {/* Onboarding y Clientes Recientes */}
        <AnimatedCard delay={0.3} className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-lg font-bold text-slate-800 flex items-center gap-2 ${outfit.className}`}>
              <Users className="w-5 h-5 text-violet-600" /> Clientes Ingresados Recientemente
            </h2>
            <Link href="/dashboard/asesor/clientes" className="text-violet-600 hover:text-violet-700 text-sm font-bold flex items-center gap-1 transition-colors">
              Base completa <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            {ultimosClientes.length === 0 ? (
               <p className="text-sm text-slate-500 text-center py-4">No hay clientes nuevos.</p>
            ) : (
               ultimosClientes.map((cliente) => (
                  <div key={cliente.id_cliente} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white/60 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-slate-600">{cliente.nombres.charAt(0)}{cliente.apellidos.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{cliente.nombres} {cliente.apellidos}</p>
                      <p className="text-xs text-slate-500 truncate">{cliente.email ?? "Sin correo registrado"}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 shrink-0">
                      Nuevo
                    </span>
                  </div>
               ))
            )}
          </div>
        </AnimatedCard>
        
        <div className="space-y-5">
          {/* Gráfico Crecimiento */}
          <AnimatedCard delay={0.4} className="h-64 flex flex-col">
            <h2 className={`text-lg font-bold text-slate-800 flex items-center gap-2 ${outfit.className}`}>
              <UserPlus className="w-5 h-5 text-sky-500" /> Crecimiento Semanal
            </h2>
            <div className="flex-1 -mx-2">
               <SparklineArea data={chartData} color="#0ea5e9" dataKey="value" />
            </div>
          </AnimatedCard>

          {/* Alertas */}
          <AnimatedCard delay={0.5} className="flex flex-col">
            <h2 className={`text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 ${outfit.className}`}>
              <AlertCircle className="w-5 h-5 text-rose-500" /> Cuentas Bloqueadas
            </h2>
            <div className="flex-1 flex flex-col gap-2">
              {cuentasAlertadas.length === 0 ? (
                 <p className="text-sm font-medium text-slate-500 my-auto text-center py-6">Milagro. No hay alertas críticas.</p>
              ) : (
                cuentasAlertadas.map((c) => (
                  <div key={c.id_cuenta} className="flex items-center gap-3 p-3 rounded-lg border border-rose-100 bg-rose-50/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Cc. {c.cliente?.numero_documento}</p>
                      <p className="text-[11px] text-slate-500 truncate">{c.tipo_cuenta.tipo.replace("_", " ")} ****{c.numero_cuenta.slice(-4)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}

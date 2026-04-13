import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Building2, BookUser, MapPin, Settings, Power, Calendar } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { DonutChart } from "@/components/dashboard/Charts";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function DashboardOperador() {
  const session = await getServerSession(authOptions);
  const nombre = session?.user?.name?.split(" ")[0] ?? "Operador";

  // ── Consultas Base ──────────────────────────────────────────────────
  const [totalPuntos, empleadosActivos, sucursales, tiposCuenta] = await Promise.all([
    prisma.punto_atencion.count(),
    prisma.empleado.count({ where: { activo: true } }),
    prisma.punto_atencion.count({ where: { tipo: "SUCURSAL" } }),
    prisma.tipo_cuenta.count(),
  ]);

  const puntosAtencion = await prisma.punto_atencion.findMany({
    orderBy: { fecha_apertura: "desc" },
    include: { barrio: { include: { comuna: { include: { municipio: true } } } } },
    take: 6,
  });

  const empleadosRecientes = await prisma.empleado.findMany({
    orderBy: { fecha_contratacion: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Puntos Físicos", value: totalPuntos.toString(), icon: <Building2 className="w-5 h-5 text-white" />, color: "from-emerald-500 to-teal-600" },
    { label: "Empleados Act", value: empleadosActivos.toString(), icon: <BookUser className="w-5 h-5 text-white" />, color: "from-sky-500 to-blue-600" },
    { label: "Sucursales", value: sucursales.toString(), icon: <MapPin className="w-5 h-5 text-white" />, color: "from-violet-600 to-indigo-600" },
    { label: "Catálogos Activos", value: tiposCuenta.toString(), icon: <Settings className="w-5 h-5 text-white" />, color: "from-amber-500 to-orange-600" },
  ];

  // Real data for DonutChart based on account types
  const tipoCuentasInfo = await prisma.tipo_cuenta.findMany();
  const cuentasAgrupadas = await prisma.cuenta.groupBy({
    by: ['id_tipo_cuenta'],
    _count: { id_cuenta: true },
  });

  const chartData = cuentasAgrupadas
    .map(grupo => {
      const tipo = tipoCuentasInfo.find(t => t.id_tipo_cuenta === grupo.id_tipo_cuenta);
      return {
        name: tipo ? tipo.tipo.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Desconocido",
        value: grupo._count.id_cuenta,
      };
    })
    .filter(item => item.value > 0);

  return (
    <div className="space-y-8 relative z-10 w-full max-w-7xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className}`}>
          Panel del Operador — {nombre}
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Supervisa la infraestructura física y el talento de BancoUM.</p>
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
        
        {/* Puntos de Atención */}
        <AnimatedCard delay={0.3} className="lg:col-span-2 flex flex-col">
          <h2 className={`text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 ${outfit.className}`}>
            <Building2 className="w-5 h-5 text-emerald-600" /> Directorio de Puntos de Atención
          </h2>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {puntosAtencion.length === 0 ? (
               <p className="text-sm text-slate-500 col-span-2 py-4">No hay puntos registrados.</p>
            ) : (
               puntosAtencion.map((punto) => (
                 <div key={punto.id_punto} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white/60 hover:border-emerald-200 transition-colors">
                   <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                     <MapPin className="w-6 h-6 text-emerald-600" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-start justify-between">
                       <p className="text-sm font-bold text-slate-800 truncate">{punto.nombre}</p>
                       {punto.activo ? (
                         <Power className="w-4 h-4 text-emerald-500" />
                       ) : (
                         <Power className="w-4 h-4 text-rose-500" />
                       )}
                     </div>
                     <p className="text-xs text-slate-500 truncate mt-1">
                       {punto.tipo.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                     </p>
                     <p className="text-xs text-slate-400 truncate">{punto.barrio.nombre}, {punto.barrio.comuna.municipio.nombre}</p>
                   </div>
                 </div>
               ))
            )}
          </div>
        </AnimatedCard>
        
        <div className="space-y-5">
          {/* Gráfico Portfolio */}
          <AnimatedCard delay={0.4} className="h-64 flex flex-col">
            <h2 className={`text-lg font-bold text-slate-800 flex items-center gap-2 ${outfit.className}`}>
              <Settings className="w-5 h-5 text-amber-500" /> Portfolio de Cuentas
            </h2>
            <div className="flex-1 flex justify-center items-center">
               <DonutChart data={chartData} colors={["#3b82f6", "#8b5cf6", "#f43f5e"]} />
            </div>
          </AnimatedCard>

          {/* Nuevos Empleados */}
          <AnimatedCard delay={0.5} className="flex flex-col">
            <h2 className={`text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 ${outfit.className}`}>
              <BookUser className="w-5 h-5 text-sky-500" /> Últimas Contrataciones
            </h2>
            <div className="flex-1 flex flex-col gap-2">
               {empleadosRecientes.map((emp) => (
                 <div key={emp.id_empleado} className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:bg-slate-50">
                    <div className="w-8 h-8 rounded bg-sky-100 flex items-center justify-center text-sky-700 text-xs font-bold shrink-0">
                      {emp.nombres.charAt(0)}{emp.apellidos.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{emp.nombres} {emp.apellidos}</p>
                      <p className="text-[11px] text-slate-500 truncate capitalize">{emp.cargo.toLowerCase()}</p>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(emp.fecha_contratacion).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                    </div>
                 </div>
               ))}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}

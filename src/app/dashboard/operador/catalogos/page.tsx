import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Settings, CheckSquare, Settings2, Map, LayoutList } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function CatalogosOperador() {
  await getServerSession(authOptions);

  // ── Database Queries ──────────────────────────────────────────────────
  const tiposCuenta = await prisma.tipo_cuenta.findMany({ orderBy: { tipo: "asc" } });
  
  // Contamos la jerarquía geográfica para métricas de expansión
  const [totalDepto, totalMuni, totalCom, totalBarrios] = await Promise.all([
    prisma.departamento.count(),
    prisma.municipio.count(),
    prisma.comuna.count(),
    prisma.barrio.count(),
  ]);

  return (
    <div className="space-y-8 relative z-10 w-full max-w-5xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <Settings className="w-8 h-8 text-amber-500" />
          Diccionarios & Compliance
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Administración de valores estáticos y parámetros del sistema de bancoUM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Catálogo de Cuentas */}
         <AnimatedCard className="flex flex-col bg-white/70 h-full">
           <h2 className={`text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 ${outfit.className}`}>
             <LayoutList className="w-6 h-6 text-amber-500" /> Tipos de Cuentas Parametrizadas
           </h2>
           <div className="flex-1 space-y-3">
              {tiposCuenta.map((tcp) => (
                <div key={tcp.id_tipo_cuenta} className="flex flex-col bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                     <p className="font-black text-slate-800 flex items-center gap-2">
                       <CheckSquare className="w-4 h-4 text-emerald-500" /> {tcp.tipo.replace("_", " ")}
                     </p>
                     <span className="text-xs font-mono font-bold text-slate-400">ID: {tcp.id_tipo_cuenta}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 font-mono font-semibold">
                     Tasa: {tcp.tasa_interes ? `${tcp.tasa_interes}%` : 'N/A'} | Manejo Mensual: {tcp.cuota_manejo ? `$${tcp.cuota_manejo}` : 'Exento'} 
                  </p>
                  <button className="self-end px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase bg-white border border-slate-200 rounded text-slate-600 hover:text-amber-600 hover:border-amber-200 transition-colors">
                     Editar Reglas
                  </button>
                </div>
              ))}
           </div>
         </AnimatedCard>

         {/* Expansión Geográfica */}
         <AnimatedCard className="flex flex-col bg-white/70 h-full">
           <h2 className={`text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 ${outfit.className}`}>
             <Map className="w-6 h-6 text-sky-500" /> Expansión Geográfica (Cobertura)
           </h2>
           <p className="text-sm text-slate-500 mb-6">El sistema relacional cuenta con la siguiente estructura logística parametrizada para la apertura de sucursales:</p>
           
           <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                 <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-1">Departamentos</p>
                 <p className="text-3xl font-black text-slate-800">{totalDepto}</p>
              </div>
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                 <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Municipios</p>
                 <p className="text-3xl font-black text-slate-800">{totalMuni}</p>
              </div>
              <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                 <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-1">Comunas Locales</p>
                 <p className="text-3xl font-black text-slate-800">{totalCom}</p>
              </div>
              <div className="bg-fuchsia-50/50 border border-fuchsia-100 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                 <p className="text-[10px] font-bold text-fuchsia-600 uppercase tracking-widest mb-1">Barrios (Deep)</p>
                 <p className="text-3xl font-black text-slate-800">{totalBarrios}</p>
              </div>
           </div>

           <button className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow border border-slate-700 font-bold text-sm flex justify-center items-center gap-2 transition-colors">
              <Settings2 className="w-4 h-4" /> Administrar Maestro Geográfico
           </button>
         </AnimatedCard>
      </div>

    </div>
  );
}

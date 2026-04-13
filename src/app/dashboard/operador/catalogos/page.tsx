import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Settings, Settings2, Map, LayoutList } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { TipoCuentaCard } from "@/components/dashboard/operador/TipoCuentaCard";

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
    <div className="space-y-6 relative z-10 w-full max-w-5xl mx-auto pb-4">
      <div>
        <h1 className={`text-3xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-2`}>
          <Settings className="w-7 h-7 text-violet-500" />
          Diccionarios & Compliance
        </h1>
        <p className="text-slate-500 mt-1.5 text-sm">Administración de valores estáticos y parámetros del sistema de bancoUM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Catálogo de Cuentas */}
         <AnimatedCard className="flex flex-col bg-white/70 h-full !p-4">
           <h2 className={`text-lg font-bold text-slate-800 mb-4 flex items-center gap-1.5 ${outfit.className}`}>
             <LayoutList className="w-5 h-5 text-violet-500" /> Tipos de Cuentas Parametrizadas
           </h2>
            <div className="flex-1 space-y-3">
              {tiposCuenta.map((tcp) => {
                const plainTcp = {
                  ...tcp,
                  tasa_interes: tcp.tasa_interes ? Number(tcp.tasa_interes) : null,
                  cuota_manejo: tcp.cuota_manejo ? Number(tcp.cuota_manejo) : null,
                };
                return <TipoCuentaCard key={tcp.id_tipo_cuenta} tcp={plainTcp} />;
              })}
           </div>
         </AnimatedCard>

         {/* Expansión Geográfica */}
         <AnimatedCard className="flex flex-col bg-white/70 h-full !p-4">
           <h2 className={`text-lg font-bold text-slate-800 mb-3 flex items-center gap-1.5 ${outfit.className}`}>
             <Map className="w-5 h-5 text-sky-500" /> Expansión Geográfica (Cobertura)
           </h2>
           <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">El sistema relacional cuenta con la siguiente estructura logística parametrizada para la apertura de sucursales:</p>
           
           <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                 <p className="text-[9px] font-bold text-sky-600 uppercase tracking-widest mb-1">Departamentos</p>
                 <p className="text-2xl font-black text-slate-800">{totalDepto}</p>
              </div>
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                 <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Municipios</p>
                 <p className="text-2xl font-black text-slate-800">{totalMuni}</p>
              </div>
              <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                 <p className="text-[9px] font-bold text-violet-600 uppercase tracking-widest mb-1">Comunas Locales</p>
                 <p className="text-2xl font-black text-slate-800">{totalCom}</p>
              </div>
              <div className="bg-fuchsia-50/50 border border-fuchsia-100 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                 <p className="text-[9px] font-bold text-fuchsia-600 uppercase tracking-widest mb-1">Barrios (Deep)</p>
                 <p className="text-2xl font-black text-slate-800">{totalBarrios}</p>
              </div>
           </div>

         </AnimatedCard>
      </div>

    </div>
  );
}

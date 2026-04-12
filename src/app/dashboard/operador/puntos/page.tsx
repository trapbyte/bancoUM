import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Building2, MapPin, Power, CreditCard, Clock, Settings2 } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function PuntosAtencionOperador() {
  await getServerSession(authOptions);

  // ── Database Queries ──────────────────────────────────────────────────
  const puntosAtencion = await prisma.punto_atencion.findMany({
    orderBy: { tipo: "asc" },
    include: {
      barrio: {
        include: { comuna: { include: { municipio: { include: { departamento: true } } } } }
      }
    }
  });

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <Building2 className="w-8 h-8 text-emerald-600" />
          Infraestructura Física
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Módulo de control para sucursales corporativas y Cajeros Automáticos (ATM).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {puntosAtencion.length === 0 ? (
          <div className="md:col-span-3 py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 backdrop-blur-sm">
             <Building2 className="w-12 h-12 text-slate-300 mb-4" />
             <p className="text-lg font-bold text-slate-600">No hay infraestructuras registradas.</p>
          </div>
        ) : (
          puntosAtencion.map((punto, idx) => {
            const isATM = punto.tipo === "CAJERO_AUTOMATICO";
            const activa = punto.activo;
            const ubicacion = `${punto.barrio.nombre}, ${punto.barrio.comuna.municipio.nombre} (${punto.barrio.comuna.municipio.departamento.nombre})`;

            return (
              <AnimatedCard key={punto.id_punto} delay={idx * 0.05} className="flex flex-col h-full bg-white/70 overflow-hidden group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center shadow-inner ${
                    isATM ? "bg-gradient-to-br from-sky-500 to-indigo-600 text-white" : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                  }`}>
                    {isATM ? <CreditCard className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                  </div>
                  <div>
                    {activa ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-emerald-100/50 text-emerald-700 border border-emerald-200 shadow-sm transition-colors">
                        <Power className="w-3 h-3" /> Conectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-rose-100 text-rose-700 border border-rose-200 shadow-sm animate-pulse">
                        <Power className="w-3 h-3" /> Fuera de red
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 mb-6">
                  <p className="text-xs font-bold text-slate-400 mb-0.5 tracking-widest uppercase">{punto.tipo}</p>
                  <p className="text-xl font-black text-slate-800 tracking-tight leading-tight">{punto.nombre}</p>
                  
                  <div className="flex items-start gap-2 mt-4 text-slate-600 text-sm">
                     <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                     <p className="font-medium leading-snug">{ubicacion}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-slate-500 text-xs font-medium">
                     <Clock className="w-4 h-4 shrink-0" />
                     Ingresado: {new Date(punto.fecha_apertura).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/50 flex gap-2">
                   <button className="flex-1 flex gap-2 items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-emerald-600 text-slate-700 text-sm font-bold py-2 rounded-lg transition-colors">
                     Ubicación
                   </button>
                   <button className="px-3 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 text-sm flex items-center justify-center rounded-lg transition-colors">
                     <Settings2 className="w-4 h-4" />
                   </button>
                </div>
              </AnimatedCard>
            );
          })
        )}
      </div>
    </div>
  );
}

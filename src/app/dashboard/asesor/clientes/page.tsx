import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Users, Search, ChevronRight, Fingerprint, MapPin, Mail } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function ClientesAsesor() {
  await getServerSession(authOptions);

  // ── Database Queries ──────────────────────────────────────────────────
  // Limitamos a los 50 más recientes para propósitos del prototipo UI
  const clientes = await prisma.cliente.findMany({
    orderBy: { fecha_registro: "desc" },
    include: {
      barrio: { include: { comuna: { include: { municipio: true } } } }
    },
    take: 50,
  });

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <Users className="w-8 h-8 text-violet-600" />
          Directorio de Clientes
        </h1>
        <p className="text-slate-500 mt-2 text-lg">CRM: Consulta perfiles de clientes, antigüedad y ubicación registrada.</p>
      </div>

      <AnimatedCard className="flex flex-col bg-white/70">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por cédula o nombre..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all shadow-sm text-slate-700" 
            />
          </div>
          <p className="text-sm font-bold text-slate-400">Total listados: {clientes.length}</p>
        </div>

        <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Identidad</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Antigüedad</th>
                <th className="px-6 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500">
                    <p className="font-semibold">No hay clientes registrados en el sistema.</p>
                  </td>
                </tr>
              ) : (
                clientes.map((c) => {
                  const ant = c.fecha_registro ? new Date(c.fecha_registro) : new Date();
                  const locacion = c.barrio ? `${c.barrio.nombre}, ${c.barrio.comuna.municipio.nombre}` : "No registrada";
                  
                  return (
                    <tr key={c.id_cliente} className="hover:bg-slate-50/60 transition-colors group cursor-pointer">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                             {c.nombres.charAt(0)}{c.apellidos.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-slate-800">{c.nombres} {c.apellidos}</p>
                             <p className="text-[11px] text-emerald-600 font-bold capitalize mt-0.5">{c.activo ? "Activo" : "Inactivo"}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Fingerprint className="w-4 h-4 text-slate-400" />
                            <div>
                               <span className="text-[11px] font-bold text-slate-400 mr-1">{c.tipo_documento}</span>
                               <span className="font-mono">{c.numero_documento}</span>
                            </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 justify-center h-full">
                            {c.email && (
                               <div className="flex items-center gap-2 text-xs truncate max-w-xs">
                                 <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                 <span className="truncate">{c.email}</span>
                               </div>
                            )}
                            <div className="flex items-center gap-2 text-xs truncate max-w-xs">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="truncate">{locacion}</span>
                            </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-700">{ant.toLocaleDateString()}</p>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </button>
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

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Users, Search, Briefcase, Mail, Phone, Calendar, Fingerprint, Building2 } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function EmpleadosOperador() {
  await getServerSession(authOptions);

  // ── Database Queries ──────────────────────────────────────────────────
  const empleados = await prisma.empleado.findMany({
    orderBy: { fecha_contratacion: "desc" },
    include: {
      empleado_punto: {
        include: { punto_atencion: true }
      }
    }
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <Users className="w-8 h-8 text-sky-600" />
          Directorio Empleados
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Módulo de Recursos Humanos. Gestiona el enrutamiento de personal a Puntos Físicos.</p>
      </div>

      <AnimatedCard className="flex flex-col bg-white/70">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-[400px]">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar personal corporativo..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all shadow-sm text-slate-700" 
            />
          </div>
          <div className="hidden sm:flex gap-2">
             <span className="px-3 py-1 bg-emerald-100/50 text-emerald-700 font-bold rounded-lg border border-emerald-100 text-xs shadow-sm">
               Activos: {empleados.filter(e => e.activo).length}
             </span>
             <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200 text-xs shadow-sm">
               Total Org: {empleados.length}
             </span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Identidad HR</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Cargo & Salario</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Asignación Logística</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {empleados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-500">
                    <p className="font-semibold text-lg">No hay personal contratado.</p>
                  </td>
                </tr>
              ) : (
                empleados.map((emp) => {
                  const ant = new Date(emp.fecha_contratacion);
                  
                  return (
                    <tr key={emp.id_empleado} className="hover:bg-slate-50/60 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 hover:bg-sky-100 hover:text-sky-600 transition-colors">
                             {emp.nombres.charAt(0)}{emp.apellidos.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-slate-800">{emp.nombres} {emp.apellidos}</p>
                             <div className="flex gap-2">
                               <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                                 <Fingerprint className="w-3 h-3"/> {emp.numero_documento}
                               </p>
                               <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                                 <Mail className="w-3 h-3"/> {emp.email}
                               </p>
                             </div>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-slate-700 capitalize flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-sky-500" /> {emp.cargo.toLowerCase()}</p>
                       </td>
                       <td className="px-6 py-4">
                          {emp.empleado_punto.length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                              {emp.empleado_punto.map(asignacion => (
                                 <div key={`${asignacion.id_empleado}-${asignacion.id_punto}`} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md w-max shadow-sm">
                                   <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                                   <span className="font-bold">{asignacion.punto_atencion.nombre}</span>
                                 </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Sin asignar / Remoto</span>
                          )}
                          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                             <Calendar className="w-3 h-3" /> Contratado el {ant.toLocaleDateString()}
                          </p>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                          {emp.activo ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-700">
                               Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-400">
                               Retirado
                            </span>
                          )}
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

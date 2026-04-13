import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Users, Briefcase, Mail, Phone, Calendar, Fingerprint, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { SearchBox } from "@/components/dashboard/SearchInput";
import { ExportDataBtn } from "@/components/dashboard/ExportDataBtn";
import Link from "next/link";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function EmpleadosOperador({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const session = await getServerSession(authOptions);

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : "";
  const PAGE_SIZE = 50;
  const skip = (page - 1) * PAGE_SIZE;

  // Build search filter
  const whereFilter = q ? {
    OR: [
      { nombres: { contains: q, mode: "insensitive" as const } },
      { apellidos: { contains: q, mode: "insensitive" as const } },
      { numero_documento: { contains: q } },
      { cargo: { contains: q, mode: "insensitive" as const } },
    ]
  } : {};

  // Database Queries
  const totalCount = await prisma.empleado.count({ where: whereFilter });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  
  const totalActivosCount = await prisma.empleado.count({ where: { activo: true } });

  const empleados = await prisma.empleado.findMany({
    where: whereFilter,
    orderBy: { fecha_contratacion: "desc" },
    include: {
      empleado_punto: {
        include: { punto_atencion: true }
      }
    },
    skip,
    take: PAGE_SIZE,
  });

  // Operador info for PDF header
  const userId = parseInt(session?.user?.id ?? "0", 10);
  const operador = await prisma.empleado.findUnique({ where: { id_empleado: userId } });
  const operadorData = operador ? {
    nombre: `${operador.nombres} ${operador.apellidos}`,
    documento: `${operador.tipo_documento} ${operador.numero_documento}`,
    email: operador.email || "No registrado",
    cargo: operador.cargo || "Operador",
  } : undefined;

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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <SearchBox
            defaultValue={q}
            placeholder="Buscar personal por nombre, cédula o cargo..."
          />
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex gap-2">
                <span className="px-3 py-1 bg-emerald-100/50 text-emerald-700 font-bold rounded-lg border border-emerald-100 text-xs shadow-sm">
                  Activos: {totalActivosCount}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200 text-xs shadow-sm">
                  Pagina {page} de {totalPages || 1}
                </span>
             </div>
             
             <ExportDataBtn 
                title="Consolidado del Personal y Asignación Institucional"
                filename="Empleados_BancoUM"
                columns={["Identificación", "Nombre Completo", "Cargo", "Correo", "Estado", "Puntos Asignados", "Contratación"]}
                asesorData={operadorData}
                fetchUrl={`/api/export?type=empleados${q ? `&q=${encodeURIComponent(q)}` : ''}`}
             />
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6 px-2">
             <p className="text-sm font-bold text-slate-500">Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, totalCount)} de {totalCount} empleados</p>
             <div className="flex gap-2">
                <Link href={`?page=${page - 1}${q ? `&q=${q}` : ''}`} className={`px-4 py-2 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${page <= 1 ? "bg-slate-100 text-slate-400 pointer-events-none" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                   <ChevronLeft className="w-5 h-5 mr-1" /> Anterior
                </Link>
                <Link href={`?page=${page + 1}${q ? `&q=${q}` : ''}`} className={`px-4 py-2 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${page >= totalPages ? "bg-slate-100 text-slate-400 pointer-events-none" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                   Siguiente <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
             </div>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
